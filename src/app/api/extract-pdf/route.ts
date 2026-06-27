import { NextResponse } from "next/server";
import { PDFParse } from "pdf-parse";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    await parser.destroy();

    if (!result.text?.trim()) {
      return NextResponse.json(
        { error: "Could not extract text from PDF" },
        { status: 400 }
      );
    }

    return NextResponse.json({ text: result.text.trim() });
  } catch (err) {
    console.error("PDF extraction error:", err);
    return NextResponse.json(
      { error: "Failed to process PDF" },
      { status: 500 }
    );
  }
}
