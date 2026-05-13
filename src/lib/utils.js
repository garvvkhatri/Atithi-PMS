import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const currency = (value = 0) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);

export const shortDate = (value) =>
  value ? new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short" }).format(new Date(value)) : "-";

export const apiBaseUrl = window.atithi?.apiBaseUrl || import.meta.env.VITE_API_URL || "http://localhost:4100";
