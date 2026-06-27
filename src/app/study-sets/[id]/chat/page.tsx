import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppShell } from "@/components/AppShell";
import { ChatPanel } from "@/components/ChatPanel";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: studySet } = await supabase
    .from("study_sets")
    .select("title")
    .eq("id", id)
    .single();

  if (!studySet || !user) notFound();

  const { data: messages } = await supabase
    .from("chat_messages")
    .select("*")
    .eq("study_set_id", id)
    .eq("user_id", user.id)
    .order("created_at");

  return (
    <AppShell studySetId={id} studySetTitle={studySet.title}>
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-slate-900">
          Chat with StudyBuddy
        </h1>
        <ChatPanel
          studySetId={id}
          userId={user.id}
          initialMessages={messages ?? []}
        />
      </div>
    </AppShell>
  );
}
