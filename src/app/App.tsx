/**
 * SheetToSound - Sheet Music to Audio Conversion Application
 * 
 * Main application entry point.
 * 
 * Architecture:
 * - React + TypeScript for UI
 * - React Router for navigation
 * - Supabase for backend (auth, storage, database)
 * - Tailwind CSS for styling
 * 
 * Key Features:
 * - Upload sheet music (images/PDFs)
 * - Select instruments (full orchestral palette) or SATB choir configuration
 * - Convert to audio and MIDI
 * - Playback controls with tempo, loop, and voice controls
 * - User library for managing scores and conversions
 * 
 * API Integration Points:
 * Backend server at /supabase/functions/server/index.tsx provides:
 * - POST /signup - User registration
 * - POST /scores/upload - Upload sheet music files
 * - POST /scores/:scoreId/convert - Convert score to audio/MIDI
 * - GET /conversions/:conversionId - Get conversion status and results
 * - GET /library - Get user's scores and conversions
 * - DELETE /scores/:scoreId - Delete score and conversions
 * 
 * Production Integration Notes:
 * For production deployment, integrate these external services:
 * 
 * 1. Optical Music Recognition (OMR):
 *    - Audiveris: Open-source OMR engine
 *    - PhotoScore API: Commercial OMR service
 *    - Google Cloud Vision + custom ML model
 *    - Output: MusicXML or MIDI representation
 * 
 * 2. Audio Synthesis:
 *    - FluidSynth: Software synthesizer for MIDI → audio
 *    - TiMidity++: Alternative MIDI renderer
 *    - Cloud-based synthesis services
 *    - Sound fonts for instrument mapping
 * 
 * 3. File Processing:
 *    - PDF.js for PDF parsing
 *    - Sharp/ImageMagick for image preprocessing
 *    - Background job queue (e.g., Bull, Celery) for async conversion
 * 
 * @author Figma Make
 * @version 1.0.0
 */

import { RouterProvider } from 'react-router';
import { AuthProvider } from './contexts/auth-context';
import { router } from './routes';

export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}
