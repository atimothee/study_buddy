import {
  defaultEveAuth,
  eveChannel,
  type EveMessageContext,
} from "eve/channels/eve";
import { localDev, vercelOidc } from "eve/channels/auth";
import { supabaseBearerAuth } from "../lib/supabase-auth.js";

function studyBuddyOnMessage(ctx: EveMessageContext, message: string | unknown) {
  const text =
    typeof message === "string"
      ? message
      : JSON.stringify(message).slice(0, 500);

  return {
    auth: defaultEveAuth(ctx),
    context: [
      "StudyBuddy session. Client context on this turn includes studySetId and userId when provided by the web app.",
      "Always call getStudySetContext first when you need material context.",
      "When the user asks to visualize, illustrate, draw, sketch, or diagram a concept, call visualizeConcept immediately with the core concept name.",
      "Persist user and assistant messages with saveChatMessage using the same studySetId and userId.",
      `Latest user message preview: ${text.slice(0, 280)}`,
    ],
  };
}

export default eveChannel({
  auth: [supabaseBearerAuth(), vercelOidc(), localDev()],
  cors: true,
  onMessage: studyBuddyOnMessage,
});
