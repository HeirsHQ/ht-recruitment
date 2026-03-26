"use client";

import { useRouter } from "next/navigation";
import { useFormik } from "formik";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import * as Yup from "yup";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { CreateJobDto, Job } from "@/types/job";
import { sanitizeText } from "@/lib/sanitize";

import { MOCK_DEPARTMENTS } from "@/__mock__/database";

interface CreateJobProps {
  job?: Job;
}

const SALARY_FREQUENCIES = [
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
  { label: "Weekly", value: "weekly" },
  { label: "Hourly", value: "hourly" },
];

const validationSchema = Yup.object<CreateJobDto>({
  title: Yup.string().trim().required("Position name is required"),
  description: Yup.string().trim(),
  jobType: Yup.string().required("Contract type is required"),
  workType: Yup.string(),
  experienceType: Yup.string(),
  location: Yup.string().trim(),
  remote: Yup.boolean(),
  role: Yup.string(),
  department: Yup.string(),
  company: Yup.string().trim(),
  salaryMin: Yup.number()
    .min(0, "Must be a positive number")
    .transform((value, original) => (original === "" ? undefined : value)),
  salaryMax: Yup.number()
    .min(0, "Must be a positive number")
    .transform((value, original) => (original === "" ? undefined : value))
    .test("max-gte-min", "Max salary must be greater than min salary", function (value) {
      const { salaryMin } = this.parent;
      if (value != null && salaryMin != null) return value >= salaryMin;
      return true;
    }),
  currency: Yup.string(),
  openUntil: Yup.date()
    .transform((value, original) => (original === "" ? undefined : value))
    .min(new Date(), "Date must be in the future"),
  tags: Yup.array().of(Yup.string().required()),
  requirements: Yup.array().of(Yup.string().required()),
  responsibilities: Yup.array().of(Yup.string().required()),
  benefits: Yup.array().of(Yup.string().required()),
});

interface FormValues extends CreateJobDto {
  headcount?: number;
  salaryFrequency: string;
  responsibilitiesText: string;
  requirementsText: string;
}

const initialValues: FormValues = {
  title: "",
  description: "",
  jobType: "",
  workType: "",
  experienceType: "",
  location: "",
  remote: false,
  role: "",
  department: "",
  company: "",
  salaryMin: undefined,
  salaryMax: undefined,
  currency: "NGN",
  openUntil: undefined,
  tags: [],
  requirements: [],
  responsibilities: [],
  benefits: [],
  headcount: undefined,
  salaryFrequency: "",
  responsibilitiesText: "",
  requirementsText: "",
};

