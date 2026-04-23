"use client";

import { useState, useCallback, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import type { DragStartEvent, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import type { ProjectData, SortMode } from "../types";
import SortableTask from "./SortableTask";
import SortableCategory from "./SortableCategory";
import SortablePerson from "./SortablePerson";
import PersonTile from "./PersonTile";
import PersonModal from "./PersonModal";
import AddPersonModal from "./AddPersonModal";
import AddItemInput from "./AddItemInput";
import AddCategoryModal from "./AddCategoryModal";
import Link from "next/link";

const SORT_OPTIONS: { value: SortMode; label: string }[] = [
  { value: "custom", label: "يدوي" },
  { value: "alpha", label: "أبجدي" },
  { value: "person", label: "بالمشارك" },
];

interface Props {
  projectName: string;
  data: ProjectData;
  onUpdate: (data: ProjectData) => void;
}

export default function GroupTaskApp({ projectName, data, onUpdate }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [modalPersonId, setModalPersonId] = useState<string | null>(null);
  const [showAddPerson, setShowAddPerson] = useState(false);
  const [showAddCategory, setShowAddCategory] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 10 } }),
  );

  const update = useCallback((updater: (prev: ProjectData) => ProjectData) => {
    onUpdate(updater(data));
  }, [data, onUpdate]);

  const addTask = useCallback((name: string) => {
    update((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { id: `t-${Date.now()}`, name, assignedTo: null, checked: false }],
    }));
  }, [update]);

  const removeTask = useCallback((taskId: string) => {
    update((prev) => ({
      ...prev,
      tasks: prev.tasks.filter((t) => t.id !== taskId),
    }));
  }, [update]);

  const addPerson = useCallback((name: string) => {
    update((prev) => ({
      ...prev,
      people: [...prev.people, { id: `p-${Date.now()}`, name }],
    }));
    setShowAddPerson(false);
  }, [update]);

  const removePerson = useCallback((personId: string) => {
    update((prev) => ({
      ...prev,
      people: prev.people.filter((p) => p.id !== personId),
      tasks: prev.tasks.map((t) => (t.assignedTo === personId ? { ...t, assignedTo: null, checked: false } : t)),
    }));
  }, [update]);

  const assignTask = useCallback((taskId: string, personId: string) => {
    update((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, assignedTo: personId } : t)),
    }));
  }, [update]);

  const unassignTask = useCallback((taskId: string) => {
    update((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, assignedTo: null, checked: false } : t)),
    }));
  }, [update]);

  const toggleCheck = useCallback((taskId: string) => {
    update((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === taskId ? { ...t, checked: !t.checked } : t)),
    }));
  }, [update]);

  const setSortMode = useCallback((mode: SortMode) => {
    update((prev) => ({ ...prev, sortMode: mode }));
  }, [update]);

  const addCategory = useCallback((name: string) => {
    update((prev) => ({
      ...prev,
      tasks: [...prev.tasks, { id: `cat-${Date.now()}`, name, assignedTo: null, checked: false, isCategory: true }],
    }));
    setShowAddCategory(false);
  }, [update]);

  const renameCategory = useCallback((id: string, name: string) => {
    update((prev) => ({
      ...prev,
      tasks: prev.tasks.map((t) => (t.id === id ? { ...t, name } : t)),
    }));
  }, [update]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
  }

  function handleDragEnd(event: DragEndEvent) {
    setActiveId(null);
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    if (activeType === "task" && overType === "person") {
      const draggedItem = data.tasks.find((t) => t.id === active.id);
      if (draggedItem?.isCategory) return;
      assignTask(active.id as string, over.id as string);
      return;
    }

    if (activeType === "task" && overType === "task" && data.sortMode === "custom") {
      update((prev) => {
        const oldIdx = prev.tasks.findIndex((t) => t.id === active.id);
        const newIdx = prev.tasks.findIndex((t) => t.id === over.id);
        if (oldIdx === -1 || newIdx === -1) return prev;
        return { ...prev, tasks: arrayMove(prev.tasks, oldIdx, newIdx) };
      });
      return;
    }

    if (activeType === "person" && overType === "person") {
      update((prev) => {
        const oldIdx = prev.people.findIndex((p) => p.id === active.id);
        const newIdx = prev.people.findIndex((p) => p.id === over.id);
        if (oldIdx === -1 || newIdx === -1) return prev;
        return { ...prev, people: arrayMove(prev.people, oldIdx, newIdx) };
      });
      return;
    }
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  function getPersonName(personId: string | null): string | undefined {
    if (!personId) return undefined;
    return data.people.find((p) => p.id === personId)?.name;
  }

  function getTaskCountForPerson(personId: string): number {
    return data.tasks.filter((t) => t.assignedTo === personId && !t.isCategory).length;
  }

  const sortedTasks = useMemo(() => {
    switch (data.sortMode) {
      case "alpha":
        return [...data.tasks].filter((t) => !t.isCategory).sort((a, b) => a.name.localeCompare(b.name, "ar"));
      case "person": {
        const personOrder = new Map(data.people.map((p, i) => [p.id, i]));
        return [...data.tasks].filter((t) => !t.isCategory).sort((a, b) => {
          const aIdx = a.assignedTo ? (personOrder.get(a.assignedTo) ?? 999) : 1000;
          const bIdx = b.assignedTo ? (personOrder.get(b.assignedTo) ?? 999) : 1000;
          if (aIdx !== bIdx) return aIdx - bIdx;
          return 0;
        });
      }
      default:
        return [...data.tasks];
    }
  }, [data.tasks, data.sortMode, data.people]);

  const taskIds = useMemo(() => sortedTasks.map((t) => t.id), [sortedTasks]);
  const personIds = useMemo(() => data.people.map((p) => p.id), [data.people]);

  const activeItem = activeId ? data.tasks.find((t) => t.id === activeId) : null;
  const activeTask = activeItem && !activeItem.isCategory ? activeItem : null;
  const activeCategory = activeItem?.isCategory ? activeItem : null;
  const activePerson = activeId ? data.people.find((p) => p.id === activeId) : null;
  const modalPerson = modalPersonId ? data.people.find((p) => p.id === modalPersonId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <div className="flex h-screen flex-col bg-[#f8f9fb] overflow-hidden">
        {/* App bar */}
        <header className="shrink-0 border-b border-gray-100 bg-white/80 backdrop-blur-lg px-4 py-3">
          <div className="flex items-center justify-center gap-2">
            <Link href="/" className="absolute right-4 flex h-7 w-7 items-center justify-center rounded-lg
              text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <div className="text-center">
              <h1 className="text-[15px] font-bold text-gray-900 tracking-tight">GroupTask</h1>
              <p className="text-[11px] font-medium text-gray-400 -mt-0.5">{projectName}</p>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* RIGHT (first in RTL): Task list */}
          <div className="flex flex-1 flex-col min-w-0 min-h-0">
            <div className="shrink-0 border-b border-gray-100 bg-white px-3 py-2.5 space-y-2">
              <div className="flex items-center gap-1.5">
                <div className="flex-1 min-w-0">
                  <AddItemInput placeholder="أضف مهمة..." onAdd={addTask} />
                </div>
                {data.sortMode === "custom" && (
                  <button
                    onClick={() => setShowAddCategory(true)}
                    className="shrink-0 flex h-[36px] items-center gap-1 rounded-xl border border-gray-200 bg-gray-50
                      px-2.5 text-[11px] font-medium text-gray-400 transition-colors
                      hover:bg-gray-100 hover:text-gray-600 cursor-pointer"
                    title="إضافة تصنيف"
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <path d="M2 6h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                    <span>تصنيف</span>
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0 text-[11px] font-medium text-gray-400">الترتيب:</span>
                <div className="relative flex-1">
                  <select
                    value={data.sortMode}
                    onChange={(e) => setSortMode(e.target.value as SortMode)}
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-2 py-1.5 pe-7
                      text-[12px] font-medium text-gray-500 outline-none
                      transition-colors focus:border-blue-300 focus:ring-1 focus:ring-blue-100
                      appearance-none cursor-pointer"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <svg
                    className="pointer-events-none absolute left-2 top-1/2 -translate-y-1/2 text-gray-400"
                    width="12" height="12" viewBox="0 0 12 12" fill="none"
                  >
                    <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-2.5">
              {sortedTasks.length === 0 ? (
                <div className="flex h-full items-center justify-center">
                  <p className="text-[13px] text-gray-300">أضف مهمة للبدء</p>
                </div>
              ) : (
                <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
                  <div className="space-y-1.5">
                    {sortedTasks.map((item) =>
                      item.isCategory ? (
                        <SortableCategory
                          key={item.id}
                          item={item}
                          onRename={renameCategory}
                          onRemove={removeTask}
                        />
                      ) : (
                        <SortableTask
                          key={item.id}
                          task={item}
                          personName={getPersonName(item.assignedTo)}
                          personId={item.assignedTo ?? undefined}
                          onRemove={removeTask}
                          onToggleCheck={toggleCheck}
                          sortable={data.sortMode === "custom"}
                        />
                      )
                    )}
                  </div>
                </SortableContext>
              )}
            </div>
          </div>

          {/* LEFT (second in RTL): Participants sidebar */}
          <div className="shrink-0 w-[88px] lg:w-[180px] border-s border-gray-100 bg-white flex flex-col min-h-0">
            <div className="shrink-0 px-2 pt-3 pb-2 border-b border-gray-50">
              <p className="text-[10px] font-bold text-gray-400 text-center tracking-wide">المشاركين</p>
            </div>

            <div className="flex-1 overflow-y-auto px-2.5 py-3">
              <SortableContext items={personIds} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5">
                  {data.people.map((person) => (
                    <SortablePerson
                      key={person.id}
                      id={person.id}
                      name={person.name}
                      taskCount={getTaskCountForPerson(person.id)}
                      onClick={() => setModalPersonId(person.id)}
                    />
                  ))}
                </div>
              </SortableContext>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2.5 mt-2.5">
                <button
                  onClick={() => setShowAddPerson(true)}
                  className="cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
                >
                  <div className="flex h-14 w-full items-center justify-center rounded-[14px]
                    border-2 border-dashed border-gray-200 bg-gray-50 transition-colors
                    hover:border-gray-300 hover:bg-gray-100">
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                      <path d="M9 4v10M4 9h10" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rounded-xl border border-blue-200 bg-white px-3 py-2.5 shadow-xl">
            <div className="flex items-center gap-2">
              <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md border-[1.5px] border-blue-300 bg-blue-50">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500" />
              </div>
              <span className="text-[13px] font-medium text-gray-900">{activeTask.name}</span>
            </div>
          </div>
        )}
        {activeCategory && (
          <div className="flex items-center gap-2 opacity-80">
            <div className="h-px flex-1 bg-gray-300" />
            <span className="shrink-0 rounded-full bg-gray-200 px-3 py-0.5 text-[11px] font-semibold text-gray-600">
              {activeCategory.name}
            </span>
            <div className="h-px flex-1 bg-gray-300" />
          </div>
        )}
        {activePerson && (
          <div className="opacity-80">
            <PersonTile
              id={activePerson.id}
              name={activePerson.name}
              taskCount={getTaskCountForPerson(activePerson.id)}
              onClick={() => {}}
            />
          </div>
        )}
      </DragOverlay>

      {modalPerson && (
        <PersonModal
          person={modalPerson}
          tasks={data.tasks}
          onClose={() => setModalPersonId(null)}
          onUnassign={unassignTask}
          onToggleCheck={toggleCheck}
          onRemovePerson={() => { removePerson(modalPerson.id); setModalPersonId(null); }}
        />
      )}

      {showAddPerson && (
        <AddPersonModal
          onAdd={addPerson}
          onClose={() => setShowAddPerson(false)}
        />
      )}

      {showAddCategory && (
        <AddCategoryModal
          onAdd={addCategory}
          onClose={() => setShowAddCategory(false)}
        />
      )}
    </DndContext>
  );
}
