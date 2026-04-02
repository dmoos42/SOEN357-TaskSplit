import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Task, SubTask, FocusSession } from './store';

// Define everything our global state needs to keep track of
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
  updateTaskName: (taskId: string, name: string) => void;
  completeSubTask: (subTaskId: string) => void;
  addSession: (session: FocusSession) => void;
  getNextSubTask: () => { subTask: SubTask; taskName: string } | null;
  deleteTask: (taskId: string) => void; 
  startGeneration: (taskName: string, file: File | null, dueDate: string) => Promise<void>;
  resetGeneration: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  
  // Try to load tasks from local storage first, otherwise start fresh
  const [tasks, setTasks] = useState<Task[]>(() => {
    const savedTasks = localStorage.getItem('tasksplit_tasks');
    return savedTasks ? JSON.parse(savedTasks) : [];
  });

  const [sessions, setSessions] = useState<FocusSession[]>(() => {
    const savedSessions = localStorage.getItem('tasksplit_sessions');
    return savedSessions ? JSON.parse(savedSessions) : [];
  });

  // State for the AI generation flow
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedPlan, setGeneratedPlan] = useState<Omit<SubTask, 'parentTaskId'>[] | null>(null);
  const [generatedTaskName, setGeneratedTaskName] = useState('');
  const [generatedDueDate, setGeneratedDueDate] = useState('');
  const [generatedFile, setGeneratedFile] = useState<File | null>(null);

  // Auto-save to local storage whenever tasks change
  useEffect(() => {
    localStorage.setItem('tasksplit_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('tasksplit_sessions', JSON.stringify(sessions));
  }, [sessions]);

  // Basic CRUD functions for managing tasks
  const addTask = useCallback((task: Task) => setTasks(prev => [...prev, task]), []);
  const deleteTask = useCallback((taskId: string) => setTasks(prev => prev.filter(t => t.id !== taskId)), []);
  const updateTask = useCallback((taskId: string, subTasks: SubTask[]) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, subTasks } : t)), []);
  const updateTaskDueDate = useCallback((taskId: string, dueDate: string) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, dueDate } : t)), []);
  const updateTaskName = useCallback((taskId: string, name: string) => setTasks(prev => prev.map(t => t.id === taskId ? { ...t, name } : t)), []);
  const addSession = useCallback((session: FocusSession) => setSessions(prev => [...prev, session]), []);

  // Mark a specific step as done
  const completeSubTask = useCallback((subTaskId: string) => {
    setTasks(prev => prev.map(t => ({
      ...t,
      subTasks: t.subTasks.map(st => st.id === subTaskId ? { ...st, completed: true } : st)
    })));
  }, []);

  // Figures out what the user should work on next (Hick's Law implementation)
  const getNextSubTask = useCallback(() => {
    for (const task of tasks) {
      const next = task.subTasks.find(st => !st.completed);
      if (next) return { subTask: next, taskName: task.name };
    }
    return null;
  }, [tasks]);

  // Main function that hits our Express backend to get AI tasks
  const startGeneration = useCallback(async (taskName: string, file: File | null, dueDate: string) => {
    if (!taskName.trim()) return;
    setIsGenerating(true);
    setGeneratedTaskName(taskName);
    setGeneratedDueDate(dueDate);
    setGeneratedFile(file);

    try {
      // Need FormData since we might be sending a file
      const formData = new FormData();
      formData.append('taskName', taskName);
      if (file) formData.append('file', file);

      const response = await fetch('http://localhost:3000/api/generate-plan', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to fetch plan from server');

      const aiData = await response.json();
      
      // Clean up the data coming back from Gemini
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
      
      // Fallback data just in case the API is down or there is an error.
      const GENERATED_SUBTASKS = (name: string): Omit<SubTask, 'parentTaskId'>[] => [
        { id: `gen-${Date.now()}-1`, name: `Review ${name} requirements`, difficulty: 'Easy', estimatedMinutes: 15, completed: false },
        { id: `gen-${Date.now()}-2`, name: 'Research & gather resources', difficulty: 'Medium', estimatedMinutes: 40, completed: false },
        { id: `gen-${Date.now()}-3`, name: 'Create initial outline', difficulty: 'Easy', estimatedMinutes: 20, completed: false },
        { id: `gen-${Date.now()}-4`, name: 'Draft first section', difficulty: 'Medium', estimatedMinutes: 35, completed: false },
      ];
      setGeneratedPlan(GENERATED_SUBTASKS(taskName));
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // Clears out temporary state if user cancel
  const resetGeneration = useCallback(() => {
    setIsGenerating(false);
    setGeneratedPlan(null);
    setGeneratedTaskName('');
    setGeneratedDueDate('');
    setGeneratedFile(null);
  }, []);

  return (
    <AppContext.Provider value={{ 
      tasks, sessions, activeSubTask: null, activeTaskName: '', isGenerating, generatedPlan,
      generatedTaskName, generatedDueDate, generatedFile, addTask, updateTask, updateTaskDueDate,
      updateTaskName, completeSubTask, addSession, getNextSubTask, deleteTask, startGeneration, resetGeneration
    }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook so we don't have to import useContext everywhere
export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}