"use client";

import { CircleCheck, Clock, XCircle } from "lucide-react";
import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import type { Job, JobStatus } from "@/types/job";
import { ActionCell, ActionIcons } from "./shared";

const getStatusBadge = (status: JobStatus) => {
  function icon(status: JobStatus) {
    switch (status) {
      case "cancelled":
      case "closed":
        return <XCircle className="size-3 text-red-600" />;
      case "in progress":
      case "pending":
        return <Clock className="size-3 text-yellow-600" />;
      case "open":
        return <CircleCheck className="size-3 text-green-600" />;
    }
  }
  return (
    <div className="flex w-fit items-center gap-x-1 rounded-3xl bg-gray-100 px-2 py-1 text-xs font-medium text-black capitalize">
      {icon(status)}
      {status}
    </div>
  );
};

export const columns: ColumnDef<Job>[] = [
  {
    accessorKey: "title",
    header: "Role",
  },
  {
    accessorKey: "company",
    header: "Company",
    cell: ({ row }) => <span>{row.original.company?.name ?? "—"}</span>,
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <span className="capitalize">
        {row.original.location ?? "—"} ({row.original.workType})
      </span>
    ),
  },
  {
    accessorKey: "experienceType",
    header: "Type",
    cell: ({ row }) => <span className="capitalize">{row.original.experienceType.replace("-", " ")}</span>,
  },
  {
    id: "applicants",
    header: "Applicants",
    cell: ({ row }) => <span>{row.original.applications?.length}</span>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => getStatusBadge(row.original.status),
  },
  {
    accessorKey: "createdAt",
    header: "Posted",
    cell: ({ row }) => format(new Date(row.original.createdAt), "dd MMM yyyy"),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <ActionCell
        actions={[
          { label: "View", icon: ActionIcons.View, href: `/jobs/${row.original.id}` },
          { label: "Edit", icon: ActionIcons.Edit, href: `/jobs/${row.original.id}/edit` },
          { label: "Delete", icon: ActionIcons.Delete, onClick: () => {}, variant: "danger" },
        ]}
      />
    ),
  },
];
