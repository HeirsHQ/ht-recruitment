"use client";

import { useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";

import { StageDialog } from "@/components/jobs/stage-dialog";
import { Button } from "@/components/ui/button";
import type { PipelineStageConfig } from "@/types/job";
import { cn } from "@/lib";

interface StageListEditorProps {
  stages: PipelineStageConfig[];
  onStagesChange: (stages: PipelineStageConfig[]) => void;
}

function SortableStageRow({
  stage,
  onEdit,
  onDelete,
}: {
  stage: PipelineStageConfig;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: stage.id,
  });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-x-3 rounded-lg border bg-white px-3 py-2.5 dark:bg-neutral-900",
        isDragging && "z-50 opacity-50 shadow-lg",
      )}
    >
      <button
        className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <span className="size-3 shrink-0 rounded-full" style={{ backgroundColor: stage.color }} />
      <span className="flex-1 text-sm font-medium">{stage.title}</span>
      {stage.approval.required && (
        <span className="flex items-center gap-x-1 text-xs text-amber-600 dark:text-amber-400">
          <ShieldCheck className="size-3.5" />
          Approval
        </span>
      )}
      <button
        onClick={onEdit}
        className="grid size-7 place-items-center rounded-md text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-neutral-800"
      >
        <Pencil className="size-3.5" />
      </button>
      <button
        onClick={onDelete}
        className="grid size-7 place-items-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/30"
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

export function StageListEditor({ stages, onStagesChange }: StageListEditorProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editingStage, setEditingStage] = useState<PipelineStageConfig | undefined>();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = stages.findIndex((s) => s.id === active.id);
    const newIndex = stages.findIndex((s) => s.id === over.id);
    onStagesChange(arrayMove(stages, oldIndex, newIndex));
  };

  const handleAddStage = (stage: PipelineStageConfig) => {
    onStagesChange([...stages, stage]);
  };

  const handleEditStage = (stage: PipelineStageConfig) => {
    onStagesChange(stages.map((s) => (s.id === stage.id ? stage : s)));
    setEditingStage(undefined);
  };

  const handleDeleteStage = (stageId: string) => {
    onStagesChange(stages.filter((s) => s.id !== stageId));
  };

  return (
    <div className="space-y-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={stages.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {stages.length > 0 ? (
            <div className="space-y-2">
              {stages.map((stage) => (
                <SortableStageRow
                  key={stage.id}
                  stage={stage}
                  onEdit={() => setEditingStage(stage)}
                  onDelete={() => handleDeleteStage(stage.id)}
                />
              ))}
            </div>
          ) : (
            <div className="grid min-h-24 place-items-center rounded-lg border border-dashed">
              <p className="text-sm text-gray-400">No stages added yet. Click below to add one.</p>
            </div>
          )}
        </SortableContext>
      </DndContext>

      <Button variant="outline" size="sm" onClick={() => setAddDialogOpen(true)}>
        <Plus className="size-3.5" />
        Add Stage
      </Button>

      <StageDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} onSave={handleAddStage} />
      <StageDialog
        key={editingStage?.id}
        open={!!editingStage}
        onOpenChange={(open) => {
          if (!open) setEditingStage(undefined);
        }}
        onSave={handleEditStage}
        initial={editingStage}
      />
    </div>
  );
}
