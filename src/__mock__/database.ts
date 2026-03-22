import { faker } from "@faker-js/faker";

import type { Job, JobApplication, JobStatus, Role, User, UserStatus } from "@/types";
import type { PipelineStageConfig } from "@/types/job";
import type {
  ApprovalRequest,
  ApprovalStatus,
  Candidate,
  StageHistoryEntry,
  WorkflowInstance,
  WorkflowTemplate,
} from "@/types/workflow";

export const MOCK_DEPARTMENTS = [
  { id: "all", name: "All Departments" },
  { id: "engineering", name: "Engineering" },
  { id: "product", name: "Product" },
  { id: "design", name: "Design" },
  { id: "marketing", name: "Marketing" },
  { id: "sales", name: "Sales" },
  { id: "hr", name: "Human Resources" },
  { id: "finance", name: "Finance" },
  { id: "operations", name: "Operations" },
  { id: "legal", name: "Legal" },
  { id: "customer-support", name: "Customer Support" },
];

export const MOCK_JOB_ROLES = [
  { id: "software-engineer", name: "Software Engineer" },
  { id: "frontend-engineer", name: "Frontend Engineer" },
  { id: "backend-engineer", name: "Backend Engineer" },
  { id: "fullstack-engineer", name: "Fullstack Engineer" },
  { id: "devops-engineer", name: "DevOps Engineer" },
  { id: "data-engineer", name: "Data Engineer" },
  { id: "data-scientist", name: "Data Scientist" },
  { id: "product-manager", name: "Product Manager" },
  { id: "product-designer", name: "Product Designer" },
  { id: "ux-researcher", name: "UX Researcher" },
  { id: "qa-engineer", name: "QA Engineer" },
  { id: "project-manager", name: "Project Manager" },
  { id: "business-analyst", name: "Business Analyst" },
  { id: "marketing-manager", name: "Marketing Manager" },
  { id: "sales-representative", name: "Sales Representative" },
  { id: "hr-manager", name: "HR Manager" },
  { id: "recruiter", name: "Recruiter" },
  { id: "accountant", name: "Accountant" },
  { id: "legal-counsel", name: "Legal Counsel" },
  { id: "customer-support-specialist", name: "Customer Support Specialist" },
];

function createMockApplications(jobId: string): JobApplication[] {
  const count = faker.number.int({ min: 10, max: 20 });
  return Array.from({ length: count }, () => {
    const applicantStatus = faker.helpers.arrayElement([
      "pending",
      "accepted",
      "hr-interview",
      "interview-scheduled",
      "rejected",
    ]);
    return {
      id: faker.string.uuid(),
      jobId,
      applicant: {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email({ provider: "gmail.com" }),
        resume: faker.internet.url(),
        coverLetter: faker.datatype.boolean() ? faker.lorem.paragraph() : undefined,
        appliedAt: faker.date.recent(),
      },
      status: applicantStatus,
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
    };
  });
}

export const MOCK_JOBS: Job[] = Array.from({ length: 16 }, () => {
  const status: JobStatus = faker.helpers.arrayElement(["open", "closed", "cancelled", "pending", "in progress"]);
  const jobId = faker.string.uuid();

  return {
    id: jobId,
    title: faker.person.jobTitle(),
    status,
    createdAt: faker.date.past(),
    openUntil: status === "open" ? faker.date.future() : faker.date.recent(),
    updatedAt: faker.date.recent(),
    applications: createMockApplications(jobId),
    description: faker.lorem.paragraph(),
    tags: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
    jobType: faker.helpers.arrayElement(["full-time", "part-time", "contract"]),
    experienceType: faker.helpers.arrayElement([
      "internship",
      "entry-level",
      "associate-level",
      "mid-level",
      "senior-level",
      "management-level",
      "director-level",
      "executive-level",
    ]),
    workType: faker.helpers.arrayElement(["on-site", "hybrid", "remote"]),
    location: faker.location.city(),
    remote: faker.datatype.boolean(),
    salaryMin: faker.number.int({ min: 50000, max: 100000 }),
    salaryMax: faker.number.int({ min: 100000, max: 200000 }),
    currency: "NGN",
    role: faker.helpers.arrayElement(MOCK_JOB_ROLES).name,
    department: faker.helpers.arrayElement(MOCK_DEPARTMENTS).name,
    company: faker.company.name(),
    responsibilities: [faker.lorem.sentence(), faker.lorem.sentence(), faker.lorem.sentence()],
    requirements: [faker.lorem.sentence(), faker.lorem.sentence(), faker.lorem.sentence()],
    benefits: [faker.lorem.sentence(), faker.lorem.sentence(), faker.lorem.sentence()],
    closedAt: status === "closed" || status === "cancelled" ? faker.date.recent() : undefined,
    views: faker.number.int({ min: 0, max: 1000 }),
  };
});

