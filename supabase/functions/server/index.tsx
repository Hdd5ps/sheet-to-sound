/**
 * Sheet Music to Audio Conversion - Backend Server
 * 
 * This Hono-based edge function provides backend services for:
 * - User authentication (signup, login)
 * - Sheet music upload and storage
 * - Music notation conversion orchestration
 * - Audio/MIDI file generation and storage
 * - User library management
 * 
 * Architecture:
 * - Frontend → Server (this file) → Database/Storage
 * - Uses Supabase Auth for user management
 * - Uses Supabase Storage for file uploads (scores, audio, MIDI)
 * - Uses KV store for score metadata and conversion history
 */

import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js';
import * as kv from './kv_store.tsx';

const app = new Hono();

// Configure CORS and logging
app.use('*', cors());
app.use('*', logger(console.log));

// Initialize Supabase client with service role for admin operations
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Bucket names for file storage
const SCORE_BUCKET = 'make-f24025d1-scores';
const AUDIO_BUCKET = 'make-f24025d1-audio';
const MIDI_BUCKET = 'make-f24025d1-midi';

/**
 * Initialize storage buckets on server startup
 * Creates private buckets for storing user-uploaded scores and generated files
 */
async function initializeBuckets() {
  const buckets = [SCORE_BUCKET, AUDIO_BUCKET, MIDI_BUCKET];
  
  const { data: existingBuckets } = await supabase.storage.listBuckets();
  
  for (const bucketName of buckets) {
    const bucketExists = existingBuckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error } = await supabase.storage.createBucket(bucketName, {
        public: false, // Private buckets for user security
      });
      
      if (error) {
        console.log(`Error creating bucket ${bucketName}:`, error);
      } else {
        console.log(`Created bucket: ${bucketName}`);
      }
    }
  }
}

// Initialize buckets on startup
initializeBuckets();

/**
 * Helper: Extract and verify access token from request headers
 */
async function verifyAuth(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split(' ')[1];
  if (!accessToken) {
    return { user: null, error: 'No authorization token provided' };
  }
  
  const { data: { user }, error } = await supabase.auth.getUser(accessToken);
  
  if (error || !user?.id) {
    return { user: null, error: 'Invalid or expired token' };
  }
  
  return { user, error: null };
}

/**
 * POST /make-server-f24025d1/signup
 * Create a new user account
 * 
 * Body: { email, password, name }
 * Returns: { user, message }
 */
app.post('/make-server-f24025d1/signup', async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name: name || email.split('@')[0] },
      // Automatically confirm email since email server hasn't been configured
      email_confirm: true,
    });
    
    if (error) {
      console.log('Signup error:', error);
      return c.json({ error: `Failed to create user: ${error.message}` }, 400);
    }
    
    return c.json({ 
      user: data.user,
      message: 'Account created successfully' 
    });
  } catch (error) {
    console.log('Signup exception:', error);
    return c.json({ error: 'Internal server error during signup' }, 500);
  }
});

/**
 * POST /make-server-f24025d1/scores/upload
 * Upload a sheet music image/PDF
 * 
 * Requires: Authorization header with access token
 * Body: FormData with 'file' field
 * Returns: { scoreId, url, metadata }
 */
app.post('/make-server-f24025d1/scores/upload', async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }
    
    const formData = await c.req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return c.json({ error: 'No file provided' }, 400);
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ 
        error: 'Invalid file type. Please upload JPG, PNG, or PDF files only.' 
      }, 400);
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}/${timestamp}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(SCORE_BUCKET)
      .upload(fileName, file, {
        contentType: file.type,
        upsert: false,
      });
    
    if (uploadError) {
      console.log('Upload error:', uploadError);
      return c.json({ error: `Failed to upload file: ${uploadError.message}` }, 500);
    }
    
    // Create signed URL for private access (valid for 1 year)
    const { data: signedUrlData } = await supabase.storage
      .from(SCORE_BUCKET)
      .createSignedUrl(fileName, 60 * 60 * 24 * 365);
    
    // Store metadata in KV store
    const scoreId = `score_${user.id}_${timestamp}`;
    const scoreMetadata = {
      id: scoreId,
      userId: user.id,
      fileName: file.name,
      filePath: fileName,
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      url: signedUrlData?.signedUrl || '',
    };
    
    await kv.set(scoreId, scoreMetadata);
    
    // Add to user's score list
    const userScoresKey = `user_scores_${user.id}`;
    const existingScores = await kv.get(userScoresKey) || [];
    await kv.set(userScoresKey, [...existingScores, scoreId]);
    
    return c.json({ 
      scoreId,
      url: signedUrlData?.signedUrl,
      metadata: scoreMetadata 
    });
  } catch (error) {
    console.log('Upload exception:', error);
    return c.json({ error: 'Internal server error during file upload' }, 500);
  }
});

