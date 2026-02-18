# SheetToSound - Sheet Music to Audio Conversion App

A comprehensive web application for converting sheet music images and PDFs into playable audio, built with React, TypeScript, Supabase, and Tailwind CSS.

## 📋 Overview

SheetToSound enables music learners and performers to:
- Upload or photograph sheet music scores
- Choose specific instruments from a full orchestral palette (including percussion like tambourine, tam-tam, cowbell)
- Configure SATB (Soprano, Alto, Tenor, Bass) choir parts with individual voice controls
- Convert notation to accurate, playable audio
- Control playback with tempo adjustment, loop regions, and scrubbing
- Download audio (MP3) and MIDI files
- Manage a personal library of converted scores

## 🏗️ Architecture

### Frontend
- **Framework**: React 18 + TypeScript
- **Routing**: React Router (Data Router pattern)
- **Styling**: Tailwind CSS v4
- **State Management**: React Context (Auth)
- **UI Components**: Custom design system with reusable components

### Backend
- **Runtime**: Supabase Edge Functions (Deno)
- **Server**: Hono web framework
- **Database**: Supabase (PostgreSQL with KV store)
- **Storage**: Supabase Storage (private buckets)
- **Authentication**: Supabase Auth

### Data Flow
```
Frontend → Server → Database/Storage
         ← API     ← 
```

## 📁 Project Structure

```
/
├── src/
│   ├── app/
│   │   ├── components/          # React components
│   │   │   ├── ui/              # Design system primitives
│   │   │   │   ├── button.tsx
│   │   │   │   ├── card.tsx
│   │   │   │   ├── chip.tsx
│   │   │   │   └── input.tsx
│   │   │   ├── navigation.tsx
│   │   │   ├── upload-area.tsx
│   │   │   ├── instrument-selector.tsx
│   │   │   ├── satb-selector.tsx
│   │   │   ├── playback-controls.tsx
│   │   │   └── score-library.tsx
│   │   ├── contexts/            # React contexts
│   │   │   └── auth-context.tsx
│   │   ├── layouts/             # Layout components
│   │   │   ├── root-layout.tsx
│   │   │   └── protected-route.tsx
│   │   ├── pages/               # Page components
│   │   │   ├── home.tsx
│   │   │   ├── upload.tsx
│   │   │   ├── playback.tsx
│   │   │   ├── library.tsx
│   │   │   ├── help.tsx
│   │   │   ├── settings.tsx
│   │   │   ├── login.tsx
│   │   │   ├── signup.tsx
│   │   │   └── not-found.tsx
│   │   ├── routes.tsx           # Route configuration
│   │   └── App.tsx              # Main app component
│   └── lib/
│       ├── supabase.ts          # Supabase client
│       ├── types.ts             # TypeScript types
│       ├── instruments.ts       # Instrument database
│       └── utils.ts             # Utility functions
├── supabase/
│   └── functions/
│       └── server/
│           └── index.tsx        # Backend server
└── package.json
```

## 🎵 Key Features

### 1. Upload & Preview
- Drag-and-drop file upload
- Support for JPG, PNG, PDF formats
- File validation (type, size)
- Clear error messages with guidance
- Preview of uploaded scores

### 2. Instrument Selection
- **Full Orchestral Palette**:
  - Strings: Violin, Viola, Cello, Double Bass, Harp, Guitar
  - Woodwinds: Flute, Piccolo, Oboe, Clarinet, Bassoon, Saxophone
  - Brass: Trumpet, French Horn, Trombone, Tuba
  - Percussion (Pitched): Timpani, Xylophone, Marimba, Vibraphone
  - Percussion (Unpitched): Snare, Bass Drum, Cymbals, **Tambourine**, **Tam-Tam**, **Cowbell**, Triangle, etc.
  - Keyboards: Piano, Organ, Harpsichord
  - Voices: Soprano, Alto, Tenor, Bass

- **Features**:
  - Category-based filtering
  - Search functionality
  - Multi-select for ensemble
  - Solo mode for single instrument

