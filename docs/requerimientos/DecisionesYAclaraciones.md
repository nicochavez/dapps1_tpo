# BidFlow — Decisiones de Diseño y Aclaraciones

Documento de registro de dudas, malentendidos y decisiones que surgieron al contrastar la idea intuitiva de la app con los requerimientos formales (`RequerimientosYFeatures.md`) y el ERD (`newErd.sql`).

---

## D-01 · Relación subasta ↔ producto

**La duda:** ¿Una subasta se refiere a un único producto?

**La realidad del modelo:**
Una subasta agrupa **muchos** productos a través de una cadena de tres tablas:

```
subastas (1) ──< catalogos (1) ──< itemscatalogo (N) ──> productos (1)
```

- `subastas` define el evento (fecha, moneda, categoría, rematador).
- `catalogos` es el catálogo asignado a esa subasta (RF-17).
- `itemscatalogo` es la tabla puente: cada fila representa un producto dentro del catálogo, con su `preciobase`, `comision`, `numeropieza` y flag `subastado`.
- `productos` es el bien físico que aporta un dueño.

Las **pujas** (`pujos`) apuntan a `itemscatalogo`, no a `subastas` directamente, porque se puja por ítem individual dentro de la sesión.

**Corolario importante:** `preciobase` y `comision` viven en `itemscatalogo`, no en `productos`. Eso permite que un mismo producto sea asignado a distintas subastas con precios distintos (por ejemplo si no se vendió y se reasigna).

---

## D-02 · Fecha de finalización por ítem

**La duda:** Cuando se vende un producto, ¿ese producto tenía una fecha de finalización de subasta distinta a la de los demás productos del catálogo?

**La realidad del modelo:**
No. En el ERD no existe ningún campo `fecha_cierre`, `deadline` ni countdown por ítem ni por subasta. El modelo refleja el comportamiento de un **remate presencial en vivo de puja ascendente**:

- Todos los ítems del catálogo se rematan dentro de **la misma sesión**, el mismo día, uno tras otro de forma secuencial.
- El cierre de un ítem no es un horario programado; es un **evento disparado por el rematador** cuando nadie supera la última puja (RF-35: *"cuando ya nadie iguale o supere la última puja, el sistema debe declarar ganador…"*).

Lo que sí existe y difiere por ítem es el **instante en que ocurrió el cierre**, que queda implícito en `pujos.fecha` de la puja ganadora (`ganador = true`). Ese timestamp es emergente del evento en vivo, no planificado.

---

## D-03 · Cómo la app informa "cuándo cierra" un ítem

**La duda:** El usuario necesita saber cuándo cierran las pujas para un ítem. ¿Cómo lo maneja la app?

**La realidad actual (implementado):**
La app no muestra un countdown ni una fecha de cierre, porque el cierre no está programado por tiempo. El modelo es de **sala de remate en vivo**:

1. El usuario hace `POST /subastas/{id}/conectar`.
2. Hace polling de `GET /subastas/{id}/item-actual`, que devuelve `ItemActualDto` con:
   - `item` → `identificador`, `descripcion`, `precioBase`, `imagenes`
   - `mejorOferta` → `importe`, `numeroPostor`
3. El "cierre" se percibe cuando el `item.identificador` cambia en el siguiente poll: el rematador pasó al siguiente ítem.

No existe ningún campo `tiempoRestante`, `fechaCierre` ni estado `por_cerrar` en la API actual.

**Gap identificado:**
RF-25 exige actualizaciones **en tiempo real**, y el polling actual lo aproxima. Si se quiere un aviso anticipado de cierre o un countdown real, habría que elegir entre dos mecanismos:

| Mecanismo | Descripción | Cambios necesarios |
|---|---|---|
| **Cierre por inactividad** | El ítem cierra tras N segundos sin nuevas pujas; el backend lo gestiona con un timer. Permite un countdown real. | Agregar `tiempoRestante` o `estado` en `ItemActualDto`; lógica de timer en el servicio |
| **Cierre manual del rematador** | El rematador decide cuándo (fiel al remate físico). No hay countdown predecible; a lo sumo un estado `por_cerrar` que él activa. | Agregar endpoint para que el rematador cambie el estado del ítem; propagar via push/SSE |

Aún **no se decidió** qué mecanismo implementar. Registrar la decisión aquí cuando se tome.

---

## Pendientes de decisión

| ID | Pregunta abierta |
|---|---|
| P-01 | ¿El cierre de ítem es por inactividad (timer) o por acción manual del rematador? |
| P-02 | ¿El polling de `item-actual` se reemplaza por WebSocket/SSE para cumplir RF-25 "tiempo real"? |
