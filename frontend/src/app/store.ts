// Shared types for TaskSplit app

export interface SubTask {
  id: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedMinutes: number;
  completed: boolean;
  parentTaskId: string;
  microSteps?: string[];
}

export interface Task {
  id: string;
  name: string;
  dueDate: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  subTasks: SubTask[];
  createdAt: string;
}

export interface FocusSession {
  id: string;
  subTaskId: string;
  subTaskName: string;
  duration: number;
  completedAt: string;
}

export const DIFFICULTY_COLORS = {
  Easy: { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
  Medium: { bg: '#FFF3E0', text: '#E65100', border: '#FFCC80' },
  Hard: { bg: '#FFEBEE', text: '#C62828', border: '#EF9A9A' },
}

export function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
};