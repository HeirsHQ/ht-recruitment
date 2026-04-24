"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { WorkflowForm } from "@/components/workflows/workflow-form";
import type { WorkflowTemplate } from "@/types/workflow";
import { useWorkflowStore } from "@/store/core";
import { Button } from "@/components/ui/button";

const Page = () => {
  const router = useRouter();
  const addWorkflow = useWorkflowStore((s) => s.addWorkflow);

  const handleSave = (workflow: WorkflowTemplate) => {
    addWorkflow(workflow);
    toast.success(`Workflow "${workflow.name}" created`);
    router.push("/pipelines");
  };

  return (
    <div className="space-y-6 p-6">
      <Link href="/pipelines">
        <Button variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">Create Pipeline</h1>
        <p className="text-sm text-gray-500">Define a new hiring pipeline template</p>
      </div>

      <div className="mx-auto max-w-3xl">
        <WorkflowForm onSave={handleSave} onCancel={() => router.push("/pipelines")} />
      </div>
    </div>
  );
};

export default Page;
