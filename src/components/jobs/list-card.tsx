"use client";

import { MapPin, Briefcase, Building2, DollarSign } from "lucide-react";
import Link from "next/link";

import { formatCurrency } from "@/lib";
import type { Job } from "@/types";

interface Props {
  job: Job;
}

function formatSalary(min?: number, max?: number, currency = "NGN") {
  if (!min && !max) return null;
  const fmt = (n: number) => formatCurrency(n, currency);
  if (min && max) return `${fmt(min)} - ${fmt(max)} ${currency}`;
  if (min) return `From ${fmt(min)} ${currency}`;
  return `Up to ${fmt(max!)} ${currency}`;
}

export const ListCard = ({ job }: Props) => {
  const salary = formatSalary(job.salaryMin, job.salaryMax);

  return (
    <Link className="group" href={`/job/${job.id}`}>
      <div className="space-y-2.5 rounded-md border bg-white p-6 transition-all duration-300 group-hover:shadow-md">
        <p className="text-lg font-bold">{job.title}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-x-2">
            <Building2 className="size-4" />
            <span className="text-sm text-gray-600">{job.company}</span>
          </div>
          <div className="flex items-center gap-x-2">
            <Briefcase className="size-4" />
            <span className="text-sm text-gray-600">{job.department}</span>
          </div>
          <div className="flex items-center gap-x-2">
            <DollarSign className="size-4" />
            <span className="text-sm text-gray-600">{salary}</span>
          </div>
          <div className="flex items-center gap-x-2">
            <MapPin className="size-4" />
            <span className="text-sm text-gray-600">{job.location}</span>
          </div>
        </div>
        <div className="flex items-center gap-x-4">
          <div className="flex items-center justify-center rounded-md bg-lime-50 p-2 text-xs text-lime-600 capitalize">
            {job.jobType.replace("-", " ")}
          </div>
          <div className="flex items-center justify-center rounded-md bg-purple-50 p-2 text-xs text-purple-600 capitalize">
            {job.workType.replace("-", " ")}
          </div>
          <div className="flex items-center justify-center rounded-md bg-cyan-50 p-2 text-xs text-cyan-600 capitalize">
            {job.experienceType.replace("-", " ")}
          </div>
        </div>
      </div>
    </Link>
  );
};
