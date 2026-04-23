"use client";

import { useEffect, useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import type { Task, Person } from "../types";

interface Props {
  person: Person;
  tasks: Task[];
  onClose: () => void;
  onUnassign: (taskId: string) => void;
  onToggleCheck: (taskId: string) => void;
  onRemovePerson: () => void;
}

export default function PersonModal({ person, tasks, onClose, onUnassign, onToggleCheck, onRemovePerson }: Props) {
  const backdropRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const assignedTasks = tasks.filter((t) => t.assignedTo === person.id && !t.isCategory);

  const handleScreenshot = useCallback(async () => {
    if (!backdropRef.current || !cardRef.current) return;
    try {
      const ratio = 2;
      const padding = 20;
      const cardRect = cardRef.current.getBoundingClientRect();
      const screenW = window.innerWidth;

      const cropY = Math.max(0, cardRect.top - padding);
      const cropH = Math.min(window.innerHeight - cropY, cardRect.height + padding * 2);

      const fullDataUrl = await toPng(backdropRef.current, {
        pixelRatio: ratio,
        width: screenW,
        height: window.innerHeight,
      });

      const img = new Image();
      img.src = fullDataUrl;
      await new Promise<void>((resolve) => { img.onload = () => resolve(); });

      const canvas = document.createElement("canvas");
      canvas.width = screenW * ratio;
      canvas.height = cropH * ratio;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(
        img,
        0, cropY * ratio,
        screenW * ratio, cropH * ratio,
        0, 0,
        screenW * ratio, cropH * ratio,
      );

      const link = document.createElement("a");
      link.download = `${person.name}-tasks.png`;
      link.href = canvas.toDataURL("image/png");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Screenshot failed:", err);
    }
  }, [person.name]);

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      style={{ animation: "fadeIn 150ms ease-out", height: "100dvh" }}
    >
      <div
        ref={cardRef}
        className="relative mx-4 w-full max-w-md rounded-3xl bg-white
          max-h-[85dvh] flex flex-col shadow-2xl overflow-hidden"
        style={{ animation: "slideUp 200ms ease-out" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-3 border-b border-gray-100">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl
            bg-gradient-to-br from-blue-400 to-violet-500 text-sm font-bold text-white shadow-sm">
            {person.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold text-gray-900 truncate">{person.name}</h2>
            <p className="text-[11px] text-gray-400">
              {assignedTasks.length === 0 ? "لا توجد مهام" : `${assignedTasks.length} مهام`}
            </p>
          </div>

          {/* Screenshot button */}
          <button
            onClick={handleScreenshot}
            className="flex h-8 w-8 items-center justify-center rounded-full
              bg-gray-100 text-gray-400 transition-colors hover:bg-blue-50 hover:text-blue-500"
            aria-label="تصوير"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          </button>

          {/* Close button */}
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full
              bg-gray-100 text-gray-400 transition-colors hover:bg-gray-200 hover:text-gray-600"
            aria-label="إغلاق"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 3L11 11M11 3L3 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Task list */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {assignedTasks.length > 0 ? (
            <div className="space-y-1.5">
              {assignedTasks.map((task) => (
                <div
                  key={task.id}
                  className="group flex items-center gap-2.5 rounded-xl bg-gray-50 px-3 py-2.5"
                >
                  {/* Checkmark */}
                  <button
                    onClick={() => onToggleCheck(task.id)}
                    className={`
                      flex h-5 w-5 shrink-0 items-center justify-center rounded-md transition-colors duration-150
                      ${task.checked
                        ? "bg-emerald-500 text-white"
                        : "border-[1.5px] border-gray-300 hover:border-emerald-400 hover:bg-emerald-50 cursor-pointer"
                      }
                    `}
                  >
                    {task.checked && (
                      <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                        <path d="M3 7.5L5.5 10L11 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>

                  <span className="flex-1 text-[13px] font-medium text-gray-700">{task.name}</span>

                  <button
                    onClick={() => onUnassign(task.id)}
                    className="flex h-6 w-6 items-center justify-center
                      rounded-md text-gray-300 transition-all hover:bg-red-50 hover:text-red-400"
                    aria-label="إلغاء"
                  >
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path d="M2 2L8 8M8 2L2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-[13px] text-gray-300">
              لا توجد مهام مسندة لهذا المشارك
            </div>
          )}

          {/* Delete person */}
          <button
            onClick={onRemovePerson}
            className="mt-4 w-full rounded-xl border border-red-100 py-2.5 text-[12px] font-medium
              text-red-400 transition-colors hover:bg-red-50 hover:text-red-500 active:bg-red-50"
          >
            حذف المشارك
          </button>
        </div>
      </div>
    </div>
  );
}
