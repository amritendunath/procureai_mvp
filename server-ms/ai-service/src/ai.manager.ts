import { ChatOpenAI } from "@langchain/openai";
import { SystemMessage, HumanMessage } from "@langchain/core/messages";
import dotenv from 'dotenv';

dotenv.config();

const rawApiKey = process.env.OPEN_API_KEY || process.env.OPENROUTER_API_KEY || process.env.OPENAI_API_KEY;
const apiKey = rawApiKey?.trim();

const rawBaseURL = process.env.OPEN_API_BASE || 
                (process.env.OPENROUTER_API_KEY || (apiKey && apiKey.startsWith("sk-or-")) ? 'https://openrouter.ai/api/v1' : undefined);
const baseURL = rawBaseURL?.trim();

const modelNameQuick = process.env.OPEN_API_MODEL_NAME_QUICK || 
                       (process.env.OPENROUTER_API_KEY ? "openai/gpt-3.5-turbo" : "gpt-3.5-turbo");

if (apiKey) {
  console.log(`[AI Manager] Initializing with BaseURL: ${baseURL || 'Default OpenAI'}, Model: ${modelNameQuick}`);
}

const chatModel = apiKey ? new ChatOpenAI({
  apiKey: apiKey, 
  configuration: {
    baseURL: baseURL,
    defaultHeaders: {
      "HTTP-Referer": "http://localhost:5173",
      "X-Title": "ProcureAI"
    }
  },
  modelName: modelNameQuick,
  modelKwargs: {
    response_format: { type: "json_object" } 
  },
  timeout: 10000 
}) : null;

export const aiManager = {
  async extractRfpStructure(userText: string): Promise<any> {
    if (!chatModel) {
      console.warn("AI Key missing, returning mock data.");
      return {
        title: "Mock RFP Title",
        description: userText,
        structuredData: JSON.stringify({ items: ["Item 1"], budget: 1000 })
      };
    }

    try {
      const messages = [
        new SystemMessage("You are a procurement assistant. Extract the following JSON structure from the user's request: { title: string, items: Array<{name: string, quantity: number, specs: string}>, budget: number, deliveryDate: string, terms: string[] }. Return ONLY generic JSON."),
        new HumanMessage(userText)
      ];

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("AI Request Timed Out")), 10000)
      );

      const response = await Promise.race([
        chatModel.invoke(messages),
        timeoutPromise
      ]) as any;
      const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
      
      return JSON.parse(content);
    } catch (error: any) {
        if (error.message === "AI Request Timed Out") {
            console.warn("[AI Manager] Request timed out, switching to mock data.");
        } else {
            console.error("AI Error:", error);
        }
        return {
            title: "Mock RFP Title (Fallback)",
            description: userText,
            structuredData: JSON.stringify({
                title: "Procurement Request (Fallback)",
                items: [{ name: "High-performance Laptops", quantity: 20, specs: "32GB RAM, 1TB SSD" }],
                budget: 50000,
                deliveryDate: "Next Month",
                terms: ["Standard Warranty"]
            })
        };
    }
  },

  async parseProposal(emailBody: string): Promise<any> {
      if (!chatModel) return { price: 0, delivery: "Unknown", summary: "Mock analysis" };

      try {
        const messages = [
            new SystemMessage("Analyze this vendor email proposal. Extract JSON: { price: number (total), deliveryTimeline: string, warranty: string, pros: string[], cons: string[] }."),
            new HumanMessage(emailBody)
        ];

        const response = await chatModel.invoke(messages);
        const content = typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
        return JSON.parse(content);
      } catch (error) {
          console.error("AI Error:", error);
          return {};
      }
  },

  async compareProposals(proposals: any[]): Promise<string> {
      if (!chatModel) return "Mock comparison: Vendor A is cheapest.";

      try {
          const modelNameThink = process.env.OPEN_API_MODEL_NAME_THINK || modelNameQuick;
          const thinkModel = new ChatOpenAI({
            openAIApiKey: apiKey,
            configuration: { baseURL },
            modelName: modelNameThink,
          });

          const messages = [
              new SystemMessage("Compare these proposals and recommend a winner with reasoning. Data provided is valid JSON."),
              new HumanMessage(JSON.stringify(proposals))
          ];

          const response = await thinkModel.invoke(messages);
          return typeof response.content === 'string' ? response.content : JSON.stringify(response.content);
      } catch (error) {
          console.error("AI Error:", error);
          return "Failed to generate comparison.";
      }
  }
};
