import { describe, it, expect } from "vitest";
import { isDemoAccount } from "@/lib/demo";

describe("isDemoAccount", () => {
  it("matches the demo account's email", () => {
    expect(isDemoAccount("demo@kpc.co.ke")).toBe(true);
  });

  it("does not match real accounts", () => {
    expect(isDemoAccount("admin@kpc.co.ke")).toBe(false);
    expect(isDemoAccount("contractor@kpc.co.ke")).toBe(false);
  });

  it("handles null/undefined safely (e.g. a user with no email)", () => {
    expect(isDemoAccount(null)).toBe(false);
    expect(isDemoAccount(undefined)).toBe(false);
  });
});
