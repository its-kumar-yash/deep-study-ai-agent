import { createDataStreamResponse } from "ai";
import { ResearchState } from "./type";
import { deepResearch } from "./main";

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const lastMessageContent = messages[messages.length - 1].content;
    const parsed = JSON.parse(lastMessageContent);
    const topic = parsed.topic;
    const clarifications = parsed.clarifications;
    // console.log(parsed);
    return createDataStreamResponse({
      execute: async (dataStream) => {
        // dataStream.writeData({ value: 'Hello' });
        const researchState: ResearchState = {
          topic: topic,
          completedSteps: 0,
          tokenUsed: 0,
          findings: [],
          processedUrl: new Set(),
          clarificationsText: JSON.stringify(clarifications),
        };
        const result = await deepResearch(researchState, dataStream);
        // console.log("Data", result);
      },
      // onError: error => `Custom error: ${error.message}`,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Invalid message",
      }),
      { status: 500 }
    );
  }
}
