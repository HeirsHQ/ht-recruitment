"use client";

import { ArrowLeft, Mail, MapPin, Phone } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useWorkflowStore } from "@/store/core";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const Page = () => {
  const id = useParams().id as string;
  const { candidates } = useWorkflowStore();

  const candidate = candidates.find((c) => c.id === id);

  if (!candidate) {
    return (
      <div className="grid min-h-64 place-items-center p-6">
        <div className="text-center">
          <p className="text-lg font-medium text-red-500">Candidate not found</p>
          <Link href="/candidates" className="mt-2 text-sm text-gray-500 underline">
            Back to candidates
          </Link>
        </div>
      </div>
    );
  }

  const initials = candidate.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 p-6">
      <Link href="/candidates">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </Link>
      <h1 className="text-xl font-semibold">Candidate Details</h1>
      <div className="space-y-6">
        <div className="space-y-3 rounded-xl border p-6">
          <h3 className="font-semibold">Personal Information</h3>
          <div className="flex items-start gap-x-4">
            <Avatar className="size-16">
              <AvatarImage src={candidate.avatar} alt={candidate.name} />
              <AvatarFallback className="bg-primary-100 text-primary-700 text-lg font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-1.5 text-sm">
              <div className="flex items-center gap-x-2 text-gray-600">
                <Mail className="size-4 shrink-0" />
                <span>{candidate.email.toLowerCase()}</span>
              </div>
              {candidate.phone && (
                <div className="flex items-center gap-x-2 text-gray-600">
                  <Phone className="size-4 shrink-0" />
                  <span>{candidate.phone}</span>
                </div>
              )}
              {candidate.location && (
                <div className="flex items-center gap-x-2 text-gray-600">
                  <MapPin className="size-4 shrink-0" />
                  <span>{candidate.location}</span>
                </div>
              )}
              <Badge
                className={
                  candidate.status === "active"
                    ? "bg-green-50 text-green-600 hover:bg-green-50"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-100"
                }
              >
                {candidate.status === "active" ? "Active" : "Inactive"}
              </Badge>
            </div>
          </div>
        </div>
        {candidate.summary && (
          <div className="space-y-3 rounded-xl border p-6">
            <h3 className="font-semibold">Summary</h3>
            <p className="text-sm leading-relaxed text-gray-600">{candidate.summary}</p>
          </div>
        )}
        {candidate.skills.length > 0 && (
          <div className="space-y-3 rounded-xl border p-6">
            <h3 className="font-semibold">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {candidate.skills.map((skill) => (
                <Badge key={skill} variant="outline" className="rounded-full px-3 py-1 text-sm font-normal">
                  {skill}
                </Badge>
              ))}
            </div>
          </div>
        )}
        {candidate.experience.length > 0 && (
          <div className="space-y-4 rounded-xl border p-6">
            <h3 className="font-semibold">Experience</h3>
            <div className="space-y-4">
              {candidate.experience.map((exp, i) => (
                <div key={i} className="border-l-2 border-gray-200 pl-4">
                  <p className="text-sm font-semibold">{exp.title}</p>
                  <p className="text-xs text-gray-500">
                    {exp.company} &middot; {exp.startDate} – {exp.endDate ?? "Present"}
                  </p>
                  <p className="mt-1 text-sm text-gray-600">{exp.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
        {candidate.education.length > 0 && (
          <div className="space-y-4 rounded-xl border p-6">
            <h3 className="font-semibold">Education</h3>
            <div className="space-y-3">
              {candidate.education.map((edu, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold">{edu.degree}</p>
                  <p className="text-xs text-gray-500">
                    {edu.institution} &middot; {edu.year}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        {candidate.certifications.length > 0 && (
          <div className="space-y-4 rounded-xl border p-6">
            <h3 className="font-semibold">Certifications</h3>
            <div className="space-y-3">
              {candidate.certifications.map((cert, i) => (
                <div key={i}>
                  <p className="text-sm font-semibold">{cert.name}</p>
                  <p className="text-xs text-gray-500">{cert.year}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Page;
