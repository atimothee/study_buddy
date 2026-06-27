"use client";

import { useState } from "react";
import { createStudySet } from "@/app/actions";
import { AppShell } from "@/components/AppShell";
import { SourceInput } from "@/components/SourceInput";
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

export default function NewStudySetPage() {
  const [sourceText, setSourceText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    formData.set("sourceText", sourceText);

    const result = await createStudySet(formData);
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Create a new study set</CardTitle>
            <CardDescription>
              Add a title and paste or upload your study material. You can
              generate flashcards and quizzes on the next screen.
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
