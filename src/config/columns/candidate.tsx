"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Eye, MoreVertical } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { Candidate } from "@/types/workflow";
import { Button } from "@/components/ui/button";

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
      <Popover>
        <PopoverTrigger asChild>
          <Button size="icon" variant="outline">
            <MoreVertical />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-50 space-y-2 p-1">
          <Link
            className="flex w-full items-center justify-start gap-x-2 rounded-md px-3 py-1.5 text-xs font-medium hover:bg-gray-200"
            href={`/candidates/${row.original.id}`}
          >
            <Eye className="size-4" /> View Candidate
          </Link>
          <button className="flex w-full items-center justify-start gap-x-2 rounded-md px-3 py-1.5 text-xs font-medium hover:bg-gray-200">
            Option
          </button>
          <button className="flex w-full items-center justify-start gap-x-2 rounded-md px-3 py-1.5 text-xs font-medium hover:bg-gray-200">
            Option
          </button>
        </PopoverContent>
      </Popover>
    ),
  },
];
