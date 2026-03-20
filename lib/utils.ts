import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatCompactCurrency(amount: number, currency = "USD") {
  if (Math.abs(amount) < 1_000) {
    return formatCurrency(amount, currency);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(amount);
}

function subtractMonthsClamped(source: Date, monthsToSubtract: number) {
  const targetMonthIndex = source.getMonth() - monthsToSubtract;
  const targetYear =
    source.getFullYear() + Math.floor(targetMonthIndex / 12);
  const targetMonth = ((targetMonthIndex % 12) + 12) % 12;
  const lastDayOfTargetMonth = new Date(targetYear, targetMonth + 1, 0).getDate();
  const clampedDay = Math.min(source.getDate(), lastDayOfTargetMonth);
  const result = new Date(source);
  result.setFullYear(targetYear);
  result.setMonth(targetMonth, clampedDay);
  return result;
}

export function getDateRange(timePeriod: string) {
  const now = new Date();
  const start = new Date(now);

  switch (timePeriod) {
    case "week":
      start.setDate(now.getDate() - 7);
      break;
    case "month":
      start.setTime(subtractMonthsClamped(now, 1).getTime());
      break;
    case "quarter":
      start.setTime(subtractMonthsClamped(now, 3).getTime());
      break;
    case "year":
      start.setFullYear(now.getFullYear() - 1);
      break;
    default:
      start.setTime(subtractMonthsClamped(now, 1).getTime());
  }

  return { start: start.toISOString(), end: now.toISOString() };
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getDaysRemaining(dueDate: string) {
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
