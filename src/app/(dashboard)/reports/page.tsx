"use client";

import { Briefcase, CalendarDays, FileDown, Printer, TrendingUp, UserCheck, Users, UsersRound } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { format, isWithinInterval, startOfWeek, subDays } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DataTable } from "@/components/shared/data-table";
import type { Candidate } from "@/types/workflow";
import { Button } from "@/components/ui/button";
import { useWorkflowStore } from "@/store/core";
import { MOCK_JOBS } from "@/__mock__/database";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

type DatePreset = "7d" | "30d" | "90d" | "all" | "custom";

interface DateRange {
  from: Date | null;
  to: Date | null;
}

const PIPELINE_STAGES = [
  { label: "Applied", stageIds: ["applied"] },
  {
    label: "Screening",
    stageIds: ["phone-screen", "screening-call", "resume-screen", "portfolio-review", "background-check"],
  },
  {
    label: "Interview",
    stageIds: [
      "technical-interview",
      "system-design",
      "final-round",
      "design-challenge",
      "team-interview",
      "sales-presentation",
      "manager-interview",
      "panel-interview",
      "interview",
      "board-approval",
    ],
  },
  { label: "Offer", stageIds: ["offer"] },
  { label: "Hired", stageIds: ["hired", "onboarding"] },
];

const CHART_COLORS = [
  "#6366f1",
  "#f59e0b",
  "#10b981",
  "#ef4444",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
  "#f97316",
  "#06b6d4",
];
const CANDIDATE_SOURCES = ["LinkedIn", "Referral", "Job Board", "Company Website", "Recruiter", "Career Fair"];

const pipelineConfig: ChartConfig = {
  count: { label: "Candidates", color: "#6366f1" },
};

const conversionConfig: ChartConfig = {
  rate: { label: "Conversion %", color: "#10b981" },
};

const hiringByDeptConfig: ChartConfig = {
  hired: { label: "Hired", color: "#8b5cf6" },
};

const applicationsOverTimeConfig: ChartConfig = {
  applications: { label: "Applications", color: "#3b82f6" },
};

const sourceChartConfig: ChartConfig = Object.fromEntries(
  CANDIDATE_SOURCES.map((s, i) => [s, { label: s, color: CHART_COLORS[i % CHART_COLORS.length] }]),
);

interface DrillDown {
  open: boolean;
  title: string;
  description: string;
  candidates: Candidate[];
}

