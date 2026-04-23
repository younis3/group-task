export interface Task {
  id: string;
  name: string;
  assignedTo: string | null;
  checked: boolean;
  isCategory?: boolean;
}

export interface Person {
  id: string;
  name: string;
}

export type SortMode = "custom" | "alpha" | "person";

export interface ProjectData {
  tasks: Task[];
  people: Person[];
  sortMode: SortMode;
}

export interface Project {
  id: string;
  name: string;
  status: "active" | "archived";
  createdAt: number;
  data: ProjectData;
}

export interface AppStore {
  projects: Project[];
}