### 3. SATB Choir Configuration
- Individual voice controls:
  - **Mute/Unmute**: Toggle each voice on/off
  - **Solo**: Isolate a single voice
  - **Volume**: Adjust relative balance (0-100%)
- Visual feedback for active voices
- Full choir mix playback

### 4. Playback Controls
- Play/Pause with visual feedback
- Progress scrubber with timeline
- Time display (current/total)
- Tempo control (40-240 BPM)
- Loop region selection (start/end %)
- Reset to beginning

### 5. Download Options
- Export audio files (MP3)
- Export MIDI files for further editing
- Automatic filename generation

### 6. User Library
- Grid view of all uploaded scores
- Conversion history per score
- Quick actions (open, delete)
- Preview thumbnails
- Metadata display (upload date, file size)

## 🔌 API Endpoints

All endpoints are prefixed with `/make-server-f24025d1/`

### Authentication
- `POST /signup` - Create new user account
  - Body: `{ email, password, name }`
  - Returns: `{ user, message }`

### Scores
- `POST /scores/upload` - Upload sheet music file
  - Requires: Authorization header
  - Body: FormData with 'file' field
  - Returns: `{ scoreId, url, metadata }`

- `DELETE /scores/:scoreId` - Delete score and conversions
  - Requires: Authorization header
  - Returns: `{ message }`

### Conversions
- `POST /scores/:scoreId/convert` - Convert score to audio/MIDI
  - Requires: Authorization header
  - Body: `{ instruments, satbConfig, tempo }`
  - Returns: `{ conversionId, status }`

- `GET /conversions/:conversionId` - Get conversion status
  - Requires: Authorization header
  - Returns: `{ status, audioUrl, midiUrl, ... }`

### Library
- `GET /library` - Get user's scores and conversions
  - Requires: Authorization header
  - Returns: `{ library: [...] }`

## 🎨 Design System

### Components

#### Button
- **Variants**: primary, secondary, outline, ghost, danger
- **Sizes**: sm, md, lg
- **Props**: fullWidth, disabled

#### Card
- **Variants**: default, outlined, elevated
- **Subcomponents**: CardHeader, CardTitle, CardDescription, CardContent, CardFooter

#### Input
- **Props**: label, error, helperText
- **Types**: text, email, password, number, etc.

#### Chip
- **Variants**: default, primary, success, warning
- **Sizes**: sm, md
- **Features**: selectable, removable

### Colors
- Primary: Blue (#2563EB)
- Success: Green
- Warning: Orange
- Danger: Red
- Gray scale: 50-900

### Typography
- Headings: Bold, varying sizes
- Body: Regular weight
- Captions: Small, gray text

## 🔐 Authentication Flow

### Sign Up
1. User enters name, email, password
2. Frontend validates input
3. Call `POST /signup` → creates user with Supabase Auth
4. Auto-login after successful signup
5. Navigate to upload page

### Sign In
1. User enters email, password
2. Call Supabase `signInWithPassword`
3. Store session in auth context
4. Navigate to library

### Protected Routes
- Wrapped in `<ProtectedRoute>` component
- Redirects to `/login` if unauthenticated
- Shows loading state while checking session

## 🛠️ Development

### Prerequisites
- Node.js 18+
- pnpm (or npm)
- Supabase account

### Setup
1. Clone repository
2. Install dependencies: `pnpm install`
3. Configure Supabase (automatic via Figma Make)
4. Run development server: `pnpm dev`

### Environment Variables
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Public anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side only)

## 🚀 Production Integration

### Optical Music Recognition (OMR)
The current implementation simulates conversion. For production, integrate:

**Option 1: Audiveris (Open Source)**
- Java-based OMR engine
- Outputs MusicXML
- Self-hosted or containerized

**Option 2: PhotoScore API (Commercial)**
- Cloud-based OMR service
- High accuracy
- Paid per-conversion

