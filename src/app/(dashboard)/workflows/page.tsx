"use client";

import { useMemo, useState } from "react";
import { CheckCircle, Clock, ListFilter, Plus, Workflow, XCircle } from "lucide-react";
import Link from "next/link";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, Pagination } from "@/components/shared";
import { createWorkflowColumns } from "@/config/columns/workflow";
import { useWorkflowStore } from "@/store/core";
import { Button } from "@/components/ui/button";
import { paginate } from "@/lib";

type WorkflowFilter = "all" | "active" | "inactive";

const initialValues = { page: 0, pageSize: 10 };

const Page = () => {
  const { workflows, deleteWorkflow, getPendingApprovalsCount } = useWorkflowStore();
  const [statusFilter, setStatusFilter] = useState<WorkflowFilter>("all");
  const [pagination, setPagination] = useState(initialValues);
  const { page, pageSize } = pagination;

  const columns = useMemo(() => createWorkflowColumns(deleteWorkflow), [deleteWorkflow]);

  const stats = useMemo(() => {
    const active = workflows.filter((w) => w.isActive).length;
    const inactive = workflows.filter((w) => !w.isActive).length;
    const pendingApprovals = getPendingApprovalsCount();

    return [
      {
        label: "Total Workflows",
        value: workflows.length,
        subtitle: "All templates",
        icon: Workflow,
        iconColor: "text-gray-500",
      },
      {
        label: "Active",
        value: active,
        subtitle: "Currently in use",
        icon: CheckCircle,
        iconColor: "text-green-600",
      },
      {
        label: "Inactive",
        value: inactive,
        subtitle: "Not in use",
        icon: XCircle,
        iconColor: "text-red-500",
      },
      {
        label: "Pending Approvals",
        value: pendingApprovals,
        subtitle: "Awaiting review",
        icon: Clock,
        iconColor: "text-amber-500",
      },
    ];
  }, [workflows, getPendingApprovalsCount]);

  const filteredWorkflows = useMemo(() => {
    switch (statusFilter) {
      case "active":
        return workflows.filter((w) => w.isActive);
      case "inactive":
        return workflows.filter((w) => !w.isActive);
      default:
        return workflows;
    }
  }, [workflows, statusFilter]);

  const paginated = useMemo(
    () => paginate(filteredWorkflows, page, pageSize, filteredWorkflows.length),
    [filteredWorkflows, page, pageSize],
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Workflows</h1>
          <p className="text-sm text-gray-500">Manage hiring pipeline templates</p>
        </div>
        <Link href="/workflows/create">
          <Button>
            <Plus className="size-4" />
            Create Workflow
          </Button>
        </Link>
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
              setStatusFilter(v as WorkflowFilter);
              setPagination((p) => ({ ...p, page: 0 }));
            }}
          >
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DataTable columns={columns} data={paginated} />
        <Pagination
          onPageChange={(p) => setPagination({ ...pagination, page: p })}
          onPageSizeChange={(ps) => setPagination({ ...pagination, pageSize: ps })}
          page={page}
          pageSize={pageSize}
          total={filteredWorkflows.length}
        />
      </div>
    </div>
  );
};

export default Page;
