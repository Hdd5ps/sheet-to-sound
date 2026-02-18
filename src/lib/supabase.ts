/**
 * Supabase Client Configuration
 * 
 * Singleton instance of Supabase client for frontend use.
 * Uses public anon key for client-side authentication and API calls.
 */

import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../../utils/supabase/info';

// Create Supabase client singleton
export const supabase = createClient(
  `https://${projectId}.supabase.co`,
  publicAnonKey
);

/**
 * API base URL for backend server endpoints
 */
export const API_BASE_URL = `https://${projectId}.supabase.co/functions/v1/make-server-f24025d1`;

/**
 * Helper: Make authenticated API call to backend
 * Automatically includes auth token in headers
 */
export async function apiCall(
  endpoint: string,
  options: RequestInit = {}
): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: HeadersInit = {
    ...options.headers,
  };
  
  // Add auth token if available
  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  // Add Content-Type for JSON requests
  if (options.body && typeof options.body === 'string') {
    headers['Content-Type'] = 'application/json';
  }
  
  return fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });
}
