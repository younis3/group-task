"use client";

import { useState, useRef } from "react";

interface Props {
  placeholder: string;
  onAdd: (name: string) => void;
}

export default function AddItemInput({ placeholder, onAdd }: Props) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setValue("");
    inputRef.current?.focus();
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-1.5">
      <input
        ref={inputRef}
        id="add-item"
        name="add-item"
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="flex-1 min-w-0 rounded-lg border border-gray-200 bg-gray-50/50 px-2.5 py-2 text-[13px]
          text-gray-900 placeholder:text-gray-300 outline-none transition-colors
          focus:border-blue-300 focus:bg-white focus:ring-1 focus:ring-blue-100"
      />
      <button
        type="submit"
        disabled={!value.trim()}
        className="shrink-0 rounded-lg bg-gray-900 px-3 py-2 text-[12px] font-semibold text-white
          transition-all active:scale-95 disabled:opacity-20 disabled:cursor-not-allowed"
      >
        +
      </button>
    </form>
  );
}
