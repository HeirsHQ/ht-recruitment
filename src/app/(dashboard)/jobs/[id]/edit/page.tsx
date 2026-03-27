"use client";

import { useParams } from "next/navigation";
import Link from "next/link";

import { CreateJob } from "@/components/jobs";
import { MOCK_JOBS } from "@/__mock__/database";

const Page = () => {
  const id = useParams().id as string;
  const job = MOCK_JOBS.find((job) => job.id === id);

  if (!job) {
    return (
      <div className="grid min-h-64 place-items-center p-6">
        <div className="text-center">
          <p className="text-lg font-medium text-red-500">Job not found</p>
          <Link href="/jobs" className="mt-2 text-sm text-gray-500 underline">
            Back to jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit Job</h1>
        <p className="text-sm text-gray-500">Update the details for &ldquo;{job.title}&rdquo;</p>
      </div>
      <div className="w-full rounded-xl border p-6">
        <CreateJob job={job} />
      </div>
    </div>
  );
};

export default Page;
