# Plan: Sistema de Pujas con WebSocket

## Contexto

El backend ya tiene TODO implementado: `PujaController`, `PujaService`, `WebSocketConfig` (STOMP), `SubastaEventPublisher`, `AdjudicacionService` (scheduler cada 5s). El frontend tiene la UI construida pero con dos problemas críticos:

1. `useLiveBids.js` conecta via WebSocket raw a una URL inexistente (`ws://.../ws/items/{id}/pujas`) — el backend usa STOMP sobre `/ws` con SockJS
2. `handlePlaceBid` en `ItemDetailLiveView.jsx` es un TODO (solo hace `alert`)

El objetivo es: conectar el frontend al WebSocket STOMP real del backend y hacer que el botón "Place Bid" llame a la API.

---

## Backend: 2 cambios

### 1. `WebSocketConfig.java` — Agregar endpoint sin SockJS para React Native
`backend/src/main/java/com/tpo/backend/common/ws/WebSocketConfig.java`

React Native no puede usar el protocolo SockJS (depende de APIs de browser). Agregar un segundo endpoint STOMP puro:

```java
registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
registry.addEndpoint("/ws-native").setAllowedOriginPatterns("*"); // sin SockJS
```

### 2. `PujaRequest.java` — Hacer `medioPagoId` opcional
`backend/src/main/java/com/tpo/backend/puja/dto/PujaRequest.java`

El `medioPagoId` no se usa en `PujaService.realizarPuja()` (la validación ya ocurrió en `conectar`). Quitar `@NotNull`:

```java
private Long medioPagoId; // sin @NotNull
```

---

## Frontend: 3 cambios

### 3. Instalar `@stomp/stompjs`
```bash
cd frontend && npm install @stomp/stompjs
```

### 4. Reescribir `frontend/hooks/useLiveBids.js`

Reemplazar la conexión WebSocket raw por STOMP real.

```javascript
import { useState, useEffect, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import { API_BASE_URL } from '../services/api';

const WS_URL = API_BASE_URL
  .replace('/api/v1', '')
  .replace(/^http/, 'ws') + '/ws-native';

export default function useLiveBids(subastaId, itemId, initialBids = []) {
  const [bids, setBids]         = useState(initialBids);
  const [connected, setConnected] = useState(false);
  const [currentBid, setCurrentBid] = useState(null);
  const [closesAt, setClosesAt]   = useState(null);  // ISO string
  const [itemClosed, setItemClosed] = useState(false);
  const clientRef = useRef(null);

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
            if (tipo === 'item-actual' && payload?.itemId === itemId) {
              setClosesAt(payload.cierreProgramado);
            } else if (tipo === 'nueva-puja' && payload?.itemId === itemId) {
              const newBid = {
                id: Date.now(),
                numeroPostor: payload.numeroPostor,
                importe: payload.importe,
                ganador: false,
                fecha: new Date().toISOString(),
              };
              setBids(prev => [newBid, ...prev]);
              setCurrentBid(payload.importe);
              // Cada puja extiende el cierre 60 s (RF-25)
              setClosesAt(new Date(Date.now() + 60_000).toISOString());
            } else if (tipo === 'item-cerrado' && payload?.itemId === itemId) {
              setItemClosed(true);
              if (payload.resultado === 'vendido') {
                setBids(prev =>
                  prev.map(b =>
                    b.numeroPostor === payload.numeroPostor ? { ...b, ganador: true } : b
                  )
                );
              }
            }
          } catch {}
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError:  () => setConnected(false),
    });

    client.activate();
    clientRef.current = client;
    return () => client.deactivate();
  }, [subastaId, itemId]);

  return { bids, connected, currentBid, closesAt, itemClosed };
}
```

### 5. Actualizar `frontend/components/ItemDetailLiveView.jsx`

Tres cosas: pasar `subastaId` al hook, implementar `handlePlaceBid` con la API real, y agregar countdown + indicadores de rango.

Cambios específicos:
- Extraer `subastaId` de `props.subastaId`
- En `useEffect` de mount (cuando `!isOwner && canAccessPrices`): llamar `conectarASubasta(subastaId, token)` y guardar `numeroPostor` en state
- Cambiar `useLiveBids(item?.id, initialBids)` → `useLiveBids(subastaId, item?.id, initialBids)`
- Agregar `currentBid`, `closesAt`, `itemClosed` destructurados del hook
- Countdown con `setInterval` cada 1s que resta tiempo hasta `closesAt`
- `handlePlaceBid` real:
  ```javascript
  const handlePlaceBid = async () => {
    try {
      await realizarPuja(subastaId, item.id, Number(bidAmount), null, currentUser.token);
      setBidAmount('');
    } catch (e) {
      Alert.alert('Error al pujar', e.message);
    }
  };
  ```
- Mostrar rango sugerido (min/max basado en `currentPriceNum + precioBase * 0.01/0.20`)
- Mostrar badge del countdown: "Cierra en Xs"
- Mostrar badge "Postor #{numeroPostor}" cuando está conectado

### 6. Actualizar `frontend/views/ItemDetailScreen.jsx`

En el objeto `shared` dentro de `CatalogItemDetail`, agregar `subastaId`:
```javascript
const shared = {
  item, parentCatalog, navigation,
  canAccessPrices: showPrices, lockReason, requiredLabel,
  currentUser, isOwner, bids, won: !!won,
  subastaId,  // ← agregar esto
};
```

---

## Flujo completo post-implementación

1. User entra a un item en vivo → `ItemDetailLiveView` monta
2. Mount effect llama `POST /subastas/{id}/conectar` → user recibe `numeroPostor`
3. Hook STOMP conecta a `/ws-native`, subscribe a `/topic/subastas/{id}`
4. Scheduler del backend envía `item-actual` → countdown arranca
5. User ingresa monto → `POST /subastas/{id}/items/{id}/pujas`
6. Backend persiste, extiende ventana 60s, publica `nueva-puja` por STOMP
7. Todos los conectados reciben el evento → bid history actualizado en tiempo real
8. Al expirar ventana, backend publica `item-cerrado` → UI pasa a estado "ended"

---

## Verificación

1. Arrancar backend: `./mvnw spring-boot:run`
2. Arrancar frontend: `npm start` (Expo)
3. Loguear como cliente admitido con medio de pago verificado
4. Navegar a catálogo → item activo → ver badge "Live Auction"
5. Verificar que aparece badge de conexión "Live" en BidHistorySection
6. Colocar una puja → confirmar que aparece en el historial en tiempo real
7. Abrir segunda instancia (otro usuario/device) → confirmar que la puja del primero aparece en el segundo
8. Esperar expiración de la ventana (60s sin puja) → confirmar transición a "Ended"
