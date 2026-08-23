// Thin API client for the FastAPI admin backend.
// In dev, Vite proxies /admin -> http://127.0.0.1:8000 (see vite.config.js).
const BASE = import.meta.env.VITE_API_URL || "";

const TOKEN_KEY = "shoonya_admin_token_v1";

// Kept in a module variable so every request can read it synchronously, and
// mirrored to localStorage so a refresh doesn't log you out.
let authToken = readStoredToken();

function readStoredToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null; // private browsing / storage disabled
  }
}

export function setAuthToken(token) {
  authToken = token || null;
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token);
    else localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* storage unavailable — the in-memory token still works for this tab */
  }
}

export const getAuthToken = () => authToken;

// Lets AuthContext react when the server rejects our token (expired/revoked)
// rather than leaving the UI in a half-logged-in state.
const unauthorizedHandlers = new Set();

export function onUnauthorized(handler) {
  unauthorizedHandlers.add(handler);
  return () => unauthorizedHandlers.delete(handler);
}

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

// FastAPI returns `detail` as a string for HTTPException but as an array of
// error objects for request-validation failures. Flatten both to one message.
function messageFromDetail(detail, fallback) {
  if (typeof detail === "string" && detail) return detail;
  if (Array.isArray(detail) && detail.length) {
    const first = detail[0];
    if (typeof first?.msg === "string") {
      return first.msg.replace(/^Value error,\s*/, "");
    }
  }
  return fallback;
}

// A 401 from the login endpoint means "wrong email or password", not "your
// session died". Wiping the token there would sign out someone who is already
// logged in and simply mistyped a password on the login screen.
const CREDENTIAL_CHECK_PATHS = ["/admin/login"];

async function request(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  if (authToken) headers.Authorization = `Bearer ${authToken}`;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { ...options, headers });
  } catch {
    throw new ApiError(
      "Cannot reach the server. Is the backend running on port 8000?",
      0,
    );
  }

  if (res.status === 401 && !CREDENTIAL_CHECK_PATHS.includes(path)) {
    // Token is no longer good for anything — drop it and tell the app.
    setAuthToken(null);
    unauthorizedHandlers.forEach((fn) => fn());
  }

  if (!res.ok) {
    let detail = null;
    try {
      detail = (await res.json()).detail;
    } catch {
      /* non-JSON error body */
    }
    throw new ApiError(
      messageFromDetail(detail, `Request failed (${res.status})`),
      res.status,
    );
  }

  if (res.status === 204) return null;
  return res.json();
}

const post = (path, body) =>
  request(path, {
    method: "POST",
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

const patch = (path, body) =>
  request(path, {
    method: "PATCH",
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });

const del = (path) => request(path, { method: "DELETE" });

export const api = {
  // ---- auth ----
  login: (payload) => post("/admin/login", payload),
  getMe: () => request("/admin/me"),

  // ---- dashboard ----
  getStats: () => request("/admin/dashboard/stats"),
  getAnalytics: (days = 30) =>
    request(`/admin/dashboard/analytics?days=${days}`),

  // ---- products ----
  getProducts: ({ category, search, page = 1, per_page = 20 } = {}) => {
    const params = new URLSearchParams();
    if (category && category !== "all") params.set("category", category);
    if (search) params.set("search", search);
    params.set("page", page);
    params.set("per_page", per_page);
    return request(`/admin/products?${params.toString()}`);
  },
  getCategories: () => request("/admin/products/categories"),
  getProduct: (id) => request(`/admin/products/${id}`),
  createProduct: (payload) => post("/admin/products", payload),
  updateProduct: (id, payload) => patch(`/admin/products/${id}`, payload),
  deleteProduct: (id) => del(`/admin/products/${id}`),

  // ---- orders ----
  getOrders: ({ status, page = 1, per_page = 20 } = {}) => {
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    params.set("page", page);
    params.set("per_page", per_page);
    return request(`/admin/orders?${params.toString()}`);
  },
  getOrder: (id) => request(`/admin/orders/${id}`),
  updateOrderStatus: (id, status) =>
    patch(`/admin/orders/${id}/status`, { status }),

  // ---- users ----
  getUsers: ({ search, page = 1, per_page = 20 } = {}) => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("page", page);
    params.set("per_page", per_page);
    return request(`/admin/users?${params.toString()}`);
  },
  getUser: (id) => request(`/admin/users/${id}`),
  getUserOrders: (id, { page = 1, per_page = 20 } = {}) => {
    const params = new URLSearchParams();
    params.set("page", page);
    params.set("per_page", per_page);
    return request(`/admin/users/${id}/orders?${params.toString()}`);
  },
};
