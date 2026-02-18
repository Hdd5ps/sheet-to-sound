/**
 * Instrument Database
 * 
 * Comprehensive list of orchestral and ensemble instruments
 * including full percussion section.
 */

import { Instrument } from './types';

export const INSTRUMENTS: Instrument[] = [
  // STRINGS
  { id: 'violin', name: 'Violin', category: 'strings' },
  { id: 'viola', name: 'Viola', category: 'strings' },
  { id: 'cello', name: 'Cello', category: 'strings' },
  { id: 'double-bass', name: 'Double Bass', category: 'strings' },
  { id: 'harp', name: 'Harp', category: 'strings' },
  { id: 'guitar', name: 'Guitar', category: 'strings' },
  
  // WOODWINDS
  { id: 'flute', name: 'Flute', category: 'woodwinds' },
  { id: 'piccolo', name: 'Piccolo', category: 'woodwinds' },
  { id: 'oboe', name: 'Oboe', category: 'woodwinds' },
  { id: 'english-horn', name: 'English Horn', category: 'woodwinds' },
  { id: 'clarinet', name: 'Clarinet', category: 'woodwinds' },
  { id: 'bass-clarinet', name: 'Bass Clarinet', category: 'woodwinds' },
  { id: 'bassoon', name: 'Bassoon', category: 'woodwinds' },
  { id: 'contrabassoon', name: 'Contrabassoon', category: 'woodwinds' },
  { id: 'saxophone', name: 'Saxophone', category: 'woodwinds' },
  
  // BRASS
  { id: 'trumpet', name: 'Trumpet', category: 'brass' },
  { id: 'french-horn', name: 'French Horn', category: 'brass' },
  { id: 'trombone', name: 'Trombone', category: 'brass' },
  { id: 'tuba', name: 'Tuba', category: 'brass' },
  { id: 'euphonium', name: 'Euphonium', category: 'brass' },
  
  // PERCUSSION - Pitched
  { id: 'timpani', name: 'Timpani', category: 'percussion' },
  { id: 'xylophone', name: 'Xylophone', category: 'percussion' },
  { id: 'marimba', name: 'Marimba', category: 'percussion' },
  { id: 'vibraphone', name: 'Vibraphone', category: 'percussion' },
  { id: 'glockenspiel', name: 'Glockenspiel', category: 'percussion' },
  { id: 'tubular-bells', name: 'Tubular Bells', category: 'percussion' },
  
  // PERCUSSION - Unpitched (including requested instruments)
  { id: 'snare-drum', name: 'Snare Drum', category: 'percussion' },
  { id: 'bass-drum', name: 'Bass Drum', category: 'percussion' },
  { id: 'cymbals', name: 'Cymbals', category: 'percussion' },
  { id: 'tambourine', name: 'Tambourine', category: 'percussion' },
  { id: 'tam-tam', name: 'Tam-Tam (Gong)', category: 'percussion' },
  { id: 'cowbell', name: 'Cowbell', category: 'percussion' },
  { id: 'triangle', name: 'Triangle', category: 'percussion' },
  { id: 'wood-block', name: 'Wood Block', category: 'percussion' },
  { id: 'claves', name: 'Claves', category: 'percussion' },
  { id: 'castanets', name: 'Castanets', category: 'percussion' },
  { id: 'maracas', name: 'Maracas', category: 'percussion' },
  { id: 'guiro', name: 'Guiro', category: 'percussion' },
  { id: 'cabasa', name: 'Cabasa', category: 'percussion' },
  { id: 'shaker', name: 'Shaker', category: 'percussion' },
  { id: 'bongos', name: 'Bongos', category: 'percussion' },
  { id: 'congas', name: 'Congas', category: 'percussion' },
  { id: 'toms', name: 'Tom-Toms', category: 'percussion' },
  
  // KEYBOARDS
  { id: 'piano', name: 'Piano', category: 'keyboards' },
  { id: 'organ', name: 'Organ', category: 'keyboards' },
  { id: 'harpsichord', name: 'Harpsichord', category: 'keyboards' },
  { id: 'celesta', name: 'Celesta', category: 'keyboards' },
  
  // VOICES (for non-SATB individual parts)
  { id: 'soprano', name: 'Soprano', category: 'voices' },
  { id: 'alto', name: 'Alto', category: 'voices' },
  { id: 'tenor', name: 'Tenor', category: 'voices' },
  { id: 'bass-voice', name: 'Bass', category: 'voices' },
  { id: 'choir', name: 'Mixed Choir', category: 'voices' },
];

/**
 * Get instruments by category
 */
export function getInstrumentsByCategory(category: string): Instrument[] {
  return INSTRUMENTS.filter(inst => inst.category === category);
}

/**
 * Get instrument by ID
 */
export function getInstrumentById(id: string): Instrument | undefined {
  return INSTRUMENTS.find(inst => inst.id === id);
}

/**
 * Instrument categories for filtering
 */
export const INSTRUMENT_CATEGORIES = [
  { id: 'strings', name: 'Strings', icon: '🎻' },
  { id: 'woodwinds', name: 'Woodwinds', icon: '🎺' },
  { id: 'brass', name: 'Brass', icon: '🎷' },
  { id: 'percussion', name: 'Percussion', icon: '🥁' },
  { id: 'keyboards', name: 'Keyboards', icon: '🎹' },
  { id: 'voices', name: 'Voices', icon: '🎤' },
];
