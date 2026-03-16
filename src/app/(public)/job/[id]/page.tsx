"use client";

import { useCallback, useRef, useState } from "react";
import { formatDistanceToNow, format } from "date-fns";
import { useParams } from "next/navigation";
import { useFormik } from "formik";
import { toast } from "sonner";
import Link from "next/link";
import * as Yup from "yup";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  DollarSign,
  Calendar,
  Clock,
  Upload,
  FileText,
  X,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import { sanitizeText } from "@/lib/sanitize";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Navbar } from "@/components/shared";
import type { ApplyDto } from "@/types";
import { cn } from "@/lib/utils";

import { MOCK_JOBS } from "@/__mock__/database";

function formatSalary(min?: number, max?: number, currency = "USD") {
  if (!min && !max) return null;
  const fmt = (n: number) =>
    new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(n);
  if (min && max) return `${fmt(min)} - ${fmt(max)}`;
  if (min) return `From ${fmt(min)}`;
  return `Up to ${fmt(max!)}`;
}

const EMAIL_RE = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PHONE_RE = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/;

function extractDetailsFromText(text: string) {
  const email = text.match(EMAIL_RE)?.[0] ?? "";
  const phone = text.match(PHONE_RE)?.[0]?.trim() ?? "";

  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  let name = "";
  for (const line of lines.slice(0, 5)) {
    if (EMAIL_RE.test(line) || PHONE_RE.test(line) || /https?:\/\//.test(line)) continue;
    if (/^(resume|curriculum|cv|profile|summary|objective|experience|education)/i.test(line)) continue;
    if (line.length <= 50 && /^[A-Za-z\s.'-]+$/.test(line)) {
      name = line;
      break;
    }
  }

  return { name, email, phone };
}

const initialValues: ApplyDto = {
  fullName: "",
  email: "",
  phone: "",
  coverLetter: "",
  resumeFile: null,
};

const schema = Yup.object({
  fullName: Yup.string().required("Full name is required"),
  email: Yup.string()
    .required("Email is required")
    .matches(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Invalid email address"),
  phone: Yup.string()
    .required("Phone number is required")
    .matches(/^(?:\+?234|0)[0-9]{10}$/, "Invalid phone number"),
  coverLetter: Yup.string().required("Cover letter is required"),
  resumeFile: Yup.mixed()
    .required("Resume is required")
    .test("fileType", "Only PDF files are accepted", (value) => {
      if (!value) return false;
      return (value as File).type === "application/pdf";
    }),
});

const Page = () => {
  const id = useParams().id as string;
  const job = MOCK_JOBS.find((j) => j.id === id);

  const [parsing, setParsing] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formik = useFormik<ApplyDto>({
    initialValues,
    validationSchema: schema,
    onSubmit: (values) => {
      const sanitizedValues = {
        fullName: sanitizeText(values.fullName),
        email: sanitizeText(values.email),
        phone: sanitizeText(values.phone),
        coverLetter: sanitizeText(values.coverLetter),
        resumeFileName: values.resumeFile?.name,
        jobId: id,
      };

      console.log("Application submitted:", sanitizedValues);
      setSubmitted(true);
      toast.success("Application submitted successfully!");
    },
  });

  const handleResumeUpload = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        toast.error("Only PDF files are accepted.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File size exceeds 10 MB limit.");
        return;
      }

      formik.setFieldValue("resumeFile", file);
      setParsing(true);

      try {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/v1/resume/parse", { method: "POST", body: formData });
        const json = await response.json();
        console.log({ json });

        if (!json.success) {
          toast.error(json.error || "Failed to parse resume.");
          setParsing(false);
          return;
        }
        const extracted = extractDetailsFromText(json.data.text);
        if (!formik.values.fullName && extracted.name) formik.setFieldValue("fullName", extracted.name);
        if (!formik.values.email && extracted.email) formik.setFieldValue("email", extracted.email);
        if (!formik.values.phone && extracted.phone) formik.setFieldValue("phone", extracted.phone);

        toast.success("Resume parsed — details autofilled.");
      } catch {
        toast.error("Failed to parse resume. Please fill in your details manually.");
      } finally {
        setParsing(false);
      }
    },
    [formik],
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleResumeUpload(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleResumeUpload(file);
  };

  if (!job) {
    return (
      <>
        <Navbar />
        <div className="w-screen">
          <div className="container mx-auto py-20 text-center">
            <Briefcase className="mx-auto size-12 text-gray-300" />
            <h2 className="mt-4 text-xl font-semibold">Job not found</h2>
            <p className="mt-2 text-gray-500">This position may have been removed or the link is incorrect.</p>
            <Link href="/">
              <Button variant="outline" className="mt-6">
                <ArrowLeft className="size-4" />
                Back to all jobs
              </Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency);

  return (
    <>
      <Navbar />
      <div className="w-screen">
        <div className="container mx-auto space-y-8 pb-16">
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
            <ArrowLeft className="size-4" />
            All positions
          </Link>
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <div className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
                  {job.company && <span>{job.company}</span>}
                  {job.department && (
                    <>
                      <span className="text-gray-300">|</span>
                      <span>{job.department}</span>
                    </>
                  )}
                </div>
              </div>
              {job.status === "open" ? (
                <Badge className="bg-green-100 text-green-700">Open</Badge>
              ) : (
                <Badge className="bg-red-100 text-red-600">Closed</Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
              {job.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin className="size-4 text-gray-400" />
                  <span>{job.location}</span>
                  {job.remote && <Badge className="ml-1 bg-blue-50 text-[10px] text-blue-600">Remote</Badge>}
                </div>
              )}
              <div className="flex items-center gap-1.5">
                <Briefcase className="size-4 text-gray-400" />
                <span className="capitalize">{job.employmentType.replace("-", " ")}</span>
                <span className="text-gray-300">|</span>
                <span className="capitalize">{job.experienceLevel} level</span>
              </div>
              {salary && (
                <div className="flex items-center gap-1.5">
                  <DollarSign className="size-4 text-gray-400" />
                  <span>{salary}</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-400">
              <div className="flex items-center gap-1.5">
                <Clock className="size-3.5" />
                <span>Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Calendar className="size-3.5" />
                <span>Apply by {format(new Date(job.openUntil), "MMM d, yyyy")}</span>
              </div>
            </div>
          </div>
          <hr className="border-gray-100" />
          {job.description && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">About this role</h2>
              <p className="text-sm leading-relaxed whitespace-pre-line text-gray-600">{job.description}</p>
            </section>
          )}
          {job.requirements && job.requirements.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Requirements</h2>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-gray-600">
                {job.requirements.map((req, i) => (
                  <li key={i}>{req}</li>
                ))}
              </ul>
            </section>
          )}
          {job.benefits && job.benefits.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold">Benefits</h2>
              <ul className="list-disc space-y-1.5 pl-5 text-sm text-gray-600">
                {job.benefits.map((benefit, i) => (
                  <li key={i}>{benefit}</li>
                ))}
              </ul>
            </section>
          )}
          {job.tags && job.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {job.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs font-normal capitalize">
                  {tag}
                </Badge>
              ))}
            </div>
          )}
          <hr className="border-gray-100" />
          {job.status === "open" && !submitted && (
            <section className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold">Apply for this position</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Upload your resume to autofill your details, then review and submit.
                </p>
              </div>
              <form onSubmit={formik.handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label>Resume (PDF) *</Label>
                  <div
                    className={cn(
                      "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors",
                      dragOver ? "border-primary-400 bg-primary-400/5" : "border-gray-200 hover:border-gray-300",
                      parsing && "pointer-events-none opacity-60",
                      formik.touched.resumeFile && formik.errors.resumeFile && "border-red-300",
                    )}
                    onDragOver={(e) => {
                      e.preventDefault();
                      setDragOver(true);
                    }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                  >
                    {parsing ? (
                      <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
                        <Loader2 className="text-primary-400 size-8 animate-spin" />
                        <span>Parsing resume...</span>
                      </div>
                    ) : formik.values.resumeFile ? (
                      <div className="flex items-center gap-3">
                        <FileText className="text-primary-400 size-8" />
                        <div>
                          <p className="text-sm font-medium">{formik.values.resumeFile.name}</p>
                          <p className="text-xs text-gray-400">
                            {(formik.values.resumeFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            formik.setFieldValue("resumeFile", null);
                            if (fileInputRef.current) fileInputRef.current.value = "";
                          }}
                          className="ml-2 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <Upload className="size-8 text-gray-300" />
                        <p className="mt-2 text-sm text-gray-500">
                          Drag & drop your resume here, or{" "}
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="text-primary-400 font-medium hover:underline"
                          >
                            browse
                          </button>
                        </p>
                        <p className="text-xs text-gray-400">PDF only, max 10 MB</p>
                      </>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </div>
                  {formik.touched.resumeFile && formik.errors.resumeFile && (
                    <p className="text-xs text-red-500">{formik.errors.resumeFile as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    placeholder="John Doe"
                    value={formik.values.fullName}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    aria-invalid={formik.touched.fullName && !!formik.errors.fullName}
                  />
                  {formik.touched.fullName && formik.errors.fullName && (
                    <p className="text-xs text-red-500">{formik.errors.fullName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formik.values.email}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    aria-invalid={formik.touched.email && !!formik.errors.email}
                  />
                  {formik.touched.email && formik.errors.email && (
                    <p className="text-xs text-red-500">{formik.errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+234 801 234 5678"
                    value={formik.values.phone}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    aria-invalid={formik.touched.phone && !!formik.errors.phone}
                  />
                  {formik.touched.phone && formik.errors.phone && (
                    <p className="text-xs text-red-500">{formik.errors.phone}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="coverLetter">Cover Letter *</Label>
                  <Textarea
                    id="coverLetter"
                    name="coverLetter"
                    placeholder="Tell us why you're a great fit for this role..."
                    value={formik.values.coverLetter}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className="min-h-32"
                    aria-invalid={formik.touched.coverLetter && !!formik.errors.coverLetter}
                  />
                  {formik.touched.coverLetter && formik.errors.coverLetter && (
                    <p className="text-xs text-red-500">{formik.errors.coverLetter}</p>
                  )}
                </div>
                <Button type="submit" className="w-full" size="lg" disabled={parsing || formik.isSubmitting}>
                  Submit Application
                </Button>
              </form>
            </section>
          )}
          {submitted && (
            <section className="rounded-lg border border-green-200 bg-green-50 p-8 text-center">
              <CheckCircle2 className="mx-auto size-12 text-green-500" />
              <h3 className="mt-4 text-lg font-semibold text-green-800">Application Submitted</h3>
              <p className="mt-2 text-sm text-green-600">
                Thank you for applying! We&apos;ll review your application and get back to you soon.
              </p>
              <Link href="/">
                <Button variant="outline" className="mt-6">
                  Browse more positions
                </Button>
              </Link>
            </section>
          )}
          {job.status === "closed" && (
            <section className="rounded-lg border border-gray-200 bg-gray-50 p-8 text-center">
              <Briefcase className="mx-auto size-10 text-gray-300" />
              <h3 className="mt-4 text-lg font-semibold text-gray-700">This position is closed</h3>
              <p className="mt-2 text-sm text-gray-500">This position is no longer accepting applications.</p>
              <Link href="/">
                <Button variant="outline" className="mt-6">
                  Browse open positions
                </Button>
              </Link>
            </section>
          )}
        </div>
      </div>
    </>
  );
};

export default Page;
