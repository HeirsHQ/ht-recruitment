"use client";

import { useMemo, useState } from "react";
import { CheckCircle, Clock, ListFilter, Users, UserCheck } from "lucide-react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, Pagination } from "@/components/shared";
import { createCandidateColumns } from "@/config/columns/candidate";
import { useWorkflowStore } from "@/store/core";
import { paginate } from "@/lib";

type CandidateFilter = "all" | "active" | "pending" | "hired";

const initialValues = { page: 0, pageSize: 10 };

const Page = () => {
  const { candidates, workflows } = useWorkflowStore();
  const [statusFilter, setStatusFilter] = useState<CandidateFilter>("all");
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

  const filteredCandidates = useMemo(() => {
    switch (statusFilter) {
      case "active":
        return candidates.filter((c) => c.currentStageId !== "hired" && c.currentStageId !== "rejected");
      case "pending":
        return candidates.filter((c) => c.approvalStatus === "pending");
      case "hired":
        return candidates.filter((c) => c.currentStageId === "hired");
      default:
        return candidates;
    }
  }, [candidates, statusFilter]);

  const paginated = useMemo(
    () => paginate(filteredCandidates, page, pageSize, filteredCandidates.length),
    [filteredCandidates, page, pageSize],
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
        <div className="flex items-center gap-x-2">
          <ListFilter className="size-4 text-gray-500" />
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v as CandidateFilter);
              setPagination((p) => ({ ...p, page: 0 }));
            }}
          >
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Candidates</SelectItem>
              <SelectItem value="active">Active in Pipeline</SelectItem>
              <SelectItem value="pending">Pending Approval</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DataTable columns={columns} data={paginated} />
        <Pagination
          onPageChange={(p) => setPagination({ ...pagination, page: p })}
          onPageSizeChange={(ps) => setPagination({ ...pagination, pageSize: ps })}
          page={page}
          pageSize={pageSize}
          total={filteredCandidates.length}
        />
      </div>
    </div>
  );
};

export default Page;
