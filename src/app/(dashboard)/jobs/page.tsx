"use client";

import { useMemo, useState } from "react";
import { Briefcase, CheckCircle, FileText, XCircle } from "lucide-react";

import { DataTable, Pagination } from "@/components/shared";
import { CreateJob } from "@/components/jobs/create-job";
import { columns } from "@/config/columns/job";
import type { Job } from "@/types/job";
import { paginate } from "@/lib";

import { MOCK_JOBS } from "@/__mock__/database";

const initialValues = { page: 0, pageSize: 10 };

const Page = () => {
  const [jobs, setJobs] = useState<Job[]>(MOCK_JOBS);
  const [pagination, setPagination] = useState(initialValues);
  const { page, pageSize } = pagination;

  const handlePageChange = (page: number) => {
    setPagination({ ...pagination, page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setPagination({ ...pagination, pageSize });
  };

  const handleCreateJob = (job: Job) => {
    setJobs((prev) => [job, ...prev]);
  };

  const stats = useMemo(() => {
    const open = jobs.filter((j) => j.status === "open").length;
    const closed = jobs.filter((j) => j.status === "closed").length;
    const applications = jobs.reduce((sum, j) => sum + (j.applications?.length ?? 0), 0);

    return [
      {
        label: "Total Jobs",
        value: jobs.length,
        subtitle: "All postings",
        icon: Briefcase,
        iconColor: "text-gray-500",
      },
      { label: "Open", value: open, subtitle: "Currently active", icon: CheckCircle, iconColor: "text-green-600" },
      { label: "Closed", value: closed, subtitle: "No longer active", icon: XCircle, iconColor: "text-red-500" },
      {
        label: "Applications",
        value: applications,
        subtitle: "Total received",
        icon: FileText,
        iconColor: "text-purple-600",
      },
    ];
  }, [jobs]);

  const paginated = useMemo(() => paginate(jobs, page, pageSize, jobs.length), [jobs, page, pageSize]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Jobs</h1>
          <p className="text-sm text-gray-500">Manage and track all job postings</p>
        </div>
        <CreateJob onSubmit={handleCreateJob} />
      </div>
      <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
      <div className="w-full space-y-4">
        <DataTable columns={columns} data={paginated} />
        <Pagination
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          page={page}
          pageSize={pageSize}
          total={jobs.length}
        />
      </div>
    </div>
  );
};

export default Page;
