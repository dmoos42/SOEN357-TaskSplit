import React, { createContext, useContext, useState, useCallback } from 'react';
import { MOCK_TASKS, MOCK_SESSIONS } from './store';
import type { Task, SubTask, FocusSession } from './store';

interface AppState {
  tasks: Task[];
  sessions: FocusSession[];
  activeSubTask: SubTask | null;
  activeTaskName: string;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, subTasks: SubTask[]) => void;
  completeSubTask: (subTaskId: string) => void;
  addSession: (session: FocusSession) => void;
  getNextSubTask: () => { subTask: SubTask; taskName: string } | null;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useState<Task[]>(MOCK_TASKS);
  const [sessions, setSessions] = useState<FocusSession[]>(MOCK_SESSIONS);

  const addTask = useCallback((task: Task) => {
    setTasks(prev => [...prev, task]);
  }, []);

  const updateTask = useCallback((taskId: string, subTasks: SubTask[]) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subTasks } : t));
  }, []);

  const completeSubTask = useCallback((subTaskId: string) => {
    setTasks(prev => prev.map(t => ({
      ...t,
      subTasks: t.subTasks.map(st => st.id === subTaskId ? { ...st, completed: true } : st)
    })));
  }, []);

  const addSession = useCallback((session: FocusSession) => {
    setSessions(prev => [...prev, session]);
  }, []);

  const getNextSubTask = useCallback(() => {
    for (const task of tasks) {
      const next = task.subTasks.find(st => !st.completed);
      if (next) return { subTask: next, taskName: task.name };
    }
    return null;
  }, [tasks]);

  return (
    <AppContext.Provider value={{ tasks, sessions, activeSubTask: null, activeTaskName: '', addTask, updateTask, completeSubTask, addSession, getNextSubTask }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}
