import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function paginate<T>(data: T[], page: number, limit: number, total: number): T[] {
  const startIndex = page * limit;
  const endIndex = Math.min(startIndex + limit, total);
  if (startIndex > total) return [];
  return data.slice(startIndex, endIndex);
}

export function formatCurrency(amount: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    notation: "compact",
    style: "currency",
  }).format(amount);
}

export function formatSalary(min?: number, max?: number, currency = "NGN") {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}
