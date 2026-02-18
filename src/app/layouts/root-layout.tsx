/**
 * Root Layout
 * 
 * Main application layout wrapper.
 * Includes navigation and renders child routes.
 */

import React from 'react';
import { Outlet, useLocation } from 'react-router';
import { Navigation } from '../components/navigation';
import { Toaster } from 'sonner';

export function RootLayout() {
  const location = useLocation();
  
  // Pages without navigation
  const noNavPages = ['/login', '/signup'];
  const showNav = !noNavPages.includes(location.pathname);
  
  return (
    <div className="min-h-screen bg-gray-50">
      {showNav && <Navigation />}
      <main>
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
}
