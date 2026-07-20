import { describe, it, expect } from "vitest";
import { getSafeRedirectPath, cn } from "@/lib/utils";

describe("getSafeRedirectPath", () => {
  it("accepts a normal same-origin path", () => {
    expect(getSafeRedirectPath("/permits/new", "/dashboard")).toBe(
      "/permits/new",
    );
  });

  it("falls back when path is missing", () => {
    expect(getSafeRedirectPath(undefined, "/dashboard")).toBe("/dashboard");
    expect(getSafeRedirectPath(null, "/dashboard")).toBe("/dashboard");
    expect(getSafeRedirectPath("", "/dashboard")).toBe("/dashboard");
  });

  it("rejects protocol-relative URLs (the //evil.com open-redirect trick)", () => {
    expect(getSafeRedirectPath("//evil.com", "/dashboard")).toBe(
      "/dashboard",
    );
    expect(getSafeRedirectPath("//evil.com/phish", "/dashboard")).toBe(
      "/dashboard",
    );
  });

  it("rejects absolute URLs to other origins", () => {
    expect(
      getSafeRedirectPath("https://evil.com/steal", "/dashboard"),
    ).toBe("/dashboard");
    expect(getSafeRedirectPath("http://evil.com", "/dashboard")).toBe(
      "/dashboard",
    );
  });

  it("rejects paths that don't start with a single slash", () => {
    expect(getSafeRedirectPath("evil.com", "/dashboard")).toBe("/dashboard");
    expect(getSafeRedirectPath("javascript:alert(1)", "/dashboard")).toBe(
      "/dashboard",
    );
  });

  it("accepts paths with query strings intact", () => {
    expect(
      getSafeRedirectPath("/permits?search=hot+work", "/dashboard"),
    ).toBe("/permits?search=hot+work");
  });
});

describe("cn", () => {
  it("merges class names and resolves Tailwind conflicts", () => {
    expect(cn("p-2", "p-4")).toBe("p-4");
  });

  it("drops falsy values", () => {
    expect(cn("a", false, undefined, null, "b")).toBe("a b");
  });
});
