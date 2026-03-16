"use client";

import Link from "next/link";
import { MapPin, Clock, Briefcase, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import { Badge } from "@/components/ui/badge";
import type { Job } from "@/types";

interface Props {
  job: Job;
}

function formatSalary(min?: number, max?: number, currency = "USD") {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);
  if (min && max) return `${fmt(min)} - ${fmt(max)} ${currency}`;
  if (min) return `From ${fmt(min)} ${currency}`;
  return `Up to ${fmt(max!)} ${currency}`;
}

export const JobCard = ({ job }: Props) => {
  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency);

  return (
    <Link href={`/job/${job.id}`}>
      <div className="flex h-full flex-col justify-between space-y-3 rounded-xl border bg-white p-5 transition-all duration-300 hover:shadow-md">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm leading-snug font-semibold">{job.title}</p>
            {job.status === "open" ? (
              <Badge className="shrink-0 bg-green-100 text-[10px] text-green-700">Open</Badge>
            ) : (
              <Badge className="shrink-0 bg-red-100 text-[10px] text-red-600">Closed</Badge>
            )}
          </div>
          {job.company && <p className="text-xs text-gray-500">{job.company}</p>}
        </div>

        <div className="space-y-2 text-xs text-gray-600">
          {job.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0" />
              <span>{job.location}</span>
              {job.remote && <Badge className="bg-blue-50 text-[10px] text-blue-600">Remote</Badge>}
            </div>
          )}

          <div className="flex items-center gap-1.5">
            <Briefcase className="size-3.5 shrink-0" />
            <span className="capitalize">{job.employmentType.replace("-", " ")}</span>
            <span className="text-gray-300">|</span>
            <span className="capitalize">{job.experienceLevel} level</span>
          </div>

          {salary && (
            <div className="flex items-center gap-1.5">
              <DollarSign className="size-3.5 shrink-0" />
              <span>{salary}</span>
            </div>
          )}
        </div>

        {job.tags && job.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {job.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} variant="outline" className="text-[10px] font-normal capitalize">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <Clock className="size-3" />
          <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
        </div>
      </div>
    </Link>
  );
};
