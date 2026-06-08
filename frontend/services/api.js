export const API_BASE_URL = 'http://192.168.0.165:8080/api/v1'; // cambiar por la IP local del backend

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

export function getSubastasByDuenio(userId) {
  return apiRequest(`/subastas/duenios/${userId}`);
}

// ── Direcciones ───────────────────────────────────────────────────────────────

export function getDirecciones(personaId, token) {
  return apiRequest(`/usuarios/${personaId}/direcciones`, { token });
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

export function getMediosPago(clienteId, token) {
  return apiRequest(`/clientes/${clienteId}/medios-pago`, { token });
}

export function deleteMedioPago(clienteId, id, token) {
  return apiRequest(`/clientes/${clienteId}/medios-pago/${id}`, {
    method: 'DELETE',
    token,
  });
}

export function createCuentaBancaria(clienteId, body, token) {
  return apiRequest(`/clientes/${clienteId}/medios-pago/cuenta-bancaria`, {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  });
}

export function createTarjetaCredito(clienteId, body, token) {
  return apiRequest(`/clientes/${clienteId}/medios-pago/tarjeta-credito`, {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  });
}

export function createChequeCertificado(clienteId, body, token) {
  return apiRequest(`/clientes/${clienteId}/medios-pago/cheque-certificado`, {
    method: 'POST',
    body: JSON.stringify(body),
    token,
  });
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

export function conectarASubasta(subastaId, token) {
  return apiRequest(`/subastas/${subastaId}/conectar`, { method: 'POST', token });
}

export function getItemCatalogoDetalle(catalogoId, itemId) {
  return apiRequest(`/catalogos/${catalogoId}/items/${itemId}`);
}

export function getHistorialPujas(subastaId, itemId) {
  return apiRequest(`/subastas/${subastaId}/items/${itemId}/pujas`);
}

export function realizarPuja(subastaId, itemId, importe, medioPagoId, token) {
  return apiRequest(`/subastas/${subastaId}/items/${itemId}/pujas`, {
    method: 'POST',
    token,
    body: JSON.stringify({ importe: Number(importe), medioPagoId }),
  });
}
