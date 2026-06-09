import { describe, expect, it } from "vitest";
import { loginSchema, formSchema, parseAuthForm } from "@/lib/validation";

describe("loginSchema", () => {
  it("accepts valid login data", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });

  it("rejects short passwords", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "short",
    });
    expect(result.success).toBe(false);
  });
});

describe("formSchema", () => {
  it("accepts valid signup data", () => {
    const result = formSchema.safeParse({
      username: "demo_user",
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
  });
});

describe("parseAuthForm", () => {
  it("returns parsed data on success", () => {
    const result = parseAuthForm(loginSchema, {
      email: "user@example.com",
      password: "password123",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.email).toBe("user@example.com");
    }
  });

  it("returns field errors on failure", () => {
    const result = parseAuthForm(loginSchema, {
      email: "not-an-email",
      password: "short",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.result.success).toBe(false);
      if (!result.result.success) {
        expect(result.result.fieldErrors?.email).toBeDefined();
      }
    }
  });
});
