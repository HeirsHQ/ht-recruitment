import type { Job, PipelineStageConfig } from "./job";

export interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  stages: PipelineStageConfig[];
  department: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

export type ApprovalStatus = "pending" | "approved" | "rejected";

export interface ApprovalComment {
  id: string;
  authorName: string;
  text: string;
  createdAt: Date;
}

export interface ApprovalRequest {
  id: string;
  candidateId: string;
  applicationId: string;
  jobId: string;
  workflowId: string;
  stageId: string;
  fromStageId: string;
  requestedBy: string;
  assignedTo: string[];
  status: ApprovalStatus;
  comments: ApprovalComment[];
  createdAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
}

export interface CandidateExperience {
  title: string;
  company: string;
  startDate: string;
  endDate?: string;
  description: string;
}

export interface CandidateEducation {
  degree: string;
  institution: string;
  year: number;
}

export interface CandidateCertification {
  name: string;
  year: number;
}

export interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  location?: string;
  summary?: string;
  resume: string;
  matchScore: number;
  coverLetter?: string;
  avatar?: string;
  skills: string[];
  experience: CandidateExperience[];
  education: CandidateEducation[];
  certifications: CandidateCertification[];
  status: "active" | "inactive";
  appliedAt: Date;
  currentStageId: string;
  previousStageId?: string;
  workflowId?: string;
  jobId: string;
  job: Job;
  applicationId: string;
  approvalStatus?: ApprovalStatus;
  activeApprovalId?: string;
  tags?: string[];
  notes?: string;
  rating?: number;
  source?: string;
}

export interface StageHistoryEntry {
  stageId: string;
  stageName: string;
  enteredAt: Date;
  exitedAt?: Date;
  action: "moved" | "approved" | "rejected" | "auto-moved";
  performedBy: string;
  notes?: string;
}

export interface WorkflowInstance {
  id: string;
  workflowId: string;
  candidateId: string;
  jobId: string;
  currentStageId: string;
  stageHistory: StageHistoryEntry[];
  startedAt: Date;
  completedAt?: Date;
  status: "active" | "completed" | "rejected";
}
