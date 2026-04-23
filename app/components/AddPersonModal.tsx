"use client";

import { useEffect, useRef, useState } from "react";
import { useKeyboardAvoid } from "../hooks/useKeyboardAvoid";

interface Props {
  onAdd: (name: string) => void;
  onClose: () => void;
}

export default function AddPersonModal({ onAdd, onClose }: Props) {
  const [value, setValue] = useState("");
  const backdropRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const kbOffset = useKeyboardAvoid();

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
  }

  return (
    <div
      ref={backdropRef}
      onClick={(e) => { if (e.target === backdropRef.current) onClose(); }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      style={{ animation: "fadeIn 150ms ease-out", height: "100dvh" }}
    >
      <div
        className="relative mx-6 w-full max-w-xs rounded-2xl bg-white p-6 shadow-2xl transition-transform duration-200"
        style={{ animation: "slideUp 200ms ease-out", transform: kbOffset ? `translateY(-${kbOffset}px)` : undefined }}
      >
        <h2 className="mb-4 text-center text-base font-bold text-gray-900">إضافة مشارك</h2>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            ref={inputRef}
            id="add-person"
            name="add-person"
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="اسم المشارك..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 text-sm
              text-gray-900 placeholder:text-gray-300 outline-none transition-colors
              focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={!value.trim()}
              className="flex-1 rounded-xl bg-gray-900 py-2.5 text-sm font-semibold text-white
                transition-all active:scale-[0.97] disabled:opacity-20 disabled:cursor-not-allowed"
            >
              إضافة
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium
                text-gray-500 transition-all active:scale-[0.97] hover:bg-gray-50"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
