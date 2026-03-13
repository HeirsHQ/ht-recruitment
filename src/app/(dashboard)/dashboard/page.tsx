"use client";

import { Briefcase, CheckCircle, Clock, FileText, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";

import { Badge } from "@/components/ui/badge";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const stats = [
  { label: "Total Jobs", value: 24, subtitle: "All postings", icon: Briefcase, iconColor: "text-gray-500" },
  { label: "Open Positions", value: 12, subtitle: "Currently active", icon: CheckCircle, iconColor: "text-green-600" },
  { label: "Total Applications", value: 340, subtitle: "All received", icon: FileText, iconColor: "text-purple-600" },
  { label: "Pending Review", value: 56, subtitle: "Awaiting action", icon: Clock, iconColor: "text-amber-500" },
];

const pipelineData = [
  { stage: "Applied", count: 120 },
  { stage: "Screening", count: 85 },
  { stage: "Interview", count: 50 },
  { stage: "Offer", count: 18 },
  { stage: "Hired", count: 10 },
];

const pipelineConfig: ChartConfig = {
  count: { label: "Candidates", color: "#6366f1" },
};

const SOURCE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#3b82f6"];

const candidateSourceData = [
  { source: "LinkedIn", value: 120, fill: SOURCE_COLORS[0] },
  { source: "Indeed", value: 80, fill: SOURCE_COLORS[1] },
  { source: "Referral", value: 65, fill: SOURCE_COLORS[2] },
  { source: "Career Page", value: 45, fill: SOURCE_COLORS[3] },
  { source: "Other", value: 30, fill: SOURCE_COLORS[4] },
];

const candidateSourceConfig: ChartConfig = {
  LinkedIn: { label: "LinkedIn", color: SOURCE_COLORS[0] },
  Indeed: { label: "Indeed", color: SOURCE_COLORS[1] },
  Referral: { label: "Referral", color: SOURCE_COLORS[2] },
  "Career Page": { label: "Career Page", color: SOURCE_COLORS[3] },
  Other: { label: "Other", color: SOURCE_COLORS[4] },
};

const recentJobs = [
  {
    id: "1",
    title: "Senior Frontend Engineer",
    department: "Engineering",
    location: "Remote",
    applicants: 42,
    status: "Open",
    postedDate: "Mar 1, 2026",
  },
  {
    id: "2",
    title: "Product Designer",
    department: "Design",
    location: "New York, NY",
    applicants: 28,
    status: "Open",
    postedDate: "Feb 25, 2026",
  },
  {
    id: "3",
    title: "DevOps Engineer",
    department: "Engineering",
    location: "Remote",
    applicants: 19,
    status: "Open",
    postedDate: "Feb 20, 2026",
  },
  {
    id: "4",
    title: "Marketing Manager",
    department: "Marketing",
    location: "San Francisco, CA",
    applicants: 35,
    status: "Closed",
    postedDate: "Feb 10, 2026",
  },
  {
    id: "5",
    title: "Data Analyst",
    department: "Analytics",
    location: "Remote",
    applicants: 22,
    status: "Open",
    postedDate: "Feb 5, 2026",
  },
];

const Page = () => {
  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your recruitment activity</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="flex flex-col justify-between rounded-xl border p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <stat.icon className={`size-5 ${stat.iconColor}`} />
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-gray-400">{stat.subtitle}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pipeline Distribution */}
        <div className="space-y-4 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Pipeline Distribution</h3>
              <p className="text-xs text-gray-500">Candidates across hiring stages</p>
            </div>
            <Users className="size-5 text-gray-400" />
          </div>
          <ChartContainer config={pipelineConfig} className="h-64 w-full">
            <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="stage" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ChartContainer>
        </div>

        {/* Candidate by Source */}
        <div className="space-y-4 rounded-xl border p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">Candidates by Source</h3>
              <p className="text-xs text-gray-500">Where your candidates come from</p>
            </div>
            <Users className="size-5 text-gray-400" />
          </div>
          <ChartContainer config={candidateSourceConfig} className="h-64 w-full">
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
              >
                {candidateSourceData.map((entry) => (
                  <Cell key={entry.source} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="source" />} />
            </PieChart>
          </ChartContainer>
        </div>
      </div>

      {/* Recent Jobs */}
      <div className="space-y-4 rounded-xl border p-4">
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
            {recentJobs.map((job) => (
              <TableRow key={job.id}>
                <TableCell className="font-medium">{job.title}</TableCell>
                <TableCell>{job.department}</TableCell>
                <TableCell>{job.location}</TableCell>
                <TableCell className="text-right">{job.applicants}</TableCell>
                <TableCell>
                  <Badge variant={job.status === "Open" ? "default" : "secondary"}>{job.status}</Badge>
                </TableCell>
                <TableCell className="text-gray-500">{job.postedDate}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Page;
