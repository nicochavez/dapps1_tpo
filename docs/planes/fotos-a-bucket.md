# Plan: Store product photos in a Railway Storage Bucket instead of DB blobs

## Context

Today `FotoEntity.foto` is a `byte[]` mapped to Postgres `bytea`. The phone uploads image
bytes as multipart `fotos` parts to `POST /api/v1/productos`, the backend persists the raw
bytes in Supabase, and every image render goes through
`GET /api/v1/productos/{id}/fotos/{id}`, which streams the blob back. This bloats the DB and
puts the backend in the image read path.

**Goal:** photos live in a **Railway Storage Bucket**; the phone uploads each file
**directly to the bucket**, the `fotos` row stores only the **object key** (a `String`), and
the app renders images **directly from the bucket**.

**Railway constraint (verified):** Storage Buckets are private and S3-compatible — there are
**no public buckets**, so there is no durable public URL to persist. The user confirmed the
render path: **presigned GET per response**. Both directions use presigned URLs:

- **Upload:** backend signs a presigned **PUT** URL; the phone PUTs bytes straight to
  `storage.railway.app`. No bucket secret ships in the app.
- **Render:** backend derives a presigned **GET** URL from the stored key on each DTO
  response; `<Image>` loads straight from the bucket. Backend stays out of the byte path.

Railway injects into the service: `BUCKET`, `ACCESS_KEY_ID`, `SECRET_ACCESS_KEY`,
`ENDPOINT` (`https://storage.railway.app`), `REGION` (`auto`).

### Key corrections vs. the draft (grounded in the code)

1. **There are 6 URL-building sites, not 5.** The draft missed
   `PujaService.firstFotoUrl` (`puja/service/PujaService.java:242-247`).
2. **No `application.properties` is tracked.** Config lives in
   `application.properties.example` (common) and `application-prod.properties` (the profile
   Railway actually runs, `SPRING_PROFILES_ACTIVE=prod`). Storage config goes in both,
   mirroring how mail/JWT config is duplicated today.
3. **The frontend only wires `createProducto`.** `EditAuctionItemScreen` and the
   `PATCH /{id}/fotos` / `PUT /{id}` endpoints are **not called** by the app (grep confirms
   `createProducto` in `CreateObjectStep3.jsx` is the only photo-writing call). So the
   frontend change is limited to `createProducto`; the backend edit endpoints are still
   converted to JSON keys for consistency but need no matching RN work.
4. **No SecurityConfig matcher needed for uploads.** `anyRequest().authenticated()` already
   covers `/api/v1/uploads/**`. The only SecurityConfig edit is **removing** the now-dead
   public matcher for `/api/v1/productos/*/fotos/**` (`SecurityConfig.java:63`).

---

## Data flow (before → after)

```
BEFORE
  phone --multipart bytes--> POST /productos --> fotos.foto = byte[] (Supabase)
  <Image> --> GET /productos/{id}/fotos/{id} --> backend streams blob

AFTER
  phone --POST /uploads/presign--> backend (SigV4) --> { key, uploadUrl }
  phone --PUT bytes, Content-Type--> storage.railway.app/<uploadUrl>   (direct)
  phone --POST /productos {..., fotos:[key,...]}--> fotos.url = key (String)
  <Image> --> presignGet(key) URL --> storage.railway.app              (direct)
```

---

## Backend changes

### B1. AWS S3 SDK — `backend/pom.xml`

Add a `<dependencyManagement>` block importing the AWS SDK BOM
(`software.amazon.awssdk:bom`, pin e.g. `2.31.x`, `<scope>import</scope>` / `<type>pom</type>`),
then a dependency on `software.amazon.awssdk:s3` (no version — managed by the BOM). The
`S3Presigner` ships inside the `s3` module, so no extra artifact is needed.

### B2. Storage config — `application-prod.properties` **and** `application.properties.example`

Add this block to both (prod is what Railway runs; the common example documents it for dev
and provides empty-safe defaults):

```
app.storage.bucket=${BUCKET:}
app.storage.endpoint=${ENDPOINT:https://storage.railway.app}
app.storage.region=${REGION:auto}
app.storage.access-key=${ACCESS_KEY_ID:}
app.storage.secret-key=${SECRET_ACCESS_KEY:}
app.storage.get-ttl-seconds=86400
app.storage.put-ttl-seconds=600
```

