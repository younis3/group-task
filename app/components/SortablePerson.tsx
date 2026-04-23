"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PersonTile from "./PersonTile";

interface Props {
  id: string;
  name: string;
  taskCount: number;
  onClick: () => void;
  onRemove: () => void;
}

export default function SortablePerson({ id, name, taskCount, onClick, onRemove }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id,
    data: { type: "person" },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`relative group ${isDragging ? "opacity-30 z-50" : ""}`}
    >
      <PersonTile
        id={id}
        name={name}
        taskCount={taskCount}
        onClick={onClick}
      />
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        onPointerDown={(e) => e.stopPropagation()}
        className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center
          rounded-full bg-white text-gray-300 shadow opacity-0 group-hover:opacity-100
          transition-all hover:text-red-400 z-10"
        aria-label="حذف"
      >
        <svg width="7" height="7" viewBox="0 0 10 10" fill="none">
          <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}
