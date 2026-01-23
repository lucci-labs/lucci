import { Agent } from "@lucci/core"

const main = async () => {
  const agent = new Agent()

  const messages = [
    {
      role: "user",
      content: "Swap 1 SOL to USDC on Solana and then check my portfolio."
    }
  ]

  console.log("Sending request to Lucci Agent...\n")

  const stream = await agent.streamResponse(messages);

  // Use fullStream to capture text chunks, tool calls, and results
  for await (const part of stream.fullStream) {
    switch (part.type) {
      case 'text-delta':
        // Stream text chunks to stdout without newlines
        console.log(part.text);
        break;

      case 'tool-call':
        console.log(`\n\n[Tool Call: ${part.toolName}]`);
        console.log(`Arguments: ${JSON.stringify(part.input, null, 2)}`);
        break;

      case 'tool-result':
        console.log(`[Tool Result: ${part.toolName}]`);
        // console.log(`Output: ${JSON.stringify(part.result, null, 2)}`);
        break;

      case 'error':
        console.error(`\n[Error]: ${part.error}`);
        break;

      case 'finish':
        console.log("\n\n--- Done ---");
        break;
    }
  }
}

main().catch(console.error)
