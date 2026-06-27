"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ImageIcon, Send, Sparkles } from "lucide-react";
import { useEveAgent } from "eve/react";
import type { EveMessage, EveMessagePart } from "eve/react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { VisualExplanationCard } from "@/components/VisualExplanationCard";
import { cn } from "@/lib/utils";
import {
  extractVisualizationsFromUnknown,
  parseStoredVisualizations,
  stripVisualizationMarker,
  type VisualizationPayload,
} from "@/lib/visualization";
import {
  extractConceptFromMessage,
  hasVisualIntent,
} from "@/lib/concept-grounding";
import type { ChatMessage } from "@/lib/types";

interface ChatPanelProps {
  studySetId: string;
  userId: string;
  studySetTitle: string;
  initialMessages: ChatMessage[];
}

function textFromParts(parts: readonly EveMessagePart[]): string {
  return parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("\n")
    .trim();
}

function visualizationsFromParts(
  parts: readonly EveMessagePart[]
): VisualizationPayload[] {
  const visuals: VisualizationPayload[] = [];

  for (const part of parts) {
    if (part.type !== "dynamic-tool") continue;
    if (part.toolName !== "visualizeConcept") continue;
    if (part.state !== "output-available" || !part.output) continue;
    visuals.push(...extractVisualizationsFromUnknown(part.output));
  }

  return visuals;
}

function serializeAssistantForPersist(
  text: string,
  visuals: VisualizationPayload[]
): string {
  if (visuals.length === 0) return text;
  return `${text}\n\n---visualization---\n${JSON.stringify(visuals[0])}`;
}

