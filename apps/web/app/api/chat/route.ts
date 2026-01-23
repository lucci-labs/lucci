import { Agent } from '@lucci/core';
import { convertToModelMessages } from 'ai';

// Instantiate the agent once (or per request if needed, but singleton is usually fine for stateless agents)
const agent = new Agent();

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Convert UI messages to ModelMessages (compatible with streamText in this version)
  // Await the conversion as it might handle async operations (e.g. downloads)
  const coreMessages = (await convertToModelMessages(messages)) as any[]; 

  const result = await agent.streamResponse(coreMessages);

  return (result as any).toDataStreamResponse();
}