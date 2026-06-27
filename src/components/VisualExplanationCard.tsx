"use client";

import DOMPurify from "isomorphic-dompurify";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { VisualizationPayload } from "@/lib/visualization";

interface VisualExplanationCardProps {
  visual: VisualizationPayload;
}

export function VisualExplanationCard({ visual }: VisualExplanationCardProps) {
  const concept = visual.concept ?? visual.title;

  return (
    <Card className="border-indigo-100 bg-indigo-50/40">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{visual.title}</CardTitle>
            <p className="mt-1 text-xs text-slate-500">Concept: {concept}</p>
          </div>
          <Badge variant="secondary">Xiaohei visual</Badge>
        </div>
        <CardDescription>{visual.shortExplanation}</CardDescription>
        {visual.skillId && (
          <p className="text-xs text-indigo-600">Skill: {visual.skillId}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        {visual.illustrationFormat === "image" && visual.illustrationOutput && (
          <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
            <Image
              src={visual.illustrationOutput}
              alt={visual.title}
              width={960}
              height={540}
              className="h-auto w-full"
              unoptimized
            />
          </div>
        )}

        {visual.illustrationFormat === "svg" && visual.illustrationOutput && (
          <div
            className="overflow-hidden rounded-lg border border-slate-200 bg-white p-4"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(visual.illustrationOutput, {
                USE_PROFILES: { svg: true, svgFilters: true },
              }),
            }}
          />
        )}

        {visual.illustrationFormat === "markdown" &&
          visual.illustrationOutput && (
            <pre className="whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-4 text-sm">
              {visual.illustrationOutput}
            </pre>
          )}

        {visual.illustrationFormat === "html" && visual.illustrationOutput && (
          <div
            className="rounded-lg border border-slate-200 bg-white p-4 text-sm"
            dangerouslySetInnerHTML={{
              __html: DOMPurify.sanitize(visual.illustrationOutput),
            }}
          />
        )}

        {(visual.illustrationFormat === "prompt" || !visual.illustrationOutput) && (
          <div className="rounded-lg border border-dashed border-indigo-200 bg-white p-4">
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-indigo-600">
              Illustration unavailable
            </p>
            <p className="text-sm text-slate-600">
              We couldn&apos;t generate an image for this concept. Try again, or
              ask a shorter, more specific concept from your study material.
            </p>
          </div>
        )}

        <p className="text-xs text-slate-500">
          <span className="font-medium text-slate-600">Source grounding:</span>{" "}
          {visual.sourceGrounding}
        </p>
      </CardContent>
    </Card>
  );
}
