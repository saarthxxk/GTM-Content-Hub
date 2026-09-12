"use client";

import { useState } from "react";
import { Send, CheckCircle2, XCircle, RotateCcw, Rocket, Archive } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { availableActions } from "@/lib/workflow";
import type { ContentStatus, Role } from "@/types";

const ACTION_META: Record<string, { label: string; icon: React.ElementType; variant: "primary" | "outline" | "danger"; needsComment?: boolean }> = {
  submit: { label: "Submit for Review", icon: Send, variant: "primary" },
  approve: { label: "Approve", icon: CheckCircle2, variant: "primary" },
  request_changes: { label: "Request Changes", icon: XCircle, variant: "outline", needsComment: true },
  revise: { label: "Move Back to Draft", icon: RotateCcw, variant: "outline" },
  publish: { label: "Publish", icon: Rocket, variant: "primary" },
  archive: { label: "Archive", icon: Archive, variant: "danger" },
  unapprove: { label: "Send Back to Draft", icon: RotateCcw, variant: "outline" },
  unpublish: { label: "Unpublish", icon: RotateCcw, variant: "outline" },
};

export function WorkflowActions({
  status,
  role,
  onTransition,
}: {
  status: ContentStatus;
  role: Role;
  onTransition: (action: string, comments?: string) => Promise<void>;
}) {
  const actions = availableActions(status, role);
  const [pending, setPending] = useState<string | null>(null);
  const [commentAction, setCommentAction] = useState<string | null>(null);
  const [comment, setComment] = useState("");

  if (actions.length === 0) return null;

  const run = async (action: string, comments?: string) => {
    setPending(action);
    try {
      await onTransition(action, comments);
      setCommentAction(null);
      setComment("");
    } finally {
      setPending(null);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {actions.map((action) => {
          const meta = ACTION_META[action];
          if (!meta) return null;
          return (
            <Button
              key={action}
              variant={meta.variant}
              loading={pending === action}
              onClick={() => (meta.needsComment ? setCommentAction(action) : run(action))}
            >
              <meta.icon className="h-4 w-4" /> {meta.label}
            </Button>
          );
        })}
      </div>

      <Modal
        open={!!commentAction}
        onClose={() => setCommentAction(null)}
        title="Request Changes"
        description="Let the author know what needs to be revised before this can be approved."
        footer={
          <>
            <Button variant="outline" onClick={() => setCommentAction(null)}>Cancel</Button>
            <Button
              variant="primary"
              loading={pending === commentAction}
              disabled={!comment.trim()}
              onClick={() => commentAction && run(commentAction, comment)}
            >
              Send Feedback
            </Button>
          </>
        }
      >
        <Textarea
          rows={4}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="e.g. Needs a concrete customer example and a stronger CTA in the closing section."
          autoFocus
        />
      </Modal>
    </>
  );
}
