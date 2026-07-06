// La URL sale de frontend/.env (EXPO_PUBLIC_API_BASE_URL). El fallback apunta a prod
// para no caer nunca a una IP local muerta si la env no está definida en un build.
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://dapps1tpo-production.up.railway.app/api/v1';

// Métodos idempotentes por semántica HTTP: seguros de reintentar ante un error de
// TRANSPORTE (respuesta perdida) sin duplicar efectos.
const METODOS_REINTENTABLES = new Set(['GET', 'HEAD', 'PUT', 'DELETE', 'OPTIONS']);

export async function apiRequest(path, options = {}) {
  // `idempotent`/`retries` son control interno; no se envían en el fetch.
  const { token, headers, idempotent, retries, ...fetchOptions } = options;

  const isFormData = fetchOptions.body instanceof FormData;
  const method = (fetchOptions.method || 'GET').toUpperCase();

  // ¿Podemos reintentar si se pierde la respuesta (keep-alive reseteado por el edge)?
  // Sí para GET/PUT/DELETE, y para POST solo si el caller lo declara idempotente
  // (login = sin efecto colateral; puja = deduplicada por idempotencyKey en el back).
  // NO para POST de pago/alta: reintentar duplicaría la acción que ya se ejecutó.
  const puedeReintentar = idempotent === true || METODOS_REINTENTABLES.has(method);
  const maxIntentos = puedeReintentar ? (retries ?? 2) + 1 : 1;

  const finalHeaders = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    // Desactiva el reuso de conexiones keep-alive: el edge de Railway cierra las
    // conexiones ociosas sin anunciar timeout y okhttp reusa una ya muerta → la
    // request llega y se ejecuta pero la respuesta se pierde ("Network request failed").
    // Abrir conexión nueva por request (como curl) elimina esa race.
    Connection: 'close',
    ...(headers || {}),
  };

  let ultimoError;
  for (let intento = 1; intento <= maxIntentos; intento++) {
    try {
      const response = await fetch(`${API_BASE_URL}${path}`, {
        ...fetchOptions,
        headers: finalHeaders,
      });

      const text = await response.text();

      let data = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = text;
      }

      if (!response.ok) {
        const fieldErrors = data?.errors
          ? Object.values(data.errors).join(', ')
          : null;
        const err = new Error(
          typeof data === 'string'
            ? data
            : fieldErrors || data?.error || data?.mensaje || data?.message || `Error HTTP ${response.status}`
        );
        err.status = response.status; // permite a los callers distinguir 400/409/422/etc.
        throw err;
      }

      return data;
    } catch (e) {
      // Un error HTTP tiene `status` (el server respondió): NO se reintenta.
      // Un error de transporte (fetch rechaza con TypeError, sin status) sí, si queda intento.
      const esErrorDeTransporte = typeof e?.status !== 'number';
      if (esErrorDeTransporte && intento < maxIntentos) {
        ultimoError = e;
        console.log('[apiRequest] retry', intento, method, path, e?.message);
        await new Promise((r) => setTimeout(r, 300 * intento)); // backoff corto
        continue;
      }
      throw e;
    }
  }
  throw ultimoError;
}

export function buildImageUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const apiRoot = API_BASE_URL.replace('/api/v1', '');
  return `${apiRoot}${path}`;
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export function loginRequest(documento, contrasenia) {
  return apiRequest('/auth/login', {
    method: 'POST',
    // Sin efecto colateral: reintentar ante respuesta perdida es seguro (evita el
    // "Network request failed" fantasma que castiga sobre todo al login).
    idempotent: true,
    body: JSON.stringify({ documento, contrasenia }),
  });
}

export function registerRequest({
  nombre, apellido, documento, email,
  dniFrente, dniDorso,
  calle, numeroCalle, piso, departamento,
  ciudad, provincia, codigoPostal,
  numeroPais = 32,
}) {
  const form = new FormData();
  form.append('nombre', nombre);
  form.append('apellido', apellido);
  form.append('documento', documento);
  form.append('email', email);
  form.append('calle', calle);
  form.append('numeroCalle', numeroCalle);
  if (piso) form.append('piso', piso);
  if (departamento) form.append('departamento', departamento);
  form.append('ciudad', ciudad);
  if (provincia) form.append('provincia', provincia);
  form.append('codigoPostal', codigoPostal);
  form.append('numeroPais', String(numeroPais));
  form.append('dniFrente', { uri: dniFrente.uri, name: dniFrente.fileName || 'dni_frente.jpg', type: dniFrente.mimeType || 'image/jpeg' });
  form.append('dniDorso', { uri: dniDorso.uri, name: dniDorso.fileName || 'dni_dorso.jpg', type: dniDorso.mimeType || 'image/jpeg' });
  return apiRequest('/auth/register', { method: 'POST', body: form });
}

