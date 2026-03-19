export type JobStatus = "open" | "closed" | "cancelled" | "pending" | "in progress";
export type JobType = "full-time" | "part-time" | "contract";
export type WorkType = "on-site" | "hybrid" | "remote";
export type ExperienceType =
  | "internship"
  | "entry-level"
  | "associate-level"
  | "mid-level"
  | "senior-level"
  | "management-level"
  | "director-level"
  | "executive-level";

export interface Job {
  id: string;
  title: string;
  description?: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  openUntil: Date;
  jobType: JobType;
  workType: WorkType;
  experienceType: ExperienceType;
  responsibilities?: string[];
  tags?: string[];
  applications?: JobApplication[];
  location?: string;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  role?: string;
  department?: string;
  company?: string;
  requirements?: string[];
  benefits?: string[];
  closedAt?: Date;
  views?: number;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicant: JobApplicant;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JobApplicant {
  id: string;
  name: string;
  email: string;
  resume: string;
  coverLetter?: string;
  appliedAt: Date;
}

export interface PipelineStageConfig {
  id: string;
  title: string;
  color: string;
  notifications: {
    enabled: boolean;
    recipients: string[];
  };
  approval: {
    required: boolean;
    approvers: string[];
  };
  workflow: {
    autoMoveAfterDays?: number;
    sendEmailTemplate?: string;
  };
}

export interface ApplyDto {
  fullName: string;
  email: string;
  phoneNumber: string;
  location: string;
  linkedInUrl: string;
  summary: string;
  skills: string[];
  coverLetter: string;
  resumeFile: File | null;
}
