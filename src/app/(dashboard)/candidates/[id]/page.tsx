"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Calendar, ExternalLink, FileText, Globe, Mail, Phone, Star } from "lucide-react";

import { CandidateStageTimeline } from "@/components/workflows/candidate-stage-timeline";
import { ApprovalActionDialog } from "@/components/workflows/approval-action-dialog";
import { ApprovalBadge } from "@/components/workflows/approval-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sanitizeText } from "@/lib/sanitize";
import { useWorkflowStore } from "@/store/core";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Page = () => {
  const id = useParams().id as string;
  const {
    candidates,
    workflows,
    approvalRequests,
    workflowInstances,
    moveCandidate,
    resolveApproval,
    createApprovalRequest,
  } = useWorkflowStore();

  const candidate = candidates.find((c) => c.id === id);
  const workflow = workflows.find((w) => w.id === candidate?.workflowId);
  const instance = workflowInstances.find((inst) => inst.candidateId === id);
  const activeApproval = approvalRequests.find((r) => r.id === candidate?.activeApprovalId && r.status === "pending");

  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [moveToStageId, setMoveToStageId] = useState("");
  const [notes, setNotes] = useState(candidate?.notes ?? "");

  const currentStage = useMemo(
    () => workflow?.stages.find((s) => s.id === candidate?.currentStageId),
    [workflow, candidate],
  );

  const currentStageIndex = useMemo(
    () => workflow?.stages.findIndex((s) => s.id === candidate?.currentStageId) ?? -1,
    [workflow, candidate],
  );

  const nextStage = useMemo(
    () =>
      workflow && currentStageIndex >= 0 && currentStageIndex < workflow.stages.length - 1
        ? workflow.stages[currentStageIndex + 1]
        : null,
    [workflow, currentStageIndex],
  );

  if (!candidate) {
    return (
      <div className="grid min-h-64 place-items-center p-6">
        <div className="text-center">
          <p className="text-lg font-medium text-red-500">Candidate not found</p>
          <Link href="/candidates" className="mt-2 text-sm text-gray-500 underline">
            Back to candidates
          </Link>
        </div>
      </div>
    );
  }

  const handleMoveToNext = () => {
    if (!nextStage || !workflow) return;

    if (nextStage.approval.required) {
      createApprovalRequest({
        candidateId: candidate.id,
        applicationId: candidate.applicationId,
        jobId: candidate.jobId,
        workflowId: workflow.id,
        stageId: nextStage.id,
        fromStageId: candidate.currentStageId,
        requestedBy: "Current User",
        assignedTo: nextStage.approval.approvers,
        status: "pending",
      });
      toast.success(`Approval request sent for "${nextStage.title}"`);
    } else {
      moveCandidate(candidate.id, nextStage.id, "Current User");
      toast.success(`${candidate.name} moved to "${nextStage.title}"`);
    }
  };

  const handleMoveToStage = () => {
    if (!moveToStageId || !workflow) return;

    const targetStage = workflow.stages.find((s) => s.id === moveToStageId);
    if (!targetStage) return;

    if (targetStage.approval.required) {
      createApprovalRequest({
        candidateId: candidate.id,
        applicationId: candidate.applicationId,
        jobId: candidate.jobId,
        workflowId: workflow.id,
        stageId: targetStage.id,
        fromStageId: candidate.currentStageId,
        requestedBy: "Current User",
        assignedTo: targetStage.approval.approvers,
        status: "pending",
      });
      toast.success(`Approval request sent for "${targetStage.title}"`);
    } else {
      moveCandidate(candidate.id, moveToStageId, "Current User");
      toast.success(`${candidate.name} moved to "${targetStage.title}"`);
    }
    setMoveToStageId("");
  };

  const handleApprove = (requestId: string, comment: string) => {
    const cleanComment = sanitizeText(comment);
    resolveApproval(requestId, "approved", "Current User", cleanComment || undefined);
    toast.success(`${candidate.name} approved`);
    setReviewDialogOpen(false);
  };

  const handleReject = (requestId: string, comment: string) => {
    const cleanComment = sanitizeText(comment);
    resolveApproval(requestId, "rejected", "Current User", cleanComment || undefined);
    toast.info(`Approval rejected for ${candidate.name}`);
    setReviewDialogOpen(false);
  };

  return (
    <div className="space-y-6 p-6">
      <Link href="/candidates">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </Link>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-x-2">
            <h1 className="text-2xl font-semibold">{candidate.name}</h1>
            {candidate.approvalStatus && <ApprovalBadge status={candidate.approvalStatus} />}
          </div>
          <p className="text-sm text-gray-500">{candidate.email}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Profile */}
          <div className="space-y-3 rounded-xl border p-4">
            <h3 className="font-semibold">Profile</h3>
            <div className="flex items-start gap-x-4">
              {candidate.avatar ? (
                <img src={candidate.avatar} alt={candidate.name} className="size-16 rounded-full object-cover" />
              ) : (
                <div className="bg-primary-100 text-primary-700 dark:bg-primary-900 dark:text-primary-300 grid size-16 place-items-center rounded-full text-xl font-semibold">
                  {candidate.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>
              )}
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-x-2 text-gray-600 dark:text-gray-400">
                  <Mail className="size-4" />
                  <span>{candidate.email}</span>
                </div>
                {candidate.phone && (
                  <div className="flex items-center gap-x-2 text-gray-600 dark:text-gray-400">
                    <Phone className="size-4" />
                    <span>{candidate.phone}</span>
                  </div>
                )}
                <div className="flex items-center gap-x-2 text-gray-600 dark:text-gray-400">
                  <Calendar className="size-4" />
                  <span>Applied {format(new Date(candidate.appliedAt), "dd MMM yyyy")}</span>
                </div>
                {candidate.source && (
                  <div className="flex items-center gap-x-2 text-gray-600 dark:text-gray-400">
                    <Globe className="size-4" />
                    <span>{candidate.source}</span>
                  </div>
                )}
              </div>
            </div>
            {candidate.tags && candidate.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {candidate.tags.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Resume */}
          <div className="space-y-2 rounded-xl border p-4">
            <h3 className="font-semibold">Resume</h3>
            <a
              href={candidate.resume}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-x-1.5 text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              <FileText className="size-4" />
              View Resume
              <ExternalLink className="size-3" />
            </a>
          </div>

          {/* Cover Letter */}
          {candidate.coverLetter && (
            <div className="space-y-2 rounded-xl border p-4">
              <h3 className="font-semibold">Cover Letter</h3>
              <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{candidate.coverLetter}</p>
            </div>
          )}

          {/* Stage History */}
          <div className="space-y-3 rounded-xl border p-4">
            <h3 className="font-semibold">Stage History</h3>
            <CandidateStageTimeline history={instance?.stageHistory ?? []} />
          </div>

          {/* Notes */}
          <div className="space-y-2 rounded-xl border p-4">
            <h3 className="font-semibold">Notes</h3>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this candidate..."
              rows={4}
            />
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-4">
          {/* Current Status */}
          <div className="space-y-3 rounded-xl border p-4">
            <h3 className="font-semibold">Current Status</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-x-2">
                {currentStage && (
                  <span className="size-3 rounded-full" style={{ backgroundColor: currentStage.color }} />
                )}
                <span className="font-medium">{currentStage?.title ?? candidate.currentStageId}</span>
              </div>
              {workflow && <p className="text-xs text-gray-500">{workflow.name}</p>}
            </div>
            {workflow && (
              <div className="flex flex-wrap gap-1 pt-2">
                {workflow.stages.map((stage, idx) => (
                  <div key={stage.id} className="flex items-center">
                    <span
                      className={`size-2.5 rounded-full ${idx <= currentStageIndex ? "opacity-100" : "opacity-30"}`}
                      style={{ backgroundColor: stage.color }}
                      title={stage.title}
                    />
                    {idx < workflow.stages.length - 1 && (
                      <span className="mx-0.5 h-px w-2 bg-gray-300 dark:bg-neutral-600" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Approval Status */}
          {activeApproval && (
            <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50/50 p-4 dark:border-amber-800 dark:bg-amber-950/20">
              <h3 className="font-semibold">Pending Approval</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-x-2">
                  <span className="text-gray-500">From:</span>
                  <span>
                    {workflow?.stages.find((s) => s.id === activeApproval.fromStageId)?.title ??
                      activeApproval.fromStageId}
                  </span>
                </div>
                <div className="flex items-center gap-x-2">
                  <span className="text-gray-500">To:</span>
                  <span>
                    {workflow?.stages.find((s) => s.id === activeApproval.stageId)?.title ?? activeApproval.stageId}
                  </span>
                </div>
                <div className="flex items-center gap-x-2">
                  <span className="text-gray-500">By:</span>
                  <span>{activeApproval.requestedBy}</span>
                </div>
              </div>
              <div className="flex gap-x-2">
                <Button variant="destructive" size="sm" className="flex-1" onClick={() => setReviewDialogOpen(true)}>
                  Reject
                </Button>
                <Button variant="success" size="sm" className="flex-1" onClick={() => setReviewDialogOpen(true)}>
                  Approve
                </Button>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="space-y-3 rounded-xl border p-4">
            <h3 className="font-semibold">Quick Actions</h3>
            {nextStage && !candidate.approvalStatus && (
              <Button size="sm" className="w-full justify-between" onClick={handleMoveToNext}>
                <span>Move to {nextStage.title}</span>
                <ArrowRight className="size-3.5" />
              </Button>
            )}
            {!candidate.approvalStatus && workflow && (
              <div className="flex gap-x-2">
                <Select value={moveToStageId} onValueChange={setMoveToStageId}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Move to stage..." />
                  </SelectTrigger>
                  <SelectContent position="popper">
                    {workflow.stages
                      .filter((s) => s.id !== candidate.currentStageId)
                      .map((stage) => (
                        <SelectItem key={stage.id} value={stage.id}>
                          {stage.title}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm" disabled={!moveToStageId} onClick={handleMoveToStage}>
                  Move
                </Button>
              </div>
            )}
            {candidate.approvalStatus === "pending" && (
              <p className="text-xs text-amber-600 dark:text-amber-400">
                Candidate is awaiting approval. Actions are disabled until resolved.
              </p>
            )}
          </div>

          {/* Rating */}
          <div className="space-y-3 rounded-xl border p-4">
            <h3 className="font-semibold">Rating</h3>
            <div className="flex items-center gap-x-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`size-5 ${
                    candidate.rating && i < candidate.rating
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-200 dark:text-neutral-700"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Approval review dialog */}
      {activeApproval && (
        <ApprovalActionDialog
          open={reviewDialogOpen}
          onOpenChange={setReviewDialogOpen}
          approvalRequest={activeApproval}
          candidate={candidate}
          fromStageName={
            workflow?.stages.find((s) => s.id === activeApproval.fromStageId)?.title ?? activeApproval.fromStageId
          }
          toStageName={workflow?.stages.find((s) => s.id === activeApproval.stageId)?.title ?? activeApproval.stageId}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default Page;
