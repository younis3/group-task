"use client";

import { useState, useRef, useEffect } from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Task } from "../types";

interface Props {
  item: Task;
  onRename: (id: string, name: string) => void;
  onRemove: (id: string) => void;
}

export default function SortableCategory({ item, onRename, onRemove }: Props) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(item.name);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: item.id,
    data: { type: "task", task: item },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function commitEdit() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== item.name) {
      onRename(item.id, trimmed);
    } else {
      setEditValue(item.name);
    }
    setEditing(false);
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`
        group flex items-center gap-2 select-none
        ${isDragging ? "opacity-30" : ""}
      `}
    >
      {/* Drag handle */}
      <div className="shrink-0 text-gray-300 cursor-grab active:cursor-grabbing">
        <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
          <circle cx="3" cy="2" r="1" /><circle cx="7" cy="2" r="1" />
          <circle cx="3" cy="5" r="1" /><circle cx="7" cy="5" r="1" />
          <circle cx="3" cy="8" r="1" /><circle cx="7" cy="8" r="1" />
        </svg>
      </div>

      {/* Divider line + label */}
      <div className="flex flex-1 items-center gap-2 min-w-0">
        <div className="h-px flex-1 bg-gray-200" />

        {editing ? (
          <input
            ref={inputRef}
            id={`cat-edit-${item.id}`}
            name={`cat-edit-${item.id}`}
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={commitEdit}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitEdit();
              if (e.key === "Escape") { setEditValue(item.name); setEditing(false); }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="shrink-0 max-w-[140px] rounded-md border border-blue-300 bg-white px-2 py-0.5
              text-[11px] font-semibold text-gray-600 outline-none text-center"
          />
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); setEditing(true); }}
            onPointerDown={(e) => e.stopPropagation()}
            className="shrink-0 rounded-full bg-gray-100 px-3 py-0.5
              text-[11px] font-semibold text-gray-500 transition-colors
              hover:bg-gray-200 hover:text-gray-700 cursor-pointer"
          >
            {item.name}
          </button>
        )}

        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* Remove */}
      <button
        onClick={(e) => { e.stopPropagation(); onRemove(item.id); }}
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
