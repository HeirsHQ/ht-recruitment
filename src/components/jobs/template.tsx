"use client";

import { useRouter } from "next/navigation";
import { FileText, Plus } from "lucide-react";
import { useState } from "react";

import type { JobTemplate } from "@/types";
import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { cn } from "@/lib";

interface Props {
  templates: JobTemplate[];
}

export const Template = ({ templates }: Props) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selected, setSelected] = useState("");
  const router = useRouter();

  const handleSelect = (template: JobTemplate) => {
    setSelected((prev) => (prev === template.id ? "" : template.id));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
    } catch (error) {
      console.error({ error });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 space-y-6">
      {templates.length > 0 ? (
        <>
          <form className="min-h-100 w-full space-y-4 rounded-xl border p-6" onSubmit={handleSubmit}>
            {templates.map((template) => (
              <div
                className={cn(
                  "flex w-full items-center justify-between rounded-md border px-4 py-3 transition-colors duration-200",
                  selected === template.id ? "bg-primary-50/10 border-primary-400" : "hover:bg-gray-50",
                )}
                key={template.id}
              >
                <div className="text-left">
                  <p className="text-sm font-medium">{template.title}</p>
                  <div className="flex items-center gap-x-3">
                    <p className="text-sm text-gray-600">{template.department.name}</p>
                    <span className="size-1 rounded-full bg-gray-600"></span>
                    <p className="text-sm text-gray-600 capitalize">{template.jobType.replace("-", " ")}</p>
                  </div>
                </div>
                <Checkbox checked={selected === template.id} onCheckedChange={() => handleSelect(template)} />
              </div>
            ))}
            <div className="flex items-center justify-end gap-3">
              <Button variant="outline" type="button" onClick={() => router.back()}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !selected} className="bg-red-600 hover:bg-red-700">
                <Plus className="size-4" />
                Create Job
              </Button>
            </div>
          </form>
        </>
      ) : (
        <div className="grid min-h-100 w-full place-items-center rounded-xl border border-dashed">
          <div className="flex flex-col items-center gap-y-4">
            <div className="grid size-20 place-items-center rounded-full bg-gray-100">
              <FileText className="size-8 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="font-medium text-gray-700">No templates yet</p>
              <p className="text-sm text-gray-500">Create a job from scratch using the form tab</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
