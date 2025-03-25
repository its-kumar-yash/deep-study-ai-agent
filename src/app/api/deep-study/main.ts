import { generateSearchQueries } from "./research-functions";
import { ResearchState } from "./type";

export async function deepResearch(
  researchState: ResearchState,
  dataStream: any
) {
  const initialQueries = await generateSearchQueries(researchState);
    console.log(initialQueries);
    return initialQueries;
}
