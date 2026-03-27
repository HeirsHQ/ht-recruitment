import { faker } from "@faker-js/faker";

import type { Company, Department } from "@/types/company";
import type { Job, JobApplication, JobStatus, User, UserStatus } from "@/types";
import type { JobTemplate, PipelineStageConfig } from "@/types/job";
import type {
  ApprovalRequest,
  ApprovalStatus,
  Candidate,
  CandidateCertification,
  CandidateEducation,
  CandidateExperience,
  StageHistoryEntry,
  WorkflowInstance,
  WorkflowTemplate,
} from "@/types/workflow";

export const MOCK_COMPANY: Company = {
  id: "company-1",
  name: "Acme Corp",
};

export const MOCK_DEPARTMENTS: Department[] = [
  { id: "all", name: "All Departments", companyId: MOCK_COMPANY.id, company: MOCK_COMPANY },
  { id: "engineering", name: "Engineering", companyId: MOCK_COMPANY.id, company: MOCK_COMPANY },
  { id: "product", name: "Product", companyId: MOCK_COMPANY.id, company: MOCK_COMPANY },
  { id: "design", name: "Design", companyId: MOCK_COMPANY.id, company: MOCK_COMPANY },
  { id: "marketing", name: "Marketing", companyId: MOCK_COMPANY.id, company: MOCK_COMPANY },
  { id: "sales", name: "Sales", companyId: MOCK_COMPANY.id, company: MOCK_COMPANY },
  { id: "hr", name: "Human Resources", companyId: MOCK_COMPANY.id, company: MOCK_COMPANY },
  { id: "finance", name: "Finance", companyId: MOCK_COMPANY.id, company: MOCK_COMPANY },
  { id: "operations", name: "Operations", companyId: MOCK_COMPANY.id, company: MOCK_COMPANY },
  { id: "legal", name: "Legal", companyId: MOCK_COMPANY.id, company: MOCK_COMPANY },
  { id: "customer-support", name: "Customer Support", companyId: MOCK_COMPANY.id, company: MOCK_COMPANY },
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

const APPLICATION_STAGES: PipelineStageConfig[] = [
  {
    id: "pending",
    title: "Pending",
    color: "#f59e0b",
    notifications: { enabled: false, recipients: [] },
    approval: { required: false, approvers: [] },
    workflow: { sendEmailTemplate: "" },
  },
  {
    id: "rejected",
    title: "Rejected",
    color: "#ef4444",
    notifications: { enabled: true, recipients: [] },
    approval: { required: false, approvers: [] },
    workflow: { sendEmailTemplate: "rejection" },
  },
  {
    id: "interview-scheduled",
    title: "Interview Scheduled",
    color: "#3b82f6",
    notifications: { enabled: true, recipients: [] },
    approval: { required: false, approvers: [] },
    workflow: { sendEmailTemplate: "interview-scheduled" },
  },
  {
    id: "hr-interview",
    title: "HR Interview",
    color: "#8b5cf6",
    notifications: { enabled: true, recipients: [] },
    approval: { required: false, approvers: [] },
    workflow: { sendEmailTemplate: "hr-interview" },
  },
  {
    id: "accepted",
    title: "Accepted",
    color: "#10b981",
    notifications: { enabled: true, recipients: [] },
    approval: { required: false, approvers: [] },
    workflow: { sendEmailTemplate: "offer-letter" },
  },
];

const SKILL_POOL = [
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Django",
  "Flask",
  "Java",
  "Spring Boot",
  "Go",
  "Rust",
  "C#",
  ".NET",
  "SQL",
  "PostgreSQL",
  "MongoDB",
  "Redis",
  "GraphQL",
  "REST APIs",
  "Docker",
  "Kubernetes",
  "AWS",
  "GCP",
  "Azure",
  "CI/CD",
  "Terraform",
  "Git",
  "Linux",
  "Agile",
  "Scrum",
  "TDD",
  "Microservices",
  "Figma",
  "Sketch",
  "Adobe XD",
  "UI/UX Design",
  "Prototyping",
  "User Research",
  "Data Analysis",
  "Machine Learning",
  "Pandas",
  "TensorFlow",
  "Power BI",
  "Tableau",
  "Project Management",
  "Jira",
  "Confluence",
  "Stakeholder Management",
  "Communication",
  "Leadership",
  "Problem Solving",
  "Critical Thinking",
  "Sales Strategy",
  "CRM",
  "Negotiation",
  "Account Management",
  "Recruitment",
  "Talent Acquisition",
  "HR Compliance",
  "Onboarding",
  "Financial Modeling",
  "Excel",
  "SAP",
  "QuickBooks",
  "Budgeting",
];

function createMockApplications(jobId: string): JobApplication[] {
  const count = faker.number.int({ min: 10, max: 20 });
  return Array.from({ length: count }, () => {
    const stage = faker.helpers.arrayElement(APPLICATION_STAGES);
    const skillCount = faker.number.int({ min: 2, max: 6 });
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
        skills: faker.helpers.arrayElements(SKILL_POOL, skillCount),
      },
      status: stage.id,
      workflow: stage,
      matchScore: faker.number.int({ min: 0, max: 100 }),
      source: faker.helpers.arrayElement([
        "LinkedIn",
        "Referral",
        "Job Board",
        "Company Website",
        "Recruiter",
        "Career Fair",
      ]),
      appliedAt: faker.date.recent(),
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
    };
  });
}

