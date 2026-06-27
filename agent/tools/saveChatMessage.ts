import { defineTool } from "eve/tools";
import { z } from "zod";
import { createServiceClient } from "../../src/lib/supabase/admin";

export default defineTool({
  description: "Persist a chat message for a study set conversation.",
  inputSchema: z.object({
    studySetId: z.string().uuid(),
    userId: z.string().uuid(),
    role: z.enum(["user", "assistant", "system"]),
    content: z.string().min(1),
  }),
  async execute({ studySetId, userId, role, content }) {
    const supabase = createServiceClient();

    const { data, error } = await supabase
      .from("chat_messages")
      .insert({
        study_set_id: studySetId,
        user_id: userId,
        role,
        content,
      })
      .select("id")
      .single();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, messageId: data.id };
  },
});
