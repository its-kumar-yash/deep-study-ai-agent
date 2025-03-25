import { z } from "zod";
import { ResearchState } from "./type";
import { callModel } from "./model-caller";
import { getPlanningPrompt, PLANNING_SYSTEM_PROMPT } from "./prompts";

export async function generateSearchQueries(researchState: ResearchState) {
  const result = await callModel(
    {
      model: "google/gemini-2.0-pro-exp-02-05:free",
      prompt: getPlanningPrompt(
        researchState.topic,
        researchState.clarificationsText
      ),
      system: PLANNING_SYSTEM_PROMPT,
      schema: z.object({
        searchQueries: z
          .array(z.string())
          .describe(
            "The search queries that can be used to find the most relevent content which can be used to write the comprehensive report on the given topic. (max 3 queries)"
          ),
      }),
    },
    researchState
  );

  return result;
}
