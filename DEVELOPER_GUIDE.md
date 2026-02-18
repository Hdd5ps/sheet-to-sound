/**
 * DEVELOPER GUIDE - SheetToSound Application
 * 
 * Quick reference for developers working on this codebase.
 */

// ============================================================================
// ADDING A NEW INSTRUMENT
// ============================================================================

/**
 * To add a new instrument to the palette:
 * 
 * 1. Open /src/lib/instruments.ts
 * 2. Add to the INSTRUMENTS array:
 */
const newInstrument = {
  id: 'unique-id',           // kebab-case identifier
  name: 'Display Name',      // User-facing name
  category: 'percussion',    // One of: strings, woodwinds, brass, percussion, keyboards, voices
};

// The instrument will automatically appear in:
// - Instrument selector component
// - Category filters
// - Search functionality

// ============================================================================
// ADDING A NEW PAGE
// ============================================================================

/**
 * To add a new page:
 * 
 * 1. Create component in /src/app/pages/my-page.tsx
 * 2. Add route in /src/app/routes.tsx:
 */
{
  path: 'my-page',
  Component: MyPage,
  // Or for protected routes:
  element: <ProtectedRoute><MyPage /></ProtectedRoute>,
}

/**
 * 3. Add navigation link in /src/app/components/navigation.tsx:
 */
const navItems = [
  // ... existing items
  { to: '/my-page', label: 'My Page', icon: IconComponent },
];

// ============================================================================
// ADDING A NEW API ENDPOINT
// ============================================================================

/**
 * To add a new backend endpoint:
 * 
 * 1. Open /supabase/functions/server/index.tsx
 * 2. Add route handler:
 */
