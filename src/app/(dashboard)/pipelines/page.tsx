"use client";

import { useMemo, useState } from "react";
import { CheckCircle, Clock, ListFilter, Plus, Workflow, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DataTable, Pagination } from "@/components/shared";
import { workflowColumns } from "@/config/columns/workflow";
import { useWorkflowStore } from "@/store/core";
import { Button } from "@/components/ui/button";
import { paginate } from "@/lib";

type WorkflowFilter = "all" | "active" | "inactive";

const initialValues = { page: 0, pageSize: 10 };

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const Page = () => {
  const { workflows, getPendingApprovalsCount } = useWorkflowStore();
  const [statusFilter, setStatusFilter] = useState<WorkflowFilter>("all");
  const [pagination, setPagination] = useState(initialValues);
  const { page, pageSize } = pagination;

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
      <motion.div
        className="flex items-center justify-between"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div>
          <h1 className="text-2xl font-semibold">Pipeline Stages</h1>
          <p className="text-sm text-gray-500">Manage hiring pipeline templates</p>
        </div>
        <Link href="/workflows/create">
          <Button>
            <Plus className="size-4" />
            Create Workflow
          </Button>
        </Link>
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
              <stat.icon className={`size-5 ${stat.iconColor}`} />
            </div>
            <p className="mt-2 text-2xl font-bold">{stat.value}</p>
            <p className="mt-1 text-xs text-gray-400">{stat.subtitle}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.div
        className="w-full space-y-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
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
        <DataTable columns={workflowColumns} data={paginated} />
        <Pagination
          onPageChange={(p) => setPagination({ ...pagination, page: p })}
          onPageSizeChange={(ps) => setPagination({ ...pagination, pageSize: ps })}
          page={page}
          pageSize={pageSize}
          total={filteredWorkflows.length}
        />
      </motion.div>
    </div>
  );
};

export default Page;
