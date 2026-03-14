import { createAnthropic } from "@ai-sdk/anthropic";
import { createOpenAI } from "@ai-sdk/openai";
import type { LanguageModel } from "ai";

interface ModelOptions {
  provider?: string;
  apiKey?: string;
}

export function getModel(options?: ModelOptions): LanguageModel {
  const provider = options?.provider || process.env.AI_PROVIDER || "anthropic";
  const apiKey = options?.apiKey;

  if (provider === "openai") {
    const key = apiKey || process.env.OPENAI_API_KEY;
    if (!key) throw new Error("No OpenAI API key configured.");
    const openai = createOpenAI({ apiKey: key });
    return openai("gpt-4o");
  }

  const key = apiKey || process.env.ANTHROPIC_API_KEY;
  if (!key) throw new Error("No Anthropic API key configured.");
  const anthropic = createAnthropic({ apiKey: key });
  return anthropic("claude-sonnet-4-5-20250929");
}
