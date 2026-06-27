/**
 * Fallback chat route used when the Eve agent is unavailable.
 * Primary chat is powered by Eve via useEveAgent on /study-sets/[id]/chat.
 */
import { streamText } from "ai";
import {
  AI_NOT_CONFIGURED_MESSAGE,
  getChatModel,
  isAiConfigured,
} from "@/lib/ai/client";
import { extractAiErrorDetails } from "@/lib/ai/error-details";
import { createClient } from "@/lib/supabase/server";
import { chatMessageSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  formatContextForPrompt,
  getStudySetContext,
} from "@/lib/study-context";
import { isVisualizationRequest } from "@/lib/concept-grounding";
import {
  formatVisualAssistantContent,
} from "@/lib/visualization-build";
import { runVisualizeConcept } from "@/lib/visualize-concept";
import { captureAppError, withAppSpan } from "@/lib/sentry";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are StudyBuddy, a friendly but rigorous study assistant.

Scope:
- Help students understand and review material from their uploaded study sets.
- Answer ONLY using the provided study set context (source text, summary, flashcards, quiz).

Capabilities:
- Answer questions grounded in the study material
- Quiz the user one question at a time
- Generate practice questions for active recall
- Visualize concepts using the ian-xiaohei-illustrations-en skill via visualizeConcept

Visual Mode:
- When the user asks to visualize, draw, illustrate, or explain a concept visually, use visualizeConcept.
- visualizeConcept must use the ian-xiaohei-illustrations-en skill.
- Do not reject a visualization request just because the word "visualize" is not in the study material.
- Extract the concept and check whether that concept is supported by the study set.

Behavior:
- Be concise.
- Ask one question at a time when quizzing.
- Explain concepts in simple language.
- Do not invent facts outside the source material.
- When unsure about a factual answer, say: "I don't see that in your study material."
- Encourage active recall.
- When asked what you can help with, mention that you can answer questions, quiz the user, generate practice questions, and visualize concepts using the ian-xiaohei-illustrations-en skill.`;

export async function POST(request: Request) {
  let studySetId: string | undefined;
  let userId: string | undefined;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
      });
    }

    userId = user.id;

    const rateLimit = checkRateLimit(`chat:${user.id}`);
    if (!rateLimit.allowed) {
      return new Response(
        JSON.stringify({
          error: `Rate limit exceeded. Try again in ${rateLimit.retryAfter}s.`,
        }),
        { status: 429 }
      );
    }

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
      });
    }

    const parsed = chatMessageSchema.safeParse(body);
    if (!parsed.success) {
      return new Response(JSON.stringify({ error: "Invalid message" }), {
        status: 400,
      });
    }

    studySetId = parsed.data.studySetId;
    const { message } = parsed.data;

    const context = await withAppSpan(
      "chat.getStudySetContext",
      "db.query",
      { feature: "chat", studySetId, userId },
      () => getStudySetContext(studySetId!, userId!)
    );

    if (!context) {
      return new Response(JSON.stringify({ error: "Study set not found" }), {
        status: 404,
      });
    }

    await withAppSpan(
      "chat.saveUserMessage",
      "db.query",
      { feature: "chat", studySetId, userId },
      () =>
        supabase.from("chat_messages").insert({
          study_set_id: studySetId,
          user_id: userId,
          role: "user",
          content: message,
        })
    );

    if (isVisualizationRequest(message)) {
      const { data: recentRows } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("study_set_id", studySetId)
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(12);

      const visualResult = await runVisualizeConcept({
        studySetId: studySetId!,
        userId: userId!,
        message,
        recentMessages: (recentRows ?? []).reverse(),
      });

      const assistantContent =
        visualResult.status === "visual"
          ? formatVisualAssistantContent(visualResult.visual)
          : visualResult.message;

      await withAppSpan(
        "chat.saveAssistantMessage",
        "db.query",
        { feature: "chat", studySetId, userId },
        () =>
          supabase.from("chat_messages").insert({
            study_set_id: studySetId,
            user_id: userId,
            role: "assistant",
            content: assistantContent,
          })
      );

      return new Response(assistantContent, {
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }

    if (!isAiConfigured()) {
      return new Response(JSON.stringify({ error: AI_NOT_CONFIGURED_MESSAGE }), {
        status: 503,
        headers: { "Content-Type": "application/json" },
      });
    }

    const contextText = formatContextForPrompt(context);

    const result = streamText({
      model: getChatModel(),
      system: `${SYSTEM_PROMPT}\n\n---\nStudy Set Context:\n${contextText}`,
      messages: [{ role: "user", content: message }],
      onFinish: async ({ text }) => {
        await withAppSpan(
          "chat.saveAssistantMessage",
          "db.query",
          { feature: "chat", studySetId, userId },
          () =>
            supabase.from("chat_messages").insert({
              study_set_id: studySetId,
              user_id: userId,
              role: "assistant",
              content: text,
            })
        ).catch((error) => {
          captureAppError(error, {
            feature: "chat",
            userId,
            studySetId,
            tool: "saveChatMessage",
          });
        });
      },
    });

    return result.toTextStreamResponse();
  } catch (error) {
    const aiErrorDetails = extractAiErrorDetails(error);
    captureAppError(error, {
      feature: "chat",
      userId,
      studySetId,
      tool: "chatRoute",
      extra: aiErrorDetails,
    });

    const message =
      error instanceof Error ? error.message.trim() : "";
    const clientError =
      message.includes("AI_GATEWAY_API_KEY") ||
      message.includes("OPENAI_API_KEY") ||
      /api key|authentication|unauthenticated/i.test(message)
        ? AI_NOT_CONFIGURED_MESSAGE
        : "We could not send your message. Please try again.";

    return new Response(JSON.stringify({ error: clientError }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