export function recuperarContrasenia(documento) {
  return apiRequest('/auth/recuperar-contrasenia', {
    method: 'POST',
    body: JSON.stringify({ documento }),
  });
}

export function cambiarContrasenia({ email, contrasenia, contraseniaActual }) {
  return apiRequest('/auth/cambiar-contrasenia', {
    method: 'POST',
    body: JSON.stringify({
      email,
      contrasenia,
      ...(contraseniaActual ? { contraseniaActual } : {}),
    }),
  });
}

// ── Cliente ───────────────────────────────────────────────────────────────────

export function getClienteMe(token) {
  return apiRequest('/clientes/me', { token });
}

export function getMetricasMe(token) {
  return apiRequest('/clientes/me/metricas', { token });
}

export function getMisParticipaciones(token) {
  return apiRequest('/clientes/me/participaciones', { token });
}

// ── Notificaciones ──────────────────────────────────────────────────────────

export function getNotificaciones(token) {
  return apiRequest('/clientes/me/notificaciones', { token });
}

export function marcarNotificacionLeida(id, token) {
  return apiRequest(`/clientes/me/notificaciones/${id}/leida`, { method: 'PATCH', token });
}

export function getSubastasByDuenio(userId) {
  return apiRequest(`/subastas/duenios/${userId}`);
}

// ── Direcciones ───────────────────────────────────────────────────────────────

export function getDirecciones(personaId, token) {
  return apiRequest(`/usuarios/${personaId}/direcciones`, { token });
}

export function getDireccionFavorita(personaId, token) {
  return apiRequest(`/usuarios/${personaId}/direcciones/favorita`, { token });
}

// ── Compras ───────────────────────────────────────────────────────────────────

export function getCompras(token) {
  return apiRequest('/clientes/me/compras', { token });
}

export function getCompraById(id, token) {
  return apiRequest(`/clientes/me/compras/${id}`, { token });
}

export function setRetiroPersonal(id, token) {
  return apiRequest(`/clientes/me/compras/${id}/retiro-personal`, { method: 'PUT', token });
}

export function pagarCompra(id, medioPagoId, token) {
  return apiRequest(`/clientes/me/compras/${id}/pagar`, {
    method: 'POST',
    token,
    body: JSON.stringify({ medioPagoId }),
  });
}

// ── Multas ────────────────────────────────────────────────────────────────────

export function getMultas(token) {
  return apiRequest('/clientes/me/multas', { token });
}

export function pagarMulta(id, medioPagoId, token) {
  return apiRequest(`/clientes/me/multas/${id}/pagar`, {
    method: 'POST',
    body: JSON.stringify({ medioPagoId }),
    token,
  });
}

export function createDireccion(personaId, body, token) {
  return apiRequest(`/usuarios/${personaId}/direcciones`, {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  });
}

export function updateDireccion(personaId, direccionId, body, token) {
  return apiRequest(`/usuarios/${personaId}/direcciones/${direccionId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
    token,
  });
}

export function deleteDireccion(personaId, direccionId, token) {
  return apiRequest(`/usuarios/${personaId}/direcciones/${direccionId}`, {
    method: 'DELETE',
    token,
  });
}

// ── Medios de pago ────────────────────────────────────────────────────────────

// La identidad sale del JWT (/clientes/me/...), nunca de la URL, para evitar IDOR.

export function getMediosPago(token) {
  return apiRequest('/clientes/me/medios-pago', { token });
}

export function deleteMedioPago(id, token) {
  return apiRequest(`/clientes/me/medios-pago/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function createCuentaBancaria(body, token) {
  return apiRequest('/clientes/me/medios-pago/cuenta-bancaria', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  });
}

export function createTarjetaCredito(body, token) {
  return apiRequest('/clientes/me/medios-pago/tarjeta-credito', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  });
}

