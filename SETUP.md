# BidFlow — Instrucciones de ejecución (Segunda Entrega)

---

## Requisitos previos

| Herramienta | Versión mínima |
|---|---|
| Java JDK | 21 |
| Node.js | 18+ |
| Expo Go (celular) | última disponible en App Store / Play Store |

> El celular y la PC deben estar en la **misma red WiFi**.

---

## 1. Agregar el archivo de configuración del Backend

El archivo `backend/src/main/resources/application.properties` **no está incluido en el repositorio** (contiene credenciales de base de datos). Se entrega por separado junto con el link del repo.

Colocar el archivo recibido en:

```
backend/src/main/resources/application.properties
```

---

## 2. Levantar el Backend

```bash
cd backend

# Windows
mvnw.cmd spring-boot:run

# Mac / Linux
./mvnw spring-boot:run
```

Queda corriendo en `http://localhost:8080`.  
La base de datos es Supabase (nube) — no requiere configuración local.

---

## 2. Configurar la IP

El frontend necesita conocer la IP local de la PC donde corre el backend.

**Obtener la IP:**
- Windows → `ipconfig` → "Dirección IPv4"
- Mac/Linux → `ifconfig` → valor de `inet`

**Editar la línea 1 de `frontend/.env`:**

```js
EXPO_PUBLIC_API_BASE_URL=http://localhost:8080/api/v1;
```

---

## 3. Levantar el Frontend

```bash
cd frontend
npm install
npm start
```

Escanear el QR que aparece en la terminal con la app **Expo Go** desde el celular.

---

## Usuarios de prueba

| Usuario | Documento | Contraseña | Categoría |
|---|---|---|---|
| fgainski | 43442410 | 1234567890 | platino |
| nicolaschavez | *(credenciales propias)* | — | comun |

Los usuarios `fgainski` y `nicolaschavez` tienen datos precargados (ítems, pujas, medios de pago) para mostrar todas las funcionalidades de la app.