export function CreateJob({ job: existingJob }: CreateJobProps = {}) {
  const router = useRouter();
  const isEditing = !!existingJob;

  const editInitialValues: FormValues = existingJob
    ? {
        title: existingJob.title,
        description: existingJob.description ?? "",
        jobType: existingJob.jobType,
        workType: existingJob.workType,
        experienceType: existingJob.experienceType,
        location: existingJob.location ?? "",
        remote: existingJob.remote ?? false,
        role: existingJob.role ?? "",
        department: existingJob.department ?? "",
        company: existingJob.company ?? "",
        salaryMin: existingJob.salaryMin,
        salaryMax: existingJob.salaryMax,
        currency: existingJob.currency ?? "NGN",
        openUntil: existingJob.openUntil,
        tags: existingJob.tags ?? [],
        requirements: existingJob.requirements ?? [],
        responsibilities: existingJob.responsibilities ?? [],
        benefits: existingJob.benefits ?? [],
        headcount: undefined,
        salaryFrequency: "",
        responsibilitiesText: existingJob.responsibilities?.join("\n") ?? "",
        requirementsText: existingJob.requirements?.join("\n") ?? "",
      }
    : initialValues;

  const formik = useFormik<FormValues>({
    initialValues: editInitialValues,
    validationSchema,
    enableReinitialize: true,
    onSubmit: (values, { resetForm }) => {
      const now = new Date();
      const parseLines = (text: string) =>
        text
          .split("\n")
          .map((l) => sanitizeText(l))
          .filter(Boolean);

      const job: Job = {
        id: existingJob?.id ?? crypto.randomUUID(),
        title: sanitizeText(values.title),
        description: values.description ? sanitizeText(values.description) : undefined,
        status: existingJob?.status ?? "open",
        jobType: (values.jobType || "full-time") as Job["jobType"],
        workType: (values.workType || "on-site") as Job["workType"],
        experienceType: (values.experienceType || "mid-level") as Job["experienceType"],
        location: values.location ? sanitizeText(values.location) : undefined,
        remote: values.remote,
        role: values.role || undefined,
        department: values.department || undefined,
        company: values.company ? sanitizeText(values.company) : undefined,
        salaryMin: values.salaryMin,
        salaryMax: values.salaryMax,
        currency: values.salaryMin != null || values.salaryMax != null ? values.currency : undefined,
        openUntil: values.openUntil
          ? new Date(values.openUntil)
          : new Date(now.getFullYear(), now.getMonth() + 1, now.getDate()),
        requirements: values.requirementsText ? parseLines(values.requirementsText) : undefined,
        responsibilities: values.responsibilitiesText ? parseLines(values.responsibilitiesText) : undefined,
        applications: existingJob?.applications ?? [],
        createdAt: existingJob?.createdAt ?? now,
        updatedAt: now,
        views: existingJob?.views ?? 0,
      };

      if (!isEditing) resetForm();
      toast.success(isEditing ? `Job "${job.title}" updated` : `Job "${job.title}" created`);
      router.push(isEditing ? `/jobs/${job.id}` : "/jobs");
    },
  });

  const getError = (field: string) => {
    const touched = formik.touched[field as keyof typeof formik.touched];
    const error = formik.errors[field as keyof typeof formik.errors];
    return touched && error ? String(error) : undefined;
  };

  return (
    <form onSubmit={formik.handleSubmit} className="mt-6 space-y-6">
      <fieldset className="space-y-4 rounded-xl border p-5">
        <p className="px-1 text-base font-semibold">Basic Information</p>
        <div className="grid gap-1.5">
          <Label htmlFor="title" className="text-sm font-medium">
            Position Name
          </Label>
          <Input
            id="title"
            name="title"
            value={formik.values.title}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="e.g. Christmas Day"
          />
          {getError("title") && <p className="text-xs text-red-500">{getError("title")}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label className="text-sm font-medium">Department</Label>
            <Select value={formik.values.department ?? ""} onValueChange={(v) => formik.setFieldValue("department", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Department" />
              </SelectTrigger>
              <SelectContent position="popper">
                {MOCK_DEPARTMENTS.filter((d) => d.id !== "all").map((d) => (
                  <SelectItem key={d.id} value={d.name}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="headcount" className="text-sm font-medium">
              Headcount
            </Label>
            <Input
              id="headcount"
              name="headcount"
              type="number"
              min={1}
              value={formik.values.headcount ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Select Date"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label className="text-sm font-medium">Location</Label>
            <Select value={formik.values.location ?? ""} onValueChange={(v) => formik.setFieldValue("location", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Location" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="Lagos, Nigeria">Lagos, Nigeria</SelectItem>
                <SelectItem value="Abuja, Nigeria">Abuja, Nigeria</SelectItem>
                <SelectItem value="Port Harcourt, Nigeria">Port Harcourt, Nigeria</SelectItem>
                <SelectItem value="London, UK">London, UK</SelectItem>
                <SelectItem value="New York, US">New York, US</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2 pb-0.5">
            <Checkbox
              id="remote"
              checked={formik.values.remote ?? false}
              onCheckedChange={(v) => formik.setFieldValue("remote", v)}
            />
            <Label htmlFor="remote" className="text-sm font-medium">
              Remote Position?
            </Label>
          </div>
        </div>
      </fieldset>
      <fieldset className="space-y-4 rounded-xl border p-5">
        <p className="px-1 text-base font-semibold">Employment Details</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label className="text-sm font-medium">Contract Type</Label>
            <Select value={formik.values.jobType} onValueChange={(v) => formik.setFieldValue("jobType", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Type" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="full-time">Full-time</SelectItem>
                <SelectItem value="part-time">Part-time</SelectItem>
                <SelectItem value="contract">Contract</SelectItem>
              </SelectContent>
            </Select>
            {getError("jobType") && <p className="text-xs text-red-500">{getError("jobType")}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label className="text-sm font-medium">Currency</Label>
            <Select value={formik.values.currency ?? "NGN"} onValueChange={(v) => formik.setFieldValue("currency", v)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Currency" />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="NGN">NGN</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label htmlFor="salaryMin" className="text-sm font-medium">
              Min Salary
            </Label>
            <Input
              id="salaryMin"
              type="number"
              name="salaryMin"
              value={formik.values.salaryMin ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Select Date"
            />
            {getError("salaryMin") && <p className="text-xs text-red-500">{getError("salaryMin")}</p>}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="salaryMax" className="text-sm font-medium">
              Max Salary
            </Label>
            <Input
              id="salaryMax"
              type="number"
              name="salaryMax"
              value={formik.values.salaryMax ?? ""}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              placeholder="Select Date"
            />
            {getError("salaryMax") && <p className="text-xs text-red-500">{getError("salaryMax")}</p>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-1.5">
            <Label className="text-sm font-medium">Salary Frequency</Label>
            <Select
              value={formik.values.salaryFrequency ?? ""}
              onValueChange={(v) => formik.setFieldValue("salaryFrequency", v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Frequency" />
              </SelectTrigger>
              <SelectContent position="popper">
                {SALARY_FREQUENCIES.map((f) => (
                  <SelectItem key={f.value} value={f.value}>
                    {f.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </fieldset>
      <fieldset className="space-y-4 rounded-xl border p-5">
        <p className="px-1 text-base font-semibold">Job Description</p>
        <div className="grid gap-1.5">
          <Label htmlFor="description" className="text-sm font-medium">
            Description
          </Label>
          <Textarea
            id="description"
            name="description"
            value={formik.values.description ?? ""}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Enter description"
            rows={3}
          />
          <p className="text-xs text-gray-400">Make the Job description clear</p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="responsibilities" className="text-sm font-medium">
            Responsibilities
          </Label>
          <Textarea
            id="responsibilities"
            name="responsibilitiesText"
            value={formik.values.responsibilitiesText}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Enter Responsibilities"
            rows={3}
          />
          <p className="text-xs text-gray-400">Make the Job responsibilities clear</p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="requirements" className="text-sm font-medium">
            Requirements
          </Label>
          <Textarea
            id="requirements"
            name="requirementsText"
            value={formik.values.requirementsText}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            placeholder="Enter Requirements"
            rows={3}
          />
          <p className="text-xs text-gray-400">Make the Job requirements clear</p>
        </div>
      </fieldset>
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" type="button" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit" disabled={formik.isSubmitting} className="bg-red-600 hover:bg-red-700">
          {!isEditing && <Plus className="size-4" />}
          {isEditing ? "Save Changes" : "Create Job"}
        </Button>
      </div>
    </form>
  );
}
