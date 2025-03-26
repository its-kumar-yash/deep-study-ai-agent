import { NextResponse } from "next/server";
import { generateObject } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { groq } from "../deep-study/services";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

const clarifyResearchGoals = async (topic: string) => {
  const prompt = `
    You are an expert research assistant helping to refine and narrow down broad topics into well-defined research scopes. 

    Given the topic: <topic>${topic}</topic>, generate 2-4 insightful clarifying questions that will help define the research focus. Ensure the questions address the following aspects:
    - **Specific areas of interest** (key subtopics or focal points within the broader topic)
    - **Required depth and complexity** (whether the research should be introductory, in-depth, technical, or comparative)
    - **Preferred perspectives or constraints** (any particular angle, framework, methodology, or excluded sources)  

    Your questions should be clear, concise, and structured to guide a well-targeted research approach.
    `;
  try {
    const { object } = await generateObject({
      model: groq("deepseek-r1-distill-llama-70b"),
      prompt,
      schema: z.object({
        questions: z.array(z.string()),
      }),
    });
    return object.questions;
  } catch (e) {
    console.error("Error generating questions:", e);
  }
};

export async function POST(req: Request) {
  const { topic } = await req.json();
  console.log("Topic:", topic);
  try {
    const questions = await clarifyResearchGoals(topic);
    console.log("Questions:", questions);
    return NextResponse.json({
      questions,
    });
  } catch (e) {
    console.error("Error generating questions:", e);
    return NextResponse.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
}