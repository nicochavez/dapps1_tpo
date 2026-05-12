# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**BidFlow / Sistema de Subastas** — a REST API + React Native mobile app for an online auction platform. Users participate in live ascending-bid auctions, submit items for sale, manage payment methods, and track purchases.

Two user roles: **Bidders (Postores)** place bids; **Sellers (Dueños)** submit items to be auctioned.

---

## Backend (Spring Boot)

### Stack
- **Java 21**, **Spring Boot 4.0.3** (`spring-boot-starter-webmvc`)
- **Spring Data JPA** + **PostgreSQL** (Supabase-hosted)
- **Lombok** for boilerplate reduction
- **springdoc-openapi 2.5.0** for Swagger UI at `/swagger-ui.html`
- Maven wrapper (`./mvnw`)

### Commands
```bash
# From /backend
./mvnw spring-boot:run
./mvnw package -DskipTests
./mvnw test
./mvnw test -Dtest=BackendApplicationTests
```

### Configuration
`backend/src/main/resources/application.properties` — contains the Supabase PostgreSQL credentials. JPA is set to `ddl-auto=update`.

### Architecture
All endpoints are under `/api/v1/`. The backend is **mock-driven**: most services inject `MockDataStore` (a Spring `@Component` in `common/mock/`) holding in-memory lists/maps instead of real JPA repositories. The sole exception is `persona`, which has a real JPA entity, repository, and service.

**Standard package layout per feature:**
```
com.tpo.backend.<feature>/
  controller/   — @RestController
  service/      — business logic, uses MockDataStore
  dto/          — request/response POJOs (Lombok @Data)
```

**Implemented modules** (controller + service + DTOs):
- `auth` — login/register, returns `"mock-jwt-token-for-<documento>"`. No real JWT validation; token is not verified on protected endpoints.
- `subasta` — list/get auctions, connect/disconnect, get current item
- `cliente` — profile GET/PUT, metrics
- `mediospago` — full CRUD for payment methods (at `/api/v1/clientes/me/medios-pago`)
- `puja` — service exists, **no controller yet**; bids endpoint (`/api/v1/subastas/{id}/items/{id}/pujas`) is unimplemented

**DTOs-only modules** (no controller or service yet): `bien`, `catalogo`, `compra`, `cuentacobro`, `historial`, `multa`, `seguro`

**Cross-cutting:**
- `common/exception/` — typed exceptions (`BadRequestException`, `ConflictException`, `ForbiddenException`, `ResourceNotFoundException`, `UnauthorizedException`, `UnprocessableEntityException`), all handled by `GlobalExceptionHandler` → `ErrorResponse { codigo, mensaje, timestamp }`
- `common/mock/MockDataStore` — single shared in-memory store; seeded with one demo account: documento `12345678` / password `password123`
- `common/dto/PagedResponse` — generic paginated list wrapper

---

## Frontend (React Native / Expo)

### Stack
- **React Native 0.83.2**, **Expo ~55**
- Files are primarily `.jsx`; only `index.ts` and `nativewind-env.d.ts` are TypeScript
- **NativeWind 4** (Tailwind via `className` prop); global CSS in `frontend/global.css`
- **`@react-navigation/native`** with `createNativeStackNavigator` — all screens registered in `App.jsx`
- `react-native-svg` for icons

### Commands
```bash
# From /frontend
npm install
npm start          # Expo dev server
npm run android
npm run ios
npm run web
```

### Architecture
Entry point is `frontend/index.ts` → `App.jsx`. Navigation is a flat native stack declared in `App.jsx`; all screens live in `frontend/views/`.

**`frontend/context/AuthContext.jsx`** — provides `{ user, login, logout }` via React context. State is in-memory only (no persistence); `user` is whatever object the login screen sets.

The frontend calls **no real API yet** — screens use local mock data or static state. When wiring up API calls, the backend runs on port 8080 by default.

**Screen inventory** (all in `frontend/views/`):
- Auth flow: `SplashScreen`, `LoginScreen`, `RegisterStep1–3`, `RegisterPending`
- Bidder flow: `HomeScreen`, `ExploreCatalogsScreen`, `CatalogItemsScreen`, `ItemDetailScreen`, `BidsScreen`, `ViewAuctionScreen`, `CompletePurchaseScreen`
- Seller flow: `CreateAuctionScreen`, `CreateObjectStep1–3`, `MyAuctionsScreen`, `ManageAuctionScreen`, `ManageObjectScreen`, `EditAuctionItemScreen`, `AuctionUnderReviewScreen`
- Account: `ProfileScreen`, `AddPaymentMethodScreen`, `AddressesScreen`, `EditAddressScreen`, `NotificationsScreen`

Reusable components are in `frontend/components/` (`Header`, `Footer`, `CardForm`, `BankForm`, `CheckForm`).

---

## API Reference

The canonical contract is `docs/swagger.yaml` (OpenAPI 3.0.3). Import it at [editor.swagger.io](https://editor.swagger.io) or run the Docker command from the README.

| Module | Base Path |
|---|---|
| Auth | `/api/v1/auth/*` |
| Profile | `/api/v1/clientes/me` |
| Payment Methods | `/api/v1/clientes/me/medios-pago` |
| Auctions | `/api/v1/subastas` |
| Bids | `/api/v1/subastas/{id}/items/{id}/pujas` |
| Purchases | `/api/v1/clientes/me/compras` |
| Fines | `/api/v1/clientes/me/multas` |

---

## Domain Rules

- **User categories** (lowest → highest): `comun` → `especial` → `plata` → `oro` → `platino`. A user can only join auctions at their own level or below.
- **Bid limits**: new bid must be between `lastOffer + 1%` and `lastOffer + 20%` of `precioBase`; limits waived for `oro`/`platino` auctions.
- **Payment**: each auction runs in a single currency (ARS or USD); the user needs a verified payment method in that currency to bid.
- **Fines**: 10% of the bid amount if the winner can't pay; blocks participation until paid.
- **Auction flow**: `POST /subastas/{id}/conectar` → receives `numeroPostor`, then poll `GET /subastas/{id}/item-actual`, then `POST` bids.

---

## Data Model

`backend/database` is a SQLite reference schema. Key tables: `personas`, `clientes`, `duenios`, `subastadores`, `empleados`, `subastas`, `catalogos`, `itemsCatalogo`, `productos`, `fotos`, `asistentes`, `pujos`, `seguros`, `registroDeSubasta`. The Spring backend mirrors this via JPA where implemented.
