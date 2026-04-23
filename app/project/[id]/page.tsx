"use client";

import { use, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useLocalStorage } from "../../hooks/useLocalStorage";
import GroupTaskApp from "../../components/GroupTaskApp";
import type { AppStore, ProjectData } from "../../types";

const DEFAULT_STORE: AppStore = { projects: [] };

export default function ProjectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [store, setStore, hydrated] = useLocalStorage<AppStore>("grouptask-store", DEFAULT_STORE);

  const project = store.projects.find((p) => p.id === id);

  const handleUpdate = useCallback((data: ProjectData) => {
    setStore((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, data } : p)),
    }));
  }, [id, setStore]);

  if (!hydrated) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-600" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-[#f8f9fb]">
        <p className="text-lg font-semibold text-gray-600">المشروع غير موجود</p>
        <button
          onClick={() => router.push("/")}
          className="rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-gray-800"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <GroupTaskApp
      projectName={project.name}
      data={project.data}
      onUpdate={handleUpdate}
    />
  );
}
