"use client";

import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  GenerationProgress,
  GENERATION_STEPS,
} from "@/components/GenerationProgress";
import { readApiError, readJsonBody } from "@/lib/parse-json-response";

interface GenerateButtonProps {
  studySetId: string;
  hasContent: boolean;
  label?: string;
  onGenerated?: () => void;
}

const STEP_INTERVAL_MS = 2800;

export function GenerateButton({
  studySetId,
  hasContent,
  label = "Generate study materials",
  onGenerated,
}: GenerateButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [complete, setComplete] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const stepTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    };
  }, []);

  function startStepper() {
    setActiveStep(0);
    setComplete(false);
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    stepTimerRef.current = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= GENERATION_STEPS.length - 1) {
          if (stepTimerRef.current) clearInterval(stepTimerRef.current);
          return prev;
        }
        return prev + 1;
      });
    }, STEP_INTERVAL_MS);
  }

  function stopStepper() {
    if (stepTimerRef.current) clearInterval(stepTimerRef.current);
    setComplete(true);
    setActiveStep(GENERATION_STEPS.length);
  }

  async function handleGenerate() {
    setLoading(true);
    setError(null);
    setSuccess(false);
    startStepper();

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studySetId }),
      });

      const data = await readJsonBody<{ error?: string }>(res);

      if (!res.ok) {
        throw new Error(
          data?.error ??
            (await readApiError(res, "Generation failed"))
        );
      }

      if (!data) {
        throw new Error("Generation failed");
      }

      stopStepper();
      setSuccess(true);
      onGenerated?.();
      router.refresh();
    } catch (err) {
      if (stepTimerRef.current) clearInterval(stepTimerRef.current);
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (loading || complete) {
    return (
      <GenerationProgress
        activeStep={activeStep}
        complete={complete && success}
      />
    );
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
        {label}
      </Button>
      {!hasContent && (
        <p className="text-sm text-slate-500">
          Add source material before generating.
        </p>
      )}
      {success && (
        <p className="text-sm text-green-700">
          Study materials generated successfully.
        </p>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