export function ChatPanel({
  studySetId,
  userId,
  studySetTitle,
  initialMessages,
}: ChatPanelProps) {
  const [input, setInput] = useState("");
  const [history, setHistory] = useState<ChatMessage[]>(initialMessages);
  const [error, setError] = useState<string | null>(null);
  const [useFallback, setUseFallback] = useState(false);
  const [fallbackLoading, setFallbackLoading] = useState(false);
  const [visualLoading, setVisualLoading] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastPersistedRef = useRef<string>("");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setAccessToken(data.session?.access_token ?? null);
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/eve/v1/health")
      .then((res) => {
        if (!res.ok && !cancelled) setUseFallback(true);
      })
      .catch(() => {
        if (!cancelled) setUseFallback(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const persistMessages = useCallback(
    async (
      messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
    ) => {
      const key = JSON.stringify(messages);
      if (key === lastPersistedRef.current) return;
      lastPersistedRef.current = key;

      await fetch("/api/chat/persist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studySetId, messages }),
      });

      const now = new Date().toISOString();
      setHistory((prev) => [
        ...prev,
        ...messages.map((message, index) => ({
          id: `persisted-${Date.now()}-${index}`,
          study_set_id: studySetId,
          user_id: userId,
          role: message.role,
          content: message.content,
          created_at: now,
        })),
      ]);
    },
    [studySetId, userId]
  );

  const agent = useEveAgent({
    auth: {
      bearer: async () => accessToken ?? "",
    },
    prepareSend: (payload) => ({
      ...payload,
      clientContext: {
        studySetId,
        userId,
        studySetTitle,
        visualRequest:
          typeof payload.message === "string" &&
          hasVisualIntent(payload.message),
      },
    }),
    onError: (err) => {
      setError(err.message);
      setUseFallback(true);
    },
    onFinish: async (snapshot) => {
      const messages = snapshot.data.messages;
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      const lastAssistant = [...messages]
        .reverse()
        .find((m) => m.role === "assistant");

      if (!lastUser || !lastAssistant) return;

      const userText = textFromParts(lastUser.parts);
      const assistantText = textFromParts(lastAssistant.parts);
      const visuals = visualizationsFromParts(lastAssistant.parts);

      if (!userText || !assistantText) return;

      await persistMessages([
        { role: "user", content: userText },
        {
          role: "assistant",
          content: serializeAssistantForPersist(assistantText, visuals),
        },
      ]);
      agent.reset();
    },
  });

  const isBusy =
    useFallback
      ? fallbackLoading || visualLoading
      : agent.status === "submitted" ||
        agent.status === "streaming" ||
        visualLoading;

  const requestVisualization = useCallback(
    async (message: string, conceptSeed?: string) => {
      const concept = extractConceptFromMessage(conceptSeed ?? message);
      setVisualLoading(true);
      setError(null);

      const optimisticId = `temp-user-${Date.now()}`;
      const optimisticUser: ChatMessage = {
        id: optimisticId,
        study_set_id: studySetId,
        user_id: userId,
        role: "user",
        content: message,
        created_at: new Date().toISOString(),
      };
      setHistory((prev) => [...prev, optimisticUser]);

      try {
        const res = await fetch("/api/visualize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studySetId,
            concept,
            userInstruction: message,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error ?? "Failed to create visual explanation");
        }

        const visual = data.visual as VisualizationPayload;
        const assistantText = `Here's a visual explanation of "${visual.title}" based on your study material.`;
        const assistantContent = serializeAssistantForPersist(assistantText, [
          visual,
        ]);

        setHistory((prev) => prev.filter((m) => m.id !== optimisticId));

        await persistMessages([
          { role: "user", content: message },
          { role: "assistant", content: assistantContent },
        ]);
      } catch (err) {
        const errorText =
          err instanceof Error
            ? err.message
            : "Failed to create visual explanation";
        setHistory((prev) => [
          ...prev.filter((m) => m.id !== optimisticId),
          optimisticUser,
          {
            id: `temp-assistant-${Date.now()}`,
            study_set_id: studySetId,
            user_id: userId,
            role: "assistant",
            content: errorText,
            created_at: new Date().toISOString(),
          },
        ]);
        await persistMessages([
          { role: "user", content: message },
          { role: "assistant", content: errorText },
        ]);
      } finally {
        setVisualLoading(false);
      }
    },
    [persistMessages, studySetId, userId]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, agent.data.messages, isBusy]);

  async function sendFallback(message: string) {
    setFallbackLoading(true);
    setError(null);

    const optimisticUser: ChatMessage = {
      id: `temp-user-${Date.now()}`,
      study_set_id: studySetId,
      user_id: userId,
      role: "user",
      content: message,
      created_at: new Date().toISOString(),
    };
    setHistory((prev) => [...prev, optimisticUser]);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studySetId, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to send message");
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      const assistantId = `temp-assistant-${Date.now()}`;
      setHistory((prev) => [
        ...prev,
        {
          id: assistantId,
          study_set_id: studySetId,
          user_id: userId,
          role: "assistant",
          content: "",
          created_at: new Date().toISOString(),
        },
      ]);

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          assistantText += decoder.decode(value, { stream: true });
          setHistory((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: assistantText } : m
            )
          );
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setHistory((prev) => prev.filter((m) => !m.id.startsWith("temp-")));
    } finally {
      setFallbackLoading(false);
    }
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const message = input.trim();
    if (!message || isBusy) return;

    setInput("");
    setError(null);

    if (hasVisualIntent(message)) {
      await requestVisualization(message);
      return;
    }

    if (useFallback || !accessToken) {
      await sendFallback(message);
      return;
    }

    try {
      await agent.send({ message });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Eve agent unavailable");
      setUseFallback(true);
      await sendFallback(message);
    }
  }

  function queueVisualRequest(seed?: string) {
    const concept = seed?.trim() || studySetTitle;
    const message = `Please visualize this concept from my study set using the Xiaohei illustration style: ${concept}`;
    void requestVisualization(message, concept);
  }

  const liveMessages = useMemo(() => {
    if (useFallback) return [];
    return agent.data.messages;
  }, [agent.data.messages, useFallback]);

  const renderedHistory = history.map((message) => {
    const visuals = parseStoredVisualizations(message.content);
    const text = stripVisualizationMarker(message.content);

    return (
      <div key={message.id} className="space-y-3">
        <div
          className={cn(
            "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
            message.role === "user"
              ? "ml-auto bg-indigo-600 text-white"
              : "bg-slate-100 text-slate-900"
          )}
        >
          <p className="whitespace-pre-wrap">{text}</p>
          {message.role === "assistant" && text && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="mt-2 h-8 px-2 text-xs text-indigo-700 hover:bg-indigo-50"
              onClick={() => queueVisualRequest(text.slice(0, 180))}
            >
              Visualize this
            </Button>
          )}
        </div>
        {visuals.map((visual, index) => (
          <VisualExplanationCard key={`${message.id}-visual-${index}`} visual={visual} />
        ))}
      </div>
    );
  });

  const renderedLive = liveMessages.map((message: EveMessage) => {
    const text = textFromParts(message.parts);
    const visuals = visualizationsFromParts(message.parts);

    return (
      <div key={message.id} className="space-y-3">
        {text && (
          <div
            className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
              message.role === "user"
                ? "ml-auto bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-900"
            )}
          >
            <p className="whitespace-pre-wrap">{text}</p>
            {message.role === "assistant" && message.metadata?.status !== "streaming" && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="mt-2 h-8 px-2 text-xs text-indigo-700 hover:bg-indigo-50"
                onClick={() => queueVisualRequest(text.slice(0, 180))}
              >
                Visualize this
              </Button>
            )}
          </div>
        )}
        {visuals.map((visual, index) => (
          <VisualExplanationCard key={`${message.id}-visual-${index}`} visual={visual} />
        ))}
      </div>
    );
  });

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-4 py-2 text-xs text-slate-500">
        {useFallback ? (
          <span>Using fallback chat while Eve is unavailable.</span>
        ) : (
          <span className="inline-flex items-center gap-1">
            <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
            Powered by Eve — source-grounded study assistant
          </span>
        )}
      </div>

      <div className="flex-1 space-y-4 overflow-y-auto p-4">
        {history.length === 0 && liveMessages.length === 0 && !isBusy && (
          <div className="flex h-full flex-col items-center justify-center text-center text-slate-500">
            <p className="font-medium text-slate-700">Chat with StudyBuddy</p>
            <p className="mt-1 max-w-sm text-sm">
              Ask about your study material, request practice questions, or create
              visual explanations for difficult concepts.
            </p>
          </div>
        )}

        {renderedHistory}
        {renderedLive}

        {isBusy && (
          <LoadingSpinner
            label={
              visualLoading
                ? "Creating visual explanation..."
                : "StudyBuddy is thinking..."
            }
          />
        )}

        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={handleSend}
        className="space-y-2 border-t border-slate-200 p-4"
      >
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask StudyBuddy about this study set..."
            className="min-h-[60px] resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                void handleSend(e);
              }
            }}
          />
          <Button type="submit" disabled={isBusy || !input.trim()} size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isBusy}
            onClick={() => queueVisualRequest(studySetTitle)}
          >
            <ImageIcon className="h-4 w-4" />
            Create visual explanation
          </Button>
        </div>
      </form>

      {(error || agent.error) && (
        <p className="px-4 pb-3 text-sm text-red-600">
          {error ?? agent.error?.message}
        </p>
      )}
    </div>
  );
}
