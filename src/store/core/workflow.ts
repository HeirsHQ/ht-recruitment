import { createReportableStore } from "../middleware/report";
import type {
  ApprovalComment,
  ApprovalRequest,
  Candidate,
  StageHistoryEntry,
  WorkflowInstance,
  WorkflowTemplate,
} from "@/types/workflow";
import { MOCK_APPROVAL_REQUESTS, MOCK_CANDIDATES, MOCK_WORKFLOW_INSTANCES, MOCK_WORKFLOWS } from "@/__mock__/database";

interface WorkflowStore {
  workflows: WorkflowTemplate[];
  candidates: Candidate[];
  approvalRequests: ApprovalRequest[];
  workflowInstances: WorkflowInstance[];

  addWorkflow: (workflow: WorkflowTemplate) => void;
  updateWorkflow: (id: string, updates: Partial<WorkflowTemplate>) => void;
  deleteWorkflow: (id: string) => void;

  moveCandidate: (candidateId: string, toStageId: string, performedBy: string) => void;
  createApprovalRequest: (request: Omit<ApprovalRequest, "id" | "createdAt" | "comments">) => void;
  resolveApproval: (requestId: string, status: "approved" | "rejected", resolvedBy: string, comment?: string) => void;
  addApprovalComment: (requestId: string, comment: Omit<ApprovalComment, "id" | "createdAt">) => void;

  getPendingApprovals: () => ApprovalRequest[];
  getPendingApprovalsCount: () => number;
  getCandidatesForWorkflow: (workflowId: string) => Candidate[];
  getCandidatesForStage: (workflowId: string, stageId: string) => Candidate[];
}

