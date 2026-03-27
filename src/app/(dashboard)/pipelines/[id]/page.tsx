"use client";

import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowLeft,
  Bell,
  Calendar,
  Building2,
  CheckCircle,
  Clock,
  KanbanIcon,
  List,
  Pencil,
  ShieldCheck,
  User,
  Users,
} from "lucide-react";

import { Kanban, KanbanList, TabPanel, type KanbanDragEndEvent } from "@/components/shared";
import { WorkflowKanbanCard } from "@/components/workflows/workflow-kanban-card";
import { ApprovalActionDialog } from "@/components/workflows/approval-action-dialog";
import { MoveCandidateDialog } from "@/components/workflows/move-candidate-dialog";
import { ApprovalBadge } from "@/components/workflows/approval-badge";
import { useWorkflowStore } from "@/store/core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib";

import type { ApprovalRequest, Candidate } from "@/types/workflow";
import type { PipelineStageConfig } from "@/types/job";

const tabs = [
  { label: "Overview", value: "overview" },
  { label: "Pipeline", value: "pipeline" },
  { label: "Approval Queue", value: "approvals" },
];

const viewOptions = [
  { label: "Kanban", value: "kanban", icon: KanbanIcon },
  { label: "List", value: "list", icon: List },
];

const Page = () => {
  const id = useParams().id as string;
  const {
    workflows,
    candidates,
    approvalRequests,
    moveCandidate,
    createApprovalRequest,
    resolveApproval,
    getCandidatesForWorkflow,
  } = useWorkflowStore();

  const workflow = workflows.find((w) => w.id === id);

  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const [view, setView] = useState("kanban");

  const [reviewingApproval, setReviewingApproval] = useState<ApprovalRequest | null>(null);
  const [reviewingCandidate, setReviewingCandidate] = useState<Candidate | null>(null);

  const [pendingMove, setPendingMove] = useState<{
    candidate: Candidate;
    targetStage: PipelineStageConfig;
    currentStageName: string;
  } | null>(null);

  const workflowCandidates = useMemo(() => getCandidatesForWorkflow(id), [getCandidatesForWorkflow, id]);

  const workflowApprovals = useMemo(() => approvalRequests.filter((r) => r.workflowId === id), [approvalRequests, id]);

  const pendingApprovals = useMemo(() => workflowApprovals.filter((r) => r.status === "pending"), [workflowApprovals]);

  const columns = useMemo(
    () => workflow?.stages.map((s) => ({ id: s.id, title: s.title, color: s.color })) ?? [],
    [workflow],
  );

  const kanbanItems = useMemo(
    () =>
      workflowCandidates.map((c) => ({
        ...c,
        status: c.currentStageId,
      })),
    [workflowCandidates],
  );

  if (!workflow) {
    return (
      <div className="grid min-h-64 place-items-center p-6">
        <div className="text-center">
          <p className="text-lg font-medium text-red-500">Workflow not found</p>
          <Link href="/workflows" className="mt-2 text-sm text-gray-500 underline">
            Back to workflows
          </Link>
        </div>
      </div>
    );
  }

  const handleDragEnd = ({ item, toStatus }: KanbanDragEndEvent<Candidate & { status: string }>) => {
    if (item.currentStageId === toStatus) return;

    const targetStage = workflow.stages.find((s) => s.id === toStatus);
    if (!targetStage) return;

    if (targetStage.approval.required) {
      const currentStage = workflow.stages.find((s) => s.id === item.currentStageId);
      setPendingMove({
        candidate: item,
        targetStage,
        currentStageName: currentStage?.title ?? item.currentStageId,
      });
      return;
    }

    moveCandidate(item.id, toStatus, "Current User");
    toast.success(`${item.name} moved to "${targetStage.title}"`);
  };

  const handleConfirmApprovalRequest = () => {
    if (!pendingMove) return;

    createApprovalRequest({
      candidateId: pendingMove.candidate.id,
      applicationId: pendingMove.candidate.applicationId,
      jobId: pendingMove.candidate.jobId,
      workflowId: workflow.id,
      stageId: pendingMove.targetStage.id,
      fromStageId: pendingMove.candidate.currentStageId,
      requestedBy: "Current User",
      assignedTo: pendingMove.targetStage.approval.approvers,
      status: "pending",
    });

    toast.success(`Approval request sent for "${pendingMove.candidate.name}"`, {
      description: `Pending approval to move to "${pendingMove.targetStage.title}"`,
    });

    setPendingMove(null);
  };

  const handleApprove = (requestId: string, comment: string) => {
    resolveApproval(requestId, "approved", "Current User", comment || undefined);
    const request = approvalRequests.find((r) => r.id === requestId);
    const candidate = candidates.find((c) => c.id === request?.candidateId);
    const stage = workflow.stages.find((s) => s.id === request?.stageId);
    toast.success(`${candidate?.name} approved for "${stage?.title}"`);
    setReviewingApproval(null);
    setReviewingCandidate(null);
  };

  const handleReject = (requestId: string, comment: string) => {
    resolveApproval(requestId, "rejected", "Current User", comment || undefined);
    const request = approvalRequests.find((r) => r.id === requestId);
    const candidate = candidates.find((c) => c.id === request?.candidateId);
    toast.info(`Approval rejected for ${candidate?.name}`);
    setReviewingApproval(null);
    setReviewingCandidate(null);
  };

  const openReviewDialog = (approval: ApprovalRequest) => {
    const candidate = candidates.find((c) => c.id === approval.candidateId);
    if (candidate) {
      setReviewingApproval(approval);
      setReviewingCandidate(candidate);
    }
  };

  const stageStats = workflow.stages.map((stage) => ({
    ...stage,
    count: workflowCandidates.filter((c) => c.currentStageId === stage.id).length,
  }));

  return (
    <div className="space-y-6 p-6">
      <Link href="/workflows">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </Link>
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-x-2">
            <h1 className="text-2xl font-semibold">{workflow.name}</h1>
            <Badge
              className={cn(
                "text-xs",
                workflow.isActive
                  ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                  : "bg-gray-100 text-gray-600 dark:bg-neutral-800 dark:text-gray-400",
              )}
            >
              {workflow.isActive ? "Active" : "Inactive"}
            </Badge>
          </div>
          <p className="text-sm text-gray-500">{workflow.description}</p>
        </div>
        <Link href={`/workflows/${workflow.id}/edit`}>
          <Button variant="outline" size="sm">
            <Pencil className="size-3.5" />
            Edit
          </Button>
        </Link>
      </div>
      <div className="w-full space-y-4">
        <div className="flex w-full items-center rounded-md bg-gray-100 p-1 dark:bg-neutral-800">
          {tabs.map((tab) => (
            <button
              className={cn(
                "flex h-8 min-w-37.5 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors",
                activeTab === tab.value
                  ? "bg-white text-gray-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                  : "text-gray-500",
              )}
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
            >
              {tab.label}
              {tab.value === "approvals" && pendingApprovals.length > 0 && (
                <span className="ml-1.5 grid size-5 place-items-center rounded-full bg-amber-100 text-xs font-semibold text-amber-800 dark:bg-amber-900 dark:text-amber-300">
                  {pendingApprovals.length}
                </span>
              )}
            </button>
          ))}
        </div>
        <TabPanel selected={activeTab} value="overview">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <div className="space-y-2 rounded-xl border p-4">
                <h3 className="font-semibold">Details</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-x-2 text-gray-600 dark:text-gray-400">
                    <Building2 className="size-4 shrink-0" />
                    <span>{workflow.department.name}</span>
                  </div>
                  <div className="flex items-center gap-x-2 text-gray-600 dark:text-gray-400">
                    <User className="size-4 shrink-0" />
                    <span>Created by {workflow.createdBy}</span>
                  </div>
                  <div className="flex items-center gap-x-2 text-gray-600 dark:text-gray-400">
                    <Calendar className="size-4 shrink-0" />
                    <span>Created {format(new Date(workflow.createdAt), "dd MMM yyyy")}</span>
                  </div>
                </div>
              </div>
              <div className="space-y-3 rounded-xl border p-4">
                <h3 className="font-semibold">Pipeline Stages</h3>
                <div className="space-y-2">
                  {stageStats.map((stage, idx) => (
                    <div
                      key={stage.id}
                      className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 dark:bg-neutral-800"
                    >
                      <div className="flex items-center gap-x-2">
                        <span className="w-5 text-xs font-medium text-gray-400">{idx + 1}</span>
                        <span className="size-3 rounded-full" style={{ backgroundColor: stage.color }} />
                        <span className="text-sm font-medium">{stage.title}</span>
                        {stage.approval.required && (
                          <span className="flex items-center gap-x-1 text-xs text-amber-600 dark:text-amber-400">
                            <ShieldCheck className="size-3" />
                            Approval
                          </span>
                        )}
                        {stage.notifications.enabled && <Bell className="size-3 text-gray-400" />}
                      </div>
                      <span className="text-sm font-medium">{stage.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col justify-between rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Candidates</p>
                    <Users className="size-5 text-purple-600" />
                  </div>
                  <p className="mt-2 text-2xl font-bold">{workflowCandidates.length}</p>
                  <p className="mt-1 text-xs text-gray-400">In pipeline</p>
                </div>
                <div className="flex flex-col justify-between rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Pending</p>
                    <Clock className="size-5 text-amber-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold">{pendingApprovals.length}</p>
                  <p className="mt-1 text-xs text-gray-400">Awaiting approval</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col justify-between rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Stages</p>
                    <CheckCircle className="size-5 text-blue-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold">{workflow.stages.length}</p>
                  <p className="mt-1 text-xs text-gray-400">Total stages</p>
                </div>
                <div className="flex flex-col justify-between rounded-xl border p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-gray-500">Approvals</p>
                    <ShieldCheck className="size-5 text-green-500" />
                  </div>
                  <p className="mt-2 text-2xl font-bold">{workflow.stages.filter((s) => s.approval.required).length}</p>
                  <p className="mt-1 text-xs text-gray-400">Approval stages</p>
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
        <TabPanel selected={activeTab} value="pipeline">
          <div className="space-y-4">
            <div className="flex items-center justify-end">
              <motion.div className="flex h-8 items-center rounded-md bg-gray-100 p-1 dark:bg-neutral-800">
                {viewOptions.map(({ icon: Icon, value }) => (
                  <motion.button
                    className={cn(
                      "grid size-6 shrink-0 place-items-center rounded-md transition-colors",
                      value === view
                        ? "bg-white text-gray-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                        : "text-gray-600",
                    )}
                    key={value}
                    onClick={() => setView(value)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    layout
                  >
                    <Icon className="size-4" />
                  </motion.button>
                ))}
              </motion.div>
            </div>
            {view === "kanban" ? (
              <Kanban
                items={kanbanItems}
                columns={columns}
                onDragEnd={handleDragEnd}
                renderCard={(candidate) => <WorkflowKanbanCard candidate={candidate} />}
              />
            ) : (
              <KanbanList
                items={kanbanItems}
                columns={columns}
                onDragEnd={handleDragEnd}
                renderCard={(candidate) => <WorkflowKanbanCard candidate={candidate} />}
              />
            )}
          </div>
        </TabPanel>
        <TabPanel selected={activeTab} value="approvals">
          <div className="space-y-4">
            <div className="rounded-xl border">
              <table className="w-full">
                <thead>
                  <tr className="border-b text-left text-sm text-gray-500">
                    <th className="px-4 py-3 font-medium">Candidate</th>
                    <th className="px-4 py-3 font-medium">From</th>
                    <th className="px-4 py-3 font-medium">To</th>
                    <th className="px-4 py-3 font-medium">Requested By</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {workflowApprovals.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-400">
                        No approval requests yet.
                      </td>
                    </tr>
                  ) : (
                    workflowApprovals.map((approval) => {
                      const candidate = candidates.find((c) => c.id === approval.candidateId);
                      const fromStage = workflow.stages.find((s) => s.id === approval.fromStageId);
                      const toStage = workflow.stages.find((s) => s.id === approval.stageId);

                      return (
                        <tr key={approval.id} className="border-b last:border-b-0">
                          <td className="px-4 py-3">
                            <div>
                              <p className="text-sm font-medium">{candidate?.name ?? "Unknown"}</p>
                              <p className="text-xs text-gray-500">{candidate?.email}</p>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-x-1.5">
                              {fromStage && (
                                <span className="size-2 rounded-full" style={{ backgroundColor: fromStage.color }} />
                              )}
                              <span className="text-sm">{fromStage?.title ?? approval.fromStageId}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-x-1.5">
                              {toStage && (
                                <span className="size-2 rounded-full" style={{ backgroundColor: toStage.color }} />
                              )}
                              <span className="text-sm">{toStage?.title ?? approval.stageId}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">{approval.requestedBy}</td>
                          <td className="px-4 py-3">
                            <ApprovalBadge status={approval.status} />
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400">
                            {format(new Date(approval.createdAt), "dd MMM yyyy")}
                          </td>
                          <td className="px-4 py-3">
                            {approval.status === "pending" && (
                              <Button variant="outline" size="sm" onClick={() => openReviewDialog(approval)}>
                                Review
                              </Button>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </TabPanel>
      </div>
      <MoveCandidateDialog
        open={!!pendingMove}
        onOpenChange={(open) => {
          if (!open) setPendingMove(null);
        }}
        candidate={pendingMove?.candidate ?? null}
        targetStage={pendingMove?.targetStage ?? null}
        currentStageName={pendingMove?.currentStageName ?? ""}
        onConfirm={handleConfirmApprovalRequest}
      />

      {/* Approval review dialog */}
      {reviewingApproval && reviewingCandidate && (
        <ApprovalActionDialog
          open={!!reviewingApproval}
          onOpenChange={(open) => {
            if (!open) {
              setReviewingApproval(null);
              setReviewingCandidate(null);
            }
          }}
          approvalRequest={reviewingApproval}
          candidate={reviewingCandidate}
          fromStageName={
            workflow.stages.find((s) => s.id === reviewingApproval.fromStageId)?.title ?? reviewingApproval.fromStageId
          }
          toStageName={
            workflow.stages.find((s) => s.id === reviewingApproval.stageId)?.title ?? reviewingApproval.stageId
          }
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
};

export default Page;