export const MOCK_ROLES: Role[] = Array.from({ length: 10 }, () => {
  return {
    id: faker.string.uuid(),
    name: faker.lorem.word(),
    permissions: [faker.lorem.word(), faker.lorem.word(), faker.lorem.word()],
    description: faker.lorem.paragraph(),
    isActive: faker.datatype.boolean(),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    createdBy: faker.string.uuid(),
    updatedBy: faker.string.uuid(),
  };
});

export const MOCK_USERS: User[] = Array.from({ length: 15 }, () => {
  const status: UserStatus = faker.helpers.arrayElement(["active", "inactive"]);
  const role: Role = faker.helpers.arrayElement(MOCK_ROLES);

  return {
    id: faker.number.int({ min: 1, max: 1000 }),
    email: faker.internet.email(),
    password: faker.internet.password(),
    name: faker.person.fullName(),
    role,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    isActive: status === "active",
    avatar: faker.image.avatar(),
    lastLoginAt: status === "active" ? faker.date.recent() : undefined,
  };
});

// ---------------------------------------------------------------------------
// Workflow Templates
// ---------------------------------------------------------------------------

function makeStage(
  id: string,
  title: string,
  color: string,
  opts?: { approvalRequired?: boolean; approvers?: string[]; emailTemplate?: string },
): PipelineStageConfig {
  return {
    id,
    title,
    color,
    notifications: { enabled: true, recipients: [] },
    approval: {
      required: opts?.approvalRequired ?? false,
      approvers: opts?.approvers ?? [],
    },
    workflow: { sendEmailTemplate: opts?.emailTemplate },
  };
}

