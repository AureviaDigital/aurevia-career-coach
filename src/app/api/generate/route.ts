import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

// Configurable model constant
const MODEL = "claude-sonnet-4-5-20250929";
const MAX_TOKENS = 8000;

// Strict system instruction
const SYSTEM_INSTRUCTION = `You are a professional executive career coach.
You must not invent experience, education, certifications, companies, job titles, dates, or achievements.
You may improve phrasing and structure but must preserve factual accuracy.
If metrics are missing, suggest placeholders like [Add metric].`;

// Log API key presence (without exposing the key)
console.log("ANTHROPIC_API_KEY present:", Boolean(process.env.ANTHROPIC_API_KEY));

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

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
    const { resumeText, jobText } = body;

    if (!resumeText || !jobText) {
      return NextResponse.json(
        { error: "resumeText and jobText are required" },
        { status: 400 }
      );
    }

    console.log("Generating career content with model:", MODEL);

    // Make a single API call with all prompts combined
    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_INSTRUCTION,
      messages: [
        {
          role: "user",
          content: `You must generate 4 sections for the user's career materials. Output them in this EXACT format with these EXACT markers:

===OPTIMIZED_RESUME===
[optimized resume text]

===COVER_LETTER===
[cover letter text]

===KEYWORD_GAP===
[keyword gap analysis text]

===INTERVIEW_QUESTIONS===
[interview questions text]

ORIGINAL RESUME:
${resumeText}

JOB DESCRIPTION:
${jobText}

Now generate all 4 sections following these instructions:

1. OPTIMIZED RESUME:
- Optimize the resume to better match the job description
- DO NOT invent job titles, companies, dates, degrees, or certifications
- Only rearrange, rephrase, or highlight existing information
- If metrics are missing, use placeholders like [Add metric] or [Add percentage]
- Keep all dates, companies, and titles exactly as provided
- Maintain the same resume format and structure
- Highlight relevant skills and experience for this job
- Use keywords from the job description naturally
- Emphasize accomplishments with metrics (use placeholders if missing)

2. COVER LETTER:
- Write a compelling cover letter (3-4 paragraphs)
- Only reference experience and skills actually listed in the resume
- DO NOT invent achievements, projects, or credentials
- Extract company name from job description if available
- Keep tone professional but personable
- Opens with a strong introduction
- Highlights 2-3 relevant achievements from the actual resume
- Shows genuine interest in the role
- Closes with a call to action

3. KEYWORD GAP ANALYSIS:
Provide a keyword gap analysis with these sections:

✅ MATCHING KEYWORDS (Found in Resume):
[List skills and keywords that appear in both]

⚠️ MISSING KEYWORDS (Not in Resume):
[List important keywords from job description missing in resume]

💡 RECOMMENDATIONS:
[Give 5 specific, actionable suggestions to add missing keywords authentically]

MATCH SCORE: [Percentage]%
[Brief explanation of the score]

4. INTERVIEW QUESTIONS:
Generate interview questions organized into these sections:

TECHNICAL QUESTIONS:
[5-7 questions based on required skills in the job description]

BEHAVIORAL QUESTIONS:
[5 questions using STAR method, relevant to the role]

ROLE-SPECIFIC QUESTIONS:
[3-5 questions about specific responsibilities mentioned in job description]

PREPARATION TIPS:
[5 actionable tips for this specific interview]

IMPORTANT: Use the exact markers shown above. Do not use markdown code blocks or extra formatting. Output plain text only.`,
        },
      ],
    });

    const responseText = message.content[0].type === "text" ? message.content[0].text : "";

    console.log("Received response from model, parsing sections...");

    // Parse the response by splitting on markers
    const optimizedResumeMatch = responseText.match(/===OPTIMIZED_RESUME===\s*([\s\S]*?)(?===COVER_LETTER===|$)/);
    const coverLetterMatch = responseText.match(/===COVER_LETTER===\s*([\s\S]*?)(?===KEYWORD_GAP===|$)/);
    const keywordGapMatch = responseText.match(/===KEYWORD_GAP===\s*([\s\S]*?)(?===INTERVIEW_QUESTIONS===|$)/);
    const interviewQuestionsMatch = responseText.match(/===INTERVIEW_QUESTIONS===\s*([\s\S]*?)$/);

    // Extract and trim sections
    const optimizedResume = optimizedResumeMatch?.[1]?.trim() || "";
    const coverLetter = coverLetterMatch?.[1]?.trim() || "";
    const keywordGap = keywordGapMatch?.[1]?.trim() || "";
    const interviewQuestions = interviewQuestionsMatch?.[1]?.trim() || "";

    // Validate that all sections are present
    if (!optimizedResume || !coverLetter || !keywordGap || !interviewQuestions) {
      console.error("Model response malformed. Missing sections:");
      console.error("optimizedResume:", !!optimizedResume);
      console.error("coverLetter:", !!coverLetter);
      console.error("keywordGap:", !!keywordGap);
      console.error("interviewQuestions:", !!interviewQuestions);
      console.error("Full response:", responseText);

      return NextResponse.json(
        { error: "Model response malformed. One or more sections are missing." },
        { status: 500 }
      );
    }

    console.log("Successfully parsed all 4 sections");

    return NextResponse.json({
      optimizedResume,
      coverLetter,
      keywordGap,
      interviewQuestions,
    });
  } catch (err: any) {
    console.error("GENERATE_ERROR", err);
    console.error(err?.stack);
    return NextResponse.json(
      { error: String(err?.message || err) },
      { status: 500 }
    );
  }
}