export const MOCK_JOBS: Job[] = Array.from({ length: 20 }, () => {
  const status: JobStatus = faker.helpers.weightedArrayElement([
    { value: "open", weight: 5 },
    { value: "closed", weight: 1 },
    { value: "cancelled", weight: 1 },
    { value: "pending", weight: 1 },
    { value: "in progress", weight: 1 },
  ]);
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
    department: faker.helpers.arrayElement(MOCK_DEPARTMENTS.filter((d) => d.id !== "all")),
    company: { id: faker.string.uuid(), name: faker.company.name() },
    responsibilities: [faker.lorem.sentence(), faker.lorem.sentence(), faker.lorem.sentence()],
    requirements: [faker.lorem.sentence(), faker.lorem.sentence(), faker.lorem.sentence()],
    benefits: [faker.lorem.sentence(), faker.lorem.sentence(), faker.lorem.sentence()],
    closedAt: status === "closed" || status === "cancelled" ? faker.date.recent() : undefined,
    views: faker.number.int({ min: 0, max: 1000 }),
  };
});

export const MOCK_ROLES: string[] = Array.from({ length: 10 }, () => {
  return faker.lorem.word();
});

export const MOCK_USERS: User[] = Array.from({ length: 15 }, () => {
  const status: UserStatus = faker.helpers.arrayElement(["active", "inactive"]);
  const role = faker.helpers.arrayElement(MOCK_ROLES);

  return {
    id: faker.string.uuid(),
    email: faker.internet.email(),
    firstName: faker.person.fullName(),
    lastName: faker.person.lastName(),
    role,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    isActive: status === "active",
    avatar: faker.image.avatar(),
    lastLogin: faker.date.recent(),
    companies: [],
    roles: [],
    permissions: faker.helpers.arrayElements([
      "audit.logs.view.all",
      "audit.logs.view.correlation",
      "audit.logs.view.history",
      "audit.metrics.health",
      "audit.metrics.view",
      "audit.search.export",
      "audit.search.formats",
      "audit.search.query",
      "configuration.company.create",
      "configuration.company.read",
      "configuration.company.update",
      "configuration.tenant.create",
      "configuration.tenant.read",
      "configuration.tenant.update",
      "documents.categories.archive",
      "documents.categories.create",
      "documents.categories.delete",
      "documents.categories.view",
      "documents.dashboard.view",
      "documents.documents.delete",
      "documents.documents.download",
      "documents.documents.Preview",
      "documents.documents.update",
      "documents.documents.Upload",
      "documents.documents.view",
      "documents.Reports.Export",
      "documents.Reports.view",
      "global.AccessRules.create",
      "global.AccessRules.delete",
      "global.AccessRules.ManageStatus",
      "global.AccessRules.update",
      "global.AccessRules.view",
      "global.Companies.view",
      "global.entities.create",
      "global.entities.delete",
      "global.entities.update",
      "global.entities.view",
      "global.modules.create",
      "global.modules.delete",
      "global.modules.update",
      "global.modules.view",
      "global.OrganizationalScopes.create",
      "global.OrganizationalScopes.delete",
      "global.OrganizationalScopes.update",
      "global.OrganizationalScopes.view",
      "global.Permissions.create",
      "global.Permissions.view",
      "global.policies.create",
      "global.policies.delete",
      "global.policies.update",
      "global.policies.view",
      "global.roles.create",
      "global.roles.delete",
      "global.roles.ManageHierarchy",
      "global.roles.ManagePermissions",
      "global.roles.update",
      "global.roles.view",
      "global.users.create",
      "global.users.delete",
      "global.users.ManagePermissions",
      "global.users.ManageRoles",
      "global.users.ManageStatus",
      "global.users.update",
      "global.users.view",
      "hr.compensation.Edit",
      "hr.compensation.view",
      "hr.contract.create",
      "hr.contract.download",
      "hr.contract.Renew",
      "hr.contract.Terminate",
      "hr.contract.update",
      "hr.contract.view",
      "hr.dependant.create",
      "hr.dependant.delete",
      "hr.dependant.list",
      "hr.education.add",
      "hr.education.list",
      "hr.education.remove",
      "hr.employee.AddCertification",
      "hr.employee.AddExperience",
      "hr.employee.AddLanguage",
      "hr.employee.AddReferee",
      "hr.employee.AddSkill",
      "hr.employee.AddTraining",
      "hr.employee.archive",
      "hr.employee.Certifications",
      "hr.employee.Consent",
      "hr.employee.create",
      "hr.employee.delete",
      "hr.employee.Edit",
      "hr.employee.Experience",
      "hr.employee.Export",
      "hr.employee.Languages",
      "hr.employee.list",
      "hr.employee.Reactivate",
      "hr.employee.Referees",
      "hr.employee.RemoveCertification",
      "hr.employee.RemoveExperience",
      "hr.employee.RemoveLanguage",
      "hr.employee.RemoveReferee",
      "hr.employee.RemoveSkill",
      "hr.employee.RemoveTraining",
      "hr.employee.Search",
      "hr.employee.Skills",
      "hr.employee.Summary",
      "hr.employee.Suspend",
      "hr.employee.Training",
      "hr.employee.view",
      "hr.lookup.CreateEmploymentType",
      "hr.lookup.CreateLanguageProficiency",
      "hr.lookup.CreateMaritalStatus",
      "hr.lookup.DeleteEmploymentType",
      "hr.lookup.DeleteLanguageProficiency",
      "hr.lookup.DeleteMaritalStatus",
      "hr.lookup.ListEmploymentTypes",
      "hr.lookup.ListLanguageProficiencies",
      "hr.lookup.ListMaritalStatuses",
      "hr.lookup.UpdateEmploymentType",
      "hr.lookup.UpdateLanguageProficiency",
      "hr.lookup.UpdateMaritalStatus",
      "hr.lookup.ViewEmploymentType",
      "hr.lookup.ViewLanguageProficiency",
      "hr.lookup.ViewMaritalStatus",
      "hr.NextOfKin.add",
      "hr.NextOfKin.list",
      "hr.NextOfKin.remove",
      "hr.ProfessionalCertification.create",
      "hr.ProfessionalCertification.delete",
      "hr.ProfessionalCertification.list",
      "hr.Settings.update",
      "hr.Settings.view",
      "hr.Training.create",
      "hr.Training.delete",
      "hr.Training.list",
      "hr.WorkExperience.create",
      "hr.WorkExperience.delete",
      "hr.WorkExperience.list",
      "leave.dashboard.view",
      "leave.Jobs.Execute",
      "leave.LeaveBalances.Adjust",
      "leave.LeaveBalances.CarryForward",
      "leave.LeaveBalances.read",
      "leave.LeaveBalances.Reset",
      "leave.LeavePolicies.archive",
      "leave.LeavePolicies.create",
      "leave.LeavePolicies.delete",
      "leave.LeavePolicies.read",
      "leave.LeavePolicies.Suspend",
      "leave.LeavePolicies.update",
      "leave.LeaveRequests.Approve",
      "leave.LeaveRequests.archive",
      "leave.LeaveRequests.Cancel",
      "leave.LeaveRequests.create",
      "leave.LeaveRequests.delete",
      "leave.LeaveRequests.read",
      "leave.LeaveRequests.Reject",
      "leave.LeaveRequests.update",
      "leave.LeaveTypes.archive",
      "leave.LeaveTypes.create",
      "leave.LeaveTypes.delete",
      "leave.LeaveTypes.read",
      "leave.LeaveTypes.update",
      "leave.Reports.Export",
      "leave.Reports.view",
      "notification.notification.retry",
      "notification.notification.send",
      "notification.notification.send.batch",
      "notification.notification.view.logs",
      "notification.notification.view.status",
      "notification.template.create",
      "notification.template.edit",
      "notification.template.view",
      "notification.template.view.detail",
      "organisation.branch.create",
      "organisation.branch.delete",
      "organisation.branch.edit",
      "organisation.branch.view.all",
      "organisation.dashboard.view",
      "organisation.dashboard.view",
      "organisation.department.archive",
      "organisation.Department.archive",
      "organisation.department.create",
      "organisation.Department.create",
      "organisation.department.delete",
      "organisation.Department.delete",
      "organisation.department.edit",
      "organisation.Department.Edit",
      "organisation.department.suspend",
      "organisation.Department.Suspend",
      "organisation.department.unarchive",
      "organisation.department.view.all",
      "organisation.department.view.team",
      "organisation.Department.ViewAll",
      "organisation.Department.ViewTeam",
      "organisation.export.bulk",
      "organisation.Export.Bulk",
      "organisation.export.structure",
      "organisation.Export.Structure",
      "organisation.group.archive",
      "organisation.Group.archive",
      "organisation.group.create",
      "organisation.Group.create",
      "organisation.group.delete",
      "organisation.Group.delete",
      "organisation.group.edit",
      "organisation.Group.Edit",
      "organisation.group.suspend",
      "organisation.Group.Suspend",
      "organisation.group.unarchive",
      "organisation.group.view.all",
      "organisation.Group.ViewAll",
      "organisation.jobrole.archive",
      "organisation.JobRole.archive",
      "organisation.jobrole.create",
      "organisation.JobRole.create",
      "organisation.jobrole.delete",
      "organisation.JobRole.delete",
      "organisation.jobrole.edit",
      "organisation.JobRole.Edit",
      "organisation.jobrole.unarchive",
      "organisation.jobrole.view.all",
      "organisation.JobRole.ViewAll",
      "organisation.unit.archive",
      "organisation.Unit.archive",
      "organisation.unit.create",
      "organisation.Unit.create",
      "organisation.unit.delete",
      "organisation.Unit.delete",
      "organisation.unit.edit",
      "organisation.Unit.Edit",
      "organisation.unit.suspend",
      "organisation.Unit.Suspend",
      "organisation.unit.unarchive",
      "organisation.unit.view.all",
      "organisation.unit.view.team",
      "organisation.Unit.ViewAll",
      "organisation.Unit.ViewTeam",
      "performance.question.add",
      "performance.question.delete",
      "performance.question.update",
      "performance.questionnaire.archive",
      "performance.questionnaire.create",
      "performance.questionnaire.delete",
      "performance.questionnaire.duplicate",
      "performance.questionnaire.export",
      "performance.questionnaire.list",
      "performance.questionnaire.publish",
      "performance.questionnaire.summary",
      "performance.questionnaire.update",
      "performance.questionnaire.view",
      "scheduler.executions.read",
      "scheduler.executions.retry",
      "scheduler.jobs.create",
      "scheduler.jobs.delete",
      "scheduler.jobs.pause",
      "scheduler.jobs.read",
      "scheduler.jobs.resume",
      "scheduler.jobs.trigger",
      "scheduler.jobs.update",
      "scheduler.schedules.create",
      "scheduler.schedules.delete",
      "scheduler.schedules.read",
      "scheduler.schedules.update",
      "scheduler.services.create",
      "scheduler.services.delete",
      "scheduler.services.read",
      "scheduler.services.update",
      "scheduler.templates.create",
      "scheduler.templates.delete",
      "scheduler.templates.read",
      "scheduler.templates.update",
      "sequencer.sequences.activate",
      "sequencer.sequences.create",
      "sequencer.sequences.deactivate",
      "sequencer.sequences.delete",
      "sequencer.sequences.edit",
      "sequencer.sequences.generate",
      "sequencer.sequences.reset",
      "sequencer.sequences.view",
      "sequencer.sequences.view.all",
    ]),
  };
});

