import { useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import { API_BASE_URL } from '../services/api';

const WS_URL = API_BASE_URL
  .replace('/api/v1', '')
  .replace(/^http/, 'ws') + '/ws-native';

/**
 * Gestiona la conexión WebSocket/STOMP para una subasta en vivo.
 * NO mantiene el historial de pujas — eso lo gestiona el padre via polling.
 * Sí mantiene: conexión, precio actual, tiempo de cierre, y si el lote cerró.
 */
export default function useLiveBids(subastaId, itemId, initialClosesAt = null) {
  const [connected, setConnected]   = useState(false);
  const [currentBid, setCurrentBid] = useState(null);
  const [closesAt, setClosesAt]     = useState(initialClosesAt);
  const [itemClosed, setItemClosed] = useState(false);
  const clientRef = useRef(null);

  // Sincronizar closesAt desde el item cuando llega por primera vez.
  useEffect(() => {
    if (initialClosesAt) setClosesAt(initialClosesAt);
  }, [initialClosesAt]);

  // Resetea el contador optimistamente a 60s (llamado por la vista tras pujar).
  const resetTimer = useCallback(() => {
    setClosesAt(new Date(Date.now() + 60_000).toISOString());
  }, []);

  useEffect(() => {
    if (!subastaId || !itemId) return;

    const client = new Client({
      webSocketFactory: () => new WebSocket(WS_URL),
      reconnectDelay: 5000,
      onConnect: () => {
        setConnected(true);
        client.subscribe(`/topic/subastas/${subastaId}`, ({ body }) => {
          try {
            const { tipo, payload } = JSON.parse(body);

            if (tipo === 'item-actual' && Number(payload?.itemId) === Number(itemId)) {
              setClosesAt(payload.cierreProgramado);

            } else if (tipo === 'nueva-puja' && Number(payload?.itemId) === Number(itemId)) {
              setCurrentBid(payload.importe);
              setClosesAt(payload.cierreProgramado ?? new Date(Date.now() + 60_000).toISOString());

            } else if (tipo === 'item-cerrado' && Number(payload?.itemId) === Number(itemId)) {
              setItemClosed(true);
              setClosesAt(null);
            }
          } catch {}
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError:  () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;

    return () => { client.deactivate(); };
  }, [subastaId, itemId]);

  return { connected, currentBid, closesAt, itemClosed, resetTimer };
}
