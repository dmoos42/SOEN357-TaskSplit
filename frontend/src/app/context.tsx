import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Task, SubTask, FocusSession } from './store';

interface AppState {
  tasks: Task[];
  sessions: FocusSession[];
  activeSubTask: SubTask | null;
  activeTaskName: string;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, subTasks: SubTask[]) => void;
  updateTaskDueDate: (taskId: string, dueDate: string) => void;
  completeSubTask: (subTaskId: string) => void;
  addSession: (session: FocusSession) => void;
  getNextSubTask: () => { subTask: SubTask; taskName: string } | null;
  deleteTask: (taskId: string) => void; 
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  // 1. Initialize state from localStorage, or default to empty arrays
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasksplit_tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [sessions, setSessions] = useState<FocusSession[]>(() => {
    const savedSessions = localStorage.getItem('tasksplit_sessions');
    return savedSessions ? JSON.parse(savedSessions) : [];
  });

  // 2. Whenever tasks or sessions change, save them back to localStorage automatically
  useEffect(() => {
    localStorage.setItem('tasksplit_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tasksplit_sessions', JSON.stringify(sessions));
  }, [sessions]);

  const addTask = useCallback((task: Task) => {
    setTasks(prev => [...prev, task]);
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
  }, []);

  const updateTask = useCallback((taskId: string, subTasks: SubTask[]) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subTasks } : t));
  }, []);

  const updateTaskDueDate = useCallback((taskId: string, dueDate: string) => {
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, dueDate } : t));
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
    <AppContext.Provider value={{ 
      tasks, 
      sessions, 
      activeSubTask: null, 
      activeTaskName: '', 
      addTask, 
      updateTask, 
      updateTaskDueDate,
      completeSubTask, 
      addSession, 
      getNextSubTask, 
      deleteTask
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}