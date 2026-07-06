# Documentación — BidFlow / Sistema de Subastas

Índice de la documentación del proyecto. Los documentos están agrupados por propósito:
**qué hay que construir** (requerimientos), **cómo está construido** (arquitectura),
**cómo se construyó cada pieza** (planes), **cómo demostrarlo** (demo) y los **datos**
(base de datos y assets).

> El contrato de API vivo es [`arquitectura/swagger.yaml`](./arquitectura/swagger.yaml)
> (OpenAPI 3.0.3), servido en runtime en `/swagger-ui.html`.

---

## 📂 Estructura

```
docs/
├── requerimientos/    Qué construir: enunciado, RF/HU, MVP y decisiones
├── arquitectura/      Cómo está hecho: trazabilidad, flujos, auth y API spec
├── planes/            Planes de implementación de cada feature
├── demo/              Guion de demo y notas de flujo
├── base-de-datos/     ERDs, seeds, backups y datos de prueba (.sql)
└── assets/            Imágenes y material de apoyo
```

---

## 📋 requerimientos/

Qué debe hacer el sistema. Punto de partida de todo lo demás.

| Documento | Descripción |
|---|---|
| [`TPO.md`](./requerimientos/TPO.md) | Enunciado original del trabajo práctico. Fuente de verdad del alcance. |
| [`RequerimientosYFeatures.md`](./requerimientos/RequerimientosYFeatures.md) | Requerimientos funcionales (RF), historias de usuario (HU) y features derivados del enunciado, con estado (✅ / 🟡 / ❌). |
| [`mvp_requerimientos_y_features.md`](./requerimientos/mvp_requerimientos_y_features.md) | Subconjunto mínimo para la primera versión: registrarse → pujar en vivo → ver el resultado de la compra. |
| [`RF_y_HU_a_solucionar.md`](./requerimientos/RF_y_HU_a_solucionar.md) | Lista acotada de RF/HU pendientes o parciales por resolver. |
| [`DecisionesYAclaraciones.md`](./requerimientos/DecisionesYAclaraciones.md) | Dudas, malentendidos y decisiones de diseño al contrastar la idea con el modelo formal. |
| [`BidFlow.pdf`](./requerimientos/BidFlow.pdf) | Export de la maqueta de Figma (PDF). |

## 🏛️ arquitectura/

Cómo está construido el sistema y cómo el código traza contra los requerimientos.

| Documento | Descripción |
|---|---|
| [`swagger.yaml`](./arquitectura/swagger.yaml) | **Contrato de API** (OpenAPI 3.0.3). Importar en [editor.swagger.io](https://editor.swagger.io). |
| [`AnalisisImplementacion.md`](./arquitectura/AnalisisImplementacion.md) | Análisis del código real (backend + frontend) contra los requerimientos: qué está hecho, parcial o falta. |
| [`EndpointsYRequerimientos.md`](./arquitectura/EndpointsYRequerimientos.md) | Mapa de cada endpoint REST / canal WebSocket contra los RF y HU que resuelve. |
| [`FlujoFrontendBackend.md`](./arquitectura/FlujoFrontendBackend.md) | Por cada RF/HU: qué pantalla lo dispara, qué endpoint consume, con qué payload y resultado. |
| [`jwt-auth.md`](./arquitectura/jwt-auth.md) | Implementación de autenticación/autorización JWT (HS256) sobre Spring Security. Reemplaza al token mock anterior. |

## 🛠️ planes/

Planes de implementación de features concretas (contexto, decisiones y pasos).

| Documento | Descripción |
|---|---|
| [`auth-direccion-mediopago-frontend.md`](./planes/auth-direccion-mediopago-frontend.md) | Conectar los controllers de auth, direcciones y medios de pago al frontend (register + login + CRUD). |
| [`pujas-websocket.md`](./planes/pujas-websocket.md) | Conectar el frontend al WebSocket STOMP real y hacer funcionar el botón de puja. |
| [`flujo-vendedor-integracion.md`](./planes/flujo-vendedor-integracion.md) | Integración completa del flujo de vendedor (proponer bien → inspección → propuesta → aceptar/rechazar). |
| [`fotos-a-bucket.md`](./planes/fotos-a-bucket.md) | Mover las fotos de productos de blobs en la DB a un Storage Bucket de Railway (presigned URLs). |

## 🎬 demo/

| Documento | Descripción |
|---|---|
| [`PlanDemo.md`](./demo/PlanDemo.md) | Guion de demo: recorrido de los flujos principales validando las reglas de negocio clave. |
| [`Idea_flujo_vendedor.txt`](./demo/Idea_flujo_vendedor.txt) | Notas informales sobre el flujo del vendedor. |

## 🗄️ base-de-datos/

Esquema, datos y respaldos. Ver [`initialErd.sql`](./base-de-datos/initialErd.sql) →
[`newErd.sql`](./base-de-datos/newErd.sql) para la evolución del modelo.

| Archivo | Descripción |
|---|---|
| [`initialErd.sql`](./base-de-datos/initialErd.sql) | Esquema ERD inicial. |
| [`newErd.sql`](./base-de-datos/newErd.sql) | Esquema ERD vigente. |
| [`seed.sql`](./base-de-datos/seed.sql) | Seed base (incluye el empleado verificador / admin). |
| [`seed_data.sql`](./base-de-datos/seed_data.sql) | Datos de seed extendidos. |
| [`datos_de_prueba_BBDD.sql`](./base-de-datos/datos_de_prueba_BBDD.sql) | Datos de prueba usados en la demo. |
| [`create-admin.sql`](./base-de-datos/create-admin.sql) | Alta manual del usuario administrador con `ROLE_EMPLEADO`. |
| [`DB_backup_20260630_191000.sql`](./base-de-datos/DB_backup_20260630_191000.sql) | Respaldo de la base (2026-06-30). |

## 🖼️ assets/

| Archivo | Descripción |
|---|---|
| [`dni-ejemplo.jpeg`](./assets/dni-ejemplo.jpeg) | DNI de ejemplo para probar la carga de documentación en el registro. |
