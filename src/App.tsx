import type React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppShell from './app/AppShell';
import HomePage from './pages/HomePage';
import { ToastProvider } from './components/ui/Toast';
import { BudgetProvider } from './contexts/BudgetContext';
import { BucketListProvider } from './contexts/BucketListContext';
import { GalleryProvider } from './contexts/GalleryContext';

// Home ships in the main bundle; every other page loads on first visit.
const page = (load: () => Promise<{ default: React.ComponentType }>) => () =>
  load().then((m) => ({ Component: m.default }));

const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'dates', lazy: page(() => import('./pages/DatesPage')) },
      { path: 'tasks', lazy: page(() => import('./pages/TasksPage')) },
      { path: 'budget', lazy: page(() => import('./pages/BudgetPage')) },
      { path: 'watch', lazy: page(() => import('./pages/WatchPage')) },
      { path: 'gallery', lazy: page(() => import('./pages/GalleryPage')) },
      { path: 'bucket-list', lazy: page(() => import('./pages/BucketListPage')) },
      { path: 'music', lazy: page(() => import('./pages/MusicPage')) },
      { path: '*', lazy: page(() => import('./pages/NotFoundPage')) },
    ],
  },
]);

export default function App() {
  return (
    <ToastProvider>
      <BudgetProvider>
        <BucketListProvider>
          <GalleryProvider>
            <RouterProvider router={router} />
          </GalleryProvider>
        </BucketListProvider>
      </BudgetProvider>
    </ToastProvider>
  );
}
