import { describe, expect, it } from "vitest";
import { bulkUpdateSchema, createContentSchema, importRowSchema, updateContentSchema } from "@/lib/validation";

describe("createContentSchema", () => {
  it("requires a non-empty title and a valid type", () => {
    expect(createContentSchema.safeParse({ title: "", type: "article" }).success).toBe(false);
    expect(createContentSchema.safeParse({ title: "Hello", type: "not-a-type" }).success).toBe(false);
    expect(createContentSchema.safeParse({ title: "Hello", type: "article" }).success).toBe(true);
  });
});

describe("updateContentSchema", () => {
  it("accepts a partial patch with only some fields", () => {
    const result = updateContentSchema.safeParse({ title: "New title" });
    expect(result.success).toBe(true);
  });

  it("rejects a meta title over 70 characters", () => {
    const result = updateContentSchema.safeParse({
      metadata: { metaTitle: "x".repeat(80) },
    });
    expect(result.success).toBe(false);
  });
});

describe("bulkUpdateSchema", () => {
  it("requires at least one id", () => {
    expect(bulkUpdateSchema.safeParse({ ids: [] }).success).toBe(false);
    expect(bulkUpdateSchema.safeParse({ ids: ["a"], archive: true }).success).toBe(true);
  });
});

describe("importRowSchema", () => {
  it("only requires a title", () => {
    expect(importRowSchema.safeParse({ title: "Row 1" }).success).toBe(true);
    expect(importRowSchema.safeParse({}).success).toBe(false);
  });
});
