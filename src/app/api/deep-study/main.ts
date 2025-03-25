import { MAX_ITERATIONS } from "./constants";
import {
  analyzeFindings,
  generateSearchQueries,
  processSearchResults,
  search,
} from "./research-functions";
import { ResearchState, SearchResult } from "./type";

export async function deepResearch(
  researchState: ResearchState,
  dataStream: any
) {
  let iteration = 0;
  const initialQueries = await generateSearchQueries(researchState);
  let currentQueries = (initialQueries as any).searchQueries;
  console.log("We have started the research");
  while (
    currentQueries &&
    currentQueries.length > 0 &&
    iteration < MAX_ITERATIONS
  ) {
    console.log("Generating search results for iteration", iteration);
    iteration++;
    const searchResults = currentQueries.map((query: string) =>
      search(query, researchState)
    );
    const searchResultsResponses = await Promise.allSettled(searchResults);
    const allSearchResults = searchResultsResponses
      .filter(
        (result) => result.status == "fulfilled" && result.value.length > 0
      )
      .map((result) => (result as PromiseFulfilledResult<SearchResult[]>).value)
      .flat();

    const newFindings = await processSearchResults(
      allSearchResults,
      researchState
    );

    console.log("New Findings", newFindings);

    researchState.findings = [...researchState.findings, ...newFindings];

    const analysis = await analyzeFindings(
      researchState,
      currentQueries,
      iteration
    );

    console.log("Analysis", analysis);

    if ((analysis as any).sufficient) {
      break;
    }

    //process the search results

    currentQueries = ((analysis as any).queries || []).filter(
      (query: string) => !currentQueries.include(query)
    );
  }

  console.log("Completed", researchState.completedSteps);
  console.log("Token Used", researchState.tokenUsed);
  console.log("Findings", researchState.findings);

  return initialQueries;
}
