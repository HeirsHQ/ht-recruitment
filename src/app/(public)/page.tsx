"use client";

import { LayoutGrid, LayoutList, ListFilter } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FILTER_PARAMS, type Filters } from "@/config/filter";
import { Navbar, Pagination } from "@/components/shared";
import { GridCard, ListCard } from "@/components/jobs";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn, paginate } from "@/lib";

import { MOCK_DEPARTMENTS, MOCK_JOBS } from "@/__mock__/database";

const VIEWS = [
  { icon: LayoutGrid, value: "grid" },
  { icon: LayoutList, value: "list" },
];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.35, ease: "easeOut" as const },
  }),
};

const initialFilters: Filters = {
  workType: [],
  jobType: [],
  experienceType: [],
  salaryMin: 0,
  salaryMax: 0,
};

const Page = () => {
  const [layout, setLayout] = useState("grid");
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("all");
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const pageSize = layout === "grid" ? 6 : 4;

  const toggleCheckbox = (key: "workType" | "jobType" | "experienceType", value: string) => {
    setFilters((prev) => {
      const current = prev[key];
      const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
      return { ...prev, [key]: next };
    });
    setPage(0);
  };

  const handleSalaryChange = (field: "salaryMin" | "salaryMax", value: string) => {
    const num = value === "" ? 0 : parseInt(value, 10);
    if (isNaN(num)) return;
    setFilters((prev) => ({ ...prev, [field]: num }));
    setPage(0);
  };

  const filtered = useMemo(() => {
    // let jobs = MOCK_JOBS.filter((job) => job.status === "open");
    let jobs = MOCK_JOBS;
    if (search.trim()) {
      const query = search.toLowerCase();
      jobs = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.company?.name?.toLowerCase().includes(query) ||
          job.location?.toLowerCase().includes(query) ||
          job.role?.toLowerCase().includes(query),
      );
    }
    if (department !== "all") {
      jobs = jobs.filter((job) => job.department?.id === department);
    }
    if (filters.workType.length > 0) {
      jobs = jobs.filter((job) => filters.workType.includes(job.workType));
    }
    if (filters.jobType.length > 0) {
      jobs = jobs.filter((job) => filters.jobType.includes(job.jobType));
    }
    if (filters.experienceType.length > 0) {
      jobs = jobs.filter((job) => filters.experienceType.includes(job.experienceType));
    }
    if (filters.salaryMin > 0) {
      jobs = jobs.filter((job) => (job.salaryMax ?? 0) >= filters.salaryMin);
    }
    if (filters.salaryMax > 0) {
      jobs = jobs.filter((job) => (job.salaryMin ?? 0) <= filters.salaryMax);
    }

    return jobs;
  }, [search, department, filters]);

  const paginated = paginate(filtered, page, pageSize, filtered.length);

  const activeFilterCount =
    filters.workType.length +
    filters.jobType.length +
    filters.experienceType.length +
    (filters.salaryMin > 0 ? 1 : 0) +
    (filters.salaryMax > 0 ? 1 : 0);

  return (
    <>
      <Navbar />
      <div className="w-screen py-6">
        <div className="container mx-auto space-y-10 pb-12">
          <motion.div
            className="space-y-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <div className="space-y-4 text-center">
              <h1 className="text-4xl font-bold tracking-tight sm:text-4xl">Find your next opportunity</h1>
              <p className="mx-auto max-w-xl text-gray-500">
                Join our team and help shape the future. Browse open positions below
              </p>
            </div>
            <div className="mx-auto flex items-center gap-x-4">
              <Input
                type="search"
                placeholder="Search title or keyword"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
              />
              <Select
                onValueChange={(value) => {
                  setDepartment(value);
                  setPage(0);
                }}
                value={department}
              >
                <SelectTrigger className="h-9 w-full sm:w-75">
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
            </div>
          </motion.div>
          <div className="flex items-start gap-x-6">
            <motion.div
              className="w-71.25 shrink-0 space-y-4 rounded-lg border p-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <div className="flex h-11 items-center justify-between border-b">
                <p className="text-lg font-semibold">Filter</p>
                {activeFilterCount > 0 && (
                  <button
                    onClick={() => setFilters(initialFilters)}
                    className="text-primary-400 text-xs font-medium hover:underline"
                  >
                    Clear all
                  </button>
                )}
              </div>
              <div className="space-y-4">
                {FILTER_PARAMS.map((filter) => (
                  <div className="space-y-4" key={filter.key}>
                    <p className="text-sm font-bold">{filter.name}</p>
                    {filter.type === "checkbox" ? (
                      <div>
                        {filter.options.map((option) => {
                          const key = filter.key as "workType" | "jobType" | "experienceType";
                          const isChecked = filters[key].includes(option.value);
                          return (
                            <div key={option.value} className="flex h-8 items-center space-x-2">
                              <Checkbox
                                id={`${filter.key}-${option.value}`}
                                checked={isChecked}
                                onCheckedChange={() => toggleCheckbox(key, option.value)}
                              />
                              <label
                                htmlFor={`${filter.key}-${option.value}`}
                                className="cursor-pointer text-sm leading-none font-medium"
                              >
                                {option.label}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex items-center gap-x-4">
                        {filter.options.map((option) => {
                          const field = option.label === "Min" ? "salaryMin" : "salaryMax";
                          return (
                            <div key={option.label} className="flex items-center gap-2">
                              <span className="text-xs">{option.label}</span>
                              <Input
                                type="number"
                                min={0}
                                placeholder={option.label}
                                className="h-8 w-full"
                                value={filters[field] || ""}
                                onChange={(e) => handleSalaryChange(field, e.target.value)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
            <div className="flex-1 space-y-4">
              <motion.div
                className="flex h-19 items-center justify-between"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <p className="font-semibold">{filtered.length} positions available</p>
                <div className="flex items-center gap-x-4">
                  <div className="flex items-center rounded-md bg-gray-200 p-0.5">
                    {VIEWS.map((view) => (
                      <button
                        className={cn(
                          "grid aspect-[1.3/1] w-10 shrink-0 place-items-center rounded-md transition-all duration-300",
                          layout === view.value ? "bg-white" : "",
                        )}
                        key={view.value}
                        onClick={() => {
                          setLayout(view.value);
                          setPage(0);
                        }}
                      >
                        <view.icon className="size-4" />
                      </button>
                    ))}
                  </div>
                  <Button className="h-11" variant="outline">
                    <ListFilter className="size-4" /> Date posted
                  </Button>
                </div>
              </motion.div>
              <div className="space-y-4">
                <AnimatePresence mode="wait">
                  {layout === "grid" ? (
                    <motion.div
                      key="grid"
                      className="grid min-h-155 grid-cols-2 gap-x-6 gap-y-4"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {paginated.map((job, i) => (
                        <motion.div key={job.id} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                          <GridCard job={job} />
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="list"
                      className="flex min-h-155 flex-col gap-y-2.5"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {paginated.map((job, i) => (
                        <motion.div key={job.id} custom={i} variants={cardVariants} initial="hidden" animate="visible">
                          <ListCard job={job} />
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
                <Pagination onPageChange={setPage} page={page} pageSize={pageSize} total={filtered.length} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Page;
