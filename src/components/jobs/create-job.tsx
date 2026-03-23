"use client";

import { Plus, X } from "lucide-react";
import { useFormik } from "formik";
import { useState } from "react";
import { toast } from "sonner";
import * as Yup from "yup";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { sanitizeText } from "@/lib/sanitize";
import type { CreateJobDto, Job } from "@/types/job";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { MOCK_DEPARTMENTS, MOCK_JOB_ROLES } from "@/__mock__/database";

interface CreateJobProps {
  onSubmit: (job: Job) => void;
}

const validationSchema = Yup.object<CreateJobDto>({
  title: Yup.string().trim().required("Title is required"),
  description: Yup.string().trim(),
  jobType: Yup.string().required("Job type is required"),
  workType: Yup.string().required("Work type is required"),
  experienceType: Yup.string().required("Experience type is required"),
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

const initialValues: CreateJobDto = {
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
};

export function CreateJob({ onSubmit }: CreateJobProps) {
  const [open, setOpen] = useState(false);

  // Temporary inputs for list fields (not part of the DTO)
  const [tagInput, setTagInput] = useState("");
  const [requirementInput, setRequirementInput] = useState("");
  const [responsibilityInput, setResponsibilityInput] = useState("");
  const [benefitInput, setBenefitInput] = useState("");

  const formik = useFormik<CreateJobDto>({
    initialValues,
    validationSchema,
    onSubmit: (values, { resetForm }) => {
      const now = new Date();
      const job: Job = {
        id: crypto.randomUUID(),
        title: sanitizeText(values.title),
        description: values.description ? sanitizeText(values.description) : undefined,
        status: "open",
        jobType: values.jobType as Job["jobType"],
        workType: values.workType as Job["workType"],
        experienceType: values.experienceType as Job["experienceType"],
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
        tags: values.tags?.length ? values.tags.map(sanitizeText) : undefined,
        requirements: values.requirements?.length ? values.requirements.map(sanitizeText) : undefined,
        responsibilities: values.responsibilities?.length ? values.responsibilities.map(sanitizeText) : undefined,
        benefits: values.benefits?.length ? values.benefits.map(sanitizeText) : undefined,
        applications: [],
        createdAt: now,
        updatedAt: now,
        views: 0,
      };

      onSubmit(job);
      resetForm();
      resetListInputs();
      setOpen(false);
      toast.success(`Job "${job.title}" created`);
    },
  });

  const resetListInputs = () => {
    setTagInput("");
    setRequirementInput("");
    setResponsibilityInput("");
    setBenefitInput("");
  };

  const handleAddListItem = (field: "tags" | "requirements" | "responsibilities" | "benefits", value: string) => {
    const sanitized = sanitizeText(value);
    if (!sanitized) return;

    const current = (formik.values[field] as string[]) ?? [];
    if (field === "tags" && current.includes(sanitized)) return;

    formik.setFieldValue(field, [...current, sanitized]);
  };

  const handleRemoveListItem = (field: "tags" | "requirements" | "responsibilities" | "benefits", index: number) => {
    const current = (formik.values[field] as string[]) ?? [];
    formik.setFieldValue(
      field,
      current.filter((_, i) => i !== index),
    );
  };

  const getError = (field: keyof CreateJobDto) =>
    formik.touched[field] && formik.errors[field] ? String(formik.errors[field]) : undefined;

  return (
    <Dialog
      open={open}
      onOpenChange={(value) => {
        setOpen(value);
        if (!value) {
          formik.resetForm();
          resetListInputs();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus className="size-4" />
          Add Job
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>New Job</DialogTitle>
          <DialogDescription>Fill in the details to create a new job posting.</DialogDescription>
        </DialogHeader>

        <form onSubmit={formik.handleSubmit}>
          <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-1">
            {/* Basic info */}
            <div className="space-y-3">
              <div className="grid gap-1.5">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  name="title"
                  value={formik.values.title}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g. Senior Frontend Engineer"
                />
                {getError("title") && <p className="text-xs text-red-500">{getError("title")}</p>}
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formik.values.description ?? ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="Describe the role, responsibilities, and what makes it great..."
                  rows={3}
                />
              </div>
            </div>

            <hr className="border-neutral-200 dark:border-neutral-700" />

            {/* Job details */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Job details</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs text-gray-500">
                    Job type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formik.values.jobType} onValueChange={(v) => formik.setFieldValue("jobType", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
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
                  <Label className="text-xs text-gray-500">
                    Work type <span className="text-red-500">*</span>
                  </Label>
                  <Select value={formik.values.workType} onValueChange={(v) => formik.setFieldValue("workType", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="on-site">On-site</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                  {getError("workType") && <p className="text-xs text-red-500">{getError("workType")}</p>}
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs text-gray-500">
                    Experience <span className="text-red-500">*</span>
                  </Label>
                  <Select
                    value={formik.values.experienceType}
                    onValueChange={(v) => formik.setFieldValue("experienceType", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      <SelectItem value="internship">Internship</SelectItem>
                      <SelectItem value="entry-level">Entry Level</SelectItem>
                      <SelectItem value="associate-level">Associate</SelectItem>
                      <SelectItem value="mid-level">Mid Level</SelectItem>
                      <SelectItem value="senior-level">Senior</SelectItem>
                      <SelectItem value="management-level">Management</SelectItem>
                      <SelectItem value="director-level">Director</SelectItem>
                      <SelectItem value="executive-level">Executive</SelectItem>
                    </SelectContent>
                  </Select>
                  {getError("experienceType") && <p className="text-xs text-red-500">{getError("experienceType")}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-1.5">
                  <Label className="text-xs text-gray-500">Role</Label>
                  <Select value={formik.values.role ?? ""} onValueChange={(v) => formik.setFieldValue("role", v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {MOCK_JOB_ROLES.map((r) => (
                        <SelectItem key={r.id} value={r.name}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs text-gray-500">Department</Label>
                  <Select
                    value={formik.values.department ?? ""}
                    onValueChange={(v) => formik.setFieldValue("department", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent position="popper">
                      {MOCK_DEPARTMENTS.map((d) => (
                        <SelectItem key={d.id} value={d.name}>
                          {d.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label className="text-xs text-gray-500">Location</Label>
                <Input
                  name="location"
                  value={formik.values.location ?? ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder="e.g. Lagos, Nigeria"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border px-3 py-2">
                <span className="text-sm">Remote position</span>
                <Switch
                  checked={formik.values.remote ?? false}
                  onCheckedChange={(v) => formik.setFieldValue("remote", v)}
                />
              </div>
            </div>

            <hr className="border-neutral-200 dark:border-neutral-700" />

            {/* Compensation */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Compensation</p>
              <div className="grid grid-cols-5 gap-3">
                <div className="col-span-2 grid gap-1.5">
                  <Label className="text-xs text-gray-500">Min salary</Label>
                  <Input
                    type="number"
                    name="salaryMin"
                    value={formik.values.salaryMin ?? ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="50,000"
                  />
                  {getError("salaryMin") && <p className="text-xs text-red-500">{getError("salaryMin")}</p>}
                </div>
                <div className="col-span-2 grid gap-1.5">
                  <Label className="text-xs text-gray-500">Max salary</Label>
                  <Input
                    type="number"
                    name="salaryMax"
                    value={formik.values.salaryMax ?? ""}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder="100,000"
                  />
                  {getError("salaryMax") && <p className="text-xs text-red-500">{getError("salaryMax")}</p>}
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs text-gray-500">Currency</Label>
                  <Select
                    value={formik.values.currency ?? "NGN"}
                    onValueChange={(v) => formik.setFieldValue("currency", v)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
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
              <div className="grid gap-1.5">
                <Label className="text-xs text-gray-500">Open until</Label>
                <Input
                  type="date"
                  name="openUntil"
                  value={formik.values.openUntil ? String(formik.values.openUntil) : ""}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                {getError("openUntil") && <p className="text-xs text-red-500">{getError("openUntil")}</p>}
              </div>
            </div>

            <hr className="border-neutral-200 dark:border-neutral-700" />

            {/* Tags */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Tags</p>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddListItem("tags", tagInput);
                      setTagInput("");
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="default"
                  type="button"
                  onClick={() => {
                    handleAddListItem("tags", tagInput);
                    setTagInput("");
                  }}
                >
                  Add
                </Button>
              </div>
              {(formik.values.tags?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {formik.values.tags!.map((tag, i) => (
                    <Badge key={tag} variant="secondary" className="gap-x-1 text-xs">
                      {tag}
                      <button type="button" onClick={() => handleRemoveListItem("tags", i)}>
                        <X className="size-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <hr className="border-neutral-200 dark:border-neutral-700" />

            {/* Requirements */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Requirements</p>
              <div className="flex gap-2">
                <Input
                  value={requirementInput}
                  onChange={(e) => setRequirementInput(e.target.value)}
                  placeholder="Add a requirement"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddListItem("requirements", requirementInput);
                      setRequirementInput("");
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="default"
                  type="button"
                  onClick={() => {
                    handleAddListItem("requirements", requirementInput);
                    setRequirementInput("");
                  }}
                >
                  Add
                </Button>
              </div>
              {(formik.values.requirements?.length ?? 0) > 0 && (
                <ul className="space-y-1">
                  {formik.values.requirements!.map((req, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-x-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span>• {req}</span>
                      <button
                        type="button"
                        className="mt-0.5 shrink-0 text-gray-400 hover:text-red-500"
                        onClick={() => handleRemoveListItem("requirements", i)}
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <hr className="border-neutral-200 dark:border-neutral-700" />

            {/* Responsibilities */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Responsibilities</p>
              <div className="flex gap-2">
                <Input
                  value={responsibilityInput}
                  onChange={(e) => setResponsibilityInput(e.target.value)}
                  placeholder="Add a responsibility"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddListItem("responsibilities", responsibilityInput);
                      setResponsibilityInput("");
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="default"
                  type="button"
                  onClick={() => {
                    handleAddListItem("responsibilities", responsibilityInput);
                    setResponsibilityInput("");
                  }}
                >
                  Add
                </Button>
              </div>
              {(formik.values.responsibilities?.length ?? 0) > 0 && (
                <ul className="space-y-1">
                  {formik.values.responsibilities!.map((item, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-x-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span>• {item}</span>
                      <button
                        type="button"
                        className="mt-0.5 shrink-0 text-gray-400 hover:text-red-500"
                        onClick={() => handleRemoveListItem("responsibilities", i)}
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <hr className="border-neutral-200 dark:border-neutral-700" />

            {/* Benefits */}
            <div className="space-y-3">
              <p className="text-sm font-medium">Benefits</p>
              <div className="flex gap-2">
                <Input
                  value={benefitInput}
                  onChange={(e) => setBenefitInput(e.target.value)}
                  placeholder="Add a benefit"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddListItem("benefits", benefitInput);
                      setBenefitInput("");
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="default"
                  type="button"
                  onClick={() => {
                    handleAddListItem("benefits", benefitInput);
                    setBenefitInput("");
                  }}
                >
                  Add
                </Button>
              </div>
              {(formik.values.benefits?.length ?? 0) > 0 && (
                <ul className="space-y-1">
                  {formik.values.benefits!.map((ben, i) => (
                    <li
                      key={i}
                      className="flex items-start justify-between gap-x-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                      <span>• {ben}</span>
                      <button
                        type="button"
                        className="mt-0.5 shrink-0 text-gray-400 hover:text-red-500"
                        onClick={() => handleRemoveListItem("benefits", i)}
                      >
                        <X className="size-3.5" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <DialogFooter className="mt-5">
            <Button variant="outline" type="button" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={formik.isSubmitting}>
              Create job
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
