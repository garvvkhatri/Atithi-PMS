import { apiBaseUrl } from "../lib/utils";

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Request failed" }));
    throw new Error(error.message || "Request failed");
  }
  return response.json();
}

export const api = {
  dashboard: () => request("/api/dashboard"),
  rooms: () => request("/api/rooms"),
  createRoom: (payload) => request("/api/rooms", { method: "POST", body: JSON.stringify(payload) }),
  updateRoomStatus: (id, status) => request(`/api/rooms/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  deleteRoom: (id) => request(`/api/rooms/${id}`, { method: "DELETE" }),
  bookings: (search = "") => request(`/api/bookings${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  createBooking: (payload) => request("/api/bookings", { method: "POST", body: JSON.stringify(payload) }),
  updateBooking: (id, payload) => request(`/api/bookings/${id}`, { method: "PATCH", body: JSON.stringify(payload) }),
  checkIn: (id) => request(`/api/bookings/${id}/check-in`, { method: "POST" }),
  checkOut: (id) => request(`/api/bookings/${id}/check-out`, { method: "POST" }),
  cancelBooking: (id) => request(`/api/bookings/${id}/cancel`, { method: "POST" }),
  groups: () => request("/api/groups"),
  createGroup: (payload) => request("/api/groups", { method: "POST", body: JSON.stringify(payload) }),
  expenses: () => request("/api/expenses"),
  createExpense: (payload) => request("/api/expenses", { method: "POST", body: JSON.stringify(payload) }),
  analytics: () => request("/api/analytics"),
  users: () => request("/api/users"),
  backup: () => request("/api/backups", { method: "POST" }),
  restore: (path) => request("/api/backups/restore", { method: "POST", body: JSON.stringify({ path }) })
};
