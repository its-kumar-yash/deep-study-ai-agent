import { z } from "zod";

export interface ResearchFindings {
  summary: string;
  source: string;
}

export interface ResearchState {
  topic: string;
  completedSteps: number;
  tokenUsed: number;
  findings: ResearchFindings[];
  processedUrl: Set<string>;
  clarificationsText: string;
}

export interface ModelCallOptions<T> {
  model: string;
  prompt: string;
  system: string;
  schema: z.ZodType<T>;
}


export interface SearchResult {
  title: string;
  url: string;
  content: string;
}