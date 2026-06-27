"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createStudySetSchema } from "@/lib/validations";
import { sendWelcomeEmail } from "@/lib/email";

export async function signUp(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    return { error: error.message };
  }

  if (data.user?.email) {
    await sendWelcomeEmail(data.user.email).catch(() => {});
  }

  redirect("/dashboard");
}

export async function signIn(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

export async function createStudySet(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "You must be signed in" };
  }

  const parsed = createStudySetSchema.safeParse({
    title: formData.get("title"),
    subject: formData.get("subject") || undefined,
    sourceText: formData.get("sourceText"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { title, subject, sourceText } = parsed.data;

  const { data: studySet, error } = await supabase
    .from("study_sets")
    .insert({
      user_id: user.id,
      title,
      subject: subject ?? null,
      source_text: sourceText,
    })
    .select("id")
    .single();

  if (error || !studySet) {
    return { error: error?.message ?? "Failed to create study set" };
  }

  revalidatePath("/dashboard");
  redirect(`/study-sets/${studySet.id}`);
}

export async function deleteStudySet(studySetId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { error } = await supabase
    .from("study_sets")
    .delete()
    .eq("id", studySetId)
    .eq("user_id", user.id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
