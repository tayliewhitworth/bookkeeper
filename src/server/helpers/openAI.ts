import { Configuration, OpenAIApi } from "openai";
import { env } from "~/env.mjs";

const openai = new OpenAIApi(
  new Configuration({
    apiKey: env.OPENAI_API_KEY,
  })
);

export interface ChatGPTMessage {
  role: "user";
  content: string;
}

export interface ChatGPTResponse {
  model: string;
  messages: ChatGPTMessage[];
  temperature: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  max_tokens: number;
  n: number;
}

export const createChatCompletion = async (payload: ChatGPTResponse) => {
  try {
    const response = await openai.createChatCompletion(payload);

    const rawRecommendations = response.data.choices[0]?.message?.content;
    if (!rawRecommendations) return [];

    const recs = rawRecommendations.split("\n\n").map((rec) => {
      const lines = rec.split("\n");
      const title = lines[0]?.split(": ")[1]?.trim();
      const author = lines[1]?.split(": ")[1]?.trim();
      const description = lines[2]?.split(": ")[1]?.trim();

      if (!title || !author || !description) {
        throw new Error("Unable to generate recommendations");
      }

      return { title, author, description };
    });
    return recs;
  } catch (error) {
    console.error(error);
    throw new Error("Unable to generate recommendations");
  }
};
