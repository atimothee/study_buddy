"use client";

import { useRef, useState } from "react";
import { Loader2, Upload } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { extractFileText } from "@/lib/extract-file-text";

interface SourceInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function SourceInput({ value, onChange, disabled }: SourceInputProps) {
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleFileUpload(file: File) {
    setUploadError(null);
    setUploading(true);

    try {
      const text = await extractFileText(file);
      onChange(value ? `${value}\n\n${text}` : text);
    } catch (err) {
      setUploadError(
        err instanceof Error ? err.message : "Failed to read the uploaded file"
      );
    } finally {
      setUploading(false);
      if (fileRef.current) {
        fileRef.current.value = "";
      }
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor="source">Study material</Label>
        <div>
          <input
            ref={fileRef}
            type="file"
            accept=".txt,.md,.pdf,text/plain,text/markdown,application/pdf"
            className="hidden"
            disabled={disabled || uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void handleFileUpload(file);
            }}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={disabled || uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? "Reading file..." : "Upload file"}
          </Button>
        </div>
      </div>
      <Textarea
        id="source"
        placeholder="Paste your notes, lecture content, or study material here (minimum 100 characters)..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || uploading}
        className="min-h-[240px]"
      />
      <div className="flex justify-between text-xs text-slate-500">
        <span>{value.length} characters</span>
        <span>Supports .txt, .md, and .pdf</span>
      </div>
      {uploadError && (
        <p className="text-sm text-red-600">{uploadError}</p>
      )}
    </div>
  );
}
