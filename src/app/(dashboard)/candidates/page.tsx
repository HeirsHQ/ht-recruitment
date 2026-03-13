"use client";

import { useMemo, useState } from "react";
import { CheckCircle, Clock, Users, UserCheck } from "lucide-react";

import { DataTable, Pagination } from "@/components/shared";
import { createCandidateColumns } from "@/config/columns/candidate";
import { useWorkflowStore } from "@/store/core";
import { paginate } from "@/lib";

const initialValues = { page: 0, pageSize: 10 };

const Page = () => {
  const { candidates, workflows } = useWorkflowStore();
  const [pagination, setPagination] = useState(initialValues);
  const { page, pageSize } = pagination;

  const columns = useMemo(() => createCandidateColumns(workflows), [workflows]);

  const stats = useMemo(() => {
    const active = candidates.filter((c) => c.currentStageId !== "hired" && c.currentStageId !== "rejected").length;
    const pending = candidates.filter((c) => c.approvalStatus === "pending").length;
    const hired = candidates.filter((c) => c.currentStageId === "hired").length;

    return [
      {
        label: "Total Candidates",
        value: candidates.length,
        subtitle: "All candidates",
        icon: Users,
        iconColor: "text-gray-500",
      },
      {
        label: "Active in Pipeline",
        value: active,
        subtitle: "Currently progressing",
        icon: CheckCircle,
        iconColor: "text-blue-600",
      },
      {
        label: "Pending Approval",
        value: pending,
        subtitle: "Awaiting review",
        icon: Clock,
        iconColor: "text-amber-500",
      },
      {
        label: "Hired",
        value: hired,
        subtitle: "Successfully placed",
        icon: UserCheck,
        iconColor: "text-green-600",
      },
    ];
  }, [candidates]);

  const paginated = useMemo(
    () => paginate(candidates, page, pageSize, candidates.length),
    [candidates, page, pageSize],
  );

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Candidates</h1>
        <p className="text-sm text-gray-500">Track all candidates across hiring pipelines</p>
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
          onPageChange={(p) => setPagination({ ...pagination, page: p })}
          onPageSizeChange={(ps) => setPagination({ ...pagination, pageSize: ps })}
          page={page}
          pageSize={pageSize}
          total={candidates.length}
        />
      </div>
    </div>
  );
};

export default Page;