export function createChequeCertificado(body, token) {
  return apiRequest('/clientes/me/medios-pago/cheque-certificado', {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  });
}

// ── Productos (flujo vendedor) ─────────────────────────────────────────────────

// Mapea el itemData del formulario (CreateObjectStep1/2) al ProductoNewRequest (multipart).
export async function createProducto(itemData, photos, token) {
  console.log('[createProducto] BUNDLE-NUEVO-JSON v2 — si NO ves esto al enviar, corre código viejo');
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const form = new FormData();
  form.append('fecha', today);
  form.append('disponible', 'false');
  form.append('descripcionCatalogo', itemData.title ?? '');
  form.append('descripcionCompleta', itemData.description ?? '');
  if (itemData.category) form.append('categoria', itemData.category);
  if (itemData.subCategory) form.append('subcategoria', itemData.subCategory);
  if (itemData.artistName) form.append('artista', itemData.artistName);
  if (itemData.itemDate) form.append('fechaObra', itemData.itemDate);
  if (itemData.itemHistory) form.append('resenia', itemData.itemHistory);

  for (const uri of Object.values(photos || {})) {
    if (!uri) continue;
    form.append('fotos', { uri, name: 'foto.jpg', type: 'image/jpeg' });
  }

  return apiRequest('/productos', { method: 'POST', body: form, token });
}

export function getMisProductos(token) {
  return apiRequest('/productos/me', { token });
}

export function getProductoById(productoId, token) {
  return apiRequest(`/productos/${productoId}`, { token });
}

export function getPropuesta(productoId, token) {
  return apiRequest(`/productos/${productoId}/propuesta`, { token });
}

export function aceptarPropuesta(productoId, token) {
  return apiRequest(`/productos/${productoId}/propuesta/aceptar`, { method: 'POST', token });
}

export function rechazarPropuesta(productoId, token) {
  return apiRequest(`/productos/${productoId}/propuesta/rechazar`, { method: 'POST', token });
}

// ── Subastas ──────────────────────────────────────────────────────────────────

export function getSubastas() {
  return apiRequest('/subastas?estado=abierta');
}

export function getSubastaById(subastaId) {
  return apiRequest(`/subastas/${subastaId}`);
}

export function getCatalogosBySubasta(subastaId) {
  return apiRequest(`/subastas/${subastaId}/catalogos`);
}

// Todos los catálogos (con su subasta embebida e items). Token opcional: si va, se ven los precios.
export function getCatalogos(token) {
  return apiRequest('/catalogos', token ? { token } : {});
}

export function conectarASubasta(subastaId, token) {
  return apiRequest(`/subastas/${subastaId}/conectar`, { method: 'POST', token });
}

export function desconectarDeSubasta(subastaId, token) {
  return apiRequest(`/subastas/${subastaId}/desconectar`, { method: 'POST', token });
}

// Estado de conexión del cliente respecto de esta subasta (conectadoAqui, numeroPostor,
// conectadoEnOtra). La vista lo consulta al entrar para no re-preguntar si ya está unido.
export function miConexionSubasta(subastaId, token) {
  return apiRequest(`/subastas/${subastaId}/mi-conexion`, { token });
}

export function getItemCatalogoDetalle(catalogoId, itemId, token) {
  return apiRequest(`/catalogos/${catalogoId}/items/${itemId}`, token ? { token } : {});
}

export function getHistorialPujas(subastaId, itemId, token) {
  return apiRequest(`/subastas/${subastaId}/items/${itemId}/pujas`, token ? { token } : {});
}

// UUID v4 simple (no criptográfico; alcanza para deduplicar reintentos de puja).
// Hermes/Expo Go no siempre expone crypto.randomUUID, así que no dependemos de él.
export function nuevaIdempotencyKey() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

export function realizarPuja(subastaId, itemId, importe, medioPagoId, token, idempotencyKey) {
  return apiRequest(`/subastas/${subastaId}/items/${itemId}/pujas`, {
    method: 'POST',
    token,
    // La idempotencyKey hace que el back deduplique un reintento: seguro reintentar
    // si se pierde la respuesta tras un reset de conexión.
    idempotent: true,
    body: JSON.stringify({ importe: Number(importe), medioPagoId, idempotencyKey }),
  });
}
