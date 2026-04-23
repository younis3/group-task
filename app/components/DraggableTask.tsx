"use client";

import { useDraggable } from "@dnd-kit/core";
import type { Task } from "../types";

interface Props {
  task: Task;
  personName?: string;
  onRemove: (taskId: string) => void;
}

export default function DraggableTask({ task, personName, onRemove }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { task },
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`
        group flex items-center gap-2.5 rounded-xl border px-3 py-2.5
        transition-all duration-150 select-none
        ${isDragging
          ? "opacity-30 border-dashed border-gray-200 bg-gray-50"
          : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
        }
        ${!isDragging && task.assignedTo ? "border-emerald-100 bg-emerald-50/30" : ""}
      `}
    >
      {/* Checkbox */}
      <div
        className={`
          flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors duration-150
          ${task.assignedTo
            ? "bg-emerald-500 text-white"
            : "border-[1.5px] border-gray-200"
          }
        `}
      >
        {task.assignedTo && (
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>

      {/* Text */}
      <div className="flex flex-1 items-center gap-1.5 min-w-0">
        <span className={`text-[13px] font-medium leading-tight truncate ${task.assignedTo ? "text-gray-600" : "text-gray-900"}`}>
          {task.name}
        </span>
        {personName && (
          <span className="shrink-0 text-[11px] font-medium text-emerald-600">
            — {personName}
          </span>
        )}
      </div>

      {/* Remove */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(task.id); }}
        onPointerDown={(e) => e.stopPropagation()}
        className="opacity-0 group-hover:opacity-100 shrink-0 flex h-5 w-5 items-center justify-center
          rounded-md text-gray-300 transition-all hover:bg-red-50 hover:text-red-400"
        aria-label="حذف"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
