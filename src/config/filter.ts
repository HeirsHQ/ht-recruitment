export interface Filters {
  workType: string[];
  jobType: string[];
  experienceType: string[];
  salaryMin: number;
  salaryMax: number;
}

export const FILTER_PARAMS = [
  {
    key: "workType",
    name: "Work type",
    type: "checkbox",
    options: [
      { label: "On Site", value: "on-site" },
      { label: "Hybrid", value: "hybrid" },
      { label: "Remote", value: "remote" },
    ],
  },
  {
    key: "jobType",
    name: "Job Type",
    type: "checkbox",
    options: [
      { label: "Full time", value: "full-time" },
      { label: "Part time", value: "part-time" },
      { label: "Contract", value: "contract" },
    ],
  },
  {
    key: "salary",
    name: "Salary",
    type: "input",
    options: [
      { label: "Min", value: 0 },
      { label: "Max", value: 0 },
    ],
  },
  {
    key: "experienceType",
    name: "Experience Level",
    type: "checkbox",
    options: [
      { label: "Internship", value: "internship" },
      { label: "Entry Level", value: "entry-level" },
      { label: "Associate Level", value: "associate-level" },
      { label: "Mid Level", value: "mid-level" },
      { label: "Senior Level", value: "senior-level" },
      { label: "Management Level", value: "management-level" },
      { label: "Director Level", value: "director-level" },
      { label: "Executive Level", value: "executive-level" },
    ],
  },
] as const;
