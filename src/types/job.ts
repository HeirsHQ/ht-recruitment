export type JobEmploymentType = "full-time" | "part-time" | "contract" | "internship";
export type JobExperienceLevel = "entry" | "mid" | "senior" | "executive";
export type JobStatus = "open" | "closed";

export interface Job {
  id: string;
  title: string;
  description?: string;
  status: JobStatus;
  createdAt: Date;
  updatedAt: Date;
  openUntil: Date;
  employmentType: JobEmploymentType;
  experienceLevel: JobExperienceLevel;
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
  phone: string;
  coverLetter: string;
  resumeFile: File | null;
}
