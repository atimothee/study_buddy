import {
  defaultEveAuth,
  eveChannel,
  type EveMessageContext,
} from "eve/channels/eve";
import { localDev, vercelOidc } from "eve/channels/auth";
import { supabaseBearerAuth } from "../lib/supabase-auth.js";

import {
  extractConceptFromMessage,
  isVisualizationRequest,
} from "../../src/lib/concept-grounding.js";

function studyBuddyOnMessage(ctx: EveMessageContext, message: string | unknown) {
  const text =
    typeof message === "string"
      ? message
      : JSON.stringify(message).slice(0, 500);

  const visualRequest = isVisualizationRequest(text);
  const concept = extractConceptFromMessage(text);

  const contextLines = [
    "StudyBuddy session. Client context on this turn includes studySetId and userId when provided by the web app.",
    "Always call getStudySetContext first when you need material context.",
    "When asked what you can help with, mention that you can answer questions, quiz the user, generate practice questions, and visualize concepts with the ian-xiaohei-illustrations-en skill.",
    "Persist user and assistant messages with saveChatMessage using the same studySetId and userId.",
    `Latest user message preview: ${text.slice(0, 280)}`,
  ];

  if (visualRequest) {
    contextLines.push(
      `VISUAL REQUEST DETECTED. You MUST call visualizeConcept immediately with studySetId and userId from clientContext and concept="${concept}". visualizeConcept uses the ian-xiaohei-illustrations-en skill. Do not say you cannot visualize. Do not answer from memory before calling the tool.`
    );
  } else {
    contextLines.push(
      "When the user asks to visualize, illustrate, draw, sketch, or diagram a concept, call visualizeConcept immediately with the core concept name."
    );
  }

  return {
    auth: defaultEveAuth(ctx),
    context: contextLines,
  };
}

export default eveChannel({
  auth: [supabaseBearerAuth(), vercelOidc(), localDev()],
  cors: true,
  onMessage: studyBuddyOnMessage,
});
