"use client";

import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis, type PieLabelRenderProps } from "recharts";
import { Briefcase, CheckCircle, Clock, FileText } from "lucide-react";
import { motion } from "framer-motion";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  type ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const stats = [
  { label: "Active Jobs", value: 24, subtitle: "All postings", icon: Briefcase, iconColor: "text-gray-500" },
  { label: "Total Candidates", value: 340, subtitle: "All received", icon: FileText, iconColor: "text-purple-600" },
  { label: "In Pipeline", value: 12, subtitle: "Currently active", icon: CheckCircle, iconColor: "text-green-600" },
  { label: "Hired", value: 56, subtitle: "Awaiting action", icon: Clock, iconColor: "text-amber-500" },
];

const pipelineData = [
  { stage: "Applied", count: 120, color: "#3b82f6" },
  { stage: "Screening", count: 85, color: "#6366f1" },
  { stage: "Interview", count: 50, color: "#8b5cf6" },
  { stage: "Offer", count: 18, color: "#f59e0b" },
  { stage: "Hired", count: 56, color: "#10b981" },
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

const sourceTotal = candidateSourceData.reduce((sum, d) => sum + d.value, 0);

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value }: PieLabelRenderProps) => {
  const RADIAN = Math.PI / 180;
  const radius = (Number(innerRadius) + Number(outerRadius)) / 2;
  const x = Number(cx) + radius * Math.cos(-Number(midAngle) * RADIAN);
  const y = Number(cy) + radius * Math.sin(-Number(midAngle) * RADIAN);
  const percent = ((Number(value) / sourceTotal) * 100).toFixed(0);

  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {percent}%
    </text>
  );
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
  return (
    <div className="space-y-6 p-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-sm text-gray-500">Overview of your recruitment activity</p>
      </motion.div>
      <motion.div
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} className="flex flex-col justify-between rounded-xl border p-4" variants={item}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <stat.icon className={`size-5 ${stat.iconColor}`} />
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-gray-400">{stat.subtitle}</p>
          </motion.div>
        ))}
      </motion.div>
      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          className="space-y-4 rounded-xl border p-4"
          variants={fadeIn}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Pipeline Distribution</h3>
            <div className="flex items-center"></div>
          </div>
          <ChartContainer config={pipelineConfig} className="h-64 w-full">
            <BarChart data={pipelineData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="stage" tickLine={false} axisLine={false} tickMargin={8} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar barSize={100} dataKey="count" radius={[4, 4, 0, 0]}>
                {pipelineData.map((entry) => (
                  <Cell key={entry.stage} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </motion.div>
        <motion.div
          className="space-y-4 rounded-xl border p-4"
          variants={fadeIn}
          initial="hidden"
          animate="show"
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Candidates by Source</h3>
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
                outerRadius={90}
                label={renderPieLabel}
                labelLine={false}
              >
                {candidateSourceData.map((entry) => (
                  <Cell key={entry.source} fill={entry.fill} />
                ))}
              </Pie>
              <ChartLegend content={<ChartLegendContent nameKey="source" />} />
            </PieChart>
          </ChartContainer>
        </motion.div>
      </div>
      <motion.div
        className="space-y-4 rounded-xl border p-4"
        variants={fadeIn}
        initial="hidden"
        animate="show"
        transition={{ delay: 0.5 }}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Recent Jobs</h3>
          <div></div>
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
      </motion.div>
    </div>
  );
};

export default Page;
