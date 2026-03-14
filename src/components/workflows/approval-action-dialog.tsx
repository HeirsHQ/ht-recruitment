"use client";

import { useState } from "react";
import { format } from "date-fns";
import { ArrowRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { sanitizeText } from "@/lib/sanitize";
import type { ApprovalRequest, Candidate } from "@/types/workflow";

interface ApprovalActionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  approvalRequest: ApprovalRequest;
  candidate: Candidate;
  fromStageName: string;
  toStageName: string;
  onApprove: (requestId: string, comment: string) => void;
  onReject: (requestId: string, comment: string) => void;
}

export function ApprovalActionDialog({
  open,
  onOpenChange,
  approvalRequest,
  candidate,
  fromStageName,
  toStageName,
  onApprove,
  onReject,
}: ApprovalActionDialogProps) {
  const [comment, setComment] = useState("");

  const handleApprove = () => {
    onApprove(approvalRequest.id, sanitizeText(comment));
    setComment("");
    onOpenChange(false);
  };

  const handleReject = () => {
    onReject(approvalRequest.id, sanitizeText(comment));
    setComment("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Review Approval Request</DialogTitle>
          <DialogDescription>Review and approve or reject this candidate&apos;s stage transition.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2 rounded-lg border p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{candidate.name}</p>
                <p className="text-xs text-gray-500">{candidate.email}</p>
              </div>
              {candidate.rating && (
                <div className="flex items-center gap-x-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={i < candidate.rating! ? "text-amber-400" : "text-gray-200 dark:text-neutral-700"}
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center gap-x-2 text-sm">
              <Badge variant="outline">{fromStageName}</Badge>
              <ArrowRight className="size-3.5 text-gray-400" />
              <Badge variant="outline">{toStageName}</Badge>
            </div>
          </div>

          <div className="text-xs text-gray-500">
            <span>Requested by {approvalRequest.requestedBy}</span>
            <span className="mx-2">·</span>
            <span>{format(new Date(approvalRequest.createdAt), "dd MMM yyyy, HH:mm")}</span>
          </div>

          {approvalRequest.comments.length > 0 && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Comments</p>
              <div className="max-h-32 space-y-2 overflow-y-auto">
                {approvalRequest.comments.map((c) => (
                  <div key={c.id} className="rounded-md bg-gray-50 p-2 dark:bg-neutral-800">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{c.authorName}</span>
                      <span className="text-xs text-gray-400">{format(new Date(c.createdAt), "dd MMM, HH:mm")}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-600 dark:text-gray-400">{c.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-sm font-medium">Add a comment</label>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add your review comments..."
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="destructive" onClick={handleReject}>
            Reject
          </Button>
          <Button variant="success" onClick={handleApprove}>
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
