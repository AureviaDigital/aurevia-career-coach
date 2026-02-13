import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// Configurable model constant
const MODEL = "claude-sonnet-4-5-20250929";
const MAX_TOKENS = 4000;

// Strict system instruction
const SYSTEM_INSTRUCTION = `You are a professional executive career coach.
You must not invent experience, education, certifications, companies, job titles, dates, or achievements.
You may improve phrasing and structure but must preserve factual accuracy.
If metrics are missing, suggest placeholders like [Add metric].`;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

type OutputType = "optimizedResume" | "coverLetter" | "keywordGap" | "interviewQuestions";

export async function POST(request: NextRequest) {
  try {
    // Check if API key is present
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "Missing ANTHROPIC_API_KEY. Check .env.local and restart server." },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { outputType, currentText, instruction, resumeText, jobText } = body;

    // Validate required fields
    if (!outputType || !currentText || !instruction || !resumeText || !jobText) {
      return NextResponse.json(
        { error: "outputType, currentText, instruction, resumeText, and jobText are required" },
        { status: 400 }
      );
    }

    // Validate outputType
    const validOutputTypes: OutputType[] = ["optimizedResume", "coverLetter", "keywordGap", "interviewQuestions"];
    if (!validOutputTypes.includes(outputType)) {
      return NextResponse.json(
        { error: `Invalid outputType. Must be one of: ${validOutputTypes.join(", ")}` },
        { status: 400 }
      );
    }

    console.log(`Refining ${outputType} with model:`, MODEL);

    // Map outputType to human-readable section name
    const sectionNames: Record<OutputType, string> = {
      optimizedResume: "Optimized Resume",
      coverLetter: "Cover Letter",
      keywordGap: "Keyword Gap Analysis",
      interviewQuestions: "Interview Questions",
    };

    const sectionName = sectionNames[outputType];

    // Make API call to refine the section
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_INSTRUCTION,
      messages: [
        {
          role: "user",
          content: `You are refining a specific section of career materials based on user feedback.

ORIGINAL RESUME:
${resumeText}

JOB DESCRIPTION:
${jobText}

CURRENT ${sectionName.toUpperCase()}:
${currentText}

USER'S REFINEMENT INSTRUCTION:
${instruction}

TASK:
Improve the ${sectionName} based on the user's instruction above. Follow these rules:

1. Address the user's specific refinement request
2. DO NOT invent job titles, companies, dates, degrees, certifications, or achievements
3. Only use information from the original resume
4. If metrics are missing, use placeholders like [Add metric] or [Add percentage]
5. Maintain professional tone and formatting
6. Keep all factual information accurate
7. Return ONLY the improved section text with no markdown code blocks, no explanations, no prefixes

Output the refined ${sectionName} text directly:`,
        },
      ],
    });

    const refinedText = message.content[0].type === "text" ? message.content[0].text : "";

    if (!refinedText) {
      console.error("Model returned empty response");
      return NextResponse.json(
        { error: "Model returned empty response" },
        { status: 500 }
      );
    }

    console.log(`Successfully refined ${outputType}`);

    return NextResponse.json({
      refinedText: refinedText.trim(),
    });
  } catch (err: any) {
    console.error("REFINE_ERROR", err);
    console.error(err?.stack);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
