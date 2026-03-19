"use client";

import { Briefcase, CheckCircle, ListFilter, NotepadText, XCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { DataTable, Pagination } from "@/components/shared";
import { CreateJob } from "@/components/jobs/create-job";
import { Button } from "@/components/ui/button";
import { columns } from "@/config/columns/job";
import type { Job } from "@/types/job";
import { paginate } from "@/lib";

import { MOCK_JOBS } from "@/__mock__/database";

const initialParams = { page: 0, pageSize: 10, status: "" };

type Params = typeof initialParams;

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const Page = () => {
  const [params, setParams] = useState(initialParams);
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);

  const handleParamsChange = <K extends keyof Params>(key: K, value: Params[K]) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const handleCreateJob = (job: Job) => {
    setJobs((prev) => [job, ...prev]);
  };

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

  const filteredJobs = useMemo(() => {
    if (params.status) return jobs.filter((job) => job.status === params.status);
    return MOCK_JOBS;
  }, [jobs, params]);

  const paginated = useMemo(
    () => paginate(filteredJobs, params.page, params.pageSize, filteredJobs.length),
    [filteredJobs, params],
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
        <CreateJob onSubmit={handleCreateJob} />
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
          <p className="text-sm font-medium">Recent Jobs</p>
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline">
                <ListFilter className="size-4" />
                Filter
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end"></PopoverContent>
          </Popover>
        </div>
        <DataTable columns={columns} data={paginated} />
        <Pagination
          onPageChange={(value) => handleParamsChange("page", value)}
          onPageSizeChange={(value) => handleParamsChange("page", value)}
          page={params.page}
          pageSize={params.pageSize}
          showPageSizeChange
          total={filteredJobs.length}
        />
      </motion.div>
    </div>
  );
};

export default Page;
