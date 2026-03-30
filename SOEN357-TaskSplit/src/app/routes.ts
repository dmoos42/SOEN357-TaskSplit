import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { TaskInput } from './components/TaskInput';
import { FocusSession } from './components/FocusSession';
import { Analytics } from './components/Analytics';
import { AssignmentDetails } from './components/AssignmentDetails';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Dashboard },
      { path: 'new-task', Component: TaskInput },
      { path: 'focus', Component: FocusSession },
      { path: 'analytics', Component: Analytics },
      { path: 'assignment/:taskId', Component: AssignmentDetails },
    ],
  },
]);