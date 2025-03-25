import { generateObject, generateText } from "ai";
import { openrouter } from "./services";
import { ModelCallOptions, ResearchState } from "./type";

export async function callModel<T>(
  { model, prompt, system, schema }: ModelCallOptions<T>,
  researchState: ResearchState
): Promise<T | string> {
  if (schema) {
    const { object, usage } = await generateObject({
      model: openrouter(model),
      prompt,
      system,
      schema: schema,
    });
    researchState.tokenUsed += usage.totalTokens;
    researchState.completedSteps += 1;
    return object;
  } else {
    const { text, usage } = await generateText({
      model: openrouter(model),
      prompt,
      system,
    });
    researchState.tokenUsed += usage.totalTokens;
    researchState.completedSteps += 1;
    return text;
  }
}