// ---------------------------------------------------------------------------
// Job Templates Templates
// ---------------------------------------------------------------------------

export const MOCK_JOB_TEMPLATES: JobTemplate[] = Array.from({ length: 5 }, () => {
  const templateId = faker.string.uuid();
  return {
    id: templateId,
    title: faker.person.jobTitle(),
    jobType: faker.helpers.arrayElement(["full-time", "part-time", "contract"]),
    department: faker.helpers.arrayElement(MOCK_DEPARTMENTS.filter((d) => d.id !== "all")),
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
    department: MOCK_DEPARTMENTS.find((d) => d.id === "engineering")!,
    createdBy: MOCK_USERS[0]?.firstName ?? "Admin",
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
    department: MOCK_DEPARTMENTS.find((d) => d.id === "design")!,
    createdBy: MOCK_USERS[0]?.firstName ?? "Admin",
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
    department: MOCK_DEPARTMENTS.find((d) => d.id === "sales")!,
    createdBy: MOCK_USERS[0]?.firstName ?? "Admin",
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
    department: MOCK_DEPARTMENTS.find((d) => d.id === "hr")!,
    createdBy: MOCK_USERS[0]?.firstName ?? "Admin",
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
    department: MOCK_DEPARTMENTS.find((d) => d.id === "hr")!,
    createdBy: MOCK_USERS[0]?.firstName ?? "Admin",
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

const DEGREE_OPTIONS = [
  "BS Computer Science",
  "MS Computer Science",
  "BA Business Administration",
  "BS Information Technology",
  "MBA",
  "BS Data Science",
  "MS Software Engineering",
  "BA Communications",
  "BS Electrical Engineering",
  "BS Mathematics",
];

const INSTITUTION_OPTIONS = [
  "Stanford University",
  "MIT",
  "University of Lagos",
  "Harvard University",
  "University of Oxford",
  "Carnegie Mellon University",
  "University of Ibadan",
  "Georgia Tech",
  "Covenant University",
  "University of Cape Town",
];

const CERTIFICATION_OPTIONS = [
  "AWS Certified Developer",
  "Google Cloud Professional",
  "PMP Certification",
  "Scrum Master (CSM)",
  "Certified Kubernetes Administrator",
  "Azure Solutions Architect",
  "CISSP",
  "CompTIA Security+",
  "Terraform Associate",
  "HubSpot Inbound Marketing",
];

function createCandidateExperience(): CandidateExperience[] {
  const count = faker.number.int({ min: 1, max: 3 });
  return Array.from({ length: count }, () => {
    const startYear = faker.number.int({ min: 2016, max: 2023 });
    const isCurrent = faker.datatype.boolean();
    return {
      title: faker.person.jobTitle(),
      company: faker.company.name(),
      startDate: `${startYear}`,
      endDate: isCurrent ? "Present" : `${faker.number.int({ min: startYear + 1, max: 2025 })}`,
      description: faker.lorem.sentence(),
    };
  });
}

function createCandidateEducation(): CandidateEducation[] {
  const count = faker.number.int({ min: 1, max: 2 });
  return Array.from({ length: count }, () => ({
    degree: faker.helpers.arrayElement(DEGREE_OPTIONS),
    institution: faker.helpers.arrayElement(INSTITUTION_OPTIONS),
    year: faker.number.int({ min: 2010, max: 2024 }),
  }));
}

function createCandidateCertifications(): CandidateCertification[] {
  const count = faker.number.int({ min: 0, max: 3 });
  return Array.from({ length: count }, () => ({
    name: faker.helpers.arrayElement(CERTIFICATION_OPTIONS),
    year: faker.number.int({ min: 2018, max: 2025 }),
  }));
}

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
        performedBy: faker.helpers.arrayElement(MOCK_USERS).firstName,
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
        requestedBy: faker.helpers.arrayElement(MOCK_USERS).firstName,
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
        location: `${faker.location.city()}, ${faker.location.countryCode()}`,
        summary: faker.lorem.paragraph(3),
        resume: faker.internet.url(),
        coverLetter: faker.datatype.boolean() ? faker.lorem.paragraphs(2) : undefined,
        avatar: faker.image.avatar(),
        skills: faker.helpers.arrayElements(SKILL_POOL, faker.number.int({ min: 3, max: 6 })),
        experience: createCandidateExperience(),
        education: createCandidateEducation(),
        certifications: createCandidateCertifications(),
        status: faker.helpers.arrayElement(["active", "inactive"]),
        appliedAt,
        currentStageId: previousStage?.id ?? "applied",
        previousStageId: stageIndex > 1 ? workflow.stages[stageIndex - 2]?.id : undefined,
        workflowId: workflow.id,
        jobId: job.id,
        job,
        applicationId,
        approvalStatus,
        activeApprovalId,
        matchScore: faker.number.int({ min: 0, max: 100 }),
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
        location: `${faker.location.city()}, ${faker.location.countryCode()}`,
        summary: faker.lorem.paragraph(3),
        resume: faker.internet.url(),
        coverLetter: faker.datatype.boolean() ? faker.lorem.paragraphs(2) : undefined,
        avatar: faker.image.avatar(),
        skills: faker.helpers.arrayElements(SKILL_POOL, faker.number.int({ min: 3, max: 6 })),
        experience: createCandidateExperience(),
        education: createCandidateEducation(),
        certifications: createCandidateCertifications(),
        status: faker.helpers.arrayElement(["active", "inactive"]),
        appliedAt,
        currentStageId: currentStage.id,
        previousStageId: previousStage?.id,
        workflowId: workflow.id,
        jobId: job.id,
        job,
        applicationId,
        matchScore: faker.number.int({ min: 0, max: 100 }),
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
      requestedBy: faker.helpers.arrayElement(MOCK_USERS).firstName,
      assignedTo: stage.approval.approvers,
      status: "approved",
      comments: [
        {
          id: faker.string.uuid(),
          authorName: faker.helpers.arrayElement(MOCK_USERS).firstName,
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
      resolvedBy: faker.helpers.arrayElement(MOCK_USERS).firstName,
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
      requestedBy: faker.helpers.arrayElement(MOCK_USERS).firstName,
      assignedTo: stage.approval.approvers,
      status: "rejected",
      comments: [
        {
          id: faker.string.uuid(),
          authorName: faker.helpers.arrayElement(MOCK_USERS).firstName,
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
      resolvedBy: faker.helpers.arrayElement(MOCK_USERS).firstName,
    });
  }

  return { candidates, instances, approvals };
}

const { candidates: _candidates, instances: _instances, approvals: _approvals } = createMockCandidates();

export const MOCK_CANDIDATES: Candidate[] = _candidates;
export const MOCK_WORKFLOW_INSTANCES: WorkflowInstance[] = _instances;
export const MOCK_APPROVAL_REQUESTS: ApprovalRequest[] = _approvals;
