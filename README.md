# Sistema de Subastas — TPO DAPPS1

REST API for an online auction platform that integrates with an existing on-premises auction system, allowing users to participate in live auctions from a mobile application.

## Deliverables

| Deliverable                | Location                                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------------------- |
| API Spec (Swagger/OpenAPI) | [`docs/swagger.yaml`](docs/swagger.yaml)                                                            |
| Figma Workspace            | [BidFlow — Figma](https://www.figma.com/design/37w5bak9cnELI1c5UNrcEF/BidFlow?t=Fab6gcKx8vtaq7sA-1) |
| Figma Export (PDF)         | [`docs/figma-export.pdf`](docs/BidFlow.pdf.pdf)                                                     |
| Source Repository          | This repo                                                                                           |

---

## How to Read the API Spec (Swagger)

The API is documented using **OpenAPI 3.0.3** and lives at [`docs/swagger.yaml`](docs/swagger.yaml).

### Option 1 — Swagger UI (recommended)

1. Go to [https://editor.swagger.io](https://editor.swagger.io).
2. Click **File → Import file** and select `docs/swagger.yaml`.
3. The interactive UI will render all endpoints, request/response schemas, and let you try calls directly.

### Option 2 — Swagger UI via Docker

```bash
docker run -p 8080:8080 \
  -e SWAGGER_JSON=/api/swagger.yaml \
  -v $(pwd)/docs:/api \
  swaggerapi/swagger-ui
```

Then open [http://localhost:8080](http://localhost:8080).

### Option 3 — VS Code extension

Install the **OpenAPI (Swagger) Editor** extension (`42Crunch.vscode-openapi`), then open `docs/swagger.yaml` directly in VS Code for inline preview and validation.

---

## Overview

The platform supports two types of participants:

- **Bidders (Postores):** Registered users who bid on items during live auctions.
- **Sellers (Dueños):** Users who submit their own items to be included in future auctions.

Auctions follow a **dynamic ascending (open-cry) format**: all participants can see competing offers in real time and may raise their bid until no higher offer is placed.

---

## Application Workflow

### 1. User Registration (Two-Stage Process)

**Stage 1 — Pre-registration (external process):**
The company collects the user's name, surname, document photos (front and back), legal address, and country of origin. The data is verified externally, and the user is assigned a **category**:

| Category   | Access Level |
| ---------- | ------------ |
| `comun`    | Base         |
| `especial` | Level 2      |
| `plata`    | Level 3      |
| `oro`      | Level 4      |
| `platino`  | Top Level    |

**Stage 2 — App registration:**
Once pre-approved, the user receives an email and must complete registration via the app:

1. `POST /auth/documentacion` — Upload front and back document photos.
2. `POST /auth/register` — Provide name, surname, email, and password.
3. `POST /auth/set-contrasenia` — Set or update personal password.
4. `POST /auth/login` — Authenticate and receive a **JWT token** used for all subsequent requests.

> All protected endpoints require `Authorization: Bearer <token>`.

---

### 2. Profile Setup

After login, the user configures their profile:

- **`GET/PUT /clientes/me`** — View and update profile (including profile photo).
- **`GET /clientes/me/metricas`** — View participation statistics (auctions attended, won, total offered/paid, breakdown by category).

**Addresses** (`/usuarios/{userId}/direcciones`):

- Add, update, delete, and mark a favorite delivery address.
- Required for shipping cost calculation after winning a bid.

**Payment Methods** (`/clientes/me/medios-pago`, `/medios-pago/*`):

- At least one **verified** payment method is required to place bids.
- Supported types:
  - Bank accounts (domestic or foreign) — registered via `POST /medios-pago/cuenta-bancaria`
  - Credit cards (national or international) — registered via `POST /medios-pago/tarjeta-credito`
  - Certified checks (pre-delivered before auction start) — registered via `POST /medios-pago/cheque`
- Payment methods carry a `montoReservado` (reserved funds) that caps total spending.
- Cannot delete the last verified payment method (`409`).

**Collection Accounts** (`/clientes/me/cuentas-cobro`):

- Bank accounts to receive proceeds from items sold at auction.
- Must be declared **before** the auction starts.
- Supports foreign bank accounts (CBU or SWIFT).

---

### 3. Submitting Items for Auction (Sellers)

Users who own items can request them to be included in a future auction:

1. `POST /productos/{duenioId}/addProducto` — Register a product with full description, availability, category, subcategory, and a reviewer assignment.
2. Upload at least 6 photos of the item.
3. Submit a `BienRequest` — includes property declaration (`declaracionPropiedad`) and lawful origin declaration (`declaracionOrigenLicito`).

**Company review process:**

- `PUT` on the item (internal) — The company accepts or rejects the submission via `BienRespuestaRequest`.
- If **rejected**: item is returned to owner at their cost; rejection reason is visible in the app.
- If **accepted**: item is assigned a `precioBase` (reserve price) and commission; the owner is notified of the auction date, time, and location.
- The owner can **reject the base price or commission**, triggering a return with shipping charges.

Each accepted item is insured by the auction company. The owner can view:

- `GET /seguros/{productoId}` — Insurance policy details (policy number, company, insured amount).
- Item location (which warehouse it is stored in).

---

### 4. Browsing Auctions and Catalogs

Auctions are publicly browsable:

- `GET /subastas` — Paginated list, filterable by `estado` (open/closed), `categoria`, `fecha`, and `moneda` (ARS/USD).
- `GET /subastas/{subastaId}` — Full auction detail including catalog.
- `GET /subastas/{subastaId}/catalogos` — List catalogs with all items.
- `GET /catalogos/{catalogoId}/items/{itemId}` — Full item detail (including product info, owner, photos, insurance).

> Catalog item **base prices** are visible only to registered and approved users.

---

### 5. Connecting to an Auction

To participate as a bidder:

1. `POST /subastas/{subastaId}/conectar` — Join an open auction as an attendee.

**Access requirements:**

- User category must be **≤ auction category** (e.g., a `plata` user can join `comun`, `especial`, or `plata` auctions, but not `oro` or `platino`).
- User must have **at least one verified payment method**.
- User can only be connected to **one auction at a time** (`403` if already connected elsewhere).

On success, the response includes a `numeroPostor` (bidder number) assigned for that session.

---

### 6. Live Bidding

Once connected, the user participates in real-time bidding:

- `GET /subastas/{subastaId}/item-actual` — View the current item being auctioned and the current best offer.
- `POST /subastas/{subastaId}/items/{itemId}/pujas` — Place a bid.

**Bid validation rules:**

| Rule      | Description                                                              |
| --------- | ------------------------------------------------------------------------ |
| Minimum   | `lastOffer + (basePrice × 1%)`                                           |
| Maximum   | `lastOffer + (basePrice × 20%)`                                          |
| Exception | Min/max limits **do not apply** to `oro` and `platino` category auctions |
| Funds     | Bid cannot exceed the user's available reserved funds (`montoReservado`) |
| Payment   | Must have a verified payment method matching the auction currency        |
| Penalties | Cannot bid if there is an unpaid fine (`multa`)                          |

Each bid is confirmed before the next one is accepted, preventing race conditions. All bids are stored in order with timestamps.

- `GET /subastas/{subastaId}/items/{itemId}/pujas` — Full bid history for an item (public).
- `GET /clientes/me/subastas/{subastaId}/pujas` — Authenticated user's own bids in a given auction.

---

### 7. Winning a Bid and Purchase Completion

When the auction for an item closes and no higher bid is placed, the last bidder becomes the new owner:

- The item is marked as sold (`subastado: true`).
- A **private notification** is sent to the winner with:
  - Winning bid amount
  - Commission
  - Shipping cost to the declared address
  - Total payable

The winner can opt for **personal pickup** via `PUT /clientes/me/compras/{id}/retiro-personal`, but doing so **voids the insurance coverage** on the item.

**If no one bids:** The auction company acquires the item at the base price.

**Purchase history:**

- `GET /clientes/me/compras` — Paginated list of all purchases.
- `GET /clientes/me/compras/{id}` — Purchase detail (item, auction, amounts, shipping, total).

---

### 8. Fines and Payment Obligations

If the winner cannot pay at the time of settlement:

1. A **fine of 10%** of the bid amount is imposed.
2. The user has **72 hours** to provide the necessary funds.
3. The fine must be paid before the user can participate in any future auction.

**Fine management:**

- `GET /clientes/me/multas` — List pending fines.
- `POST /clientes/me/multas/{id}/pagar` — Pay a fine using a registered payment method.

If the user fails to pay within the deadline, the case is escalated externally and the user loses access to all app services.

---

### 9. Auction Currency

- Each auction is conducted in a **single currency**: `ARS` (Argentine Pesos) or `USD` (US Dollars).
- USD auctions must be settled in USD — via international bank transfer or international credit card.
- Mixed-currency payment is **not allowed**.

---

### 10. Notifications

- `GET /usuarios/{userId}/notificaciones` — Retrieve all notifications for a user.
- Notifications include a title, message, read status, and creation timestamp.
- Used for: registration confirmation, auction results, item acceptance/rejection, fine alerts, and purchase summaries.

---

## API Summary

| Module              | Base Path                                    | Auth Required |
| ------------------- | -------------------------------------------- | :-----------: |
| Authentication      | `/auth/*`                                    |    Partial    |
| Users / Profile     | `/clientes/me`, `/usuarios/*`                |      Yes      |
| Addresses           | `/usuarios/{id}/direcciones`                 |      Yes      |
| Payment Methods     | `/clientes/me/medios-pago`, `/medios-pago/*` |      Yes      |
| Collection Accounts | `/clientes/me/cuentas-cobro`                 |      Yes      |
| Auctions            | `/subastas`                                  |    Partial    |
| Catalogs            | `/catalogos`, `/subastas/{id}/catalogos`     |      No       |
| Products            | `/productos`                                 |    Partial    |
| Bids                | `/subastas/{id}/items/{id}/pujas`            |    Partial    |
| Purchases           | `/clientes/me/compras`                       |      Yes      |
| Fines               | `/clientes/me/multas`                        |      Yes      |
| Insurance           | `/seguros/*`                                 |      Yes      |
| Notifications       | `/usuarios/{id}/notificaciones`              |      Yes      |
| Countries           | `/paises`                                    |      No       |

---

## Authentication

All protected endpoints use **JWT Bearer tokens**:

```
Authorization: Bearer <token>
```

Tokens are obtained via `POST /auth/login` using the user's document number and password.

---

## Error Handling

| HTTP Code | Meaning                                                                             |
| --------- | ----------------------------------------------------------------------------------- |
| `400`     | Invalid or missing request data                                                     |
| `401`     | Missing or invalid JWT token                                                        |
| `403`     | Insufficient category, unverified payment method, or account blocked by unpaid fine |
| `404`     | Resource not found                                                                  |
| `409`     | Conflict (e.g., user already connected to another auction, item already sold)       |
| `422`     | Insufficient funds                                                                  |

All error responses follow the `ErrorResponse` schema:

```json
{
  "codigo": "string",
  "mensaje": "string",
  "timestamp": "2026-04-20T00:00:00Z"
}
```

---

## Tech Stack

- **API Spec:** OpenAPI 3.0.3 (Swagger)
- **Auth:** JWT (Bearer)
- **Currencies:** ARS, USD
- **Pagination:** Page/size query parameters on list endpoints
