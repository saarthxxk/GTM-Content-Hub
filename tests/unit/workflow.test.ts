import { describe, expect, it } from "vitest";
import { assertTransition, availableActions, canPerform, WorkflowError } from "@/lib/workflow";
import type { ContentStatus } from "@/types";

describe("workflow state machine", () => {
  it("allows an author to submit a draft for review", () => {
    expect(canPerform("draft", "submit", "author")).toBe(true);
    expect(assertTransition({ status: "draft" }, "submit", "author")).toBe("in_review");
  });

  it("does not allow an author to approve their own content", () => {
    expect(canPerform("in_review", "approve", "author")).toBe(false);
    expect(() => assertTransition({ status: "in_review" }, "approve", "author")).toThrow(WorkflowError);
  });

  it("allows a reviewer to approve or request changes on in-review content", () => {
    expect(canPerform("in_review", "approve", "reviewer")).toBe(true);
    expect(canPerform("in_review", "request_changes", "reviewer")).toBe(true);
  });

  it("routes changes_requested back to draft via revise", () => {
    expect(assertTransition({ status: "changes_requested" }, "revise", "author")).toBe("draft");
  });

  it("only admins (or reviewers) can publish approved content", () => {
    expect(canPerform("approved", "publish", "author")).toBe(false);
    expect(canPerform("approved", "publish", "reviewer")).toBe(true);
    expect(canPerform("approved", "publish", "admin")).toBe(true);
  });

  it("only admins can archive published content", () => {
    expect(canPerform("published", "archive", "admin")).toBe(true);
    expect(canPerform("published", "archive", "reviewer")).toBe(false);
    expect(canPerform("published", "archive", "author")).toBe(false);
  });

  it("rejects an action that has no transition from the current status", () => {
    expect(() => assertTransition({ status: "draft" }, "publish", "admin")).toThrow(WorkflowError);
  });

  it("lists only the actions a role may take from a given status", () => {
    const actions = availableActions("in_review", "reviewer");
    expect(actions).toEqual(expect.arrayContaining(["approve", "request_changes"]));
    expect(actions).not.toContain("publish");
  });

  it("never allows a transition out of archived", () => {
    const statuses: ContentStatus[] = ["draft", "in_review", "changes_requested", "approved", "published", "archived"];
    for (const status of statuses) {
      for (const role of ["author", "reviewer", "admin"] as const) {
        if (status === "archived") {
          expect(availableActions(status, role)).toEqual([]);
        }
      }
    }
  });
});
