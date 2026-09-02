import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

type AnalysisResult = {
  observation_type: "TREE" | "PLANT" | "ANIMAL" | "POLLINATOR" | "FUNGI" | "OTHER";
  common_name: string;
  scientific_name: string;
  notes: string;
  confidence: number;
};

export async function POST(request: Request) {
  try {
    const { imageBase64, mimeType } = await request.json() as { imageBase64: string; mimeType: string };

    if (!imageBase64 || !mimeType) {
      return NextResponse.json({ error: "Missing imageBase64 or mimeType" }, { status: 400 });
    }

    // Use Claude API if available
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (apiKey) {
      return analyzeWithClaude(imageBase64, mimeType, apiKey);
    }

    // Fallback: return placeholder
    return NextResponse.json(generatePlaceholderAnalysis(), { status: 200 });
  } catch (error) {
    console.error("Analysis error:", error);
    return NextResponse.json({ error: "Could not analyze image" }, { status: 500 });
  }
}

async function analyzeWithClaude(
  imageBase64: string,
  mimeType: string,
  apiKey: string
): Promise<Response> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType,
                data: imageBase64,
              },
            },
            {
              type: "text",
              text: `You are a biodiversity expert. Analyze this image and identify the organism.

Respond in JSON format ONLY (no markdown, no extra text):
{
  "observation_type": "TREE" | "PLANT" | "ANIMAL" | "POLLINATOR" | "FUNGI" | "OTHER",
  "common_name": "common name in English",
  "scientific_name": "scientific binomial name or 'Unknown'",
  "notes": "Brief description (max 100 words) of key identifying features",
  "confidence": 0.0 to 1.0
}

If uncertain, set confidence lower and use "Unknown" for scientific name.`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Claude API error:", error);
    return NextResponse.json(generatePlaceholderAnalysis(), { status: 200 });
  }

  const data = (await response.json()) as {
    content: Array<{ type: string; text: string }>;
  };
  const textContent = data.content.find((block) => block.type === "text");
  if (!textContent || textContent.type !== "text") {
    return NextResponse.json(generatePlaceholderAnalysis(), { status: 200 });
  }

  try {
    const result = JSON.parse(textContent.text) as AnalysisResult;
    return NextResponse.json(result, { status: 200 });
  } catch {
    return NextResponse.json(generatePlaceholderAnalysis(), { status: 200 });
  }
}

function generatePlaceholderAnalysis(): AnalysisResult {
  return {
    observation_type: "PLANT",
    common_name: "Unknown species",
    scientific_name: "Unknown",
    notes: "Photo analysis is not available yet. Please identify this organism based on its features.",
    confidence: 0,
  };
}
