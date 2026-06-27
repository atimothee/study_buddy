"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createStudySet } from "@/app/actions";
import { AppShell } from "@/components/AppShell";
import { SourceInput } from "@/components/SourceInput";
import { GenerationProgress } from "@/components/GenerationProgress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { readApiError, readJsonBody } from "@/lib/parse-json-response";

export default function NewStudySetPage() {
  const router = useRouter();
  const [sourceText, setSourceText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("sourceText", sourceText);

    const result = await createStudySet(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    if (!result?.studySetId) {
      setError("Failed to create study set");
      setLoading(false);
      return;
    }

    setGenerating(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studySetId: result.studySetId }),
      });

      const data = await readJsonBody<{ error?: string }>(res);

      if (!res.ok) {
        throw new Error(
          data?.error ??
            (await readApiError(
              res,
              "Study set created, but generation failed. Open the study set to try again."
            ))
        );
      }

      router.push(`/study-sets/${result.studySetId}`);
    } catch (err) {
      setGenerating(false);
      setLoading(false);
      setError(
        err instanceof Error
          ? err.message
          : "Study set created, but generation failed. Open the study set to try again."
      );
    }
  }

  if (generating) {
    return (
      <AppShell>
        <div className="mx-auto flex max-w-2xl flex-col items-center justify-center py-24">
          <GenerationProgress activeStep={2} />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create a new study set</CardTitle>
            <CardDescription>
              Add a title and paste or upload your study material. We&apos;ll
              generate flashcards, a quiz, and a summary with Eve.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="e.g. Biology Chapter 5 — Cell Division"
                  required
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject (optional)</Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder="e.g. Biology"
                  disabled={loading}
                />
              </div>

              <SourceInput
                value={sourceText}
                onChange={setSourceText}
                disabled={loading}
              />

              {error && (
                <p className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={loading || sourceText.length < 100}
              >
                {loading ? "Creating..." : "Create study set"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