export const MOCK_WORKFLOWS: WorkflowTemplate[] = [
  {
    id: "wf-engineering",
    name: "Engineering Hiring Pipeline",
    description: "Standard workflow for engineering roles including technical and system design interviews.",
    department: "Engineering",
    createdBy: MOCK_USERS[0]?.name ?? "Admin",
    isActive: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    stages: [
      makeStage("applied", "Applied", "#6b7280"),
      makeStage("phone-screen", "Phone Screen", "#3b82f6", { emailTemplate: "interview-invite" }),
      makeStage("technical-interview", "Technical Interview", "#8b5cf6", {
        approvalRequired: true,
        approvers: [MOCK_USERS[1]?.email ?? "tech-lead@company.com", MOCK_USERS[2]?.email ?? "eng-mgr@company.com"],
        emailTemplate: "interview-invite",
      }),
      makeStage("system-design", "System Design", "#ec4899", {
        approvalRequired: true,
        approvers: [MOCK_USERS[1]?.email ?? "tech-lead@company.com"],
      }),
      makeStage("final-round", "Final Round", "#f97316", { emailTemplate: "interview-invite" }),
      makeStage("offer", "Offer", "#10b981", { emailTemplate: "offer-letter" }),
      makeStage("hired", "Hired", "#059669"),
    ],
  },
  {
    id: "wf-design",
    name: "Design Hiring Pipeline",
    description: "Workflow for design roles with portfolio review and design challenge stages.",
    department: "Design",
    createdBy: MOCK_USERS[0]?.name ?? "Admin",
    isActive: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    stages: [
      makeStage("applied", "Applied", "#6b7280"),
      makeStage("portfolio-review", "Portfolio Review", "#8b5cf6", {
        approvalRequired: true,
        approvers: [MOCK_USERS[3]?.email ?? "design-lead@company.com"],
      }),
      makeStage("design-challenge", "Design Challenge", "#3b82f6", { emailTemplate: "interview-invite" }),
      makeStage("team-interview", "Team Interview", "#f59e0b", { emailTemplate: "interview-invite" }),
      makeStage("offer", "Offer", "#10b981", { emailTemplate: "offer-letter" }),
      makeStage("hired", "Hired", "#059669"),
    ],
  },
  {
    id: "wf-sales",
    name: "Sales Hiring Pipeline",
    description: "Standard workflow for sales positions including presentation and manager interview.",
    department: "Sales",
    createdBy: MOCK_USERS[0]?.name ?? "Admin",
    isActive: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    stages: [
      makeStage("applied", "Applied", "#6b7280"),
      makeStage("screening-call", "Screening Call", "#3b82f6", { emailTemplate: "interview-invite" }),
      makeStage("sales-presentation", "Sales Presentation", "#f59e0b", {
        approvalRequired: true,
        approvers: [MOCK_USERS[4]?.email ?? "sales-mgr@company.com"],
        emailTemplate: "interview-invite",
      }),
      makeStage("manager-interview", "Manager Interview", "#8b5cf6", { emailTemplate: "interview-invite" }),
      makeStage("offer", "Offer", "#10b981", { emailTemplate: "offer-letter" }),
      makeStage("hired", "Hired", "#059669"),
    ],
  },
  {
    id: "wf-executive",
    name: "Executive Recruitment",
    description: "Multi-approval workflow for executive-level hires with board approval.",
    department: "Human Resources",
    createdBy: MOCK_USERS[0]?.name ?? "Admin",
    isActive: true,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    stages: [
      makeStage("applied", "Applied", "#6b7280"),
      makeStage("background-check", "Background Check", "#f59e0b", {
        approvalRequired: true,
        approvers: [MOCK_USERS[5]?.email ?? "hr@company.com"],
      }),
      makeStage("panel-interview", "Panel Interview", "#3b82f6", {
        approvalRequired: true,
        approvers: [MOCK_USERS[1]?.email ?? "vp@company.com", MOCK_USERS[5]?.email ?? "hr@company.com"],
        emailTemplate: "interview-invite",
      }),
      makeStage("board-approval", "Board Approval", "#8b5cf6", {
        approvalRequired: true,
        approvers: [MOCK_USERS[0]?.email ?? "ceo@company.com"],
      }),
      makeStage("offer", "Offer", "#10b981", { emailTemplate: "offer-letter" }),
      makeStage("hired", "Hired", "#059669"),
    ],
  },
  {
    id: "wf-internship",
    name: "Internship Program",
    description: "Simplified workflow for internship positions.",
    department: "Human Resources",
    createdBy: MOCK_USERS[0]?.name ?? "Admin",
    isActive: false,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    stages: [
      makeStage("applied", "Applied", "#6b7280"),
      makeStage("resume-screen", "Resume Screen", "#3b82f6"),
      makeStage("interview", "Interview", "#f59e0b", { emailTemplate: "interview-invite" }),
      makeStage("offer", "Offer", "#10b981", { emailTemplate: "offer-letter" }),
      makeStage("onboarding", "Onboarding", "#059669"),
    ],
  },
];

// ---------------------------------------------------------------------------
// Candidates & Workflow Instances
// ---------------------------------------------------------------------------

const CANDIDATE_SOURCES = ["LinkedIn", "Referral", "Job Board", "Company Website", "Recruiter", "Career Fair"];

