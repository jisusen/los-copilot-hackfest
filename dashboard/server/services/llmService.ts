import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenAI } from "@google/genai";
import { sessionStore } from "./sessionStore";
import { getSettings } from "../routes/settings";
import { getActiveSkillContent } from "../routes/skills";
import { recordLlmUsage } from "../db/dashboardDb";

export type Message = { role: "user" | "assistant"; content: string };

/** Strip thinking/reasoning tags that some models (mimo, deepseek, qwen) inject into output. */
function stripThinkingTags(text: string): string {
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
  cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "");
  return cleaned.trim();
}

/** Detect if a line is meta-commentary (model talking about the question, not answering it). */
function isMetaCommentary(line: string): boolean {
  const lower = line.toLowerCase().trim();
  if (!lower) return false;
  // Thinking starters
  if (/^(hmm|huh|oh|ah|okay|ok|right|well|let me|i see|so|actually|however|while|now)[,!. ]/i.test(lower)) return true;
  // Model talking about the user's question
  if (/^(the user|user) (is |just |wants |needs |asking|said)/i.test(lower)) return true;
  if (/^(i think|i need to|i should|i'll|let me (think|analyze|check|explain|review))/i.test(lower)) return true;
  if (/^(based on|looking at|from the|according to|reading)/i.test(lower)) return true;
  // Model talking about its own instructions/role
  if (/^(the instructions|my instructions|the system|my role|my purpose|as an? (ai|assistant|copilot|model))/i.test(lower)) return true;
  if (/^(i (am|'m) (a |an )?(ai |assistant |copilot |model ))/i.test(lower)) return true;
  // Model explaining what it's going to do instead of doing it
  if (/^(i'?ll (just |simply |now )?(print|print|output|respond|answer|give|provide|show|keep|respond|answer))/i.test(lower)) return true;
  if (/^(i (will|can|should) (just |simply )?(print|output|respond|answer|give|provide|show))/i.test(lower)) return true;
  if (/^(the (correct|right|proper|actual) (answer|response|output) is)/i.test(lower)) return true;
  if (/^(since the user|because the user|as the user)/i.test(lower)) return true;
  // Model reasoning about whether to answer
  if (/^(i (notice|see|understand|realize|recognize))/i.test(lower)) return true;
  if (/^(this (request|question|task|message))/i.test(lower)) return true;
  if (/^(the (request|question|task))/i.test(lower)) return true;
  if (/^(my (task|goal|purpose|role|job))/i.test(lower)) return true;
  if (/^(i'?m (a |an )?(ai |assistant |copilot |model ))/i.test(lower)) return true;
  if (/^(i'?m (looking|reading|examining|analyzing|reviewing|checking|thinking))/i.test(lower)) return true;
  return false;
}

/** Streaming wrapper that suppresses thinking tags and meta-commentary in real-time. */
async function* filterStream(source: AsyncGenerator<string>): AsyncGenerator<string> {
  let buf = "";
  let inTag = false;
  let headDone = false; // once we yield real content, stop checking for meta

  for await (const chunk of source) {
    buf += chunk;

    while (true) {
      // Inside a <think> tag — suppress everything
      if (inTag) {
        const closeIdx = buf.toLowerCase().indexOf("</think>");
        if (closeIdx !== -1) {
          buf = buf.slice(closeIdx + 8);
          inTag = false;
          continue;
        }
        buf = "";
        break;
      }

      // Detect opening <think> tag
      const openIdx = buf.toLowerCase().indexOf("<think");
      if (openIdx !== -1) {
        if (openIdx > 0) yield stripThinkingTags(buf.slice(0, openIdx));
        buf = buf.slice(openIdx);
        inTag = true;
        continue;
      }

      // Once we've started yielding real content, just flush
      if (headDone) {
        if (buf.length > 20) {
          const safe = buf.length - 10;
          yield buf.slice(0, safe);
          buf = buf.slice(safe);
        }
        break;
      }

      // At the start: look for first real content line
      const nl = buf.indexOf("\n");
      if (nl === -1) {
        // No newline yet — keep buffering (up to 400 chars)
        if (buf.length > 400) {
          // If no newline in 400 chars, it's probably a long paragraph — just yield it
          headDone = true;
          yield buf;
          buf = "";
        }
        break;
      }

      const line = buf.slice(0, nl);
      buf = buf.slice(nl + 1);

      if (isMetaCommentary(line)) {
        // Skip this line — it's thinking
        continue;
      }

      // First non-meta line found — yield it and the rest
      headDone = true;
      yield line + "\n";
      break;
    }
  }

  if (buf) yield headDone ? buf : stripThinkingTags(buf);
}

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
  component: 'browse' | 'memo' | 'chat' = 'chat',
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
    let totalInput = 0;
    let totalOutput = 0;
    
    for await (const chunk of filterStream(streamGemini(gemini, cfg.geminiModel, systemPrompt, history, userMessage, (input, output) => {
      totalInput = input;
      totalOutput = output;
    }))) {
      yield chunk;
    }
    
    // Record usage after stream completes
    if (totalInput > 0 || totalOutput > 0) {
      try {
        recordLlmUsage(appId, component, cfg.geminiModel, totalInput, totalOutput);
      } catch (e) {
        console.error('[LLM] Failed to record usage:', e);
      }
    }
  } else if (cfg.provider === "custom" && cfg.customEndpoint) {
    yield* filterStream(streamCustomOpenAI(cfg.customEndpoint, cfg.customModel, cfg.apiKey, systemPrompt, history, userMessage));
  } else if (cfg.apiKey) {
    const anthropic = new Anthropic({ apiKey: cfg.apiKey });
    yield* filterStream(streamAnthropic(anthropic, cfg.anthropicModel, systemPrompt, history, userMessage));
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
  onUsage?: (inputTokens: number, outputTokens: number) => void,
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

  let totalInput = 0;
  let totalOutput = 0;

  for await (const chunk of result) {
    // Capture usage metadata from Gemini
    if (chunk.usageMetadata) {
      totalInput = chunk.usageMetadata.promptTokenCount ?? 0;
      totalOutput = chunk.usageMetadata.candidatesTokenCount ?? 0;
    }
    
    const text = chunk.candidates?.[0]?.content?.parts?.[0]?.text;
    if (text) yield text;
  }

  // Report final usage after stream completes
  if (onUsage && (totalInput > 0 || totalOutput > 0)) {
    onUsage(totalInput, totalOutput);
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
- Match the language of the user's message. If they write in Bahasa Indonesia, respond in Bahasa Indonesia. If they write in English, respond in English.
- NEVER start with "I think", "The user is asking", "Let me analyze", "Based on the data", or similar meta-commentary.
- Jump DIRECTLY to the answer. First word should be a fact, figure, or direct response.
- Provide SPECIFIC numbers and facts from the data above — do not estimate or fabricate
- If asked about CRDE, explain the triggered rules and their meaning clearly
- If data is not available in the context, state clearly: "This data is not available in the LOS extraction"
- Help the analyst understand the credit data — do not make credit decisions yourself
- Format responses clearly: use bullet points, specific figures, and concise explanations
- If asked a question unrelated to credit analysis, loan applications, or banking, politely refuse and redirect: "I'm the Credit Analyst Copilot — I can help with loan application reviews, credit data analysis, and memo writing. Silakan tanyakan tentang aplikasi kredit."
- Remain professional and objective`;

  return prompt;
}