const INITIAL_DRILL_DOWN: DrillDown = { open: false, title: "", description: "", candidates: [] };

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const Page = () => {
  const [customRange, setCustomRange] = useState<DateRange>({ from: null, to: null });
  const [drillDown, setDrillDown] = useState<DrillDown>(INITIAL_DRILL_DOWN);
  const [preset, setPreset] = useState<DatePreset>("all");
  const { candidates, workflows } = useWorkflowStore();

  const effectiveDateRange = useMemo((): DateRange => {
    const now = new Date();
    if (preset === "7d") return { from: subDays(now, 7), to: now };
    if (preset === "30d") return { from: subDays(now, 30), to: now };
    if (preset === "90d") return { from: subDays(now, 90), to: now };
    if (preset === "custom") return customRange;
    return { from: null, to: null };
  }, [preset, customRange]);

  const filteredCandidates = useMemo(() => {
    const { from, to } = effectiveDateRange;
    if (!from || !to || from > to) return candidates;
    return candidates.filter((c) => isWithinInterval(new Date(c.appliedAt), { start: from, end: to }));
  }, [candidates, effectiveDateRange]);

  const filteredJobs = useMemo(() => {
    const { from, to } = effectiveDateRange;
    if (!from || !to || from > to) return MOCK_JOBS;
    return MOCK_JOBS.filter((j) => isWithinInterval(new Date(j.createdAt), { start: from, end: to }));
  }, [effectiveDateRange]);

  const pipelineData = useMemo(
    () =>
      PIPELINE_STAGES.map(({ label, stageIds }) => ({
        stage: label,
        count: filteredCandidates.filter((c) => stageIds.includes(c.currentStageId)).length,
      })),
    [filteredCandidates],
  );

  const conversionRates = useMemo(() => {
    const result: { from: string; to: string; rate: number; fromCount: number; toCount: number }[] = [];
    for (let i = 0; i < pipelineData.length - 1; i++) {
      const curr = pipelineData[i];
      const next = pipelineData[i + 1];
      const rate = curr.count === 0 ? 0 : Math.round((next.count / curr.count) * 100);
      result.push({ from: curr.stage, to: next.stage, rate, fromCount: curr.count, toCount: next.count });
    }
    return result;
  }, [pipelineData]);

  const hiringByDeptData = useMemo(() => {
    const hiredStageIds = ["hired", "onboarding"];
    const hiredCandidates = filteredCandidates.filter((c) => hiredStageIds.includes(c.currentStageId));

    const deptMap = new Map<string, number>();
    for (const c of hiredCandidates) {
      const job = MOCK_JOBS.find((j) => j.id === c.jobId);
      const dept = job?.department?.name ?? "Unknown";
      deptMap.set(dept, (deptMap.get(dept) ?? 0) + 1);
    }

    return Array.from(deptMap.entries())
      .map(([department, hired]) => ({ department, hired }))
      .sort((a, b) => b.hired - a.hired);
  }, [filteredCandidates]);

  const candidateSourceData = useMemo(
    () =>
      CANDIDATE_SOURCES.map((source, i) => ({
        source,
        value: filteredCandidates.filter((c) => c.source === source).length,
        fill: CHART_COLORS[i % CHART_COLORS.length],
      })).filter((d) => d.value > 0),
    [filteredCandidates],
  );

  const applicationsOverTime = useMemo(() => {
    const weekMap = new Map<string, number>();
    for (const c of filteredCandidates) {
      const week = startOfWeek(new Date(c.appliedAt), { weekStartsOn: 1 });
      const key = format(week, "MMM d");
      weekMap.set(key, (weekMap.get(key) ?? 0) + 1);
    }

    return Array.from(weekMap.entries())
      .map(([week, applications]) => ({ week, applications }))
      .sort((a, b) => {
        // Sort chronologically by parsing the week labels back
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const [aM, aD] = a.week.split(" ");
        const [bM, bD] = b.week.split(" ");
        const aIdx = months.indexOf(aM) * 100 + Number(aD);
        const bIdx = months.indexOf(bM) * 100 + Number(bD);
        return aIdx - bIdx;
      });
  }, [filteredCandidates]);

  const totalCandidates = filteredCandidates.length;
  const hiredCount = pipelineData.find((p) => p.stage === "Hired")?.count ?? 0;
  const activeInPipeline = totalCandidates - hiredCount;
  const totalJobs = filteredJobs.length;

  const stats = [
    {
      label: "Total Candidates",
      value: totalCandidates,
      subtitle: "All applicants",
      icon: UsersRound,
      iconColor: "text-gray-500",
    },
    {
      label: "Active in Pipeline",
      value: activeInPipeline,
      subtitle: "In progress",
      icon: Users,
      iconColor: "text-blue-600",
    },
    {
      label: "Hired",
      value: hiredCount,
      subtitle: "Successfully placed",
      icon: UserCheck,
      iconColor: "text-green-600",
    },
    { label: "Total Jobs", value: totalJobs, subtitle: "All postings", icon: Briefcase, iconColor: "text-purple-600" },
  ];

  const recentJobsData = useMemo(
    () =>
      [...filteredJobs]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 20)
        .map((job) => ({
          id: job.id,
          title: job.title,
          department: job.department?.name ?? "\u2014",
          location: job.location ?? "\u2014",
          applicants: job.applications?.length ?? 0,
          status: job.status,
          postedDate: format(new Date(job.createdAt), "MMM d, yyyy"),
        })),
    [filteredJobs],
  );

  const drillDownColumns = useMemo<ColumnDef<Candidate, unknown>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Candidate",
        cell: ({ row }) => (
          <div>
            <p className="text-sm font-medium">{row.original.name}</p>
            <p className="text-xs text-gray-500">{row.original.email}</p>
          </div>
        ),
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: ({ row }) => row.original.source ?? "\u2014",
      },
      {
        accessorKey: "currentStageId",
        header: "Stage",
        cell: ({ row }) => {
          const wf = workflows.find((w) => w.id === row.original.workflowId);
          const stage = wf?.stages.find((s) => s.id === row.original.currentStageId);
          return stage?.title ?? row.original.currentStageId;
        },
      },
      {
        accessorKey: "appliedAt",
        header: "Applied",
        cell: ({ row }) => format(new Date(row.original.appliedAt), "dd MMM yyyy"),
      },
      {
        accessorKey: "rating",
        header: "Rating",
        cell: ({ row }) => (row.original.rating ? `${row.original.rating}/5` : "\u2014"),
      },
    ],
    [workflows],
  );

  const handleBarClick = (data: Record<string, unknown>) => {
    const stageName = data.stage as string;
    const stageGroup = PIPELINE_STAGES.find((p) => p.label === stageName);
    if (!stageGroup) return;
    const matched = filteredCandidates.filter((c) => stageGroup.stageIds.includes(c.currentStageId));
    setDrillDown({
      open: true,
      title: `${stageName} Stage`,
      description: `${matched.length} candidate${matched.length !== 1 ? "s" : ""} currently in this stage`,
      candidates: matched,
    });
  };

  const handlePieClick = (data: Record<string, unknown>) => {
    const sourceName = data.source as string;
    const matched = filteredCandidates.filter((c) => c.source === sourceName);
    setDrillDown({
      open: true,
      title: `Candidates from ${sourceName}`,
      description: `${matched.length} candidate${matched.length !== 1 ? "s" : ""} sourced via ${sourceName}`,
      candidates: matched,
    });
  };

  const exportCSV = () => {
    const headers = ["Name", "Email", "Source", "Stage", "Applied At", "Rating"];
    const rows = filteredCandidates.map((c) => {
      const wf = workflows.find((w) => w.id === c.workflowId);
      const stage = wf?.stages.find((s) => s.id === c.currentStageId);
      return [
        c.name,
        c.email,
        c.source ?? "",
        stage?.title ?? c.currentStageId,
        format(new Date(c.appliedAt), "yyyy-MM-dd"),
        c.rating?.toString() ?? "",
      ];
    });

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `recruitment-report-${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportPDF = () => {
    window.print();
  };

  return (
    <>
      <style>{`
        @media print {
          body > *:not(#__next) { display: none !important; }
          aside, header, nav, .print\\:hidden { display: none !important; }
          #reports-printable { padding: 20px; }
          #reports-printable * { break-inside: avoid; }
        }
      `}</style>
      <div id="reports-printable" className="space-y-6 p-6">
        <motion.div
          className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-2xl font-semibold">Reports</h1>
            <p className="text-sm text-gray-500">Analytics and insights for your hiring pipeline</p>
          </div>
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <Select value={preset} onValueChange={(v) => setPreset(v as DatePreset)}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
              </SelectContent>
            </Select>
            {preset === "custom" && (
              <>
                <Input
                  type="date"
                  className="w-36"
                  value={customRange.from ? format(customRange.from, "yyyy-MM-dd") : ""}
                  onChange={(e) =>
                    setCustomRange((r) => ({ ...r, from: e.target.value ? new Date(e.target.value) : null }))
                  }
                />
                <span className="text-sm text-gray-400">to</span>
                <Input
                  type="date"
                  className="w-36"
                  value={customRange.to ? format(customRange.to, "yyyy-MM-dd") : ""}
                  onChange={(e) =>
                    setCustomRange((r) => ({ ...r, to: e.target.value ? new Date(e.target.value) : null }))
                  }
                />
              </>
            )}

            <Button variant="outline" size="sm" onClick={exportCSV}>
              <FileDown className="size-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportPDF}>
              <Printer className="size-4" />
              Print
            </Button>
          </div>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          variants={container}
          initial="hidden"
          animate="show"
        >
          {stats.map((stat) => (
            <motion.div
              key={stat.label}
              className="flex flex-col justify-between rounded-xl border p-4"
              variants={item}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">{stat.label}</p>
                <stat.icon className={`size-5 ${stat.iconColor}`} />
              </div>
              <p className="mt-2 text-2xl font-bold">{stat.value}</p>
              <p className="mt-1 text-xs text-gray-400">{stat.subtitle}</p>
            </motion.div>
          ))}
        </motion.div>
        <motion.div
          className="space-y-4 rounded-xl border p-4"
          variants={fadeIn}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Applications Over Time</h3>
              <p className="text-xs text-gray-500">Weekly application volume trends</p>
            </div>
            <CalendarDays className="size-5 text-gray-400" />
          </div>
          {applicationsOverTime.length > 1 ? (
            <ChartContainer config={applicationsOverTimeConfig} className="h-64 w-full">
              <AreaChart data={applicationsOverTime} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="fillApplications" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-applications)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-applications)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="week" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="applications"
                  stroke="var(--color-applications)"
                  strokeWidth={2}
                  fill="url(#fillApplications)"
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
        </motion.div>
        <motion.div
          className="grid gap-6 lg:grid-cols-2"
          variants={fadeIn}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.4 }}
        >
          <div className="space-y-4 rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Pipeline Distribution</h3>
                <p className="text-xs text-gray-500">Candidates across hiring stages (click to drill down)</p>
              </div>
              <Users className="size-5 text-gray-400" />
            </div>
            <ChartContainer config={pipelineConfig} className="h-64 w-full">
              <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="stage" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                  onClick={(_data: unknown) => {
                    handleBarClick(_data as Record<string, unknown>);
                  }}
                />
              </BarChart>
            </ChartContainer>
          </div>
          <div className="space-y-4 rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Candidates by Source</h3>
                <p className="text-xs text-gray-500">Where your candidates come from (click to drill down)</p>
              </div>
              <Users className="size-5 text-gray-400" />
            </div>
            <ChartContainer config={sourceChartConfig} className="h-64 w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="source" hideLabel />} />
                <Pie
                  data={candidateSourceData}
                  dataKey="value"
                  nameKey="source"
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  className="cursor-pointer"
                  onClick={(data: unknown) => handlePieClick(data as Record<string, unknown>)}
                >
                  {candidateSourceData.map((entry) => (
                    <Cell key={entry.source} fill={entry.fill} />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="source" />} />
              </PieChart>
            </ChartContainer>
          </div>
        </motion.div>
        <motion.div
          className="grid gap-6 lg:grid-cols-2"
          variants={fadeIn}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.5 }}
        >
          <div className="space-y-4 rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Pipeline Conversion</h3>
                <p className="text-xs text-gray-500">Stage-to-stage progression rates</p>
              </div>
              <TrendingUp className="size-5 text-gray-400" />
            </div>
            <ChartContainer config={conversionConfig} className="h-64 w-full">
              <BarChart
                data={conversionRates.map((r) => ({ label: `${r.from} \u2192 ${r.to}`, rate: r.rate }))}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis tickLine={false} axisLine={false} tickMargin={8} domain={[0, 100]} unit="%" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="rate" barSize={32} fill="var(--color-rate)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </div>
          <div className="space-y-4 rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Hiring by Department</h3>
                <p className="text-xs text-gray-500">Hires distributed across departments</p>
              </div>
              <Briefcase className="size-5 text-gray-400" />
            </div>
            {hiringByDeptData.length > 0 ? (
              <ChartContainer config={hiringByDeptConfig} className="h-64 w-full">
                <BarChart data={hiringByDeptData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="department" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis tickLine={false} axisLine={false} tickMargin={8} allowDecimals={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="hired" barSize={32} radius={[4, 4, 0, 0]}>
                    {hiringByDeptData.map((entry, index) => (
                      <Cell key={entry.department} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="grid h-64 place-items-center rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600">
                <div className="text-center">
                  <Briefcase className="mx-auto size-8 text-gray-300 dark:text-gray-600" />
                  <p className="mt-2 text-sm text-gray-400">No hires in selected period</p>
                </div>
              </div>
            )}
          </div>
        </motion.div>
        <motion.div
          className="space-y-4 rounded-xl border p-4"
          variants={fadeIn}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Recent Jobs</h3>
              <p className="text-xs text-gray-500">Latest job postings</p>
            </div>
            <Briefcase className="size-5 text-gray-400" />
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Location</TableHead>
                <TableHead className="text-right">Applicants</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Posted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentJobsData.map((job) => (
                <TableRow key={job.id}>
                  <TableCell className="font-medium">{job.title}</TableCell>
                  <TableCell>{job.department}</TableCell>
                  <TableCell>{job.location}</TableCell>
                  <TableCell className="text-right">{job.applicants}</TableCell>
                  <TableCell>
                    <Badge variant={job.status === "open" ? "default" : "secondary"}>{job.status}</Badge>
                  </TableCell>
                  <TableCell className="text-gray-500">{job.postedDate}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </motion.div>
        <Dialog open={drillDown.open} onOpenChange={(open) => setDrillDown((d) => ({ ...d, open }))}>
          <DialogContent className="sm:max-w-4xl" showCloseButton>
            <DialogHeader>
              <DialogTitle>{drillDown.title}</DialogTitle>
              <DialogDescription>{drillDown.description}</DialogDescription>
            </DialogHeader>
            <div className="max-h-[60vh] overflow-y-auto">
              <DataTable columns={drillDownColumns} data={drillDown.candidates} pageSize={8} />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Page;
