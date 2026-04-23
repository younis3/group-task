"use client";

import { useDroppable } from "@dnd-kit/core";

interface Props {
  id: string;
  name: string;
  taskCount: number;
  onClick: () => void;
}

const TILE_COLORS = [
  "from-blue-400 to-blue-500",
  "from-violet-400 to-violet-500",
  "from-rose-400 to-rose-500",
  "from-amber-400 to-amber-500",
  "from-emerald-400 to-emerald-500",
  "from-cyan-400 to-cyan-500",
  "from-pink-400 to-pink-500",
  "from-indigo-400 to-indigo-500",
  "from-teal-400 to-teal-500",
  "from-orange-400 to-orange-500",
];

function getColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return TILE_COLORS[Math.abs(hash) % TILE_COLORS.length];
}

export default function PersonTile({ id, name, taskCount, onClick }: Props) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      className={`
        group relative w-full cursor-pointer transition-all duration-200
        ${isOver ? "scale-110" : "hover:scale-105 active:scale-95"}
      `}
    >
      <div
        className={`
          flex h-14 w-full items-center justify-center rounded-[14px] px-1 py-0.5
          bg-gradient-to-br text-white shadow-sm overflow-hidden
          transition-all duration-200
          ${getColor(id)}
          ${isOver ? "shadow-lg ring-2 ring-blue-400 ring-offset-2" : ""}
        `}
      >
        <span className="max-w-full text-center text-[12px] font-bold leading-tight drop-shadow-sm line-clamp-2 break-all">
          {name}
        </span>
      </div>

      {taskCount > 0 && (
        <span className="absolute -top-1 -left-1 flex h-[18px] min-w-[18px] items-center justify-center
          rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
          {taskCount}
        </span>
      )}
    </button>
  );
}