export const useWorkflowStore = createReportableStore<WorkflowStore>((set, get) => ({
  workflows: MOCK_WORKFLOWS,
  candidates: MOCK_CANDIDATES,
  approvalRequests: MOCK_APPROVAL_REQUESTS,
  workflowInstances: MOCK_WORKFLOW_INSTANCES,

  addWorkflow: (workflow) => set((state) => ({ workflows: [workflow, ...state.workflows] })),

  updateWorkflow: (id, updates) =>
    set((state) => ({
      workflows: state.workflows.map((w) => (w.id === id ? { ...w, ...updates, updatedAt: new Date() } : w)),
    })),

  deleteWorkflow: (id) =>
    set((state) => ({
      workflows: state.workflows.filter((w) => w.id !== id),
    })),

  moveCandidate: (candidateId, toStageId, performedBy) =>
    set((state) => {
      const candidate = state.candidates.find((c) => c.id === candidateId);
      if (!candidate) return state;

      const workflow = state.workflows.find((w) => w.id === candidate.workflowId);
      const targetStage = workflow?.stages.find((s) => s.id === toStageId);

      const historyEntry: StageHistoryEntry = {
        stageId: toStageId,
        stageName: targetStage?.title ?? toStageId,
        enteredAt: new Date(),
        action: "moved",
        performedBy,
      };

      return {
        candidates: state.candidates.map((c) =>
          c.id === candidateId
            ? {
                ...c,
                previousStageId: c.currentStageId,
                currentStageId: toStageId,
                approvalStatus: undefined,
                activeApprovalId: undefined,
              }
            : c,
        ),
        workflowInstances: state.workflowInstances.map((inst) =>
          inst.candidateId === candidateId
            ? {
                ...inst,
                currentStageId: toStageId,
                stageHistory: [...inst.stageHistory, historyEntry],
                status: toStageId === "hired" ? ("completed" as const) : inst.status,
                completedAt: toStageId === "hired" ? new Date() : undefined,
              }
            : inst,
        ),
      };
    }),

  createApprovalRequest: (request) =>
    set((state) => {
      const id = crypto.randomUUID();
      const newRequest: ApprovalRequest = {
        ...request,
        id,
        comments: [],
        createdAt: new Date(),
      };

      return {
        approvalRequests: [newRequest, ...state.approvalRequests],
        candidates: state.candidates.map((c) =>
          c.id === request.candidateId ? { ...c, approvalStatus: "pending" as const, activeApprovalId: id } : c,
        ),
      };
    }),

  resolveApproval: (requestId, status, resolvedBy, comment) =>
    set((state) => {
      const request = state.approvalRequests.find((r) => r.id === requestId);
      if (!request) return state;

      const comments = comment
        ? [
            ...request.comments,
            {
              id: crypto.randomUUID(),
              authorName: resolvedBy,
              text: comment,
              createdAt: new Date(),
            },
          ]
        : request.comments;

      const updatedRequests = state.approvalRequests.map((r) =>
        r.id === requestId ? { ...r, status, resolvedAt: new Date(), resolvedBy, comments } : r,
      );

      let updatedCandidates = state.candidates;
      let updatedInstances = state.workflowInstances;

      if (status === "approved") {
        const historyEntry: StageHistoryEntry = {
          stageId: request.stageId,
          stageName: request.stageId,
          enteredAt: new Date(),
          action: "approved",
          performedBy: resolvedBy,
          notes: comment,
        };

        // Resolve the stage name from the workflow
        const workflow = state.workflows.find((w) => w.id === request.workflowId);
        const targetStage = workflow?.stages.find((s) => s.id === request.stageId);
        if (targetStage) {
          historyEntry.stageName = targetStage.title;
        }

        updatedCandidates = state.candidates.map((c) =>
          c.id === request.candidateId
            ? {
                ...c,
                previousStageId: c.currentStageId,
                currentStageId: request.stageId,
                approvalStatus: undefined,
                activeApprovalId: undefined,
              }
            : c,
        );

        updatedInstances = state.workflowInstances.map((inst) =>
          inst.candidateId === request.candidateId
            ? {
                ...inst,
                currentStageId: request.stageId,
                stageHistory: [...inst.stageHistory, historyEntry],
                status: request.stageId === "hired" ? ("completed" as const) : inst.status,
                completedAt: request.stageId === "hired" ? new Date() : undefined,
              }
            : inst,
        );
      } else {
        // Rejected: clear approval status, candidate stays in current stage
        updatedCandidates = state.candidates.map((c) =>
          c.id === request.candidateId ? { ...c, approvalStatus: undefined, activeApprovalId: undefined } : c,
        );

        const workflow = state.workflows.find((w) => w.id === request.workflowId);
        const targetStage = workflow?.stages.find((s) => s.id === request.stageId);

        const rejectedEntry: StageHistoryEntry = {
          stageId: request.stageId,
          stageName: targetStage?.title ?? request.stageId,
          enteredAt: new Date(),
          action: "rejected",
          performedBy: resolvedBy,
          notes: comment,
        };

        updatedInstances = state.workflowInstances.map((inst) =>
          inst.candidateId === request.candidateId
            ? { ...inst, stageHistory: [...inst.stageHistory, rejectedEntry] }
            : inst,
        );
      }

      return {
        approvalRequests: updatedRequests,
        candidates: updatedCandidates,
        workflowInstances: updatedInstances,
      };
    }),

  addApprovalComment: (requestId, comment) =>
    set((state) => ({
      approvalRequests: state.approvalRequests.map((r) =>
        r.id === requestId
          ? {
              ...r,
              comments: [...r.comments, { ...comment, id: crypto.randomUUID(), createdAt: new Date() }],
            }
          : r,
      ),
    })),

  getPendingApprovals: () => get().approvalRequests.filter((r) => r.status === "pending"),

  getPendingApprovalsCount: () => get().approvalRequests.filter((r) => r.status === "pending").length,

  getCandidatesForWorkflow: (workflowId) => get().candidates.filter((c) => c.workflowId === workflowId),

  getCandidatesForStage: (workflowId, stageId) =>
    get().candidates.filter((c) => c.workflowId === workflowId && c.currentStageId === stageId),
}));
