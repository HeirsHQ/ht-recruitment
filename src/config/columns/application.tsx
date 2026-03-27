"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import type { JobApplication } from "@/types/job";

export function createApplicationColumns(): ColumnDef<JobApplication>[] {
  return [
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => <span>{row.original.applicant.name}</span>,
    },
    {
      id: "email",
      header: "Email",
      cell: ({ row }) => <span className="lowercase">{row.original.applicant.email.toLowerCase()}</span>,
    },
    {
      accessorKey: "source",
      header: "Source",
    },
    {
      id: "stage",
      header: "Pipeline Stage",
      cell: ({ row }) => {
        const { workflow } = row.original;
        return (
          <div className="flex items-center gap-x-1.5">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: workflow.color }} />
            <span className="text-sm">{workflow.title}</span>
          </div>
        );
      },
    },
    {
      accessorKey: "matchScore",
      header: "Match Score",
      cell: ({ row }) => <span>{row.original.matchScore}%</span>,
    },
    {
      accessorKey: "appliedAt",
      header: "Applied",
      cell: ({ row }) => format(new Date(row.original.appliedAt), "dd MMM yyyy"),
    },
  ];
}
