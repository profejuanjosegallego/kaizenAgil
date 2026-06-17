"use client";

/**
 * Cliente HTTP minimo para hablar con nuestra API.
 * Las cookies (JWT httpOnly) viajan solas al ser mismo origen.
 */
export async function apiFetch(path, { method = "GET", body } = {}) {
  const res = await fetch(path, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const error = new Error(data?.error || "Ocurrió un error");
    error.status = res.status;
    error.details = data?.details || null;
    throw error;
  }
  return data;
}

export const api = {
  get: (p) => apiFetch(p),
  post: (p, body) => apiFetch(p, { method: "POST", body }),
  patch: (p, body) => apiFetch(p, { method: "PATCH", body }),
  del: (p) => apiFetch(p, { method: "DELETE" }),
};
