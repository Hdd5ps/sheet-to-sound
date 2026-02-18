/**
 * Type Definitions
 * 
 * Core data structures used throughout the application.
 */

/**
 * User account information
 */
export interface User {
  id: string;
  email: string;
  name?: string;
}

/**
 * Sheet music score metadata
 */
export interface Score {
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

/**
 * Music conversion job
 */
export interface Conversion {
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
  audioPath?: string;
  midiPath?: string;
  error?: string;
}

/**
 * SATB (Soprano, Alto, Tenor, Bass) voice configuration
 */
export interface SATBConfig {
  soprano: VoiceSettings;
  alto: VoiceSettings;
  tenor: VoiceSettings;
  bass: VoiceSettings;
}

/**
 * Individual voice settings
 */
export interface VoiceSettings {
  enabled: boolean;
  solo: boolean;
  volume: number;
}

/**
 * Playback state
 */
export interface PlaybackState {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  tempo: number;
  loop: {
    enabled: boolean;
    start: number;
    end: number;
  };
}

/**
 * Instrument definition
 */
export interface Instrument {
  id: string;
  name: string;
  category: InstrumentCategory;
  icon?: string;
}

/**
 * Instrument categories
 */
export type InstrumentCategory = 
  | 'strings'
  | 'woodwinds'
  | 'brass'
  | 'percussion'
  | 'keyboards'
  | 'voices';

/**
 * Upload validation result
 */
export interface UploadValidation {
  valid: boolean;
  error?: string;
  warnings?: string[];
}
