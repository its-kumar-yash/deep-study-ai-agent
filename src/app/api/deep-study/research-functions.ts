import { z } from "zod";
import { ResearchFindings, ResearchState, SearchResult } from "./type";
import { callModel } from "./model-caller";
import {
  ANALYSIS_SYSTEM_PROMPT,
  EXTRACTION_SYSTEM_PROMPT,
  getAnalysisPrompt,
  getExtractionPrompt,
  getPlanningPrompt,
  getReportPrompt,
  PLANNING_SYSTEM_PROMPT,
  REPORT_SYSTEM_PROMPT,
} from "./prompts";
import { exa } from "./services";
import { combineFindings } from "./utils";
import {
  MAX_CONTENT_CHARS,
  MAX_ITERATIONS,
  MAX_SEARCH_RESULTS,
  MODELS,
} from "./constants";

export async function generateSearchQueries(researchState: ResearchState) {
  const result = await callModel(
    {
      model: MODELS.PLANNING,
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

export async function search(
  query: string,
  ResearchState: ResearchState
): Promise<SearchResult[]> {
  try {
    const searchResult = await exa.searchAndContents(query, {
      type: "keyword",
      numResults: MAX_SEARCH_RESULTS,
      startPublishedDate: new Date(
        Date.now() - 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      endPublishedDate: new Date().toISOString(),
      startCrawlDate: new Date(
        Date.now() - 365 * 24 * 60 * 60 * 1000
      ).toISOString(),
      endCrawlDate: new Date().toISOString(),
      excludeDomains: ["https://www.youtube.com"],
      text: {
        maxCharacters: MAX_CONTENT_CHARS,
      },
    });

    const filteredResults = searchResult.results
      .filter((r) => r.title && r.text !== undefined)
      .map((r) => ({
        title: r.title || "",
        url: r.url,
        content: r.text || "",
      }));

    ResearchState.completedSteps++;
    return filteredResults;
  } catch (error) {
    console.log("Error in search function", error);
    return [];
  }
}

export async function extractContent(
  content: string,
  url: string,
  ResearchState: ResearchState
) {
  const result = await callModel(
    {
      model: MODELS.EXTRACTION,
      prompt: getExtractionPrompt(
        content,
        ResearchState.topic,
        ResearchState.clarificationsText
      ),
      system: EXTRACTION_SYSTEM_PROMPT,
      schema: z.object({
        summary: z.string().describe("A comprehensive summary of the content"),
      }),
    },
    ResearchState
  );

  return {
    url,
    summary: (result as any).summary,
  };
}

export async function processSearchResults(
  searchResults: SearchResult[],
  ResearchState: ResearchState
): Promise<ResearchFindings[]> {
  const extractionPromises = searchResults.map((result) =>
    extractContent(result.content, result.url, ResearchState)
  );
  const extractionResult = await Promise.allSettled(extractionPromises);

  type ExtractionResult = { url: string; summary: string };

  const newFindings = extractionResult
    .filter(
      (result): result is PromiseFulfilledResult<ExtractionResult> =>
        result.status == "fulfilled" &&
        result.value !== null &&
        result.value !== undefined
    )
    .map((result) => {
      const { summary, url } = result.value;
      return {
        summary,
        source: url,
      };
    });
  return newFindings;
}

export async function analyzeFindings(
  ResearchState: ResearchState,
  currentQueries: string[],
  currentIteration: number
) {
  try {
    const contentText = combineFindings(ResearchState.findings);
    const result = await callModel(
      {
        model: MODELS.ANALYSIS,
        prompt: getAnalysisPrompt(
          contentText,
          ResearchState.topic,
          ResearchState.clarificationsText,
          currentQueries,
          currentIteration,
          MAX_ITERATIONS,
          contentText.length
        ),
        system: ANALYSIS_SYSTEM_PROMPT,
        schema: z.object({
          sufficient: z
            .boolean()
            .describe(
              "Whether the content is sufficient for a comprehensive report"
            ),
          gaps: z.array(z.string()).describe("Identified gaps in the content"),
          queries: z
            .array(z.string())
            .describe("Search queries for missing information. Max 3 queries"),
        }),
      },
      ResearchState
    );

    return result;
  } catch (error) {
    console.log("Error in analyzeFindings", error);
  }
}

export async function generateReport(
    researchState: ResearchState
){
    try{
        const content = combineFindings(researchState.findings);
        const report = await callModel({
            model: MODELS.REPORT,
            prompt: getReportPrompt(
                content,
                researchState.topic,
                researchState.clarificationsText
            ),
            system: REPORT_SYSTEM_PROMPT,
        }, researchState);
        return report;
    } catch(error){
        console.log("Error in generateReport", error);
    }
}
