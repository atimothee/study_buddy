import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { captureAppError, withAppSpan } from "@/lib/sentry";

const persistSchema = z.object({
  studySetId: z.string().uuid(),
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1),
      })
    )
    .min(1)
    .max(4),
});

export async function POST(request: Request) {
  let studySetId: string | undefined;
  let userId: string | undefined;

  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    userId = user.id;

    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const parsed = persistSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    studySetId = parsed.data.studySetId;
    const { messages } = parsed.data;

    const { data: studySet } = await withAppSpan(
      "chat.persist.verifyStudySet",
      "db.query",
      { feature: "chat", studySetId, userId },
      () =>
        supabase
          .from("study_sets")
          .select("id")
          .eq("id", studySetId!)
          .eq("user_id", userId!)
          .maybeSingle()
    );

    if (!studySet) {
      return NextResponse.json({ error: "Study set not found" }, { status: 404 });
    }

    const rows = messages.map((message) => ({
      study_set_id: studySetId,
      user_id: userId,
      role: message.role,
      content: message.content,
    }));

    const { error } = await withAppSpan(
      "chat.persist.insertMessages",
      "db.query",
      {
        feature: "chat",
        studySetId,
        userId,
        messageCount: messages.length,
      },
      () => supabase.from("chat_messages").insert(rows)
    );

    if (error) {
      captureAppError(error, {
        feature: "chat",
        userId,
        studySetId,
        tool: "saveChatMessage",
        extra: { messageCount: messages.length },
      });
      return NextResponse.json(
        { error: "We could not save your messages. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    captureAppError(error, {
      feature: "chat",
      userId,
      studySetId,
      tool: "chatPersistRoute",
    });
    return NextResponse.json(
      { error: "We could not save your messages. Please try again." },
      { status: 500 }
    );
  }
}
