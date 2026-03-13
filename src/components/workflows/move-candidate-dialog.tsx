"use client";

import { AlertTriangle, ArrowRight } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Candidate } from "@/types/workflow";
import type { PipelineStageConfig } from "@/types/job";

interface MoveCandidateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  candidate: Candidate | null;
  targetStage: PipelineStageConfig | null;
  currentStageName: string;
  onConfirm: () => void;
}

export function MoveCandidateDialog({
  open,
  onOpenChange,
  candidate,
  targetStage,
  currentStageName,
  onConfirm,
}: MoveCandidateDialogProps) {
  if (!candidate || !targetStage) return null;

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-x-2">
            <AlertTriangle className="size-5 text-amber-500" />
            Approval Required
          </DialogTitle>
          <DialogDescription>This stage requires approval before the candidate can proceed.</DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="rounded-lg border p-3">
            <p className="text-sm font-medium">{candidate.name}</p>
            <p className="text-xs text-gray-500">{candidate.email}</p>
          </div>

          <div className="flex items-center justify-center gap-x-3 py-2">
            <Badge variant="outline">{currentStageName}</Badge>
            <ArrowRight className="size-4 text-gray-400" />
            <Badge className="border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
              {targetStage.title}
            </Badge>
          </div>

          <div className="rounded-md bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-950/50 dark:text-amber-300">
            <p>
              An approval request will be sent to{" "}
              <span className="font-medium">
                {targetStage.approval.approvers.length > 0
                  ? targetStage.approval.approvers.join(", ")
                  : "configured approvers"}
              </span>
              . The candidate will remain in their current stage until the request is approved.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm}>Send Approval Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
