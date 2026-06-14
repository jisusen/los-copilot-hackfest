import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { sessionStore } from "./sessionStore";
import { getSettings } from "../routes/settings";
import { getActiveSkillContent } from "../routes/skills";

export type Message = { role: "user" | "assistant"; content: string };

function getProvider() {
  const s = getSettings();
  return {
    provider: s.llmProvider ?? "anthropic",
    apiKey: s.apiKey ?? "",
    anthropicModel: s.anthropicModel ?? "claude-sonnet-4-6",
    geminiModel: s.geminiModel ?? "gemini-2.0-flash",
    customEndpoint: s.customEndpoint ?? "",
    customModel: s.customModel ?? "",
  };
}

export async function* streamChat(
  appId: string,
  history: Message[],
  userMessage: string,
): AsyncGenerator<string> {
  const context = sessionStore.getChatContext(appId);

  if (!context) {
    yield "Session for this application not found. Please run the agent first.";
    return;
  }

  const systemPrompt = buildSystemPrompt(context);
  const cfg = getProvider();

  if (cfg.provider === "gemini" && cfg.apiKey) {
    const gemini = new GoogleGenAI({ apiKey: cfg.apiKey });
    yield* streamGemini(
      gemini,
      cfg.geminiModel,
      systemPrompt,
      history,
      userMessage,
    );
  } else if (cfg.provider === "custom" && cfg.customEndpoint) {
    yield* streamCustomOpenAI(
      cfg.customEndpoint,
      cfg.customModel,
      cfg.apiKey,
      systemPrompt,
      history,
      userMessage,
    );
  } else if (cfg.apiKey) {
    const anthropic = new Anthropic({ apiKey: cfg.apiKey });
    yield* streamAnthropic(
      anthropic,
      cfg.anthropicModel,
      systemPrompt,
      history,
      userMessage,
    );
  } else {
    yield "No LLM provider configured. Set API key in Settings.";
  }
}

async function* streamAnthropic(
  client: Anthropic,
  model: string,
  system: string,
  history: Message[],
  userMessage: string,
): AsyncGenerator<string> {
  const stream = client.messages.stream({
    model,
    max_tokens: 1024,
    system,
    messages: [
      ...history.map((m) => ({ role: m.role, content: m.content })),
      { role: "user", content: userMessage },
    ],
  });

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }
}

async function* streamGemini(
  client: GoogleGenAI,
  model: string,
  system: string,
  history: Message[],
  userMessage: string,
): AsyncGenerator<string> {
  const contents = [
    ...history.map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    })),
    { role: "user", parts: [{ text: userMessage }] },
  ];

  const result = await client.models.generateContentStream({
    model,
    config: { systemInstruction: system },
    contents,
  });

  for await (const chunk of result) {
    const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) yield text;
  }
}

async function* streamCustomOpenAI(
  endpoint: string,
  model: string,
  apiKey: string,
  system: string,
  history: Message[],
  userMessage: string,
): AsyncGenerator<string> {
  const messages = [
    { role: "system", content: system },
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: "user", content: userMessage },
  ];

  const url = endpoint.replace(/\/$/, "") + "/chat/completions";
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
    },
    body: JSON.stringify({
      model,
      messages,
      stream: true,
      max_tokens: 1024,
    }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Custom LLM error ${res.status}: ${text}`);
  }

  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === "data: [DONE]") continue;
      if (trimmed.startsWith("data: ")) {
        try {
          const json = JSON.parse(trimmed.slice(6));
          const d = json.choices?.[0]?.delta;
          // Some providers (e.g. glm-5.1 via LiteLLM) stream reasoning_content instead of content
          const delta = d?.content ?? d?.reasoning_content ?? "";
          if (delta) yield delta;
        } catch {
          /* ignore malformed JSON */
        }
      }
    }
  }
}

function buildSystemPrompt(context: string): string {
  const skillContent = getActiveSkillContent();
  let prompt = `You are the Credit Analyst Copilot, an AI assistant for consumer credit analysts at Bank Maju Bersama (JOKI AI), Indonesia.

You have access to the following application data, read directly from the Loan Origination System (LOS) by the AI agent:

${context}`;

  if (skillContent) {
    prompt += `\n\n## Active Skills / SOP\n${skillContent}`;
  }

  prompt += `

INSTRUCTIONS:
- Answer using formal English ONLY. Never respond in German or any other language.
- Output ONLY the final answer. Do not include thinking process, reasoning steps, or internal monologue.
- Provide SPECIFIC numbers and facts from the data above — do not estimate or fabricate
- If asked about CRDE, explain the triggered rules and their meaning clearly
- If data is not available in the context, state clearly: "This data is not available in the LOS extraction"
- Help the analyst understand the credit data — do not make credit decisions yourself
- Format responses clearly: use bullet points, specific figures, and concise explanations
- Remain professional and objective`;

  return prompt;
}
