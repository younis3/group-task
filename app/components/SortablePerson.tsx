"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import PersonTile from "./PersonTile";

interface Props {
  id: string;
  name: string;
  taskCount: number;
  onClick: () => void;
}

export default function SortablePerson({ id, name, taskCount, onClick }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
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
      className={`relative ${isDragging ? "opacity-30 z-50" : ""}`}
    >
      {/* Drag activator overlay — tap opens modal, long-press drags */}
      <div
        ref={setActivatorNodeRef}
        {...listeners}
        onClick={onClick}
        className="absolute inset-0 z-10 cursor-pointer"
        style={{ touchAction: "none" }}
      />
      <PersonTile
        id={id}
        name={name}
        taskCount={taskCount}
        onClick={onClick}
      />
    </div>
  );
}
