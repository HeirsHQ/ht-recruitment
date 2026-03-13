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
