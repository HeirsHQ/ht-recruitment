import Tesseract from "tesseract.js";
// Import from lib directly to avoid pdf-parse's index.js loading a test file on import
import pdfParse from "pdf-parse/lib/pdf-parse.js";

export interface ResumeParseResult {
  text: string;
  pages: number;
  method: "text" | "ocr";
}

export interface ResumeParseOptions {
  minCharsPerPage?: number;
  ocrLanguage?: string;
}

const DEFAULT_MIN_CHARS_PER_PAGE = 50;

/**
 * Parse a PDF resume buffer, extracting text content.
 * Tries direct text extraction first; falls back to OCR for scanned documents.
 */
export async function parseResume(buffer: Buffer, options?: ResumeParseOptions): Promise<ResumeParseResult> {
  const minChars = options?.minCharsPerPage ?? DEFAULT_MIN_CHARS_PER_PAGE;
  const lang = options?.ocrLanguage ?? "eng";

  const parsed = await pdfParse(buffer);
  const extractedText = parsed.text.trim();

  if (extractedText.length >= minChars * parsed.numpages) {
    return {
      text: extractedText,
      pages: parsed.numpages,
      method: "text",
    };
  }

  const { data } = await Tesseract.recognize(buffer, lang);

  return {
    text: data.text.trim(),
    pages: parsed.numpages,
    method: "ocr",
  };
}
