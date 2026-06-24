import { describe, it, expect } from "vitest";
import { cn } from "./cn";

describe("cn", () => {
  it("joins truthy class names and drops falsy ones", () => {
    expect(cn("a", false, "b", undefined, null, "c")).toBe("a b c");
  });

  it("supports conditional classes", () => {
    const active = true;
    const disabled = false;
    expect(cn("base", active && "is-active", disabled && "is-disabled")).toBe("base is-active");
  });
});
