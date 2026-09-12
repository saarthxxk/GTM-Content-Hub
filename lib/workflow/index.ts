import { Content, ContentStatus, Role, WorkflowTransition } from "@/types";

/**
 * Content lifecycle state machine.
 *
 *   draft -> in_review -> approved -> published -> archived
 *              |               ^
 *              v               |
 *      changes_requested ------+ (back to draft after author edits)
 *
 * This module is the single place that decides whether a transition is
 * legal and who is allowed to perform it. API routes call `assertTransition`
 * before mutating content so the rule can never be bypassed by a UI bug.
 */
export const TRANSITIONS: WorkflowTransition[] = [
  { from: "draft", to: "in_review", action: "submit", allowedRoles: ["author", "admin"] },
  { from: "in_review", to: "approved", action: "approve", allowedRoles: ["reviewer", "admin"] },
  { from: "in_review", to: "changes_requested", action: "request_changes", allowedRoles: ["reviewer", "admin"] },
  { from: "changes_requested", to: "draft", action: "revise", allowedRoles: ["author", "admin"] },
  { from: "approved", to: "published", action: "publish", allowedRoles: ["admin", "reviewer"] },
  { from: "published", to: "archived", action: "archive", allowedRoles: ["admin"] },
  { from: "approved", to: "draft", action: "unapprove", allowedRoles: ["admin"] },
  { from: "draft", to: "archived", action: "archive", allowedRoles: ["admin"] },
  { from: "published", to: "draft", action: "unpublish", allowedRoles: ["admin"] },
];

export class WorkflowError extends Error {}

export function findTransition(from: ContentStatus, action: string): WorkflowTransition | undefined {
  return TRANSITIONS.find((t) => t.from === from && t.action === action);
}

export function canPerform(from: ContentStatus, action: string, role: Role): boolean {
  const t = findTransition(from, action);
  return !!t && t.allowedRoles.includes(role);
}

export function assertTransition(content: Pick<Content, "status">, action: string, role: Role): ContentStatus {
  const t = findTransition(content.status, action);
  if (!t) {
    throw new WorkflowError(
      `"${action}" is not a valid action from status "${content.status}".`
    );
  }
  if (!t.allowedRoles.includes(role)) {
    throw new WorkflowError(
      `Role "${role}" is not permitted to perform "${action}" on content in "${content.status}".`
    );
  }
  return t.to;
}

export const STATUS_LABEL: Record<ContentStatus, string> = {
  draft: "Draft",
  in_review: "In Review",
  changes_requested: "Changes Requested",
  approved: "Approved",
  published: "Published",
  archived: "Archived",
};

export const STATUS_TONE: Record<ContentStatus, "neutral" | "info" | "warning" | "success" | "danger"> = {
  draft: "neutral",
  in_review: "info",
  changes_requested: "warning",
  approved: "success",
  published: "success",
  archived: "neutral",
};

/** Actions available to a given role for a piece of content right now. */
export function availableActions(status: ContentStatus, role: Role): string[] {
  return TRANSITIONS.filter((t) => t.from === status && t.allowedRoles.includes(role)).map(
    (t) => t.action
  );
}
