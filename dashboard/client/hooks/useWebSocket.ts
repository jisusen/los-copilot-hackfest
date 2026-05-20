import { useEffect, useRef, useCallback } from 'react';
import type { WsMessage } from '../lib/types';

export function useWebSocket(onMessage: (msg: WsMessage) => void) {
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;

  const connect = useCallback(() => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(`${protocol}//${window.location.host}/ws`);
    wsRef.current = ws;

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data) as WsMessage;
        onMessageRef.current(msg);
      } catch {}
    };

    ws.onclose = () => {
      console.log('[WS] Disconnected, reconnecting in 2s...');
      setTimeout(connect, 2000);
    };

    ws.onerror = () => ws.close();

    // Heartbeat
    const ping = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }));
      }
    }, 30000);

    ws.onclose = () => {
      clearInterval(ping);
      console.log('[WS] Reconnecting in 2s...');
      setTimeout(connect, 2000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
    };
  }, [connect]);
}
