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
      onClick={onClick}
      className={`relative cursor-pointer ${isDragging ? "opacity-30 z-50" : ""}`}
    >
      <PersonTile
        id={id}
        name={name}
        taskCount={taskCount}
        onClick={onClick}
      />
    </div>
  );
}