function createMockCandidates(): {
  candidates: Candidate[];
  instances: WorkflowInstance[];
  approvals: ApprovalRequest[];
} {
  const candidates: Candidate[] = [];
  const instances: WorkflowInstance[] = [];
  const approvals: ApprovalRequest[] = [];

  const activeWorkflows = MOCK_WORKFLOWS.filter((w) => w.isActive);

  for (let i = 0; i < 30; i++) {
    const workflow = faker.helpers.arrayElement(activeWorkflows);
    const job = faker.helpers.arrayElement(MOCK_JOBS);
    const stageIndex = faker.number.int({ min: 0, max: workflow.stages.length - 1 });
    const currentStage = workflow.stages[stageIndex];
    const previousStage = stageIndex > 0 ? workflow.stages[stageIndex - 1] : undefined;

    const candidateId = faker.string.uuid();
    const applicationId = faker.string.uuid();
    const appliedAt = faker.date.past();

    // Build stage history
    const stageHistory: StageHistoryEntry[] = [];
    for (let s = 0; s <= stageIndex; s++) {
      const stage = workflow.stages[s];
      const enteredAt = new Date(appliedAt.getTime() + s * 3 * 24 * 60 * 60 * 1000);
      stageHistory.push({
        stageId: stage.id,
        stageName: stage.title,
        enteredAt,
        exitedAt: s < stageIndex ? new Date(enteredAt.getTime() + 2 * 24 * 60 * 60 * 1000) : undefined,
        action: stage.approval.required && s > 0 ? "approved" : "moved",
        performedBy: faker.helpers.arrayElement(MOCK_USERS).name,
      });
    }

    // Determine approval status: some candidates at approval-required stages are pending
    let approvalStatus: ApprovalStatus | undefined;
    let activeApprovalId: string | undefined;

    if (currentStage.approval.required && i < 5) {
      // First 5 candidates at approval stages are pending
      approvalStatus = "pending";
      const approvalId = faker.string.uuid();
      activeApprovalId = approvalId;

      approvals.push({
        id: approvalId,
        candidateId,
        applicationId,
        jobId: job.id,
        workflowId: workflow.id,
        stageId: currentStage.id,
        fromStageId: previousStage?.id ?? "applied",
        requestedBy: faker.helpers.arrayElement(MOCK_USERS).name,
        assignedTo: currentStage.approval.approvers,
        status: "pending",
        comments: [],
        createdAt: faker.date.recent(),
      });

      // For pending candidates, they're actually still in the previous stage
      candidates.push({
        id: candidateId,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        resume: faker.internet.url(),
        coverLetter: faker.datatype.boolean() ? faker.lorem.paragraphs(2) : undefined,
        avatar: faker.image.avatar(),
        appliedAt,
        currentStageId: previousStage?.id ?? "applied",
        previousStageId: stageIndex > 1 ? workflow.stages[stageIndex - 2]?.id : undefined,
        workflowId: workflow.id,
        jobId: job.id,
        applicationId,
        approvalStatus,
        activeApprovalId,
        tags: [faker.lorem.word(), faker.lorem.word()],
        rating: faker.number.int({ min: 1, max: 5 }),
        source: faker.helpers.arrayElement(CANDIDATE_SOURCES),
      });
    } else {
      candidates.push({
        id: candidateId,
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        resume: faker.internet.url(),
        coverLetter: faker.datatype.boolean() ? faker.lorem.paragraphs(2) : undefined,
        avatar: faker.image.avatar(),
        appliedAt,
        currentStageId: currentStage.id,
        previousStageId: previousStage?.id,
        workflowId: workflow.id,
        jobId: job.id,
        applicationId,
        tags: [faker.lorem.word(), faker.lorem.word()],
        rating: faker.number.int({ min: 1, max: 5 }),
        source: faker.helpers.arrayElement(CANDIDATE_SOURCES),
      });
    }

    instances.push({
      id: faker.string.uuid(),
      workflowId: workflow.id,
      candidateId,
      jobId: job.id,
      currentStageId: currentStage.id,
      stageHistory,
      startedAt: appliedAt,
      status: currentStage.id === "hired" ? "completed" : "active",
      completedAt: currentStage.id === "hired" ? faker.date.recent() : undefined,
    });
  }

  // Add historical approved/rejected approvals
  for (let i = 0; i < 8; i++) {
    const workflow = faker.helpers.arrayElement(activeWorkflows);
    const approvalStages = workflow.stages.filter((s) => s.approval.required);
    if (approvalStages.length === 0) continue;

    const stage = faker.helpers.arrayElement(approvalStages);
    const stageIdx = workflow.stages.indexOf(stage);
    const fromStage = stageIdx > 0 ? workflow.stages[stageIdx - 1] : workflow.stages[0];

    approvals.push({
      id: faker.string.uuid(),
      candidateId: faker.helpers.arrayElement(candidates).id,
      applicationId: faker.string.uuid(),
      jobId: faker.helpers.arrayElement(MOCK_JOBS).id,
      workflowId: workflow.id,
      stageId: stage.id,
      fromStageId: fromStage.id,
      requestedBy: faker.helpers.arrayElement(MOCK_USERS).name,
      assignedTo: stage.approval.approvers,
      status: "approved",
      comments: [
        {
          id: faker.string.uuid(),
          authorName: faker.helpers.arrayElement(MOCK_USERS).name,
          text: faker.helpers.arrayElement([
            "Candidate looks strong, approved.",
            "Good technical skills, moving forward.",
            "Meets all requirements.",
            "Approved after discussion with team.",
          ]),
          createdAt: faker.date.recent(),
        },
      ],
      createdAt: faker.date.past(),
      resolvedAt: faker.date.recent(),
      resolvedBy: faker.helpers.arrayElement(MOCK_USERS).name,
    });
  }

  for (let i = 0; i < 3; i++) {
    const workflow = faker.helpers.arrayElement(activeWorkflows);
    const approvalStages = workflow.stages.filter((s) => s.approval.required);
    if (approvalStages.length === 0) continue;

    const stage = faker.helpers.arrayElement(approvalStages);
    const stageIdx = workflow.stages.indexOf(stage);
    const fromStage = stageIdx > 0 ? workflow.stages[stageIdx - 1] : workflow.stages[0];

    approvals.push({
      id: faker.string.uuid(),
      candidateId: faker.helpers.arrayElement(candidates).id,
      applicationId: faker.string.uuid(),
      jobId: faker.helpers.arrayElement(MOCK_JOBS).id,
      workflowId: workflow.id,
      stageId: stage.id,
      fromStageId: fromStage.id,
      requestedBy: faker.helpers.arrayElement(MOCK_USERS).name,
      assignedTo: stage.approval.approvers,
      status: "rejected",
      comments: [
        {
          id: faker.string.uuid(),
          authorName: faker.helpers.arrayElement(MOCK_USERS).name,
          text: faker.helpers.arrayElement([
            "Does not meet minimum requirements.",
            "Not a good culture fit at this time.",
            "Insufficient experience for this level.",
          ]),
          createdAt: faker.date.recent(),
        },
      ],
      createdAt: faker.date.past(),
      resolvedAt: faker.date.recent(),
      resolvedBy: faker.helpers.arrayElement(MOCK_USERS).name,
    });
  }

  return { candidates, instances, approvals };
}

const { candidates: _candidates, instances: _instances, approvals: _approvals } = createMockCandidates();

export const MOCK_CANDIDATES: Candidate[] = _candidates;
export const MOCK_WORKFLOW_INSTANCES: WorkflowInstance[] = _instances;
export const MOCK_APPROVAL_REQUESTS: ApprovalRequest[] = _approvals;