### B3. New `StorageService` — `com.tpo.backend.common.storage.StorageService`

`@Service` reading the `app.storage.*` props (via `@Value` or an `@ConfigurationProperties`
POJO). Builds an `S3Client` and `S3Presigner` with:
`endpointOverride(URI.create(endpoint))`, `region(Region.of(region))` (`Region.of("auto")` is
valid), `credentialsProvider(StaticCredentialsProvider.create(AwsBasicCredentials.create(...)))`,
and `serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())`.
Methods:

- `PresignedUpload presignPut(String contentType)` — generate key `fotos/{uuid}.jpg`, build a
  `PutObjectRequest` with `.contentType(contentType)` (**must** sign the content type; see
  gotcha below), presign for `put-ttl-seconds`; return `{ key, uploadUrl }`.
- `String presignGet(String key)` — presigned GET (`get-ttl-seconds`) for rendering; used by
  all 6 DTO sites.
- `void delete(String key)` — used by `eliminarFotos`.

> **SigV4 gotcha:** if `presignPut` signs `Content-Type`, the phone's PUT **must** send the
> exact same `Content-Type` header or the signature is rejected. Keep the value the phone
> sends (`presignUpload(contentType)`) identical to what it PUTs (F1). Store the content type
> per key end-to-end.

### B4. `FotoEntity` — store the key, not bytes

`producto/entity/FotoEntity.java`: replace the `byte[] foto` field (col `foto`) with

```java
// Object key within the Railway bucket (e.g. "fotos/uuid.jpg"); render URL is a
// presigned GET derived from this per response.
@Column(name = "url", nullable = false)
private String url;
```

### B5. Presign endpoint for the phone

New `common/storage/UploadController` at `/api/v1/uploads` (auth required — already the default
via `anyRequest().authenticated()`, so **no** SecurityConfig matcher to add):

- `POST /api/v1/uploads/presign` — JSON body `{ "contentType": "image/jpeg" }` (or a list to
  batch) → returns `[{ key, uploadUrl }]` from `StorageService.presignPut`. Guard with
  `@AuthenticationPrincipal AuthenticatedUser me` + `UnauthorizedException` if null (match the
  existing controller pattern).

### B6. Product write endpoints → JSON keys instead of multipart

The phone now sends already-uploaded object keys, not bytes.

- `ProductoNewRequest`: replace `List<MultipartFile> fotos` with `List<String> fotos` (keys);
  drop the `MultipartFile` import.
- `ProductoController.crear`: switch from `consumes = MULTIPART_FORM_DATA_VALUE` /
  `@ModelAttribute` to a JSON `@RequestBody`. Do the same for `actualizar` (`PUT /{id}`,
  currently `@RequestPart("data")` + `@RequestPart("fotos")`) and `agregarFotos`
  (`PATCH /{id}/fotos`) — accept `List<String>` keys as JSON. Remove the now-unused
  `MediaType`/`MultipartFile` imports.
- `ProductoService`: change `crear`, `actualizar`, `agregarFotos` signatures to take
  `List<String> keys`; rewrite `saveFotos(ProductoEntity, List<String> keys)` to create one
  `FotoEntity` per key (`foto.setUrl(key)`), dropping the `try/catch` + `getBytes` +
  `IOException` import.
- `eliminarFotos`: call `storageService.delete(foto.getUrl())` before `fotoRepository.delete`.
- **Delete the blob-serving path:** remove `ProductoService.getFotoBytes`, and remove
  `ProductoController.getFoto` + `detectImageType` + the `byte[]` / `MediaType` imports they
  needed.

### B7. Build render URLs from the key in all **6** DTO sites

Inject `StorageService` and replace every hard-coded
`"/api/v1/productos/" + id + "/fotos/" + f.getId()` with `storageService.presignGet(f.getUrl())`:

