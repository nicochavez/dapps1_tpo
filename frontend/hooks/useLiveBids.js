import { useState, useEffect, useRef } from 'react';

// El back debe exponer un endpoint WebSocket en esta ruta.
// Cada mensaje es un JSON: { id, itemId, userId, importe, ganador, fecha }
// Ejemplo de implementación en Spring Boot:
//   @ServerEndpoint("/ws/items/{itemId}/pujas")
const wsUrl = (itemId) => `ws://10.0.2.2:8080/ws/items/${itemId}/pujas`;

export default function useLiveBids(itemId, initialBids = []) {
  const [bids, setBids] = useState(initialBids);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef(null);

  useEffect(() => {
    if (!itemId) return;

    let ws;
    try {
      ws = new WebSocket(wsUrl(itemId));
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);

      ws.onclose = () => setConnected(false);

      ws.onerror = () => setConnected(false);

      ws.onmessage = ({ data }) => {
        try {
          const incoming = JSON.parse(data);
          // Prepend (lista ordenada desc, el más reciente arriba)
          setBids(prev => {
            if (prev.some(b => b.id === incoming.id)) return prev;
            return [incoming, ...prev];
          });
        } catch {
          // Ignorar mensajes malformados
        }
      };
    } catch {
      // WebSocket no disponible (dev sin backend) — queda con datos iniciales
    }

    return () => {
      wsRef.current?.close();
    };
  }, [itemId]);

  return { bids, connected };
}
