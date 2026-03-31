"use client";

import { Briefcase, CheckCircle, LayoutGrid, LayoutList, ListFilter, NotepadText, Plus, XCircle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { DataTable, Pagination, TabPanel } from "@/components/shared";
import type { Job, JobStatus, JobType, WorkType } from "@/types/job";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { columns } from "@/config/columns/job";
import { JobKanban } from "@/components/jobs";
import { cn, paginate } from "@/lib";
import { toast } from "sonner";

import { MOCK_JOBS } from "@/__mock__/database";

const STATUS_OPTIONS: { label: string; value: JobStatus }[] = [
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Pending", value: "pending" },
  { label: "In Progress", value: "in progress" },
];

const JOB_TYPE_OPTIONS: { label: string; value: JobType }[] = [
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
  { label: "Contract", value: "contract" },
];

const WORK_TYPE_OPTIONS: { label: string; value: WorkType }[] = [
  { label: "On-site", value: "on-site" },
  { label: "Hybrid", value: "hybrid" },
  { label: "Remote", value: "remote" },
];

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const VIEWS = [
  { icon: LayoutList, value: "list" },
  { icon: LayoutGrid, value: "grid" },
];

const initialFilters = { status: "", jobType: "", workType: "" };

const Page = () => {
  const [layout, setLayout] = useState("list");
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);

  const initialParams = {
    page: 0,
    pageSize: layout === "list" ? 10 : 12,
    search: "",
    ...initialFilters,
  };
  type Params = typeof initialParams;
  const [params, setParams] = useState(initialParams);
  const [draft, setDraft] = useState(initialFilters);

  const handleParamsChange = <K extends keyof Params>(key: K, value: Params[K]) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleDraftChange = (key: keyof typeof initialFilters, value: string) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setParams((prev) => ({ ...prev, ...draft, page: 0 }));
  };

  const clearAllFilters = () => {
    setDraft(initialFilters);
    setParams((prev) => ({ ...prev, ...initialFilters, page: 0 }));
  };

  const handleJobStatusChange = useCallback((jobId: string, newStatus: JobStatus) => {
    setJobs((prev) =>
      prev.map((job) => (job.id === jobId ? { ...job, status: newStatus, updatedAt: new Date() } : job)),
    );
    toast.success(`Job moved to "${newStatus}"`);
  }, []);

  const stats = useMemo(() => {
    const open = jobs.filter((j) => j.status === "open").length;
    const closed = jobs.filter((j) => j.status === "closed").length;
    const applications = jobs.reduce((sum, j) => sum + (j.applications?.length ?? 0), 0);

    return [
      { label: "Total Jobs", value: jobs.length, icon: Briefcase },
      { label: "Open", value: open, icon: CheckCircle },
      { label: "Closed", value: closed, icon: XCircle },
      { label: "Applications", value: applications, icon: NotepadText },
    ];
  }, [jobs]);

  const filtered = useMemo(() => {
    let result = jobs;
    if (params.search) {
      const query = params.search.toLowerCase();
      result = result.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company?.name?.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query) ||
          job.role?.toLowerCase().includes(query),
      );
    }
    if (params.jobType) result = result.filter((job) => job.jobType === params.jobType);
    if (params.status) result = result.filter((job) => job.status === params.status);
    if (params.workType) result = result.filter((job) => job.workType === params.workType);
    return result;
  }, [jobs, params]);

  const paginated = useMemo(
    () => paginate(filtered, params.page, params.pageSize, filtered.length),
    [filtered, params],
  );

  return (
    <div className="space-y-6 p-6">
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-semibold">Jobs</h1>
          <p className="text-sm text-gray-500">Manage and track all job postings</p>
        </div>
        <Button asChild>
          <Link href="/jobs/create">
            <Plus className="size-4" /> Create Job
          </Link>
        </Button>
      </motion.div>
      <motion.div
        className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} className="flex flex-col justify-between rounded-xl border p-4" variants={item}>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">{stat.label}</p>
              <stat.icon className="size-4" />
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
          </motion.div>
        ))}
      </motion.div>
      <motion.div
        className="w-full space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Input
              className="h-8 w-75"
              onChange={(e) => handleParamsChange("search", e.target.value)}
              placeholder="Search jobs..."
              type="search"
              value={params.search}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button size="sm" variant="outline">
                  <ListFilter className="size-4" />
                  Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-100 space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Filters</p>
                  {(draft.status || draft.jobType || draft.workType) && (
                    <button onClick={clearAllFilters} className="text-primary-400 text-xs font-medium hover:underline">
                      Clear all
                    </button>
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">Status</label>
                  <RadioGroup
                    className="flex flex-wrap items-center gap-3"
                    value={draft.status}
                    onValueChange={(value) => handleDraftChange("status", value)}
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex cursor-pointer items-center gap-x-2">
                        <RadioGroupItem value={opt.value} />
                        <span className="text-xs">{opt.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">Job Type</label>
                  <RadioGroup
                    className="flex flex-wrap items-center gap-3"
                    value={draft.jobType}
                    onValueChange={(value) => handleDraftChange("jobType", value)}
                  >
                    {JOB_TYPE_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex cursor-pointer items-center gap-x-2">
                        <RadioGroupItem value={opt.value} />
                        <span className="text-xs">{opt.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-medium text-gray-500">Work Type</label>
                  <RadioGroup
                    className="flex flex-wrap items-center gap-3"
                    value={draft.workType}
                    onValueChange={(value) => handleDraftChange("workType", value)}
                  >
                    {WORK_TYPE_OPTIONS.map((opt) => (
                      <label key={opt.value} className="flex cursor-pointer items-center gap-x-2">
                        <RadioGroupItem value={opt.value} />
                        <span className="text-xs">{opt.label}</span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>
                <Button
                  size="sm"
                  className="w-full"
                  onClick={applyFilters}
                  disabled={!draft.status && !draft.jobType && !draft.workType}
                >
                  Apply Filter
                </Button>
              </PopoverContent>
            </Popover>
          </div>
          <div className="flex items-center rounded-md bg-gray-200 p-0.5">
            {VIEWS.map((view) => (
              <button
                className={cn(
                  "grid aspect-[1.3/1] w-10 shrink-0 place-items-center rounded-md transition-all duration-300",
                  layout === view.value ? "bg-white" : "",
                )}
                key={view.value}
                onClick={() => setLayout(view.value)}
              >
                <view.icon className="size-4" />
              </button>
            ))}
          </div>
        </div>
        {layout === "list" ? (
          <TabPanel className="space-y-4" selected={""} value={""}>
            <DataTable columns={columns} data={paginated} />
            <Pagination
              onPageChange={(value) => handleParamsChange("page", value)}
              onPageSizeChange={(value) => handleParamsChange("page", value)}
              page={params.page}
              pageSize={params.pageSize}
              showPageSizeChange
              total={filtered.length}
            />
          </TabPanel>
        ) : (
          <JobKanban jobs={filtered} onStatusChange={handleJobStatusChange} />
        )}
      </motion.div>
    </div>
  );
};

export default Page;
