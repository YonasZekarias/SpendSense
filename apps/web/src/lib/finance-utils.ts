import axios from "axios";

export const createApiClient = (token: string) => {
  return axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000",
    headers: { Authorization: `Bearer ${token}` },
  });
};

export function formatMoney(value: string | number) {
  const amount = typeof value === "string" ? Number.parseFloat(value || "0") : value;
  return Number.isFinite(amount) ? amount.toLocaleString() : "0";
}

export function formatMonthLabel(month: number, year: number) {
  const date = new Date(year, Math.max(0, month - 1), 1);
  return date.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}