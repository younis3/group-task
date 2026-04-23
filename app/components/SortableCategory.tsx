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
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState(item.name);
  const renameInputRef = useRef<HTMLInputElement>(null);

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
    if (renameOpen) {
      renameInputRef.current?.focus();
      renameInputRef.current?.select();
    }
  }, [renameOpen]);

  function commitRename() {
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== item.name) {
      onRename(item.id, trimmed);
    }
    setRenameOpen(false);
  }

  return (
    <>
      <div
        ref={setNodeRef}
        style={style}
        {...attributes}
        {...listeners}
        className={`
          group flex items-center gap-2 select-none cursor-grab active:cursor-grabbing
          ${isDragging ? "opacity-30" : ""}
        `}
      >
        {/* Drag dots — visual hint */}
        <div className="shrink-0 text-gray-300 p-1 -m-1">
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <circle cx="3" cy="2" r="1" /><circle cx="7" cy="2" r="1" />
            <circle cx="3" cy="5" r="1" /><circle cx="7" cy="5" r="1" />
            <circle cx="3" cy="8" r="1" /><circle cx="7" cy="8" r="1" />
          </svg>
        </div>

        {/* Divider line + label */}
        <div className="flex flex-1 items-center gap-2 min-w-0">
          <div className="h-px flex-1 bg-gray-200" />

          <button
            onClick={(e) => {
              e.stopPropagation();
              setRenameValue(item.name);
              setRenameOpen(true);
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="shrink-0 rounded-full bg-gray-100 px-3 py-0.5
              text-[11px] font-semibold text-gray-500 transition-colors
              hover:bg-gray-200 hover:text-gray-700 cursor-pointer"
          >
            {item.name}
          </button>

          <div className="h-px flex-1 bg-gray-200" />
        </div>
      </div>

      {/* Rename modal */}
      {renameOpen && (
        <div
          onClick={() => setRenameOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          style={{ animation: "fadeIn 150ms ease-out", height: "100dvh" }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative mx-6 w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl"
            style={{ animation: "slideUp 200ms ease-out" }}
          >
            <h2 className="mb-4 text-center text-base font-bold text-gray-900">تعديل التصنيف</h2>
            <form onSubmit={(e) => { e.preventDefault(); commitRename(); }} className="space-y-3">
              <input
                ref={renameInputRef}
                id={`cat-rename-${item.id}`}
                name={`cat-rename-${item.id}`}
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onFocus={(e) => { setTimeout(() => e.target.scrollIntoView({ behavior: "smooth", block: "center" }), 300); }}
                placeholder="اسم التصنيف..."
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm
                  text-gray-900 placeholder:text-gray-300 outline-none transition-colors
                  focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={!renameValue.trim()}
                  className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white
                    transition-all active:scale-[0.97] disabled:opacity-20 disabled:cursor-not-allowed"
                >
                  حفظ
                </button>
                <button
                  type="button"
                  onClick={() => setRenameOpen(false)}
                  className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium
                    text-gray-500 transition-all active:scale-[0.97] hover:bg-gray-50"
                >
                  إلغاء
                </button>
              </div>
            </form>
            <button
              onClick={() => { setRenameOpen(false); onRemove(item.id); }}
              className="mt-3 w-full rounded-xl border border-red-100 py-2.5 text-[12px] font-medium
                text-red-400 transition-colors hover:bg-red-50 hover:text-red-500 active:bg-red-50"
            >
              حذف التصنيف
            </button>
          </div>
        </div>
      )}
    </>
  );
}