1. `producto/service/ProductoService.java:327-330` — `ProductoDto.FotoDto`
2. `catalogo/service/CatalogoService.java:226-227` — `imagenPrincipal` (`fotos.get(0).getUrl()`)
3. `catalogo/service/CatalogoService.java:264-267` — `ItemCatalogoDetailDto.FotoDto`
4. `subasta/service/SubastaService.java:269-271` — `ItemCatalogoDetailDto.FotoDto`
5. `subasta/service/SubastaService.java:368-371` — `buildFotoRefs` (`FotoRefDto`, used by
   `addItem` line 232 and line 364)
6. `puja/service/PujaService.java:242-247` — `firstFotoUrl`

The DTO field names stay (`url`, `imagenPrincipal`); they now carry an absolute
`https://storage.railway.app/...` presigned URL. RF-14 min-6-photos checks
(`fotoRepository.findByProductoId(...).size()`) are unaffected — they count rows, not bytes.

### B8. Drop the old `fotos` table (demo data)

`ddl-auto=update` will **not** convert `bytea`→`varchar`. Before/at deploy, run
`DROP TABLE fotos CASCADE;` on the Supabase (and local) DB so Hibernate recreates it with the
`url` column on next boot. Existing demo photos are discarded (agreed).

---

## Frontend changes

### F1. `services/api.js` — bucket helpers + dep

Add `expo-file-system` (`npx expo install expo-file-system`). New helpers:

- `presignUpload(contentType, token)` → `POST /uploads/presign` with `{ contentType }`,
  returns `{ key, uploadUrl }`.
- `uploadToBucket(uploadUrl, uri, contentType)` → PUT the file straight to the bucket via
  `FileSystem.uploadAsync(uploadUrl, uri, { httpMethod: 'PUT', uploadType:
FileSystemUploadType.BINARY_CONTENT, headers: { 'Content-Type': contentType } })`. The
  `Content-Type` **must** match what was passed to `presignUpload` (B3 SigV4 gotcha).

### F2. `createProducto(itemData, photos, token)` — upload first, then JSON

Rewrite (`services/api.js:238-258`, currently builds `FormData` with `fotos` file parts): for
each picked URI in `photos` → `presignUpload('image/jpeg')` → `uploadToBucket` → collect the
returned `key`. Then `POST /productos` with a **JSON** body (drop `FormData`) carrying the text
fields plus `fotos: [key1, key2, …]`. `apiRequest` already sets `Content-Type: application/json`
for non-FormData bodies, so no other change. `CreateObjectStep3.jsx` calls this unchanged.
(No `EditAuctionItemScreen` work — it doesn't call the backend for photos today.)

### F3. Rendering — no change

Backend now returns `fotos[].url` / `imagenPrincipal` as absolute `https://storage.railway.app/...`
URLs. `buildImageUrl()` (`services/api.js:40-45`) already passes `http(s)` URLs through
untouched, and every `<Image>` site runs values through it. No render-site edits.

### Out of scope (flag for later)

Registration DNI photos (`/auth/register`, `RegisterStep2`, `PersonaService` base64→DB) stay
as-is; can migrate to the same presign flow in a follow-up.

---

## Verification

**Backend** (Railway bucket env vars set, or a local S3-compatible endpoint like MinIO):

1. `POST /api/v1/uploads/presign` with a bearer token → `{ key, uploadUrl }`.
2. `curl -X PUT -H 'Content-Type: image/jpeg' --data-binary @sample.jpg "<uploadUrl>"` → `200`
   (confirms the signed content type matches).
3. `POST /api/v1/productos` JSON body with `fotos: ["<key>"]` → `201`.
4. `GET /api/v1/productos/{id}` → `fotos[0].url` is an absolute `storage.railway.app` presigned
   URL; opening it in a browser renders the image.
5. `GET /api/v1/productos/{id}/fotos/{id}` → `404` (route removed).
6. `./mvnw package -DskipTests` compiles clean — no remaining `getBytes` / `byte[] foto` /
   `MultipartFile` (in producto) / `detectImageType` references.

**Frontend** (Expo): 7. Create an object (CreateObjectStep1→3) with ≥6 photos → each presign+PUT succeeds, product
created, navigates to `AuctionUnderReview`. 8. Open the item in `ItemDetailScreen` / `MyAuctionsScreen` / catalog list → images load; the
network log shows requests to `storage.railway.app`, not the backend.
