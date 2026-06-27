"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";

interface GenerateButtonProps {
  studySetId: string;
  hasContent: boolean;
  onGenerated?: () => void;
}

export function GenerateButton({
  studySetId,
  hasContent,
  onGenerated,
}: GenerateButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studySetId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Generation failed");
      }

      onGenerated?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner label="Generating flashcards, quiz, and summary..." />;
  }

  return (
    <div className="space-y-3">
      <Button
        onClick={handleGenerate}
        disabled={!hasContent}
        size="lg"
        className="w-full sm:w-auto"
      >
        <Sparkles className="h-4 w-4" />
        Generate study materials
      </Button>
      {!hasContent && (
        <p className="text-sm text-slate-500">
          Add source material before generating.
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
