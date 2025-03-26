import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { createGroq } from '@ai-sdk/groq';

import Exa from "exa-js"

export const exa = new Exa(process.env.EXA_SEARCH_API_KEY || "");

export const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY || "",
});

export const groq = createGroq({
  apiKey: process.env.GROQ_API_KEY || "",
})

