"use client";

import { Filter, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Navbar, Pagination } from "@/components/shared";
import { JobCard } from "@/components/jobs/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { paginate } from "@/lib";

import { MOCK_DEPARTMENTS, MOCK_JOBS } from "@/__mock__/database";

const initialParams = {
  page: 0,
  pageSize: 20,
  search: "",
  department: "",
  employmentType: "",
  workType: "",
  location: "",
};

const EMPLOYMENT_TYPES = [
  { label: "Full-time", value: "full-time" },
  { label: "Part-time", value: "part-time" },
  { label: "Contract", value: "contract" },
  { label: "Internship", value: "internship" },
];

// const WORK_TYPES = [
//   { label: "Remote", value: "remote" },
//   { label: "On-site", value: "on-site" },
//   { label: "Hybrid", value: "hybrid" },
// ];

const Page = () => {
  const [params, setParams] = useState(initialParams);
  const [search, setSearch] = useState("");

  const handleParamsChange = <K extends keyof typeof initialParams>(field: K, value: (typeof initialParams)[K]) => {
    setParams({ ...params, [field]: value });
  };

  const filteredJobs = useMemo(() => {
    const openJobs = MOCK_JOBS.filter((job) => job.status === "open");
    if (!search.trim()) return openJobs;
    const query = search.toLowerCase();
    return openJobs.filter(
      (job) =>
        job.title.toLowerCase().includes(query) ||
        job.company?.toLowerCase().includes(query) ||
        job.location?.toLowerCase().includes(query) ||
        job.role?.toLowerCase().includes(query),
    );
  }, [search]);

  const paginated = paginate(filteredJobs, params.page, params.pageSize, filteredJobs.length);

  return (
    <>
      <Navbar />
      <div className="w-screen">
        <div className="container mx-auto space-y-10 pb-12">
          <div className="space-y-4 py-10 text-center">
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Find Your Next Opportunity</h1>
            <p className="mx-auto max-w-xl text-gray-500">
              Browse open positions and find a role that matches your skills and aspirations.
            </p>
            <div className="mx-auto flex items-center gap-x-4">
              <Input
                type="search"
                placeholder="Search by title, company, or location..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setParams((prev) => ({ ...prev, page: 0 }));
                }}
              />
              <Select>
                <SelectTrigger className="w-full sm:w-75">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept.id} value={dept.id}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-full sm:w-75">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex w-full items-center justify-end">
              <Popover>
                <PopoverTrigger asChild>
                  <Button className="w-37.5" size="sm" variant="ghost">
                    <Filter className="size-4" /> Filter
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end"></PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-6">
            <p className="text-sm text-gray-500">
              {filteredJobs.length} {filteredJobs.length === 1 ? "position" : "positions"} available
            </p>
            {paginated.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {paginated.map((job) => (
                  <JobCard job={job} key={job.id} />
                ))}
              </div>
            ) : (
              <div className="py-20 text-center">
                <Search className="mx-auto size-10 text-gray-300" />
                <p className="mt-4 text-gray-500">No positions found matching your search.</p>
              </div>
            )}
            <Pagination
              onPageChange={(value) => handleParamsChange("page", value)}
              onPageSizeChange={(value) => handleParamsChange("pageSize", value)}
              page={params.page}
              pageSize={params.pageSize}
              total={filteredJobs.length}
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
