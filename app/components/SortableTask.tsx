"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types";

interface Props {
  task: Task;
  personName?: string;
  personId?: string;
  onRemove: (taskId: string) => void;
  onToggleCheck: (taskId: string) => void;
  sortable: boolean;
}

const PILL_COLORS = [
  { bg: "bg-blue-100", text: "text-blue-600" },
  { bg: "bg-violet-100", text: "text-violet-600" },
  { bg: "bg-rose-100", text: "text-rose-600" },
  { bg: "bg-amber-100", text: "text-amber-700" },
  { bg: "bg-emerald-100", text: "text-emerald-600" },
  { bg: "bg-cyan-100", text: "text-cyan-600" },
  { bg: "bg-pink-100", text: "text-pink-600" },
  { bg: "bg-indigo-100", text: "text-indigo-600" },
  { bg: "bg-teal-100", text: "text-teal-600" },
  { bg: "bg-orange-100", text: "text-orange-600" },
];

function getPillColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return PILL_COLORS[Math.abs(hash) % PILL_COLORS.length];
}

export default function SortableTask({ task, personName, personId, onRemove, onToggleCheck, sortable }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: { type: "task", task },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isAssigned = !!task.assignedTo;
  const isChecked = task.checked;
  const pill = personId ? getPillColor(personId) : null;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={`
        group flex items-center gap-2.5 rounded-xl border px-3 py-2.5
        transition-colors duration-150 select-none
        ${isDragging
          ? "opacity-30 border-dashed border-gray-200 bg-gray-50 z-50"
          : isAssigned
            ? "bg-gray-50/60 border-gray-100 hover:border-gray-200"
            : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-sm"
        }
      `}
    >
      {/* Drag handle */}
      <div
        ref={setActivatorNodeRef}
        {...listeners}
        className={`shrink-0 cursor-grab active:cursor-grabbing p-1 -m-1
          ${sortable ? "text-gray-300" : "text-gray-200"}`}
        style={{ touchAction: "none" }}
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <circle cx="3" cy="2" r="1" /><circle cx="7" cy="2" r="1" />
          <circle cx="3" cy="5" r="1" /><circle cx="7" cy="5" r="1" />
          <circle cx="3" cy="8" r="1" /><circle cx="7" cy="8" r="1" />
        </svg>
      </div>

      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          if (isAssigned) onToggleCheck(task.id);
        }}
        onPointerDown={(e) => e.stopPropagation()}
        disabled={!isAssigned}
        className={`
          flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors duration-150
          ${isChecked
            ? "bg-emerald-500 text-white"
            : isAssigned
              ? "border-[1.5px] border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer"
              : "border-[1.5px] border-gray-200"
          }
        `}
      >
        {isChecked && (
          <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
            <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {/* Task name */}
      <span className="flex-1 text-[15px] font-medium leading-tight truncate text-gray-900 min-w-0">
        {task.name}
      </span>

      {/* Person pill badge */}
      {personName && pill && (
        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${pill.bg} ${pill.text}`}>
          {personName}
        </span>
      )}

      {/* Remove */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(task.id); }}
        onPointerDown={(e) => e.stopPropagation()}
        className="shrink-0 flex h-5 w-5 items-center justify-center
          rounded-md text-gray-300 transition-all hover:bg-red-50 hover:text-red-400 active:bg-red-50 active:text-red-400"
        aria-label="حذف"
      >
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
