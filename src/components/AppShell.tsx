"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  BookOpen,
  LayoutDashboard,
  MessageSquare,
  Plus,
  Layers,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/study-sets/new", label: "New Study Set", icon: Plus },
];

const studySetNav = (id: string) => [
  { href: `/study-sets/${id}`, label: "Overview", icon: BookOpen },
  { href: `/study-sets/${id}/flashcards`, label: "Flashcards", icon: Layers },
  { href: `/study-sets/${id}/quiz`, label: "Quiz", icon: HelpCircle },
  { href: `/study-sets/${id}/chat`, label: "Chat", icon: MessageSquare },
];

interface NavContentProps {
  items: Array<{
    href: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }>;
  pathname: string;
  studySetTitle?: string;
  onNavigate: () => void;
  onSignOut: () => void;
}

function NavContent({
  items,
  pathname,
  studySetTitle,
  onNavigate,
  onSignOut,
}: NavContentProps) {
  return (
    <>
      <div className="mb-8 flex items-center gap-2 px-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white">
          <BookOpen className="h-5 w-5" />
        </div>
        <div>
          <p className="font-semibold text-slate-900">StudyBuddy</p>
          {studySetTitle && (
            <p className="max-w-[160px] truncate text-xs text-slate-500">
              {studySetTitle}
            </p>
          )}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                active
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Button
        variant="ghost"
        className="mt-auto justify-start gap-2 text-slate-600"
        onClick={onSignOut}
      >
        <LogOut className="h-4 w-4" />
        Sign out
      </Button>
    </>
  );
}

interface AppShellProps {
  children: React.ReactNode;
  studySetId?: string;
  studySetTitle?: string;
}

export function AppShell({ children, studySetId, studySetTitle }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  const items = studySetId
    ? [...navItems, ...studySetNav(studySetId)]
    : navItems;

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-64 flex-col border-r border-slate-200 bg-white p-4 lg:flex">
        <NavContent
          items={items}
          pathname={pathname}
          studySetTitle={studySetTitle}
          onNavigate={() => setMobileOpen(false)}
          onSignOut={handleSignOut}
        />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col bg-white p-4 shadow-xl">
            <button
              className="mb-4 self-end rounded-lg p-2 hover:bg-slate-100"
              onClick={() => setMobileOpen(false)}
            >
              <X className="h-5 w-5" />
            </button>
            <NavContent
              items={items}
              pathname={pathname}
              studySetTitle={studySetTitle}
              onNavigate={() => setMobileOpen(false)}
              onSignOut={handleSignOut}
            />
          </aside>
        </div>
      )}

      <div className="flex flex-1 flex-col">
        <header className="flex items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
          <button
            className="rounded-lg p-2 hover:bg-slate-100"
            onClick={() => setMobileOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-semibold">StudyBuddy</span>
        </header>
        <main className="flex-1 p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
