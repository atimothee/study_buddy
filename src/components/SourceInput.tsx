"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

interface SourceInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SourceInput({ value, onChange, disabled }: SourceInputProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File) {
    setUploadError(null);

    if (file.type === "text/plain" || file.name.endsWith(".txt")) {
      const text = await file.text();
      onChange(value ? `${value}\n\n${text}` : text);
      return;
    }

    if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/extract-pdf", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setUploadError(data.error ?? "Failed to extract PDF text");
        return;
      }

      const data = await res.json();
      onChange(value ? `${value}\n\n${data.text}` : data.text);
      return;
    }

    setUploadError("Please upload a .txt or .pdf file");
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="source">Study material</Label>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.pdf,text/plain,application/pdf"
            className="hidden"
            disabled={disabled}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileUpload(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled}
            onClick={() => fileRef.current?.click()}
          >
            <Upload className="h-4 w-4" />
            Upload file
          </Button>
        </div>
      </div>
      <Textarea
        id="source"
        placeholder="Paste your notes, lecture content, or study material here (minimum 100 characters)..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="min-h-[240px]"
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>{value.length} characters</span>
        <span>Minimum 100 characters required</span>
      </div>
      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}
    </div>
  );
}
