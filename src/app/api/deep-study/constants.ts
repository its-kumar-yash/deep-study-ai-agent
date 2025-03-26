// Research constants
export const MAX_ITERATIONS = 2; // Maximum number of iterations
export const MAX_SEARCH_RESULTS = 1; // Maximum number of search results
export const MAX_CONTENT_CHARS = 20000; // Maximum number of characters in the content
export const MAX_RETRY_ATTEMPTS = 3; // It is the number of times the model will try to call LLMs if it fails
export const RETRY_DELAY_MS = 1000; // It is the delay in milliseconds between retries for the model to call LLMs

// Model names
export const MODELS = {
  PLANNING: "google/gemini-2.0-pro-exp-02-05:free",
  EXTRACTION: "google/gemini-2.0-flash-lite-preview-02-05:free",
  ANALYSIS: "google/gemini-2.0-flash-exp:free",
  REPORT: "deepseek/deepseek-r1-distill-qwen-32b:free"
  // REPORT: "anthropic/claude-3.7-sonnet:thinking",
}; 