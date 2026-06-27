/**
 * Fallback chat route used when the Eve agent is unavailable.
 * Primary chat is powered by Eve via useEveAgent on /study-sets/[id]/chat.
 */
import { streamText } from "ai";
import { openai } from "@/lib/ai/client";
import { createClient } from "@/lib/supabase/server";
import { chatMessageSchema } from "@/lib/validations";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  formatContextForPrompt,
  getStudySetContext,
} from "@/lib/study-context";
import { captureAppError, withAppSpan } from "@/lib/sentry";

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are StudyBuddy, a friendly but rigorous study assistant.

Scope:
- Help students understand and review material from their uploaded study sets.
- Answer ONLY using the provided study set context (source text, summary, flashcards, quiz).

Behavior:
- Be concise.
- Ask one question at a time when quizzing.
- Explain concepts in simple language.
- Do not invent facts outside the source material.
- When unsure, say: "I don't see that in your study material."
- Encourage active recall.
- You can generate additional practice questions on request, grounded in the material.`;

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

    const contextText = formatContextForPrompt(context);

    const result = streamText({
      model: openai("gpt-4o-mini"),
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
    captureAppError(error, {
      feature: "chat",
      userId,
      studySetId,
      tool: "chatRoute",
    });
    return new Response(
      JSON.stringify({
        error: "We could not send your message. Please try again.",
      }),
      { status: 500 }
    );
  }
}
