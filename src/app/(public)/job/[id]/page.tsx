"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import { useFormik } from "formik";
import { format } from "date-fns";
import { toast } from "sonner";
import Link from "next/link";
import * as Yup from "yup";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Upload,
  FileText,
  X,
  Loader2,
  Building2,
  DollarSign,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn, formatSalary } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { sanitizeText } from "@/lib/sanitize";
import { Navbar } from "@/components/shared";
import type { ApplyDto } from "@/types";

import { MOCK_JOBS } from "@/__mock__/database";

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
  coverLetter: "",
  email: "",
  fullName: "",
  phoneNumber: "",
  location: "",
  linkedInUrl: "",
  resumeFile: null,
  skills: [],
  summary: "",
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

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.4, ease: "easeOut" as const },
  }),
};

const stagger = {
  visible: { transition: { staggerChildren: 0.08 } },
};

const Page = () => {
  const id = useParams().id as string;
  const router = useRouter();

  const job = MOCK_JOBS.find((j) => j.id === id);

  const [submitted, setSubmitted] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [screen, setScreen] = useState("job");
  const [skillInput, setSkillInput] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formik = useFormik<ApplyDto>({
    initialValues,
    validationSchema: schema,
    onSubmit: (values) => {
      const sanitizedValues = {
        fullName: sanitizeText(values.fullName),
        email: sanitizeText(values.email),
        phone: sanitizeText(values.phoneNumber),
        coverLetter: sanitizeText(values.coverLetter),
        skills: values.skills.filter(Boolean),
        location: sanitizeText(values.location),
        linkedInUrl: sanitizeText(values.linkedInUrl),
        summary: sanitizeText(values.summary),
        resumeFileName: values.resumeFile?.name,
        jobId: id,
      };

      console.log("Application submitted:", sanitizedValues);
      setSubmitted(true);
    },
  });

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (formik.values.skills.includes(trimmed)) {
      toast.error("Skill already added");
      return;
    }
    formik.setFieldValue("skills", [...formik.values.skills, trimmed]);
    setSkillInput("");
  };

  const removeSkill = (index: number) => {
    formik.setFieldValue(
      "skills",
      formik.values.skills.filter((_, i) => i !== index),
    );
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

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
        if (!formik.values.phoneNumber && extracted.phone) formik.setFieldValue("phone", extracted.phone);

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
        <motion.div
          className="w-screen"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
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
        </motion.div>
      </>
    );
  }

  const salary = formatSalary(job.salaryMin, job.salaryMax, job.currency);

  if (submitted) {
    return (
      <>
        <Navbar />
        <div className="flex w-screen items-center justify-center py-20">
          <motion.div
            className="mx-auto max-w-lg space-y-6 text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <motion.div
              className="mx-auto flex size-24 items-center justify-center rounded-full bg-green-50"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
            >
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 12, delay: 0.5 }}
              >
                <CheckCircle2 className="size-12 text-green-500" />
              </motion.div>
            </motion.div>
            <motion.div
              className="space-y-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.4 }}
            >
              <h2 className="text-2xl font-bold text-gray-900">Application Submitted!</h2>
              <p className="text-gray-500">
                Your application for <span className="font-semibold text-gray-700">{job.title}</span> at{" "}
                <span className="font-semibold text-gray-700">{job.company}</span> has been received.
              </p>
            </motion.div>
            <motion.div
              className="space-y-3 rounded-xl border bg-gray-50 p-6 text-left"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.4 }}
            >
              <h3 className="text-sm font-semibold text-gray-700">What happens next?</h3>
              <div className="space-y-3">
                {[
                  { step: "1", text: "Our team will review your application" },
                  { step: "2", text: "If shortlisted, you'll receive an email invitation for the next stage" },
                  { step: "3", text: "Interview process and final decision" },
                ].map((item, i) => (
                  <motion.div
                    key={item.step}
                    className="flex items-start gap-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.1 + i * 0.15, duration: 0.3 }}
                  >
                    <span className="bg-primary-400 flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white">
                      {item.step}
                    </span>
                    <p className="text-sm text-gray-600">{item.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
            <motion.div
              className="flex items-center justify-center gap-4 pt-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5, duration: 0.4 }}
            >
              <Link href="/">
                <Button variant="outline" size="lg">
                  <ArrowLeft className="size-4" />
                  Browse more jobs
                </Button>
              </Link>
              <Link href={`/job/${id}`}>
                <Button
                  size="lg"
                  onClick={(e) => {
                    e.preventDefault();
                    setSubmitted(false);
                    setScreen("job");
                    formik.resetForm();
                  }}
                >
                  View job details
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </>
    );
  }

  if (screen === "form") {
    return (
      <>
        <Navbar />
        <div className="w-screen py-6">
          <motion.div
            className="container mx-auto space-y-6 pb-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              className="inline-flex items-center gap-x-4 text-sm text-gray-500 hover:text-gray-700"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Button onClick={() => setScreen("job")} size="sm" variant="outline">
                <ArrowLeft className="size-4" />
              </Button>
              Back
            </motion.div>
            <motion.div
              className="space-y-4 rounded-lg border p-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <p className="text-2xl font-bold">Apply for {job.title}</p>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
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
            </motion.div>
            <motion.div className="space-y-6" initial="hidden" animate="visible" variants={stagger}>
              <motion.p className="text-lg font-semibold" variants={fadeUp} custom={0}>
                Personal Information
              </motion.p>
              <motion.div className="rounded-xl border p-6" variants={fadeUp} custom={1}>
                <form onSubmit={formik.handleSubmit} className="space-y-5">
                  {/* Resume Upload */}
                  <motion.div className="space-y-2" variants={fadeUp} custom={2}>
                    <Label>Resume (PDF) *</Label>
                    <div
                      className={cn(
                        "relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-all duration-300",
                        dragOver
                          ? "border-primary-400 bg-primary-400/5 scale-[1.01]"
                          : "border-gray-200 hover:border-gray-300",
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
                      <AnimatePresence mode="wait">
                        {parsing ? (
                          <motion.div
                            key="parsing"
                            className="flex flex-col items-center gap-2 text-sm text-gray-500"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
                            <Loader2 className="text-primary-400 size-8 animate-spin" />
                            <span>Parsing resume...</span>
                          </motion.div>
                        ) : formik.values.resumeFile ? (
                          <motion.div
                            key="file"
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                          >
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
                              className="ml-2 rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
                            >
                              <X className="size-4" />
                            </button>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="empty"
                            className="flex flex-col items-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                          >
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
                          </motion.div>
                        )}
                      </AnimatePresence>
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
                  </motion.div>
                  <motion.div className="grid grid-cols-1 gap-4 sm:grid-cols-2" variants={fadeUp} custom={3}>
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
                      <Label htmlFor="email">Email *</Label>
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
                      <Label htmlFor="phoneNumber">Phone Number *</Label>
                      <Input
                        id="phoneNumber"
                        name="phoneNumber"
                        type="tel"
                        placeholder="+234 801 234 5678"
                        value={formik.values.phoneNumber}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        aria-invalid={formik.touched.phoneNumber && !!formik.errors.phoneNumber}
                      />
                      {formik.touched.phoneNumber && formik.errors.phoneNumber && (
                        <p className="text-xs text-red-500">{formik.errors.phoneNumber}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        name="location"
                        placeholder="Lagos, Nigeria"
                        value={formik.values.location}
                        onChange={formik.handleChange}
                        onBlur={formik.handleBlur}
                        aria-invalid={formik.touched.location && !!formik.errors.location}
                      />
                      {formik.touched.location && formik.errors.location && (
                        <p className="text-xs text-red-500">{formik.errors.location}</p>
                      )}
                    </div>
                  </motion.div>
                  <motion.div className="space-y-2" variants={fadeUp} custom={4}>
                    <Label htmlFor="linkedInUrl">LinkedIn URL</Label>
                    <Input
                      id="linkedInUrl"
                      name="linkedInUrl"
                      type="url"
                      placeholder="https://linkedin.com/in/johndoe"
                      value={formik.values.linkedInUrl}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      aria-invalid={formik.touched.linkedInUrl && !!formik.errors.linkedInUrl}
                    />
                    {formik.touched.linkedInUrl && formik.errors.linkedInUrl && (
                      <p className="text-xs text-red-500">{formik.errors.linkedInUrl}</p>
                    )}
                  </motion.div>
                  <motion.div className="space-y-2" variants={fadeUp} custom={5}>
                    <Label htmlFor="summary">Professional Summary</Label>
                    <Textarea
                      id="summary"
                      name="summary"
                      placeholder="Brief overview of your professional background..."
                      value={formik.values.summary}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                      className="min-h-32"
                      aria-invalid={formik.touched.summary && !!formik.errors.summary}
                    />
                    {formik.touched.summary && formik.errors.summary && (
                      <p className="text-xs text-red-500">{formik.errors.summary}</p>
                    )}
                  </motion.div>
                  <motion.div className="space-y-2" variants={fadeUp} custom={6}>
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
                  </motion.div>
                  <motion.div className="space-y-3" variants={fadeUp} custom={7}>
                    <Label>Skills</Label>
                    <div className="flex items-center gap-x-3">
                      <Input
                        placeholder="e.g. React, TypeScript, Node.js"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyDown={handleSkillKeyDown}
                      />
                      <Button type="button" variant="outline" onClick={addSkill} disabled={!skillInput.trim()}>
                        Add
                      </Button>
                    </div>
                    <AnimatePresence>
                      {formik.values.skills.length > 0 && (
                        <motion.div
                          className="flex flex-wrap items-center gap-2 pt-1"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                        >
                          <AnimatePresence mode="popLayout">
                            {formik.values.skills.map((skill, index) => (
                              <motion.div
                                key={skill}
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ type: "spring", stiffness: 300, damping: 25 }}
                              >
                                <Badge variant="secondary" className="h-7 gap-1.5 pr-1.5 text-sm">
                                  {skill}
                                  <button
                                    type="button"
                                    onClick={() => removeSkill(index)}
                                    className="rounded-full p-0.5 transition-colors hover:bg-gray-300"
                                  >
                                    <X className="size-3" />
                                  </button>
                                </Badge>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                  <motion.div className="flex w-full items-center justify-end gap-x-4" variants={fadeUp} custom={8}>
                    <Button type="button" size="lg" disabled={parsing || formik.isSubmitting} variant="outline">
                      Cancel
                    </Button>
                    <Button type="submit" size="lg" disabled={parsing || formik.isSubmitting}>
                      {formik.isSubmitting ? (
                        <>
                          <Loader2 className="size-4 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Application"
                      )}
                    </Button>
                  </motion.div>
                </form>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="w-screen py-6">
        <motion.div
          className="container mx-auto space-y-6 pb-16"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="inline-flex items-center gap-x-4 text-sm text-gray-500 hover:text-gray-700"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Button onClick={() => router.back()} size="sm" variant="outline">
              <ArrowLeft className="size-4" />
            </Button>
            Back to all jobs
          </motion.div>
          <motion.div
            className="space-y-4 rounded-lg border p-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <p className="text-2xl font-bold">{job.title}</p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
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
          </motion.div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <motion.div className="col-span-2 space-y-6" initial="hidden" animate="visible" variants={stagger}>
              <motion.div className="space-y-4" variants={fadeUp} custom={0}>
                <p className="text-lg font-bold">Job Description</p>
                <p className="text-sm text-gray-600">{job.description}</p>
              </motion.div>
              <motion.div className="space-y-4" variants={fadeUp} custom={1}>
                <p className="text-lg font-bold">Responsibilities</p>
                <ul className="ml-6 list-disc">
                  {job.responsibilities?.map((res, i) => (
                    <li className="list-item text-sm text-gray-600" key={i}>
                      {res}
                    </li>
                  ))}
                </ul>
              </motion.div>
              <motion.div className="space-y-4" variants={fadeUp} custom={2}>
                <p className="text-lg font-bold">Requirements</p>
                <ul className="ml-6 list-disc">
                  {job.requirements?.map((req, i) => (
                    <li className="list-item text-sm text-gray-600" key={i}>
                      {req}
                    </li>
                  ))}
                </ul>
              </motion.div>
            </motion.div>
            <motion.div
              className="space-y-4 rounded-xl border px-4 py-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.3 }}
            >
              <Button className="w-full" onClick={() => setScreen("form")}>
                Apply Now
              </Button>
              <hr />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="text-sm font-semibold capitalize">{job.department}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Location</p>
                  <p className="text-sm font-semibold capitalize">{job.location}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Job Type</p>
                  <p className="text-sm font-semibold capitalize">{job.jobType.replace("-", " ")}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Work Type</p>
                  <p className="text-sm font-semibold capitalize">{job.workType.replace("-", " ")}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Experience Level</p>
                  <p className="text-sm font-semibold capitalize">{job.experienceType.replace("-", " ")}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Posted On</p>
                  <p className="text-sm font-semibold capitalize">{format(job.createdAt, "MMM d, yyyy")}</p>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">Applicants</p>
                  <p className="text-sm font-semibold capitalize">{job.applications?.length}</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default Page;
