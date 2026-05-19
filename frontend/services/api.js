export const API_BASE_URL = 'http://10.0.2.2:8080/api/v1';

export async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      ...(options.headers || {}),
    },
    ...options,
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

export function loginRequest(documento, contrasenia) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ documento, contrasenia }),
  });
}

export function getSubastas() {
  return apiRequest('/subastas?estado=abierta');
}