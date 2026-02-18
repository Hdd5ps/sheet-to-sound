/**
 * Application Routes
 * 
 * React Router configuration for all pages.
 * Uses Data Router pattern with RouterProvider.
 */

import { createBrowserRouter, Navigate } from 'react-router';
import { RootLayout } from './layouts/root-layout';
import { ProtectedRoute } from './layouts/protected-route';

// Pages
import { HomePage } from './pages/home';
import { UploadPage } from './pages/upload';
import { PlaybackPage } from './pages/playback';
import { LibraryPage } from './pages/library';
import { HelpPage } from './pages/help';
import { SettingsPage } from './pages/settings';
import { LoginPage } from './pages/login';
import { SignupPage } from './pages/signup';
import { NotFoundPage } from './pages/not-found';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      // Public routes
      { index: true, Component: HomePage },
      { path: 'login', Component: LoginPage },
      { path: 'signup', Component: SignupPage },
      { path: 'help', Component: HelpPage },
      
      // Protected routes (require authentication)
      {
        path: 'upload',
        element: <ProtectedRoute><UploadPage /></ProtectedRoute>,
      },
      {
        path: 'library',
        element: <ProtectedRoute><LibraryPage /></ProtectedRoute>,
      },
      {
        path: 'playback/:conversionId',
        element: <ProtectedRoute><PlaybackPage /></ProtectedRoute>,
      },
      {
        path: 'settings',
        element: <ProtectedRoute><SettingsPage /></ProtectedRoute>,
      },
      
      // 404
      { path: '*', Component: NotFoundPage },
    ],
  },
]);