/**
 * POST /make-server-f24025d1/scores/:scoreId/convert
 * Convert sheet music to audio/MIDI
 * 
 * Requires: Authorization header
 * Body: { instruments, satbConfig, tempo }
 * Returns: { conversionId, status }
 * 
 * NOTE: This endpoint simulates conversion. In production, integrate with:
 * - OMR (Optical Music Recognition) API like Audiveris, PhotoScore API
 * - Music synthesis engine like FluidSynth, TiMidity++
 * - Or cloud services like Google Cloud Vision + custom MIDI generation
 */
app.post('/make-server-f24025d1/scores/:scoreId/convert', async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }
    
    const scoreId = c.req.param('scoreId');
    const { instruments, satbConfig, tempo } = await c.req.json();
    
    // Verify score ownership
    const scoreMetadata = await kv.get(scoreId);
    if (!scoreMetadata || scoreMetadata.userId !== user.id) {
      return c.json({ error: 'Score not found or access denied' }, 404);
    }
    
    // Create conversion job
    const conversionId = `conversion_${user.id}_${Date.now()}`;
    const conversionData = {
      id: conversionId,
      scoreId,
      userId: user.id,
      instruments: instruments || [],
      satbConfig: satbConfig || {},
      tempo: tempo || 120,
      status: 'processing',
      createdAt: new Date().toISOString(),
    };
    
    await kv.set(conversionId, conversionData);
    
    // TODO: Integration point for actual OMR and conversion
    // Example workflow:
    // 1. Call OMR API with score image → get MusicXML/MIDI
    // 2. Process MusicXML with selected instruments
    // 3. Generate audio using synthesis engine
    // 4. Upload audio/MIDI to storage buckets
    // 5. Update conversion status
    
    // Simulate async processing (in production, this would be a background job)
    setTimeout(async () => {
      try {
        // In production: generate actual audio/MIDI files here
        // For now, we'll create dummy file references
        
        const audioPath = `${user.id}/${conversionId}.mp3`;
        const midiPath = `${user.id}/${conversionId}.mid`;
        
        // Create signed URLs (these would point to actual generated files)
        const { data: audioUrl } = await supabase.storage
          .from(AUDIO_BUCKET)
          .createSignedUrl(audioPath, 60 * 60 * 24 * 365);
        
        const { data: midiUrl } = await supabase.storage
          .from(MIDI_BUCKET)
          .createSignedUrl(midiPath, 60 * 60 * 24 * 365);
        
        // Update conversion with results
        const updatedConversion = {
          ...conversionData,
          status: 'completed',
          audioUrl: audioUrl?.signedUrl,
          midiUrl: midiUrl?.signedUrl,
          audioPath,
          midiPath,
          completedAt: new Date().toISOString(),
        };
        
        await kv.set(conversionId, updatedConversion);
        
        // Add to user's conversion history
        const userConversionsKey = `user_conversions_${user.id}`;
        const existingConversions = await kv.get(userConversionsKey) || [];
        await kv.set(userConversionsKey, [...existingConversions, conversionId]);
      } catch (error) {
        console.log('Background conversion error:', error);
        await kv.set(conversionId, {
          ...conversionData,
          status: 'failed',
          error: 'Conversion processing failed',
        });
      }
    }, 2000); // Simulate 2-second processing time
    
    return c.json({ 
      conversionId,
      status: 'processing',
      message: 'Conversion started. Check status using the conversion ID.' 
    });
  } catch (error) {
    console.log('Conversion endpoint exception:', error);
    return c.json({ error: 'Internal server error during conversion' }, 500);
  }
});

/**
 * GET /make-server-f24025d1/conversions/:conversionId
 * Check conversion status and get results
 * 
 * Requires: Authorization header
 * Returns: { status, audioUrl, midiUrl, ... }
 */
