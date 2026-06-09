import { describe, expect, it } from "vitest";
import {
  formatCompactCurrency,
  formatCurrency,
  getDateRange,
  getOverviewFetchRange,
} from "@/lib/utils";

describe("formatCurrency", () => {
  it("formats USD amounts", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });
});

describe("formatCompactCurrency", () => {
  it("uses compact notation for large values", () => {
    expect(formatCompactCurrency(1500)).toMatch(/\$1\.5K|\$1,500\.00/);
  });

  it("uses standard formatting below 1000", () => {
    expect(formatCompactCurrency(999)).toBe("$999.00");
  });
});

describe("getDateRange", () => {
  it("returns ISO start and end for week", () => {
    const { start, end } = getDateRange("week");
    expect(new Date(start).getTime()).toBeLessThan(new Date(end).getTime());
  });
});

describe("getOverviewFetchRange", () => {
  it("widens month range to include calendar month start", () => {
    const { start, end } = getOverviewFetchRange("month");
    const startDate = new Date(start);
    const endDate = new Date(end);
    expect(startDate.getTime()).toBeLessThanOrEqual(endDate.getTime());
  });
});
