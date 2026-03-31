"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { ActionCell, ActionIcons } from "./shared";
import type { Candidate } from "@/types/workflow";

export const createCandidateColumns: ColumnDef<Candidate>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => <span className="lowercase">{row.original.email.toLowerCase()}</span>,
  },
  {
    id: "location",
    header: "Location",
    cell: ({ row }) => <span>{row.original.job.location}</span>,
  },
  {
    accessorKey: "source",
    header: "Source",
  },

  {
    id: "status",
    header: "Status",
    cell: ({ row }) => <span>{row.original.matchScore}%</span>,
  },
  {
    accessorKey: "appliedAt",
    header: "Added",
    cell: ({ row }) => format(new Date(row.original.appliedAt), "dd MMM yyyy"),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <ActionCell
        actions={[
          { label: "View", icon: ActionIcons.View, href: `/candidates/${row.original.id}` },
          { label: "Delete", icon: ActionIcons.Delete, onClick: () => {}, variant: "danger" },
        ]}
      />
    ),
  },
];
