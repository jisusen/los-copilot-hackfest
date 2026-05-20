import { useState, useCallback } from 'react';
import type { Message } from '../lib/types';

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
              setStreamingText(fullText);
            }
          } catch {}
        }
      }

      setMessages(prev => [...prev, { role: 'assistant', content: fullText }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: 'An error occurred. Please try again.' }]);
    } finally {
      setStreaming(false);
      setStreamingText('');
    }
  }, [appId, messages, streaming]);

  return { messages, streaming, streamingText, sendMessage };
}
