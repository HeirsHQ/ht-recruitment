import { NextRequest, NextResponse } from "next/server";
import * as Handlebars from "handlebars";
import { readFileSync } from "fs";
import { join } from "path";

import SWAGGER_TEMPLATE from "./templates/swagger";
import REDOC_TEMPLATE from "./templates/redoc";

function getStaticSpec(): Record<string, unknown> | null {
  try {
    const filePath = join(process.cwd(), "public", "docs", "openapi.json");
    const raw = readFileSync(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const spec = getStaticSpec();
  if (!spec) {
    return NextResponse.json({ error: "Failed to load API specification" }, { status: 500 });
  }

  const format = searchParams.get("format") || "swagger";
  const template = format === "redoc" ? REDOC_TEMPLATE : SWAGGER_TEMPLATE;
  const compiled = Handlebars.compile(template);

  const html = compiled({
    specUrl: "/docs/openapi.json",
  });

  return new Response(html, {
    headers: {
      "Content-Type": "text/html",
    },
  });
}