app.get('/make-server-f24025d1/conversions/:conversionId', async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }
    
    const conversionId = c.req.param('conversionId');
    const conversionData = await kv.get(conversionId);
    
    if (!conversionData || conversionData.userId !== user.id) {
      return c.json({ error: 'Conversion not found or access denied' }, 404);
    }
    
    return c.json(conversionData);
  } catch (error) {
    console.log('Get conversion exception:', error);
    return c.json({ error: 'Internal server error fetching conversion' }, 500);
  }
});

/**
 * GET /make-server-f24025d1/library
 * Get user's score library
 * 
 * Requires: Authorization header
 * Returns: { scores: [...] }
 */
app.get('/make-server-f24025d1/library', async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }
    
    // Get user's score IDs
    const userScoresKey = `user_scores_${user.id}`;
    const scoreIds = await kv.get(userScoresKey) || [];
    
    // Get user's conversion IDs
    const userConversionsKey = `user_conversions_${user.id}`;
    const conversionIds = await kv.get(userConversionsKey) || [];
    
    // Fetch all score metadata
    const scores = await kv.mget(scoreIds);
    
    // Fetch all conversion metadata
    const conversions = await kv.mget(conversionIds);
    
    // Group conversions by scoreId
    const conversionsByScore = conversions.reduce((acc, conv) => {
      if (!acc[conv.scoreId]) {
        acc[conv.scoreId] = [];
      }
      acc[conv.scoreId].push(conv);
      return acc;
    }, {} as Record<string, any[]>);
    
    // Combine scores with their conversions
    const library = scores.map(score => ({
      ...score,
      conversions: conversionsByScore[score.id] || [],
    }));
    
    // Sort by upload date (newest first)
    library.sort((a, b) => 
      new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
    
    return c.json({ library });
  } catch (error) {
    console.log('Library fetch exception:', error);
    return c.json({ error: 'Internal server error fetching library' }, 500);
  }
});

/**
 * DELETE /make-server-f24025d1/scores/:scoreId
 * Delete a score and all its conversions
 * 
 * Requires: Authorization header
 * Returns: { message }
 */
app.delete('/make-server-f24025d1/scores/:scoreId', async (c) => {
  try {
    const { user, error: authError } = await verifyAuth(c.req.raw);
    
    if (authError || !user) {
      return c.json({ error: authError || 'Unauthorized' }, 401);
    }
    
    const scoreId = c.req.param('scoreId');
    const scoreMetadata = await kv.get(scoreId);
    
    if (!scoreMetadata || scoreMetadata.userId !== user.id) {
      return c.json({ error: 'Score not found or access denied' }, 404);
    }
    
    // Delete score file from storage
    await supabase.storage.from(SCORE_BUCKET).remove([scoreMetadata.filePath]);
    
    // Get and delete all conversions for this score
    const userConversionsKey = `user_conversions_${user.id}`;
    const conversionIds = await kv.get(userConversionsKey) || [];
    const conversions = await kv.mget(conversionIds);
    
    const scoreConversions = conversions.filter(c => c.scoreId === scoreId);
    
    for (const conversion of scoreConversions) {
      // Delete audio/MIDI files if they exist
      if (conversion.audioPath) {
        await supabase.storage.from(AUDIO_BUCKET).remove([conversion.audioPath]);
      }
      if (conversion.midiPath) {
        await supabase.storage.from(MIDI_BUCKET).remove([conversion.midiPath]);
      }
      
      // Delete conversion metadata
      await kv.del(conversion.id);
    }
    
    // Remove conversions from user's list
    const updatedConversions = conversionIds.filter(
      id => !scoreConversions.find(c => c.id === id)
    );
    await kv.set(userConversionsKey, updatedConversions);
    
    // Delete score metadata
    await kv.del(scoreId);
    
    // Remove score from user's list
    const userScoresKey = `user_scores_${user.id}`;
    const scoreIds = await kv.get(userScoresKey) || [];
    await kv.set(userScoresKey, scoreIds.filter(id => id !== scoreId));
    
    return c.json({ message: 'Score and all conversions deleted successfully' });
  } catch (error) {
    console.log('Delete score exception:', error);
    return c.json({ error: 'Internal server error during deletion' }, 500);
  }
});

/**
 * Health check endpoint
 */
app.get('/make-server-f24025d1/health', (c) => {
  return c.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start the server
Deno.serve(app.fetch);
