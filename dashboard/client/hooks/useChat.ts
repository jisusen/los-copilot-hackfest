import { useState, useCallback } from 'react';
import type { Message } from '../lib/types';

/** Strip thinking/reasoning tags and meta-commentary that some models inject into output. */
function stripThinkingTags(text: string): string {
  let cleaned = text.replace(/<think>[\s\S]*?<\/think>/gi, "");
  cleaned = cleaned.replace(/<thinking>[\s\S]*?<\/thinking>/gi, "");
  // Strip lines that are meta-commentary (model talking about the question, not answering)
  const lines = cleaned.split("\n");
  const result: string[] = [];
  let headStripped = false;
  for (const line of lines) {
    const lower = line.toLowerCase().trim();
    if (!headStripped && (
      /^(hmm|huh|oh|ah|okay|ok|right|well|let me|i see|so|actually|however|while|now)[,!. ]/i.test(lower) ||
      /^(the user|user) (is |just |wants |needs |asking|said)/i.test(lower) ||
      /^(i think|i need to|i should|i'll|let me (think|analyze|check|explain|review))/i.test(lower) ||
      /^(based on|looking at|from the|according to|reading)/i.test(lower) ||
      /^(the instructions|my instructions|the system|my role|my purpose|as an? (ai|assistant|copilot|model))/i.test(lower) ||
      /^(i (am|'m) (a |an )?(ai |assistant |copilot |model ))/i.test(lower) ||
      /^(i'?ll (just |simply |now )?(print|output|respond|answer|give|provide|show|keep|respond|answer))/i.test(lower) ||
      /^(i (will|can|should) (just |simply )?(print|output|respond|answer|give|provide|show))/i.test(lower) ||
      /^(the (correct|right|proper|actual) (answer|response|output) is)/i.test(lower) ||
      /^(since the user|because the user|as the user)/i.test(lower) ||
      /^(i (notice|see|understand|realize|recognize))/i.test(lower) ||
      /^(this (request|question|task|message))/i.test(lower) ||
      /^(the (request|question|task))/i.test(lower) ||
      /^(my (task|goal|purpose|role|job))/i.test(lower) ||
      /^(i'?m (a |an )?(ai |assistant |copilot |model ))/i.test(lower) ||
      /^(i'?m (looking|reading|examining|analyzing|reviewing|checking|thinking))/i.test(lower)
    )) {
      continue; // skip this line
    }
    headStripped = true;
    result.push(line);
  }
  return result.join("\n").trim();
}

export function useChat(appId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || streaming) return;

    const userMsg: Message = { role: 'user', content: text };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setStreaming(true);
    setStreamingText('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appId, message: text, history: messages }),
      });

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const { text: chunk, error } = JSON.parse(data) as { text?: string; error?: string };
            if (error) {
              fullText = `[Error] ${error}`;
              setStreamingText(fullText);
            } else if (chunk) {
              fullText += chunk;
              setStreamingText(stripThinkingTags(fullText));
            }
          } catch {}
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: stripThinkingTags(fullText) }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'An error occurred. Please try again.' }]);
    } finally {
      setStreaming(false);
      setStreamingText('');
    }
  }, [appId, messages, streaming]);

  return { messages, streaming, streamingText, sendMessage };
}
