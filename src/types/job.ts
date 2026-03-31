import type { Company, Department } from "./company";

export type ActivityType = "scheduled" | "interview" | "task" | "follow-up" | "assessment" | "onboarding" | "other";
export type JobStatus = "open" | "closed" | "cancelled" | "pending" | "in progress";
export type ActivityPriority = "urgent" | "high" | "medium" | "low";
export type JobType = "full-time" | "part-time" | "contract";
export type MeetingType = "in-person" | "phone" | "video";
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
  responsibilities: string[];
  tags: string[];
  applications: JobApplication[];
  activities: JobActivity[];
  requirements: string[];
  location?: string;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  role?: string;
  department?: Department;
  company?: Company;
  benefits?: string[];
  closedAt?: Date;
  views?: number;
}

export interface JobActivity {
  id: string;
  jobId: string;
  title: string;
  startDate: Date;
  endDate: Date;
  meetingType: MeetingType;
  location: string;
  meetingUrl: string;
  priority: ActivityPriority;
  type: ActivityType;
  createdAt: Date;
  description?: string;
  updatedAt?: Date;
}

export interface JobApplication {
  id: string;
  jobId: string;
  applicant: JobApplicant;
  status: string;
  workflow: PipelineStageConfig;
  matchScore: number;
  source: string;
  appliedAt: Date;
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
  skills: string[];
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

export interface CreateJobDto {
  title: string;
  description?: string;
  openUntil?: Date;
  jobType: JobType | (string & {});
  workType: WorkType | (string & {});
  experienceType: ExperienceType | (string & {});
  responsibilities?: string[];
  tags?: string[];
  location?: string;
  remote?: boolean;
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
  role?: string;
  departmentId?: string;
  companyId?: string;
  requirements?: string[];
  benefits?: string[];
}

export interface CreateActivityDto {
  jobId: string;
  title: string;
  startDate: Date | undefined;
  endDate: Date | undefined;
  meetingType: MeetingType | (string & {});
  location: string;
  meetingUrl: string;
  priority: ActivityPriority | (string & {});
  type: ActivityType | (string & {});
  description?: string;
}

export interface JobTemplate {
  id: string;
  title: string;
  department: Department;
  jobType: JobType;
}
