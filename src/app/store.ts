// Shared types and mock data for TaskSplit app

export interface SubTask {
  id: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  estimatedMinutes: number;
  completed: boolean;
  parentTaskId: string;
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

export const MOCK_TASKS: Task[] = [
  {
    id: '1',
    name: 'SOEN 357 Final Report',
    dueDate: '2026-04-05',
    difficulty: 'Hard',
    createdAt: '2026-03-24',
    subTasks: [
      { id: 's1', name: 'Research & gather sources', difficulty: 'Medium', estimatedMinutes: 45, completed: true, parentTaskId: '1' },
      { id: 's2', name: 'Create outline structure', difficulty: 'Easy', estimatedMinutes: 20, completed: true, parentTaskId: '1' },
      { id: 's3', name: 'Write introduction section', difficulty: 'Medium', estimatedMinutes: 30, completed: false, parentTaskId: '1' },
      { id: 's4', name: 'Draft methodology section', difficulty: 'Hard', estimatedMinutes: 45, completed: false, parentTaskId: '1' },
      { id: 's5', name: 'Write analysis & findings', difficulty: 'Hard', estimatedMinutes: 50, completed: false, parentTaskId: '1' },
      { id: 's6', name: 'Write conclusion', difficulty: 'Easy', estimatedMinutes: 20, completed: false, parentTaskId: '1' },
      { id: 's7', name: 'Proofread & format', difficulty: 'Easy', estimatedMinutes: 25, completed: false, parentTaskId: '1' },
    ],
  },
  {
    id: '2',
    name: 'COMP 352 Algorithm Assignment',
    dueDate: '2026-04-02',
    difficulty: 'Medium',
    createdAt: '2026-03-25',
    subTasks: [
      { id: 's8', name: 'Read problem statements', difficulty: 'Easy', estimatedMinutes: 15, completed: true, parentTaskId: '2' },
      { id: 's9', name: 'Solve sorting problem', difficulty: 'Medium', estimatedMinutes: 35, completed: false, parentTaskId: '2' },
      { id: 's10', name: 'Implement graph traversal', difficulty: 'Hard', estimatedMinutes: 40, completed: false, parentTaskId: '2' },
      { id: 's11', name: 'Write complexity analysis', difficulty: 'Medium', estimatedMinutes: 25, completed: false, parentTaskId: '2' },
    ],
  },
  // Completed assignments for History / Positive Reinforcement
  {
    id: '3',
    name: 'ENGR 201 Ethics Essay',
    dueDate: '2026-03-20',
    difficulty: 'Medium',
    createdAt: '2026-03-10',
    subTasks: [
      { id: 's12', name: 'Read case study material', difficulty: 'Easy', estimatedMinutes: 20, completed: true, parentTaskId: '3' },
      { id: 's13', name: 'Identify ethical frameworks', difficulty: 'Medium', estimatedMinutes: 30, completed: true, parentTaskId: '3' },
      { id: 's14', name: 'Write argument draft', difficulty: 'Medium', estimatedMinutes: 40, completed: true, parentTaskId: '3' },
      { id: 's15', name: 'Revise and add citations', difficulty: 'Easy', estimatedMinutes: 25, completed: true, parentTaskId: '3' },
      { id: 's16', name: 'Final review & submit', difficulty: 'Easy', estimatedMinutes: 15, completed: true, parentTaskId: '3' },
    ],
  },
  {
    id: '4',
    name: 'SOEN 341 Sprint 2 Deliverable',
    dueDate: '2026-03-15',
    difficulty: 'Hard',
    createdAt: '2026-03-01',
    subTasks: [
      { id: 's17', name: 'Set up CI/CD pipeline', difficulty: 'Hard', estimatedMinutes: 50, completed: true, parentTaskId: '4' },
      { id: 's18', name: 'Implement user auth feature', difficulty: 'Hard', estimatedMinutes: 60, completed: true, parentTaskId: '4' },
      { id: 's19', name: 'Write unit tests', difficulty: 'Medium', estimatedMinutes: 35, completed: true, parentTaskId: '4' },
      { id: 's20', name: 'Update project wiki', difficulty: 'Easy', estimatedMinutes: 20, completed: true, parentTaskId: '4' },
      { id: 's21', name: 'Record demo video', difficulty: 'Medium', estimatedMinutes: 30, completed: true, parentTaskId: '4' },
      { id: 's22', name: 'Submit on Moodle', difficulty: 'Easy', estimatedMinutes: 10, completed: true, parentTaskId: '4' },
    ],
  },
  {
    id: '5',
    name: 'COMP 248 Lab 7',
    dueDate: '2026-03-08',
    difficulty: 'Easy',
    createdAt: '2026-03-04',
    subTasks: [
      { id: 's23', name: 'Read lab instructions', difficulty: 'Easy', estimatedMinutes: 10, completed: true, parentTaskId: '5' },
      { id: 's24', name: 'Implement linked list class', difficulty: 'Medium', estimatedMinutes: 30, completed: true, parentTaskId: '5' },
      { id: 's25', name: 'Test with sample inputs', difficulty: 'Easy', estimatedMinutes: 15, completed: true, parentTaskId: '5' },
    ],
  },
];

export const MOCK_SESSIONS: FocusSession[] = [
  { id: 'fs1', subTaskId: 's1', subTaskName: 'Research & gather sources', duration: 45, completedAt: '2026-03-25T10:00:00' },
  { id: 'fs2', subTaskId: 's2', subTaskName: 'Create outline structure', duration: 20, completedAt: '2026-03-25T14:30:00' },
  { id: 'fs3', subTaskId: 's8', subTaskName: 'Read problem statements', duration: 15, completedAt: '2026-03-26T09:00:00' },
  // Sessions for completed assignments
  { id: 'fs4', subTaskId: 's12', subTaskName: 'Read case study material', duration: 20, completedAt: '2026-03-12T09:00:00' },
  { id: 'fs5', subTaskId: 's13', subTaskName: 'Identify ethical frameworks', duration: 30, completedAt: '2026-03-13T11:00:00' },
  { id: 'fs6', subTaskId: 's14', subTaskName: 'Write argument draft', duration: 40, completedAt: '2026-03-14T14:00:00' },
  { id: 'fs7', subTaskId: 's15', subTaskName: 'Revise and add citations', duration: 25, completedAt: '2026-03-16T10:00:00' },
  { id: 'fs8', subTaskId: 's16', subTaskName: 'Final review & submit', duration: 15, completedAt: '2026-03-18T16:00:00' },
  { id: 'fs9', subTaskId: 's17', subTaskName: 'Set up CI/CD pipeline', duration: 50, completedAt: '2026-03-03T09:00:00' },
  { id: 'fs10', subTaskId: 's18', subTaskName: 'Implement user auth feature', duration: 60, completedAt: '2026-03-05T10:00:00' },
  { id: 'fs11', subTaskId: 's19', subTaskName: 'Write unit tests', duration: 35, completedAt: '2026-03-07T14:00:00' },
  { id: 'fs12', subTaskId: 's20', subTaskName: 'Update project wiki', duration: 20, completedAt: '2026-03-09T11:00:00' },
  { id: 'fs13', subTaskId: 's21', subTaskName: 'Record demo video', duration: 30, completedAt: '2026-03-11T15:00:00' },
  { id: 'fs14', subTaskId: 's22', subTaskName: 'Submit on Moodle', duration: 10, completedAt: '2026-03-13T09:00:00' },
  { id: 'fs15', subTaskId: 's23', subTaskName: 'Read lab instructions', duration: 10, completedAt: '2026-03-05T09:00:00' },
  { id: 'fs16', subTaskId: 's24', subTaskName: 'Implement linked list class', duration: 30, completedAt: '2026-03-06T13:00:00' },
  { id: 'fs17', subTaskId: 's25', subTaskName: 'Test with sample inputs', duration: 15, completedAt: '2026-03-07T10:00:00' },
];

export const DIFFICULTY_COLORS = {
  Easy: { bg: '#E8F5E9', text: '#2E7D32', border: '#A5D6A7' },
  Medium: { bg: '#FFF3E0', text: '#E65100', border: '#FFCC80' },
  Hard: { bg: '#FFEBEE', text: '#C62828', border: '#EF9A9A' },
};