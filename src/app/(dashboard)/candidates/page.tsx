"use client";

import { CheckCircle, Clock, ListFilter, Users, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { motion } from "framer-motion";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { createCandidateColumns } from "@/config/columns/candidate";
import { DataTable, Pagination } from "@/components/shared";
import { useWorkflowStore } from "@/store/core";
import { Button } from "@/components/ui/button";
import { paginate } from "@/lib";

type Params = {
  page: number;
  pageSize: number;
  status: string;
};

const initialParams: Params = { page: 0, pageSize: 10, status: "" };

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
} as const;

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const Page = () => {
  const { candidates } = useWorkflowStore();
  const [params, setParams] = useState(initialParams);

  const handleParamChange = <K extends keyof Params>(field: K, value: Params[K]) => {
    setParams((params) => ({ ...params, [field]: value }));
  };

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

  const filtered = useMemo(() => {
    const result = candidates;
    return result;
  }, [candidates]);

  const paginated = useMemo(
    () => paginate(filtered, params.page, params.pageSize, filtered.length),
    [filtered, params],
  );

  return (
    <div className="space-y-6 p-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
        <h1 className="text-2xl font-semibold">Candidates</h1>
        <p className="text-sm text-gray-500">Track all candidates across hiring pipelines</p>
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
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-x-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button className="w-37.5" size="sm" variant="outline">
                  <ListFilter className="size-4" /> Filter
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className=""></PopoverContent>
            </Popover>
          </div>
        </div>
        <DataTable columns={createCandidateColumns} data={paginated} />
        <Pagination
          onPageChange={(page) => handleParamChange("page", page)}
          onPageSizeChange={(pageSize) => handleParamChange("pageSize", pageSize)}
          page={params.page}
          pageSize={params.pageSize}
          total={filtered.length}
        />
      </motion.div>
    </div>
  );
};

export default Page;
