"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { WorkflowForm } from "@/components/workflows/workflow-form";
import { useWorkflowStore } from "@/store/core";
import { Button } from "@/components/ui/button";
import type { WorkflowTemplate } from "@/types/workflow";

const Page = () => {
  const id = useParams().id as string;
  const router = useRouter();
  const { workflows, updateWorkflow } = useWorkflowStore();
  const workflow = workflows.find((w) => w.id === id);

  if (!workflow) {
    return (
      <div className="grid min-h-64 place-items-center p-6">
        <div className="text-center">
          <p className="text-lg font-medium text-red-500">Workflow not found</p>
          <Link href="/workflows" className="mt-2 text-sm text-gray-500 underline">
            Back to workflows
          </Link>
        </div>
      </div>
    );
  }

  const handleSave = (updated: WorkflowTemplate) => {
    updateWorkflow(id, updated);
    toast.success(`Workflow "${updated.name}" updated`);
    router.push(`/workflows/${id}`);
  };

  return (
    <div className="space-y-6 p-6">
      <Link href={`/workflows/${id}`}>
        <Button variant="ghost" size="sm">
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </Link>
      <div>
        <h1 className="text-2xl font-semibold">Edit Workflow</h1>
        <p className="text-sm text-gray-500">{workflow.name}</p>
      </div>

      <div className="mx-auto max-w-3xl">
        <WorkflowForm initialData={workflow} onSave={handleSave} onCancel={() => router.push(`/workflows/${id}`)} />
      </div>
    </div>
  );
};

export default Page;
