export const API_BASE_URL = 'http://10.0.2.2:8080/api/v1';

export async function apiRequest(path, options = {}) {
  const { token, headers, ...fetchOptions } = options;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...fetchOptions,
    headers: {
      'Content-Type': 'application/json',
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
    throw new Error(
      typeof data === 'string'
        ? data
        : data?.mensaje || data?.message || `Error HTTP ${response.status}`
    );
  }

  return data;
}

export function buildImageUrl(path) {
  if (!path) return null;

  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const apiRoot = API_BASE_URL.replace('/api/v1', '');
  return `${apiRoot}${path}`;
}

export function loginRequest(documento, contrasenia) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ documento, contrasenia }),
  });
}

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
  return apiRequest(`/subastas/${subastaId}/conectar`, {
    method: 'POST',
    token,
  });
}