"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { format, formatDistanceToNow, startOfDay } from "date-fns";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Link from "next/link";
import {
  ArrowRightLeft,
  BarChart3,
  Briefcase,
  Building2,
  CalendarDays,
  ExternalLink,
  Eye,
  Globe,
  KanbanIcon,
  Lightbulb,
  List,
  MapPin,
  MessageSquare,
  Plus,
  Settings2,
  Sparkles,
  Target,
  TrendingUp,
  UserPlus,
  Users,
  DollarSign,
} from "lucide-react";

import { Kanban, KanbanList, TabPanel, type KanbanColumnConfig, type KanbanDragEndEvent } from "@/components/shared";
import { type ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import type { JobApplication, PipelineStageConfig } from "@/types/job";
import { StageDialog } from "@/components/jobs/stage-dialog";
import KanbanCard from "@/components/jobs/kanban-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn, formatSalary } from "@/lib";

import { MOCK_JOBS } from "@/__mock__/database";

const tabs = [
  { label: "Overview", value: "overview" },
  { label: "Applicants", value: "applicants" },
  { label: "Activities", value: "activities" },
  { label: "AI Recommendations", value: "ai-recommendations" },
  { label: "Sources", value: "sources" },
  { label: "Attachments", value: "attachments" },
  { label: "Analytics", value: "analytics" },
  { label: "Others", value: "others" },
];

const DEFAULT_STAGES: PipelineStageConfig[] = [
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

const views = [
  { label: "Kanban", value: "kanban", icon: KanbanIcon },
  { label: "List", value: "list", icon: List },
];

const ACTIVITY_TYPES = {
  application: { icon: UserPlus, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950" },
  "stage-change": { icon: ArrowRightLeft, color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-950" },
  comment: { icon: MessageSquare, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950" },
  view: { icon: Eye, color: "text-gray-500", bg: "bg-gray-50 dark:bg-gray-800" },
} as const;

const SOURCE_COLORS: Record<string, string> = {
  LinkedIn: "#0a66c2",
  Referral: "#10b981",
  "Job Board": "#f59e0b",
  "Company Website": "#8b5cf6",
  Recruiter: "#ec4899",
  "Career Fair": "#3b82f6",
};

const applicationsChartConfig: ChartConfig = {
  applications: { label: "Applications", color: "#6366f1" },
};

const Page = () => {
  const id = useParams().id as string;
  const job = MOCK_JOBS.find((job) => job.id === id);

  const [applications, setApplications] = useState<JobApplication[]>(job?.applications ?? []);
  const [editingStage, setEditingStage] = useState<PipelineStageConfig | undefined>();
  const [stages, setStages] = useState<PipelineStageConfig[]>(DEFAULT_STAGES);
  const [activeTab, setActiveTab] = useState(tabs[0].value);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [view, setView] = useState("kanban");

  const columns = useMemo(() => stages.map((s) => ({ id: s.id, title: s.title, color: s.color })), [stages]);

  const stats = useMemo(() => {
    const pending = applications.filter((a) => a.status === "pending").length;
    const accepted = applications.filter((a) => a.status === "accepted").length;
    const rejected = applications.filter((a) => a.status === "rejected").length;
    return { total: applications.length, pending, accepted, rejected };
  }, [applications]);

  const activities = useMemo(() => {
    const items: { id: string; type: keyof typeof ACTIVITY_TYPES; message: string; date: Date }[] = [];
    applications.forEach((app) => {
      items.push({
        id: `${app.id}-applied`,
        type: "application",
        message: `${app.applicant.name} applied for this position`,
        date: app.createdAt,
      });
      if (app.status !== "pending") {
        items.push({
          id: `${app.id}-stage`,
          type: "stage-change",
          message: `${app.applicant.name} moved to "${stages.find((s) => s.id === app.status)?.title ?? app.status}"`,
          date: app.updatedAt,
        });
      }
    });
    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 20);
  }, [applications, stages]);

  const sources = useMemo(() => {
    const sourceNames = ["LinkedIn", "Referral", "Job Board", "Company Website", "Recruiter", "Career Fair"];
    const total = applications.length;
    return sourceNames.map((name, i) => {
      const count = Math.max(1, Math.round(total * [0.35, 0.25, 0.15, 0.12, 0.08, 0.05][i]));
      return { name, count, percentage: Math.round((count / Math.max(total, 1)) * 100) };
    });
  }, [applications]);

  const applicationsOverTime = useMemo(() => {
    const dayMap = new Map<number, { key: number; label: string; applications: number }>();
    for (const app of applications) {
      const day = startOfDay(new Date(app.createdAt));
      const key = day.getTime();
      const existing = dayMap.get(key);
      if (existing) {
        existing.applications += 1;
      } else {
        dayMap.set(key, { key, label: format(day, "MMM d"), applications: 1 });
      }
    }
    return Array.from(dayMap.values()).sort((a, b) => a.key - b.key);
  }, [applications]);

  const topCandidates = useMemo(
    () =>
      applications.slice(0, 3).map((app) => {
        const hash = app.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const matchScore = 70 + (hash % 26);
        return { ...app, matchScore };
      }),
    [applications],
  );

  if (!job) {
    return (
      <div className="grid min-h-64 place-items-center p-6">
        <div className="text-center">
          <p className="text-lg font-medium text-red-500">Job not found</p>
          <Link href="/jobs" className="mt-2 text-sm text-gray-500 underline">
            Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  const handleDragEnd = ({ item, toStatus }: KanbanDragEndEvent<JobApplication>) => {
    const targetStage = stages.find((s) => s.id === toStatus);
    if (targetStage?.approval.required) {
      toast.info(`Approval required to move to "${targetStage.title}"`, {
        description: `Pending approval from: ${targetStage.approval.approvers.join(", ") || "configured approvers"}`,
      });
    }

    setApplications((prev) =>
      prev.map((a) => (a.id === item.id ? { ...a, status: toStatus as JobApplication["status"] } : a)),
    );

    if (targetStage?.notifications.enabled) {
      toast.success(`Notification sent for "${targetStage.title}"`, {
        description:
          targetStage.notifications.recipients.length > 0
            ? `Recipients: ${targetStage.notifications.recipients.join(", ")}`
            : "Default notification recipients will be notified",
      });
    }
  };

  const handleAddStage = (stage: PipelineStageConfig) => {
    if (stages.some((s) => s.id === stage.id)) {
      toast.error("A status with this name already exists");
      return;
    }
    setStages((prev) => [...prev, stage]);
    toast.success(`Status "${stage.title}" added`);
  };

  const handleEditStage = (stage: PipelineStageConfig) => {
    setStages((prev) => prev.map((s) => (s.id === stage.id ? stage : s)));
    setEditingStage(undefined);
    toast.success(`Status "${stage.title}" updated`);
  };

  const handleColumnsReorder = (reorderedColumns: KanbanColumnConfig[]) => {
    setStages((prev) => {
      const stageMap = new Map(prev.map((s) => [s.id, s]));
      return reorderedColumns.map((col) => stageMap.get(col.id)!);
    });
  };

  const handleDeleteStage = (stageId: string) => {
    const stage = stages.find((s) => s.id === stageId);
    if (applications.some((a) => a.status === stageId)) {
      toast.error(`Cannot delete "${stage?.title}" — it still has applications`);
      return;
    }
    setStages((prev) => prev.filter((s) => s.id !== stageId));
    toast.success(`Status "${stage?.title}" deleted`);
  };

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-start justify-between">
        <div className="">
          <p className="text-lg font-semibold">Job Details</p>
          <p className="text-sm text-gray-600">View job information, status and administrative actions</p>
        </div>
        <div className="flex items-center gap-x-4">
          <Button size="sm" variant="ghost">
            Edit Details
          </Button>
          <Button size="sm">Delete Job</Button>
        </div>
      </div>
      <motion.div
        className="space-y-4 rounded-lg border p-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <p className="text-2xl font-bold">{job.title}</p>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-x-2">
            <Building2 className="size-4" />
            <span className="text-sm text-gray-600">{job.company}</span>
          </div>
          <div className="flex items-center gap-x-2">
            <Briefcase className="size-4" />
            <span className="text-sm text-gray-600">{job.department}</span>
          </div>
          <div className="flex items-center gap-x-2">
            <DollarSign className="size-4" />
            <span className="text-sm text-gray-600">{salary}</span>
          </div>
          <div className="flex items-center gap-x-2">
            <MapPin className="size-4" />
            <span className="text-sm text-gray-600">{job.location}</span>
          </div>
        </div>
        <div className="flex items-center gap-x-4">
          <div className="flex items-center justify-center rounded-md bg-lime-50 p-2 text-xs text-lime-600 capitalize">
            {job.jobType.replace("-", " ")}
          </div>
          <div className="flex items-center justify-center rounded-md bg-purple-50 p-2 text-xs text-purple-600 capitalize">
            {job.workType.replace("-", " ")}
          </div>
          <div className="flex items-center justify-center rounded-md bg-cyan-50 p-2 text-xs text-cyan-600 capitalize">
            {job.experienceType.replace("-", " ")}
          </div>
        </div>
      </motion.div>
      <div className="w-full space-y-4">
        <div className="flex w-full items-center justify-between rounded-md bg-gray-100 p-1 dark:bg-neutral-800">
          {tabs.map((tab) => (
            <button
              className={cn(
                "flex h-7 flex-1 items-center justify-center rounded-md px-3 text-sm font-medium transition-colors",
                activeTab === tab.value
                  ? "bg-white text-gray-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                  : "text-gray-500",
              )}
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
            >
              <span className="whitespace-nowrap">{tab.label}</span>
            </button>
          ))}
        </div>
        <TabPanel selected={activeTab} value="overview">
          <div className="space-y-6">
            {job.description && (
              <div className="space-y-2 rounded-xl border p-4">
                <h3 className="font-semibold">Description</h3>
                <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-400">{job.description}</p>
              </div>
            )}
            {job.requirements && job.requirements.length > 0 && (
              <div className="space-y-2 rounded-xl border p-4">
                <h3 className="font-semibold">Requirements</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {job.requirements.map((req, i) => (
                    <li key={i}>{req}</li>
                  ))}
                </ul>
              </div>
            )}
            {job.benefits && job.benefits.length > 0 && (
              <div className="space-y-2 rounded-xl border p-4">
                <h3 className="font-semibold">Benefits</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {job.benefits.map((benefit, i) => (
                    <li key={i}>{benefit}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabPanel>
        <TabPanel selected={activeTab} value="applicants">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-x-2">
                <h3 className="text-sm font-medium text-gray-500">Pipeline stages</h3>
                <div className="flex items-center gap-x-1">
                  {stages.map((stage) => (
                    <button
                      key={stage.id}
                      onClick={() => setEditingStage(stage)}
                      className="group flex items-center gap-x-1 rounded-md px-2 py-1 text-xs transition-colors hover:bg-gray-100 dark:hover:bg-neutral-800"
                    >
                      <span className="size-2 rounded-full" style={{ backgroundColor: stage.color }} />
                      <span>{stage.title}</span>
                      <Settings2 className="size-3 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-x-4">
                <motion.div className="flex h-8 items-center rounded-md bg-gray-100 p-1 dark:bg-neutral-800">
                  {views.map(({ icon: Icon, value }, index) => (
                    <motion.button
                      className={cn(
                        "grid size-6 shrink-0 place-items-center rounded-md transition-colors",
                        value === view
                          ? "bg-white text-gray-900 shadow-sm dark:bg-neutral-700 dark:text-white"
                          : "text-gray-600",
                      )}
                      key={index}
                      onClick={() => setView(value)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      layout
                    >
                      <Icon className="size-4" />
                    </motion.button>
                  ))}
                </motion.div>
                <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(true)}>
                  <Plus className="size-3.5" />
                  Add status
                </Button>
              </div>
            </div>
            {view === "kanban" ? (
              <Kanban
                items={applications}
                columns={columns}
                onDragEnd={handleDragEnd}
                onColumnsReorder={handleColumnsReorder}
                onColumnEdit={(id) => {
                  const stage = stages.find((s) => s.id === id);
                  if (stage) setEditingStage(stage);
                }}
                onColumnDelete={handleDeleteStage}
                renderCard={(application) => <KanbanCard application={application} />}
              />
            ) : (
              <KanbanList
                items={applications}
                columns={columns}
                onDragEnd={handleDragEnd}
                onColumnEdit={(id) => {
                  const stage = stages.find((s) => s.id === id);
                  if (stage) setEditingStage(stage);
                }}
                onColumnDelete={handleDeleteStage}
                renderCard={(application) => <KanbanCard application={application} />}
              />
            )}
          </div>
        </TabPanel>
        <TabPanel selected={activeTab} value="analytics">
          <div className="w-full space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="flex flex-col justify-between rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Views</p>
                  <Eye className="size-5 text-gray-500" />
                </div>
                <p className="mt-2 text-2xl font-bold">{job.views ?? 0}</p>
                <p className="mt-1 text-xs text-gray-400">Total impressions</p>
              </div>
              <div className="flex flex-col justify-between rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Applications</p>
                  <Users className="size-5 text-purple-600" />
                </div>
                <p className="mt-2 text-2xl font-bold">{stats.total}</p>
                <p className="mt-1 text-xs text-gray-400">Total received</p>
              </div>
              <div className="flex flex-col justify-between rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Pending</p>
                  <Globe className="size-5 text-amber-500" />
                </div>
                <p className="mt-2 text-2xl font-bold">{stats.pending}</p>
                <p className="mt-1 text-xs text-gray-400">Awaiting review</p>
              </div>
              <div className="flex flex-col justify-between rounded-xl border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">Accepted</p>
                  <Users className="size-5 text-green-600" />
                </div>
                <p className="mt-2 text-2xl font-bold">{stats.accepted}</p>
                <p className="mt-1 text-xs text-gray-400">Moved forward</p>
              </div>
            </div>
            <div className="space-y-4 rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold">Applications Over Time</h3>
                  <p className="text-xs text-gray-500">Daily application volume for this job</p>
                </div>
                <CalendarDays className="size-5 text-gray-400" />
              </div>
              {applicationsOverTime.length > 1 ? (
                <ChartContainer config={applicationsChartConfig} className="h-64 w-full">
                  <AreaChart data={applicationsOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="fillJobApplications" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-applications)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-applications)" stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="applications"
                      stroke="var(--color-applications)"
                      strokeWidth={2}
                      fill="url(#fillJobApplications)"
                    />
                  </AreaChart>
                </ChartContainer>
              ) : (
                <div className="grid h-64 place-items-center rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600">
                  <div className="text-center">
                    <CalendarDays className="mx-auto size-8 text-gray-300 dark:text-gray-600" />
                    <p className="mt-2 text-sm text-gray-400">Not enough data for trend chart</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabPanel>
        <TabPanel selected={activeTab} value="activities">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Recent Activity</h3>
              <p className="text-sm text-gray-500">{activities.length} events</p>
            </div>
            <div className="space-y-1">
              {activities.map((activity) => {
                const config = ACTIVITY_TYPES[activity.type];
                const Icon = config.icon;
                return (
                  <div
                    key={activity.id}
                    className="flex items-start gap-x-3 rounded-lg p-3 transition-colors hover:bg-gray-50 dark:hover:bg-neutral-800/50"
                  >
                    <div className={cn("mt-0.5 grid size-8 shrink-0 place-items-center rounded-full", config.bg)}>
                      <Icon className={cn("size-4", config.color)} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-gray-700 dark:text-gray-300">{activity.message}</p>
                      <p className="text-xs text-gray-400">
                        {formatDistanceToNow(new Date(activity.date), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                );
              })}
              {activities.length === 0 && (
                <div className="py-12 text-center text-sm text-gray-400">No activity yet</div>
              )}
            </div>
          </div>
        </TabPanel>
        <TabPanel selected={activeTab} value="sources">
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-xl border p-4">
              <div className="flex items-center gap-x-2">
                <BarChart3 className="size-5 text-gray-500" />
                <h3 className="font-semibold">Application Sources</h3>
              </div>
              <div className="space-y-3">
                {sources.map((source) => (
                  <div key={source.name} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-x-2">
                        <span
                          className="size-2.5 rounded-full"
                          style={{ backgroundColor: SOURCE_COLORS[source.name] ?? "#6b7280" }}
                        />
                        <span className="text-gray-700 dark:text-gray-300">{source.name}</span>
                      </div>
                      <span className="font-medium">
                        {source.count} ({source.percentage}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-gray-100 dark:bg-neutral-800">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${source.percentage}%`,
                          backgroundColor: SOURCE_COLORS[source.name] ?? "#6b7280",
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4 rounded-xl border p-4">
              <div className="flex items-center gap-x-2">
                <TrendingUp className="size-5 text-gray-500" />
                <h3 className="font-semibold">Source Performance</h3>
              </div>
              <div className="space-y-3">
                {sources.map((source) => (
                  <div key={source.name} className="flex items-center justify-between rounded-lg border p-3">
                    <div className="flex items-center gap-x-3">
                      <div
                        className="grid size-9 place-items-center rounded-lg"
                        style={{ backgroundColor: `${SOURCE_COLORS[source.name] ?? "#6b7280"}20` }}
                      >
                        <ExternalLink className="size-4" style={{ color: SOURCE_COLORS[source.name] ?? "#6b7280" }} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{source.name}</p>
                        <p className="text-xs text-gray-400">{source.count} applicants</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {source.percentage}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabPanel>
        <TabPanel selected={activeTab} value="ai-recommendations">
          <div className="space-y-6">
            <div className="flex items-center gap-x-2 rounded-xl border border-purple-200 bg-purple-50 p-4 dark:border-purple-900 dark:bg-purple-950/50">
              <Sparkles className="size-5 shrink-0 text-purple-500" />
              <p className="text-sm text-purple-700 dark:text-purple-300">
                AI-powered insights based on your job posting and application data.
              </p>
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3 rounded-xl border p-4">
                <div className="flex items-center gap-x-2">
                  <Lightbulb className="size-5 text-amber-500" />
                  <h3 className="font-semibold">Job Posting Insights</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-x-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-400" />
                    Consider adding salary range visibility to increase applications by up to 30%.
                  </li>
                  <li className="flex items-start gap-x-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-400" />
                    Your job description could benefit from more specific technical requirements.
                  </li>
                  <li className="flex items-start gap-x-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-amber-400" />
                    Adding remote/hybrid flexibility details may attract 40% more candidates.
                  </li>
                </ul>
              </div>
              <div className="space-y-3 rounded-xl border p-4">
                <div className="flex items-center gap-x-2">
                  <Target className="size-5 text-blue-500" />
                  <h3 className="font-semibold">Pipeline Optimization</h3>
                </div>
                <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                  <li className="flex items-start gap-x-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-blue-400" />
                    {stats.pending > 5
                      ? `${stats.pending} candidates pending review — consider batch processing to reduce time-to-hire.`
                      : "Pipeline is moving efficiently. Keep up the review cadence."}
                  </li>
                  <li className="flex items-start gap-x-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-blue-400" />
                    {stats.rejected > stats.accepted
                      ? "High rejection rate detected. Review screening criteria to attract more qualified candidates."
                      : "Acceptance-to-rejection ratio looks healthy."}
                  </li>
                  <li className="flex items-start gap-x-2">
                    <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-blue-400" />
                    Average time in pipeline stages could be reduced with automated scheduling.
                  </li>
                </ul>
              </div>
              <div className="space-y-3 rounded-xl border p-4 lg:col-span-2">
                <div className="flex items-center gap-x-2">
                  <Users className="size-5 text-green-500" />
                  <h3 className="font-semibold">Top Candidate Matches</h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  {topCandidates.map((app) => (
                    <div key={app.id} className="flex items-center gap-x-3 rounded-lg border p-3">
                      <div className="grid size-10 shrink-0 place-items-center rounded-full bg-green-50 text-sm font-semibold text-green-600 dark:bg-green-950 dark:text-green-400">
                        {app.matchScore}%
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{app.applicant.name}</p>
                        <p className="truncate text-xs text-gray-400">{app.applicant.email}</p>
                      </div>
                    </div>
                  ))}
                  {applications.length === 0 && (
                    <p className="col-span-3 py-4 text-center text-sm text-gray-400">No applications to analyze yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </TabPanel>
        <TabPanel selected={activeTab} value="attachments">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Attachments</h3>
              <Button variant="outline" size="sm">
                <Plus className="size-3.5" />
                Upload
              </Button>
            </div>
            <div className="grid h-48 place-items-center rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600">
              <div className="text-center">
                <p className="text-sm text-gray-400">No attachments uploaded yet</p>
                <p className="mt-1 text-xs text-gray-400">Upload documents, images, or other files related to this job</p>
              </div>
            </div>
          </div>
        </TabPanel>
        <TabPanel selected={activeTab} value="others">
          <div className="space-y-6">
            <div className="space-y-2 rounded-xl border p-4">
              <h3 className="font-semibold">Job Metadata</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm text-gray-500">Status</span>
                  <Badge variant="secondary" className="capitalize">
                    {job.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm text-gray-500">Created</span>
                  <span className="text-sm font-medium">{format(new Date(job.createdAt), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm text-gray-500">Last Updated</span>
                  <span className="text-sm font-medium">{format(new Date(job.updatedAt), "MMM d, yyyy")}</span>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <span className="text-sm text-gray-500">Open Until</span>
                  <span className="text-sm font-medium">{format(new Date(job.openUntil), "MMM d, yyyy")}</span>
                </div>
              </div>
            </div>
            {job.tags && job.tags.length > 0 && (
              <div className="space-y-2 rounded-xl border p-4">
                <h3 className="font-semibold">Tags</h3>
                <div className="flex flex-wrap gap-1.5">
                  {job.tags.map((tag, i) => (
                    <Badge key={i} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {job.responsibilities && job.responsibilities.length > 0 && (
              <div className="space-y-2 rounded-xl border p-4">
                <h3 className="font-semibold">Responsibilities</h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-gray-600 dark:text-gray-400">
                  {job.responsibilities.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </TabPanel>
      </div>
      <StageDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSave={handleAddStage} />
      <StageDialog
        key={editingStage?.id}
        open={!!editingStage}
        onOpenChange={(open) => {
          if (!open) setEditingStage(undefined);
        }}
        onSave={handleEditStage}
        initial={editingStage}
      />
    </div>
  );
};

export default Page;
