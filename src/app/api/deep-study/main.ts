import { timeStamp } from "console";
import { MAX_ITERATIONS } from "./constants";
import {
  analyzeFindings,
  generateReport,
  generateSearchQueries,
  processSearchResults,
  search,
} from "./research-functions";
import { ResearchState, SearchResult } from "./type";
import { createActivityTracker } from "./activity-tracker";

export async function deepResearch(
  researchState: ResearchState,
  dataStream: any
) {
  let iteration = 0;

  const activityTracker = createActivityTracker(dataStream, researchState);

  const initialQueries = await generateSearchQueries(
    researchState,
    activityTracker
  );
  let currentQueries = (initialQueries as any).searchQueries;
  console.log("We have started the research");

  while (
    currentQueries &&
    currentQueries.length > 0 &&
    iteration <= MAX_ITERATIONS
  ) {
    console.log("Generating search results for iteration", iteration);
    const searchResults = currentQueries.map((query: string) =>
      search(query, researchState, activityTracker)
    );
    const searchResultsResponses = await Promise.allSettled(searchResults);
    const allSearchResults = searchResultsResponses
      .filter(
        (result) => result.status == "fulfilled" && result.value.length > 0
      )
      .map((result) => (result as PromiseFulfilledResult<SearchResult[]>).value)
      .flat();

    console.log("Search Results", allSearchResults);

    const newFindings = await processSearchResults(
      allSearchResults,
      researchState,
      activityTracker
    );

    console.log("New Findings", newFindings);

    researchState.findings = [...researchState.findings, ...newFindings];

    const analysis = await analyzeFindings(
      researchState,
      currentQueries,
      iteration,
      activityTracker
    );

    console.log("Analysis", analysis);

    if ((analysis as any).sufficient === true) {
      console.log("Research is complete");
      break;
    }

    //process the search results
    console.log("Processing search results");

    currentQueries = ((analysis as any).queries || []).filter(
      (query: string) => !currentQueries.include(query)
    ); 
    console.log("Current Queries", currentQueries);
    iteration++;
    console.log("Iteration", iteration);
  }

  const report = await generateReport(researchState, activityTracker);

  dataStream.writeData({
    type: "report",
    content: report,
  });

  console.log("Report", report);

  return initialQueries;
}
