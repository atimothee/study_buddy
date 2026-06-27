import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const fromEmail = process.env.RESEND_FROM_EMAIL ?? "StudyBuddy <onboarding@resend.dev>";

export async function sendWelcomeEmail(email: string, name?: string) {
  if (!resend) return { skipped: true };

  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: "Welcome to StudyBuddy!",
    html: `
      <h1>Welcome${name ? `, ${name}` : ""}!</h1>
      <p>You're all set to turn your notes into flashcards, quizzes, and a personal study assistant.</p>
      <p><a href="${process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"}/study-sets/new">Create your first study set</a></p>
    `,
  });

  return { sent: true };
}

export async function sendStudySetReadyEmail(
  email: string,
  studySetTitle: string,
  studySetId: string
) {
  if (!resend) return { skipped: true };

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  await resend.emails.send({
    from: fromEmail,
    to: email,
    subject: `Your study set "${studySetTitle}" is ready`,
    html: `
      <h1>Your study set is ready!</h1>
      <p>We've generated flashcards, a quiz, and a summary for <strong>${studySetTitle}</strong>.</p>
      <p><a href="${baseUrl}/study-sets/${studySetId}">Start studying</a></p>
    `,
  });

  return { sent: true };
}
