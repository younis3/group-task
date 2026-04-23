"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "./hooks/useLocalStorage";
import type { AppStore, Project } from "./types";

const DEFAULT_STORE: AppStore = { projects: [] };

export default function Home() {
  const router = useRouter();
  const [store, setStore, hydrated] = useLocalStorage<AppStore>("grouptask-store", DEFAULT_STORE);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [showArchived, setShowArchived] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Migrate old single-project localStorage to new multi-project format
  useEffect(() => {
    if (!hydrated) return;
    try {
      const oldData = localStorage.getItem("grouptask-state");
      if (!oldData) return;
      const parsed = JSON.parse(oldData);
      if (parsed && parsed.tasks && parsed.people) {
        const migrated: Project = {
          id: `proj-migrated-${Date.now()}`,
          name: "المشروع السابق",
          status: "active",
          createdAt: Date.now(),
          data: {
            tasks: parsed.tasks,
            people: parsed.people,
            sortMode: parsed.sortMode || "custom",
          },
        };
        setStore((prev) => ({
          ...prev,
          projects: [migrated, ...prev.projects],
        }));
        localStorage.removeItem("grouptask-state");
      }
    } catch {
      // ignore migration errors
    }
  }, [hydrated, setStore]);

  useEffect(() => {
    if (showCreate) inputRef.current?.focus();
  }, [showCreate]);

  const activeProjects = store.projects.filter((p) => p.status === "active");
  const archivedProjects = store.projects.filter((p) => p.status === "archived");

  const createProject = useCallback(() => {
    const name = newName.trim();
    if (!name) return;
    const id = `proj-${Date.now()}`;
    const project: Project = {
      id,
      name,
      status: "active",
      createdAt: Date.now(),
      data: { tasks: [], people: [], sortMode: "custom" },
    };
    setStore((prev) => ({ ...prev, projects: [project, ...prev.projects] }));
    setNewName("");
    setShowCreate(false);
    router.push(`/project/${id}`);
  }, [newName, setStore, router]);

  const archiveProject = useCallback((projectId: string) => {
    setStore((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId ? { ...p, status: "archived" as const } : p
      ),
    }));
  }, [setStore]);

  const restoreProject = useCallback((projectId: string) => {
    setStore((prev) => ({
      ...prev,
      projects: prev.projects.map((p) =>
        p.id === projectId ? { ...p, status: "active" as const } : p
      ),
    }));
  }, [setStore]);

  const deleteProject = useCallback((projectId: string) => {
    setStore((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== projectId),
    }));
  }, [setStore]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8f9fb]">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-[#f8f9fb]">
      {/* Header */}
      <header className="shrink-0 border-b border-gray-100 bg-white/80 backdrop-blur-lg px-4 py-4">
        <h1 className="text-[17px] font-bold text-gray-900 tracking-tight text-center">GroupTask</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-lg px-4 py-6 space-y-6">

          {/* Create new project */}
          {!showCreate ? (
            <button
              onClick={() => setShowCreate(true)}
              className="w-full rounded-2xl border-2 border-dashed border-gray-200 bg-white
                px-5 py-8 text-center transition-all duration-200
                hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm active:scale-[0.98] cursor-pointer"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gray-900 text-white shadow-sm">
                  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
                    <path d="M11 5v12M5 11h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                  </svg>
                </div>
                <div>
                  <p className="text-[15px] font-semibold text-gray-800">إنشاء مشروع جديد</p>
                  <p className="text-[12px] text-gray-400 mt-0.5">مشروع، مهمة، رحلة...</p>
                </div>
              </div>
            </button>
          ) : (
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 space-y-4">
              <h2 className="text-[14px] font-bold text-gray-800">مشروع جديد</h2>
              <form onSubmit={(e) => { e.preventDefault(); createProject(); }} className="space-y-3">
                <input
                  ref={inputRef}
                  id="project-name"
                  name="project-name"
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="اسم المشروع أو الرحلة..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3
                    text-[14px] text-gray-900 placeholder:text-gray-300 outline-none
                    transition-colors focus:border-blue-300 focus:ring-2 focus:ring-blue-100"
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={!newName.trim()}
                    className="flex-1 rounded-xl bg-gray-900 px-4 py-2.5 text-[13px] font-semibold
                      text-white transition-all hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    إنشاء
                  </button>
                  <button
                    type="button"
                    onClick={() => { setShowCreate(false); setNewName(""); }}
                    className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-[13px]
                      font-medium text-gray-500 transition-colors hover:bg-gray-50"
                  >
                    إلغاء
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Active projects */}
          {activeProjects.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-[12px] font-bold text-gray-400 tracking-wide px-1">المشاريع الحالية</h2>
              <div className="space-y-2">
                {activeProjects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    onClick={() => router.push(`/project/${project.id}`)}
                    onArchive={() => archiveProject(project.id)}
                    onDelete={() => deleteProject(project.id)}
                    archiveLabel="إخفاء"
                  />
                ))}
              </div>
            </section>
          )}

          {/* Empty state */}
          {activeProjects.length === 0 && !showCreate && (
            <div className="text-center py-8">
              <p className="text-[13px] text-gray-300">لا توجد مشاريع حالية</p>
            </div>
          )}

          {/* Archived projects */}
          {archivedProjects.length > 0 && (
            <section className="space-y-2">
              <button
                onClick={() => setShowArchived(!showArchived)}
                className="flex w-full items-center gap-2 px-1 py-1 cursor-pointer"
              >
                <svg
                  width="12" height="12" viewBox="0 0 12 12" fill="none"
                  className={`text-gray-400 transition-transform duration-200 ${showArchived ? "rotate-0" : "-rotate-90"}`}
                >
                  <path d="M3 4.5L6 7.5L9 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="text-[12px] font-bold text-gray-400 tracking-wide">
                  مشاريع سابقة ({archivedProjects.length})
                </span>
              </button>

              {showArchived && (
                <div className="space-y-2">
                  {archivedProjects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      onClick={() => router.push(`/project/${project.id}`)}
                      onArchive={() => restoreProject(project.id)}
                      onDelete={() => deleteProject(project.id)}
                      archiveLabel="استعادة"
                      dimmed
                    />
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  onClick,
  onArchive,
  onDelete,
  archiveLabel,
  dimmed,
}: {
  project: Project;
  onClick: () => void;
  onArchive: () => void;
  onDelete: () => void;
  archiveLabel: string;
  dimmed?: boolean;
}) {
  const realTasks = project.data.tasks.filter((t) => !t.isCategory);
  const taskCount = realTasks.length;
  const personCount = project.data.people.length;
  const checkedCount = realTasks.filter((t) => t.checked).length;
  const assignedCount = realTasks.filter((t) => t.assignedTo).length;
  const date = new Date(project.createdAt);
  const dateStr = date.toLocaleDateString("ar-SA", { day: "numeric", month: "short" });

  return (
    <div
      className={`group relative rounded-2xl bg-white border border-gray-100 shadow-sm
        transition-all duration-200 hover:shadow-md hover:border-gray-200 cursor-pointer
        ${dimmed ? "opacity-60" : ""}`}
    >
      <div onClick={onClick} className="px-4 py-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-bold text-gray-800 truncate">{project.name}</h3>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-[11px] text-gray-400">{taskCount} مهمة</span>
              <span className="text-[11px] text-gray-400">{personCount} مشارك</span>
              {taskCount > 0 && (
                <span className="text-[11px] text-gray-400">
                  {assignedCount}/{taskCount} موزعة
                  {checkedCount > 0 && ` · ${checkedCount} مكتملة`}
                </span>
              )}
            </div>
          </div>
          <span className="shrink-0 text-[10px] text-gray-300 mt-0.5">{dateStr}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex border-t border-gray-50">
        <button
          onClick={(e) => { e.stopPropagation(); onArchive(); }}
          className="flex-1 py-2 text-[11px] font-medium text-gray-400 transition-colors
            hover:bg-gray-50 hover:text-gray-600 rounded-bl-2xl"
        >
          {archiveLabel}
        </button>
        <div className="w-px bg-gray-50" />
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          className="flex-1 py-2 text-[11px] font-medium text-gray-400 transition-colors
            hover:bg-red-50 hover:text-red-500 rounded-br-2xl"
        >
          حذف
        </button>
      </div>
    </div>
  );
}
