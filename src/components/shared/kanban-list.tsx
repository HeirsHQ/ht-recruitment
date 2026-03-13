"use client";

import { ChevronDown, GripVertical, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { type ReactNode, useCallback, useMemo, useState } from "react";
import { CSS } from "@dnd-kit/utilities";
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import type { KanbanColumnConfig, KanbanDragEndEvent, KanbanItemBase } from "./kanban";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib";

interface KanbanListProps<T extends KanbanItemBase> {
  items: T[];
  columns: KanbanColumnConfig[];
  renderCard: (item: T) => ReactNode;
  onDragEnd?: (event: KanbanDragEndEvent<T>) => void;
  onColumnEdit?: (columnId: string) => void;
  onColumnDelete?: (columnId: string) => void;
  className?: string;
}

interface AccordionSectionProps<T extends KanbanItemBase> {
  config: KanbanColumnConfig;
  items: T[];
  renderCard: (item: T) => ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
}

function DraggableRow({ id, children }: { id: string; children: ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      data-slot="kanban-list-row"
      data-dragging={isDragging || undefined}
      style={style}
      className={cn(
        "group flex items-center gap-x-3 rounded-lg border bg-white p-3 transition-shadow",
        "hover:shadow-sm dark:border-neutral-700 dark:bg-neutral-800",
        isDragging && "ring-primary-200 dark:ring-primary-800 z-50 opacity-50 shadow-lg ring-2",
      )}
    >
      <button
        className="cursor-grab touch-none text-gray-300 hover:text-gray-500 active:cursor-grabbing dark:text-neutral-600 dark:hover:text-neutral-400"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="size-4" />
      </button>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

function AccordionSection<T extends KanbanItemBase>({
  config,
  items,
  renderCard,
  onEdit,
  onDelete,
}: AccordionSectionProps<T>) {
  const [open, setOpen] = useState(true);
  const { setNodeRef, isOver } = useDroppable({ id: config.id });
  const hasActions = !!onEdit || !!onDelete;

  return (
    <div data-slot="kanban-list-section" data-status={config.id} className="rounded-xl border dark:border-neutral-700">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "flex w-full items-center justify-between rounded-xl px-4 py-3",
          "hover:bg-neutral-50 dark:hover:bg-neutral-800/50",
          open && "border-b dark:border-neutral-700",
        )}
      >
        <div className="flex items-center gap-x-2">
          {config.color && <span className="size-2.5 rounded-full" style={{ backgroundColor: config.color }} />}
          <span className="text-sm font-semibold">{config.title}</span>
          <span
            className={cn(
              "grid size-5 place-items-center rounded-full text-xs font-medium",
              "bg-neutral-200 dark:bg-neutral-700",
            )}
          >
            {items.length}
          </span>
        </div>
        <div className="flex items-center gap-x-1">
          {hasActions && (
            <Popover>
              <PopoverTrigger asChild>
                <span
                  role="button"
                  onClick={(e) => e.stopPropagation()}
                  className="grid size-6 place-items-center rounded-md text-gray-400 hover:bg-neutral-200 hover:text-gray-600 dark:hover:bg-neutral-700 dark:hover:text-gray-300"
                >
                  <MoreVertical className="size-3.5" />
                </span>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-36 p-1">
                <div className="flex flex-col">
                  {onEdit && (
                    <button
                      onClick={onEdit}
                      className="flex items-center gap-x-2 rounded-md px-2.5 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-neutral-700"
                    >
                      <Pencil className="size-3.5 text-gray-500" />
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={onDelete}
                      className="flex items-center gap-x-2 rounded-md px-2.5 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </button>
                  )}
                </div>
              </PopoverContent>
            </Popover>
          )}
          <ChevronDown className={cn("size-4 text-gray-400 transition-transform", open && "rotate-180")} />
        </div>
      </button>
      {open && (
        <div
          ref={setNodeRef}
          data-slot="kanban-list-section-body"
          className={cn(
            "flex min-h-12 flex-col gap-y-2 p-3 transition-colors",
            isOver && "bg-primary-50/50 dark:bg-primary-950/30",
          )}
        >
          <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
            {items.length > 0 ? (
              items.map((item) => (
                <DraggableRow key={item.id} id={item.id}>
                  {renderCard(item)}
                </DraggableRow>
              ))
            ) : (
              <div className="grid min-h-12 place-items-center rounded-lg border border-dashed border-neutral-300 dark:border-neutral-600">
                <p className="text-sm text-neutral-400 dark:text-neutral-500">No items</p>
              </div>
            )}
          </SortableContext>
        </div>
      )}
    </div>
  );
}

export function KanbanList<T extends KanbanItemBase>({
  items,
  columns,
  renderCard,
  onDragEnd: onDragEndProp,
  onColumnEdit,
  onColumnDelete,
  className,
}: KanbanListProps<T>) {
  const [activeItem, setActiveItem] = useState<T | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const itemsByStatus = useMemo(() => {
    const grouped: Record<string, T[]> = {};
    for (const col of columns) {
      grouped[col.id] = [];
    }
    for (const item of items) {
      if (grouped[item.status]) {
        grouped[item.status].push(item);
      }
    }
    return grouped;
  }, [items, columns]);

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const item = items.find((i) => i.id === event.active.id);
      setActiveItem(item ?? null);
    },
    [items],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveItem(null);

      const { active, over } = event;
      if (!over || !onDragEndProp) return;

      const activeId = active.id as string;
      const overId = over.id as string;

      const draggedItem = items.find((item) => item.id === activeId);
      if (!draggedItem) return;

      const fromStatus = draggedItem.status;

      let toStatus: string;
      let toIndex: number;

      const isOverColumn = columns.some((col) => col.id === overId);
      if (isOverColumn) {
        toStatus = overId;
        toIndex = itemsByStatus[overId]?.length ?? 0;
      } else {
        const overItem = items.find((item) => item.id === overId);
        if (!overItem) return;
        toStatus = overItem.status;
        toIndex = (itemsByStatus[toStatus] ?? []).findIndex((i) => i.id === overId);
      }

      const fromIndex = (itemsByStatus[fromStatus] ?? []).findIndex((i) => i.id === activeId);

      if (fromStatus === toStatus && fromIndex === toIndex) return;

      onDragEndProp({ item: draggedItem, fromStatus, toStatus, fromIndex, toIndex });
    },
    [items, columns, itemsByStatus, onDragEndProp],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div data-slot="kanban-list" className={cn("flex flex-col gap-y-3", className)}>
        {columns.map((column) => (
          <AccordionSection
            key={column.id}
            config={column}
            items={itemsByStatus[column.id] ?? []}
            renderCard={renderCard}
            onEdit={onColumnEdit ? () => onColumnEdit(column.id) : undefined}
            onDelete={onColumnDelete ? () => onColumnDelete(column.id) : undefined}
          />
        ))}
      </div>
      <DragOverlay>
        {activeItem ? (
          <div
            data-slot="kanban-list-row-overlay"
            className="flex items-center gap-x-3 rounded-lg border bg-white p-3 shadow-xl dark:border-neutral-700 dark:bg-neutral-800"
          >
            <GripVertical className="size-4 text-gray-300" />
            <div className="min-w-0 flex-1">{renderCard(activeItem)}</div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
