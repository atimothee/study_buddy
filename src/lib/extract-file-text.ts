const TEXT_EXTENSIONS = new Set(["txt", "md", "markdown", "text"]);

function getExtension(file: File): string {
  const parts = file.name.split(".");
  if (parts.length < 2) return "";
  return parts.pop()!.toLowerCase();
}

export function isTextFile(file: File): boolean {
  const ext = getExtension(file);
  if (TEXT_EXTENSIONS.has(ext)) return true;
  if (file.type.startsWith("text/")) return true;
  return false;
}

export function isPdfFile(file: File): boolean {
  return getExtension(file) === "pdf" || file.type === "application/pdf";
}

async function extractTextFile(file: File): Promise<string> {
  const text = await file.text();
  if (!text.trim()) {
    throw new Error("The file appears to be empty.");
  }
  return text.trim();
}

async function extractPdfFile(file: File): Promise<string> {
  const { PDFParse } = await import("pdf-parse");

  PDFParse.setWorker(
    "https://cdn.jsdelivr.net/npm/pdf-parse@2.4.5/dist/pdf-parse/web/pdf.worker.mjs"
  );

  const data = new Uint8Array(await file.arrayBuffer());
  const parser = new PDFParse({ data });

  try {
    const result = await parser.getText();
    if (!result.text?.trim()) {
      throw new Error(
        "Could not extract text from this PDF. It may be scanned or image-only."
      );
    }
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
}

export async function extractFileText(file: File): Promise<string> {
  if (isTextFile(file)) {
    return extractTextFile(file);
  }

  if (isPdfFile(file)) {
    return extractPdfFile(file);
  }

  throw new Error("Please upload a .txt, .md, or .pdf file.");
}