**Option 3: Custom ML Model**
- Google Cloud Vision for symbol detection
- Custom training for music notation
- TensorFlow/PyTorch implementation

### Audio Synthesis
**Option 1: FluidSynth**
```bash
# Install FluidSynth
apt-get install fluidsynth

# Convert MIDI to audio
fluidsynth -F output.wav soundfont.sf2 input.mid
```

**Option 2: TiMidity++**
```bash
timidity input.mid -Ow -o output.wav
```

**Option 3: Cloud Services**
- AWS Polly (for vocal synthesis)
- Google Cloud Text-to-Speech
- Azure Cognitive Services

### Background Processing
Implement async conversion with job queues:
```typescript
// Example with Bull (Redis-based queue)
import Queue from 'bull';

const conversionQueue = new Queue('music-conversion', {
  redis: { host: 'localhost', port: 6379 }
});

conversionQueue.process(async (job) => {
  const { scoreId, config } = job.data;
  
  // 1. Download score from storage
  // 2. Run OMR (Audiveris/PhotoScore)
  // 3. Process MusicXML with instrument config
  // 4. Synthesize audio (FluidSynth)
  // 5. Upload audio/MIDI to storage
  // 6. Update conversion status in database
  
  return { audioUrl, midiUrl };
});
```

### Scaling Considerations
- **Storage**: Use CDN for score images and audio files
- **Processing**: Horizontal scaling with worker nodes
- **Database**: Connection pooling, read replicas
- **Caching**: Redis for frequently accessed scores

## 📝 Code Comments

All components include comprehensive JSDoc comments explaining:
- **Purpose**: What the component does
- **Props**: Input parameters and types
- **State**: Internal state management
- **API Integration**: Where to connect backend services
- **Usage Examples**: How to use the component

Example:
```typescript
/**
 * Upload Area Component
 * 
 * Drag-and-drop file upload area for sheet music images/PDFs.
 * 
 * Props:
 * - onFileSelect: Callback when file is selected
 * - maxSizeMB: Maximum file size in megabytes (default: 10)
 * - disabled: Disable upload
 * 
 * API Integration Point:
 * After file selection, parent component should call:
 * POST /scores/upload with FormData containing the file
 */
```

## 🧪 Testing Notes

### Manual Testing Checklist
- [ ] Upload various file types (JPG, PNG, PDF)
- [ ] Test file validation (size, type)
- [ ] Select multiple instruments
- [ ] Configure SATB voices
- [ ] Test playback controls
- [ ] Verify audio download
- [ ] Test MIDI download
- [ ] Check library pagination
- [ ] Delete scores
- [ ] Sign up new user
- [ ] Sign in existing user
- [ ] Sign out

### Edge Cases
- Empty library state
- Failed conversion handling
- Network errors
- Large file uploads
- Concurrent conversions

## 📊 Data Models

### Score
```typescript
{
  id: string;
  userId: string;
  fileName: string;
  filePath: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
  url: string;
  conversions?: Conversion[];
}
```

### Conversion
```typescript
{
  id: string;
  scoreId: string;
  userId: string;
  instruments: string[];
  satbConfig: SATBConfig;
  tempo: number;
  status: 'processing' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  audioUrl?: string;
  midiUrl?: string;
  error?: string;
}
```

## 🤝 Contributing

### Code Style
- Use TypeScript for all new files
- Follow React best practices (hooks, functional components)
- Comment complex logic
- Use semantic HTML
- Maintain accessibility (ARIA labels, keyboard navigation)

### Component Guidelines
1. Keep components small and focused
2. Extract reusable logic to custom hooks
3. Use consistent naming (PascalCase for components)
4. Props should be well-typed with interfaces
5. Include JSDoc comments

## 📄 License

This project is part of Figma Make demonstration. Not intended for production use without proper OMR and synthesis integration.

## 🙋 Support

For questions or issues:
1. Check the Help page (`/help`) in the app
2. Review API integration comments in code
3. Refer to this README for architecture details

---

**Built with** ❤️ **using Figma Make**
