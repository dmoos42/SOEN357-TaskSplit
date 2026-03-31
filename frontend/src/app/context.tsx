import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Task, SubTask, FocusSession } from './store';

interface AppState {
  tasks: Task[];
  sessions: FocusSession[];
  activeSubTask: SubTask | null;
  activeTaskName: string;
  isGenerating: boolean;
  generatedPlan: Omit<SubTask, 'parentTaskId'>[] | null;
  generatedTaskName: string;
  generatedDueDate: string;
  generatedFile: File | null;
  addTask: (task: Task) => void;
  updateTask: (taskId: string, subTasks: SubTask[]) => void;
  updateTaskDueDate: (taskId: string, dueDate: string) => void;
  completeSubTask: (subTaskId: string) => void;
  addSession: (session: FocusSession) => void;
  getNextSubTask: () => { subTask: SubTask; taskName: string } | null;
  deleteTask: (taskId: string) => void; 
  startGeneration: (taskName: string, file: File | null, dueDate: string) => Promise<void>;
  resetGeneration: () => void;
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

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<Omit<SubTask, 'parentTaskId'>[] | null>(null);
  const [generatedTaskName, setGeneratedTaskName] = useState('');
  const [generatedDueDate, setGeneratedDueDate] = useState('');
  const [generatedFile, setGeneratedFile] = useState<File | null>(null);

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

  const startGeneration = useCallback(async (taskName: string, file: File | null, dueDate: string) => {
    if (!taskName.trim()) return;
    setIsGenerating(true);
    setGeneratedTaskName(taskName);
    setGeneratedDueDate(dueDate);
    setGeneratedFile(file);

    try {
      const formData = new FormData();
      formData.append('taskName', taskName);
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch('http://localhost:3000/api/generate-plan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to fetch plan from server');

      const aiData = await response.json();
      const formattedSubTasks: Omit<SubTask, 'parentTaskId'>[] = aiData.map((step: any, index: number) => ({
        id: `gen-${Date.now()}-${index}`,
        name: step.name,
        difficulty: step.difficulty,
        estimatedMinutes: step.estimatedMinutes,
        completed: false,
        microSteps: step.microSteps || [],
      }));

      setGeneratedPlan(formattedSubTasks);
    } catch (error) {
      console.error("Error generating tasks:", error);
      alert("Oops! The AI needs a quick break. Please try again.");
      const GENERATED_SUBTASKS = (name: string): Omit<SubTask, 'parentTaskId'>[] => [
        { id: `gen-${Date.now()}-1`, name: `Review ${name} requirements`, difficulty: 'Easy', estimatedMinutes: 15, completed: false },
        { id: `gen-${Date.now()}-2`, name: 'Research & gather resources', difficulty: 'Medium', estimatedMinutes: 40, completed: false },
        { id: `gen-${Date.now()}-3`, name: 'Create initial outline', difficulty: 'Easy', estimatedMinutes: 20, completed: false },
        { id: `gen-${Date.now()}-4`, name: 'Draft first section', difficulty: 'Medium', estimatedMinutes: 35, completed: false },
        { id: `gen-${Date.now()}-5`, name: 'Draft remaining sections', difficulty: 'Hard', estimatedMinutes: 50, completed: false },
        { id: `gen-${Date.now()}-6`, name: 'Review & revise', difficulty: 'Medium', estimatedMinutes: 30, completed: false },
        { id: `gen-${Date.now()}-7`, name: 'Final proofread & submit', difficulty: 'Easy', estimatedMinutes: 15, completed: false },
      ];
      setGeneratedPlan(GENERATED_SUBTASKS(taskName));
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const resetGeneration = useCallback(() => {
    setIsGenerating(false);
    setGeneratedPlan(null);
    setGeneratedTaskName('');
    setGeneratedDueDate('');
    setGeneratedFile(null);
  }, []);

  return (
    <AppContext.Provider value={{ 
      tasks, 
      sessions, 
      activeSubTask: null, 
      activeTaskName: '', 
      isGenerating,
      generatedPlan,
      generatedTaskName,
      generatedDueDate,
      generatedFile,
      addTask, 
      updateTask, 
      updateTaskDueDate,
      completeSubTask, 
      addSession, 
      getNextSubTask, 
      deleteTask,
      startGeneration,
      resetGeneration
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