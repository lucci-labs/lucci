import { Agent } from "@lucci/core"

const main = async () => {
  const agent = new Agent()

  const messages = [
    // Example conversation history
    {
      role: "user",
      content: "Hello! Can you check my portfolio for address 0x123...mock_address?"
    }
  ]

  console.log("Sending request to Lucci Agent...")
  
  const res = await agent.requestResponse(messages)

  console.log("\n--- Agent Response ---")
  console.log(res.text)
}

main().catch(console.error)
