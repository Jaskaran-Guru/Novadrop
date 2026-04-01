import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(price);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-");
}

export function calculateROAS(revenue: number, spend: number): number {
  if (spend === 0) return 0;
  return parseFloat((revenue / spend).toFixed(2));
}

export function calculateCTR(clicks: number, impressions: number): number {
  if (impressions === 0) return 0;
  return parseFloat(((clicks / impressions) * 100).toFixed(2));
}

export function calculateCPC(spend: number, clicks: number): number {
  if (clicks === 0) return 0;
  return parseFloat((spend / clicks).toFixed(2));
}
