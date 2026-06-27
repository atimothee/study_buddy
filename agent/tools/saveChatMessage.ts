import { defineTool } from "eve/tools";
import { z } from "zod";
import { createServiceClient } from "../lib/supabase.js";
import { captureAppError, withAppSpan } from "../../src/lib/sentry.js";

async function verifyStudySetOwnership(
  studySetId: string,
  userId: string
): Promise<boolean> {
  const supabase = createServiceClient();
  const { data } = await withAppSpan(
    "agent.saveChatMessage.verify",
    "db.query",
    { feature: "chat", studySetId, userId },
    () =>
      supabase
        .from("study_sets")
        .select("id")
        .eq("id", studySetId)
        .eq("user_id", userId)
        .maybeSingle()
  );

  return Boolean(data);
}

export default defineTool({
  description: "Persist a chat message for a study set conversation.",
  inputSchema: z.object({
    studySetId: z.string().uuid(),
    userId: z.string().uuid(),
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().min(1),
  }),
  async execute({ studySetId, userId, role, content }) {
    try {
      const allowed = await verifyStudySetOwnership(studySetId, userId);
      if (!allowed) {
        return { success: false, error: "Study set not found or access denied" };
      }

      const supabase = createServiceClient();
      const { data, error } = await withAppSpan(
        "agent.saveChatMessage.insert",
        "db.query",
        { feature: "chat", studySetId, userId, role },
        () =>
          supabase
            .from("chat_messages")
            .insert({
              study_set_id: studySetId,
              user_id: userId,
              role,
              content,
            })
            .select("id")
            .single()
      );

      if (error) {
        captureAppError(error, {
          feature: "chat",
          userId,
          studySetId,
          tool: "saveChatMessage",
          extra: { role },
        });
        return { success: false, error: "Failed to save chat message" };
      }

      return { success: true, messageId: data.id };
    } catch (error) {
      captureAppError(error, {
        feature: "chat",
        userId,
        studySetId,
        tool: "saveChatMessage",
        extra: { role },
      });
      return { success: false, error: "Failed to save chat message" };
    }
  },
});
