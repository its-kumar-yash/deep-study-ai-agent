/* eslint-disable @typescript-eslint/no-explicit-any */

import { z } from "zod";
import {
  ActivityTracker,
  ResearchFindings,
  ResearchState,
  SearchResult,
} from "./type";
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
import { exa, groq } from "./services";
import { combineFindings, handleError } from "./utils";
import {
  MAX_CONTENT_CHARS,
  MAX_ITERATIONS,
  MAX_SEARCH_RESULTS,
  MODELS,
} from "./constants";
import { streamText } from "ai";

export async function generateSearchQueries(
  researchState: ResearchState,
  activityTracker: ActivityTracker
) {
  try {
    activityTracker.add("planning", "pending", "Planning the research");

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
        activityType: "planning",
      },
      researchState,
      activityTracker
    );

    activityTracker.add("planning", "complete", "Crafted the research plan");

    return result;
  } catch (error) {
    return handleError(
      error,
      `Research planning`,
      activityTracker,
      "planning",
      {
        searchQueries: [
          `${researchState.topic} best practices`,
          `${researchState.topic} guidelines`,
          `${researchState.topic} research`,
        ],
      }
    );
  }
}

export async function search(
  query: string,
  ResearchState: ResearchState,
  activityTracker: ActivityTracker
): Promise<SearchResult[]> {
  activityTracker.add("search", "pending", `Searching for: ${query}`);

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

    activityTracker.add(
      "search",
      "complete",
      `Found ${filteredResults.length} results for: ${query}`
    );

    return filteredResults;
  } catch (error) {
    console.log("Error in search function", error);
    return (
      handleError(
        error,
        `Searching for: ${query}`,
        activityTracker,
        "search",
        []
      ) || []
    );
  }
}

export async function extractContent(
  content: string,
  url: string,
  ResearchState: ResearchState,
  activityTracker: ActivityTracker
) {
  try {
    activityTracker.add("extract", "pending", `Extracting content from ${url}`);
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
          summary: z
            .string()
            .describe("A comprehensive summary of the content"),
        }),
        activityType: "extract",
      },
      ResearchState,
      activityTracker
    );

    activityTracker.add("extract", "complete", `Extracted content from ${url}`);

    return {
      url,
      summary: (result as any).summary,
    };
  } catch (error) {
    return (
      handleError(
        error,
        `Content extraction from: ${url}`,
        activityTracker,
        "extract",
        null
      ) || null
    );
  }
}

export async function processSearchResults(
  searchResults: SearchResult[],
  researchState: ResearchState,
  activityTracker: ActivityTracker
): Promise<ResearchFindings[]> {
  const extractionPromises = searchResults.map((result) =>
    extractContent(result.content, result.url, researchState, activityTracker)
  );
  const extractionResults = await Promise.allSettled(extractionPromises);

  type ExtractionResult = { url: string; summary: string };

  const newFindings = extractionResults
    .filter(
      (result): result is PromiseFulfilledResult<ExtractionResult> =>
        result.status === "fulfilled" &&
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
  currentIteration: number,
  activityTracker: ActivityTracker
) {
  try {
    activityTracker.add(
      "analyze",
      "pending",
      `Analyzing research findings (iteration ${currentIteration}) of ${MAX_ITERATIONS}`
    );
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
        activityType: "analyze",
      },
      ResearchState,
      activityTracker
    );

    const isContentSufficient = (result as any).sufficient;

    activityTracker.add(
      "analyze",
      "complete",
      `Analyzed collected research findings: ${
        isContentSufficient
          ? "Content is sufficient"
          : "More information is needed"
      }`
    );

    return result;
  } catch (error) {
    console.log("Error in analyzeFindings", error);
    return handleError(error, `Content analysis`, activityTracker, "analyze", {
      sufficient: false,
      gaps: ["Error in content analysis"],
      queries: ["Please try a different search query"],
    });
  }
}

export async function generateReport(
  researchState: ResearchState,
  activityTracker: ActivityTracker,
  dataStream: any
) {
  try {
    activityTracker.add(
      "generate",
      "pending",
      `Generating comprehensive report!`
    );
    const content = combineFindings(researchState.findings);
    const prompt = getReportPrompt(
      content,
      researchState.topic,
      researchState.clarificationsText
    );
    // const report = await callModel(
    //   {
    //     model: MODELS.REPORT,
    //     prompt: prompt,
    //     system: REPORT_SYSTEM_PROMPT,
    //     activityType: "generate",
    //   },
    //   researchState,
    //   activityTracker
    // );
    const streamResult = await streamText({
      model: groq(MODELS.REPORT),
      prompt,
      system: REPORT_SYSTEM_PROMPT,
    });

    let report = "";
    for await (const chunk of streamResult.textStream) {
      report += chunk;
      dataStream.writeData({ type: "report_chunk", content: chunk });
    }
    activityTracker.add(
      "generate",
      "complete",
      `Generated comprehensive report, Total token used: ${researchState.tokenUsed}. Research completed in ${researchState.completedSteps} steps.`
    );
    dataStream.writeData({ type: "report_complete", content: report });
    return report;
  } catch (error) {
    console.log("Error in generateReport", error);
    return handleError(
      error,
      `Report generation`,
      activityTracker,
      "generate",
      "Error in report generation"
    );
  }
}