app.get('/make-server-f24025d1/my-endpoint', async (c) => {
  try {
    // For protected endpoints, verify auth:
    const { user, error: authError } = await verifyAuth(c.req.raw);
    if (authError || !user) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Your logic here
    const result = await processData();
    
    return c.json({ success: true, data: result });
  } catch (error) {
    console.log('Error in my-endpoint:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

/**
 * 3. Call from frontend using apiCall helper:
 */
import { apiCall } from '../../lib/supabase';

const response = await apiCall('/my-endpoint', {
  method: 'GET', // or 'POST', 'PUT', 'DELETE'
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ data: 'value' }), // for POST/PUT
});

const data = await response.json();

// ============================================================================
// WORKING WITH STORAGE
// ============================================================================

/**
 * Upload file to Supabase Storage (server-side):
 */
const { data, error } = await supabase.storage
  .from('bucket-name')
  .upload('path/to/file.ext', fileBuffer, {
    contentType: 'image/jpeg',
    upsert: false,
  });

/**
 * Create signed URL for private file:
 */
const { data: signedUrl } = await supabase.storage
  .from('bucket-name')
  .createSignedUrl('path/to/file.ext', 60 * 60 * 24 * 365); // 1 year

/**
 * Delete file:
 */
await supabase.storage
  .from('bucket-name')
  .remove(['path/to/file.ext']);

// ============================================================================
// WORKING WITH KEY-VALUE STORE
// ============================================================================

/**
 * The KV store is imported in server/index.tsx as:
 */
import * as kv from './kv_store.tsx';

/**
 * Available operations:
 */
await kv.set('key', { data: 'value' });        // Set value
const value = await kv.get('key');             // Get single value
const values = await kv.mget(['key1', 'key2']); // Get multiple values
await kv.del('key');                           // Delete key
await kv.mset({ key1: val1, key2: val2 });     // Set multiple
await kv.mdel(['key1', 'key2']);               // Delete multiple
const results = await kv.getByPrefix('user_'); // Get by prefix

// ============================================================================
// ADDING A DESIGN SYSTEM COMPONENT
// ============================================================================

/**
 * Create new component in /src/app/components/ui/
 * 
 * Example structure:
 */
import React from 'react';
import { cn } from '../../../lib/utils';

export interface MyComponentProps {
  variant?: 'default' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  // ... other props
}

export function MyComponent({ 
  variant = 'default', 
  size = 'md',
  className,
  children,
  ...props 
}: MyComponentProps) {
  const baseStyles = 'base-tailwind-classes';
  const variantStyles = {
    default: 'variant-classes',
    primary: 'primary-classes',
  };
  const sizeStyles = {
    sm: 'size-classes',
    md: 'size-classes',
    lg: 'size-classes',
  };
  
  return (
    <div
      className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
      {...props}
    >
      {children}
    </div>
  );
}

// ============================================================================
// AUTHENTICATION PATTERNS
// ============================================================================

/**
 * Access current user in any component:
 */
import { useAuth } from '../contexts/auth-context';

function MyComponent() {
  const { user, signIn, signOut } = useAuth();
  
  if (!user) {
    return <div>Please sign in</div>;
  }
  
  return <div>Welcome, {user.name}</div>;
}

/**
 * Protect a route:
 */
import { ProtectedRoute } from '../layouts/protected-route';

{
  path: 'my-route',
  element: <ProtectedRoute><MyComponent /></ProtectedRoute>,
}

/**
 * Make authenticated API call:
 */
import { apiCall } from '../../lib/supabase';

const response = await apiCall('/protected-endpoint', {
  method: 'GET',
});
// Auth token is automatically included in headers

// ============================================================================
// FORM VALIDATION PATTERN
// ============================================================================

/**
 * Example form with validation:
 */
function MyForm() {
  const [formData, setFormData] = useState({ email: '', name: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  function validate() {
    const newErrors: Record<string, string> = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    
    if (!formData.name) {
      newErrors.name = 'Name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }
  
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    // Submit form...
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Input
        label="Email"
        value={formData.email}
        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        error={errors.email}
      />
      {/* More fields... */}
    </form>
  );
}

// ============================================================================
// ERROR HANDLING BEST PRACTICES
// ============================================================================

/**
 * Always wrap API calls in try-catch:
 */
try {
  const response = await apiCall('/endpoint');
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  // Success - show toast notification
  toast.success('Operation successful');
  
  // Update state
  setState(data);
} catch (error: any) {
  console.error('Descriptive error message:', error);
  toast.error(error.message || 'Operation failed');
}

/**
 * Server-side error logging:
 */
try {
  // ... operation
} catch (error) {
  console.log('Detailed context about error:', error);
  return c.json({ 
    error: 'User-friendly error message with context' 
  }, 500);
}

// ============================================================================
// TOAST NOTIFICATIONS
// ============================================================================

/**
 * Show notifications to users:
 */
import { toast } from 'sonner';

toast.success('Success message');
toast.error('Error message');
toast.info('Info message');
toast.warning('Warning message');

// With custom duration
toast.success('Message', { duration: 5000 });

// ============================================================================
// RESPONSIVE DESIGN PATTERNS
// ============================================================================

/**
 * Use Tailwind responsive prefixes:
 */
<div className="
  grid 
  grid-cols-1           /* Mobile: 1 column */
  md:grid-cols-2        /* Tablet: 2 columns */
  lg:grid-cols-3        /* Desktop: 3 columns */
  gap-4
">
  {/* Content */}
</div>

/**
 * Hide/show based on screen size:
 */
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>

// ============================================================================
// PERFORMANCE OPTIMIZATION TIPS
// ============================================================================

/**
 * 1. Use React.memo for expensive components:
 */
export const ExpensiveComponent = React.memo(({ data }) => {
  // Component that renders based on complex calculations
});

/**
 * 2. Use useMemo for expensive calculations:
 */
const filteredData = useMemo(() => {
  return data.filter(item => complexFilter(item));
}, [data]);

/**
 * 3. Use useCallback for event handlers passed to children:
 */
const handleClick = useCallback(() => {
  // Handler logic
}, [dependencies]);

/**
 * 4. Lazy load routes:
 */
const LazyPage = React.lazy(() => import('./pages/lazy-page'));

{
  path: 'lazy',
  element: <Suspense fallback={<Loading />}><LazyPage /></Suspense>,
}

// ============================================================================
// DEBUGGING TIPS
// ============================================================================

/**
 * 1. Check browser console for frontend errors
 * 2. Check Supabase logs for backend errors
 * 3. Use React DevTools to inspect component state
 * 4. Use Network tab to debug API calls
 * 5. Add console.log with descriptive context:
 */
console.log('Component mounted with props:', props);
console.log('API response:', response);
console.error('Failed to fetch data:', error);

/**
 * 6. Check auth state in React DevTools:
 */
// Look for AuthContext in component tree

// ============================================================================
// COMMON GOTCHAS
// ============================================================================

/**
 * 1. Always check user authentication before calling protected endpoints
 * 2. Remember to add CORS headers to new endpoints
 * 3. Validate file types and sizes on both frontend and backend
 * 4. Use signed URLs for private storage files
 * 5. Don't expose SUPABASE_SERVICE_ROLE_KEY to frontend
 * 6. Test mobile responsiveness for all new features
 * 7. Add loading states for async operations
 * 8. Handle empty states (no data scenarios)
 * 9. Provide user feedback for all actions (toasts)
 * 10. Clean up resources in useEffect cleanup functions
 */

// ============================================================================
// DEPLOYMENT CHECKLIST
// ============================================================================

/**
 * Before deploying to production:
 * 
 * [ ] Test all user flows (signup, login, upload, convert, playback, delete)
 * [ ] Verify error handling for network failures
 * [ ] Test with large files (max size limits)
 * [ ] Check mobile responsiveness
 * [ ] Verify authentication persistence (page refresh)
 * [ ] Test logout and re-login
 * [ ] Ensure all API endpoints have proper auth checks
 * [ ] Review and sanitize error messages
 * [ ] Test with multiple users (concurrent access)
 * [ ] Verify storage bucket permissions
 * [ ] Check that signed URLs expire correctly
 * [ ] Test file deletion (cleanup)
 * [ ] Verify CORS configuration
 * [ ] Review logging and monitoring setup
 * [ ] Test with slow network (throttling)
 * [ ] Verify accessibility (keyboard navigation, screen readers)
 */

// ============================================================================
// USEFUL RESOURCES
// ============================================================================

/**
 * - React Router Docs: https://reactrouter.com/
 * - Supabase Docs: https://supabase.com/docs
 * - Tailwind CSS: https://tailwindcss.com/docs
 * - TypeScript Handbook: https://www.typescriptlang.org/docs/
 * - Lucide Icons: https://lucide.dev/
 */
