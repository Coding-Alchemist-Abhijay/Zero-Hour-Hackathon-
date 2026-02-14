/**
 * Client-side API helpers. Use in components that have access to auth store (accessToken).
 */

export function getAuthHeaders(accessToken) {
  const headers = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

export async function api(path, options = {}, token) {
  const url = path.startsWith("http") ? path : `/api${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...options,
    headers: { ...getAuthHeaders(token), ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message ?? `Request failed: ${res.status}`);
  return data;
}

export const issuesApi = {
  list: (params = {}, token) => api(`/issues?${new URLSearchParams(params)}`, {}, token),
  get: (id, token) => api(`/issues/${id}`, {}, token),
  create: (body, token) => api("/issues", { method: "POST", body: JSON.stringify(body) }, token),
  update: (id, body, token) => api(`/issues/${id}`, { method: "PATCH", body: JSON.stringify(body) }, token),
  trending: (limit = 10, token) => api(`/issues/trending?limit=${limit}`, {}, token),
  nearby: (lat, lng, radiusKm = 5, token) => api(`/issues/nearby?lat=${lat}&lng=${lng}&radiusKm=${radiusKm}`, {}, token),
};

export const commentsApi = {
  list: (issueId, token) => api(`/comments?issueId=${issueId}`, {}, token),
  create: (body, token) => api("/comments", { method: "POST", body: JSON.stringify(body) }, token),
};

export const votesApi = {
  toggle: (issueId, token) => api("/votes", { method: "POST", body: JSON.stringify({ issueId }) }, token),
};

export const timelineApi = {
  list: (issueId, token) => api(`/timeline?issueId=${issueId}`, {}, token),
};

export const analyticsApi = {
  get: (token) => api("/analytics", {}, token),
};

export const notificationsApi = {
  list: (params = {}, token) => api(`/notifications?${new URLSearchParams(params)}`, {}, token),
  markRead: (id, token) => api(`/notifications/${id}/read`, { method: "PATCH" }, token),
};

export const surveysApi = {
  list: (token) => api("/surveys", {}, token),
  get: (id, token) => api(`/surveys/${id}`, {}, token),
  results: (id, token) => api(`/surveys/${id}/results`, {}, token),
  respond: (id, answers, token) => api(`/surveys/${id}/respond`, { method: "POST", body: JSON.stringify({ answers }) }, token),
};

export const departmentsApi = {
  list: (token) => api("/departments", {}, token),
};
