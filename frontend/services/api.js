import * as FileSystem from 'expo-file-system/legacy';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'http://192.168.0.165:8080/api/v1';

export async function apiRequest(path, options = {}) {
  const { token, headers, ...fetchOptions } = options;

  const isFormData = fetchOptions.body instanceof FormData;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
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
    throw new Error(
      typeof data === 'string'
        ? data
        : fieldErrors || data?.error || data?.mensaje || data?.message || `Error HTTP ${response.status}`
    );
  }

  return data;
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

// ── Upload de fotos (Railway Storage Bucket) ──────────────────────────────────

function presignUpload(contentType, token) {
  return apiRequest('/uploads/presign', {
    method: 'POST',
    token,
    body: JSON.stringify({ contentType }),
  });
}

async function uploadToBucket(uploadUrl, uri, contentType) {
  await FileSystem.uploadAsync(uploadUrl, uri, {
    httpMethod: 'PUT',
    uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
    headers: { 'Content-Type': contentType },
  });
}

// ── Productos (flujo vendedor) ─────────────────────────────────────────────────

// Mapea el itemData del formulario (CreateObjectStep1/2) al ProductoNewRequest (JSON).
export async function createProducto(itemData, photos, token) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  const keys = [];
  for (const uri of Object.values(photos || {})) {
    if (!uri) continue;
    const contentType = 'image/jpeg';
    const { key, uploadUrl } = await presignUpload(contentType, token);
    await uploadToBucket(uploadUrl, uri, contentType);
    keys.push(key);
  }

  const body = {
    fecha: today,
    disponible: false,
    descripcionCatalogo: itemData.title ?? '',
    descripcionCompleta: itemData.description ?? '',
    categoria: itemData.category,
    subcategoria: itemData.subCategory,
    artista: itemData.artistName,
    fechaObra: itemData.itemDate,
    resenia: itemData.itemHistory,
    fotos: keys,
  };

  return apiRequest('/productos', { method: 'POST', body: JSON.stringify(body), token });
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

export function getItemCatalogoDetalle(catalogoId, itemId, token) {
  return apiRequest(`/catalogos/${catalogoId}/items/${itemId}`, token ? { token } : {});
}

export function getHistorialPujas(subastaId, itemId, token) {
  return apiRequest(`/subastas/${subastaId}/items/${itemId}/pujas`, token ? { token } : {});
}

export function realizarPuja(subastaId, itemId, importe, medioPagoId, token) {
  return apiRequest(`/subastas/${subastaId}/items/${itemId}/pujas`, {
    method: 'POST',
    token,
    body: JSON.stringify({ importe: Number(importe), medioPagoId }),
  });
}
