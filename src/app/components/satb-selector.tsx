/**
 * SATB Voice Selector Component
 * 
 * Controls for Soprano, Alto, Tenor, Bass choir voices.
 * 
 * Features:
 * - Solo individual voices
 * - Mute/unmute voices
 * - Volume control per voice
 * - Visual feedback for active voices
 * 
 * Props:
 * - config: Current SATB configuration
 * - onChange: Callback when configuration changes
 * - disabled: Disable all controls
 * 
 * State:
 * Each voice has: enabled (mute/unmute), solo, volume (0-100)
 */

import React from 'react';
import { Volume2, VolumeX, Music2 } from 'lucide-react';
import { SATBConfig } from '../../lib/types';
import { cn } from '../../lib/utils';
import { Button } from './ui/button';

export interface SATBSelectorProps {
  config: SATBConfig;
  onChange: (config: SATBConfig) => void;
  disabled?: boolean;
}

const VOICES = [
  { id: 'soprano', label: 'Soprano', color: 'blue' },
  { id: 'alto', label: 'Alto', color: 'purple' },
  { id: 'tenor', label: 'Tenor', color: 'green' },
  { id: 'bass', label: 'Bass', color: 'orange' },
] as const;

export function SATBSelector({ config, onChange, disabled = false }: SATBSelectorProps) {
  function handleToggleEnabled(voiceId: keyof SATBConfig) {
    onChange({
      ...config,
      [voiceId]: {
        ...config[voiceId],
        enabled: !config[voiceId].enabled,
      },
    });
  }
  
  function handleToggleSolo(voiceId: keyof SATBConfig) {
    const newConfig = { ...config };
    
    // If this voice is already solo, unsolo it
    if (config[voiceId].solo) {
      newConfig[voiceId] = { ...newConfig[voiceId], solo: false };
    } else {
      // Solo this voice and unsolo all others
      VOICES.forEach(voice => {
        newConfig[voice.id] = {
          ...newConfig[voice.id],
          solo: voice.id === voiceId,
        };
      });
    }
    
    onChange(newConfig);
  }
  
  function handleVolumeChange(voiceId: keyof SATBConfig, volume: number) {
    onChange({
      ...config,
      [voiceId]: {
        ...config[voiceId],
        volume,
      },
    });
  }
  
  function handleResetAll() {
    const resetConfig: SATBConfig = {
      soprano: { enabled: true, solo: false, volume: 100 },
      alto: { enabled: true, solo: false, volume: 100 },
      tenor: { enabled: true, solo: false, volume: 100 },
      bass: { enabled: true, solo: false, volume: 100 },
    };
    onChange(resetConfig);
  }
  
  const anySolo = VOICES.some(voice => config[voice.id].solo);
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Music2 className="w-5 h-5" />
            SATB Voice Controls
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Manage choir voices: solo, mute, or adjust volume
          </p>
        </div>
        
        <Button 
          variant="outline" 
          size="sm"
          onClick={handleResetAll}
          disabled={disabled}
        >
          Reset All
        </Button>
      </div>
      
      {/* Voice Controls */}
      <div className="space-y-3">
        {VOICES.map(voice => {
          const voiceConfig = config[voice.id];
          const isActive = voiceConfig.enabled && (!anySolo || voiceConfig.solo);
          
          return (
            <div
              key={voice.id}
              className={cn(
                'border-2 rounded-lg p-4 transition-all',
                isActive ? `border-${voice.color}-500 bg-${voice.color}-50` : 'border-gray-200 bg-white',
                !voiceConfig.enabled && 'opacity-50'
              )}
            >
              <div className="flex items-center gap-4">
                {/* Voice Label */}
                <div className="w-24">
                  <p className={cn(
                    'font-semibold',
                    isActive ? `text-${voice.color}-700` : 'text-gray-700'
                  )}>
                    {voice.label}
                  </p>
                </div>
                
                {/* Mute/Unmute Button */}
                <button
                  onClick={() => handleToggleEnabled(voice.id)}
                  disabled={disabled}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    voiceConfig.enabled 
                      ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                      : 'bg-red-100 text-red-700 hover:bg-red-200',
                    disabled && 'opacity-50 cursor-not-allowed'
                  )}
                  aria-label={voiceConfig.enabled ? 'Mute' : 'Unmute'}
                >
                  {voiceConfig.enabled ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </button>
                
                {/* Solo Button */}
                <button
                  onClick={() => handleToggleSolo(voice.id)}
                  disabled={disabled || !voiceConfig.enabled}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    voiceConfig.solo 
                      ? `bg-${voice.color}-600 text-white` 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200',
                    (disabled || !voiceConfig.enabled) && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {voiceConfig.solo ? 'Solo On' : 'Solo'}
                </button>
                
                {/* Volume Slider */}
                <div className="flex-1 flex items-center gap-3">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={voiceConfig.volume}
                    onChange={(e) => handleVolumeChange(voice.id, parseInt(e.target.value))}
                    disabled={disabled || !voiceConfig.enabled}
                    className={cn(
                      'flex-1 h-2 rounded-lg appearance-none cursor-pointer',
                      `accent-${voice.color}-600`,
                      (disabled || !voiceConfig.enabled) && 'opacity-50 cursor-not-allowed'
                    )}
                  />
                  <span className="text-sm text-gray-600 w-12 text-right">
                    {voiceConfig.volume}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Status Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
        <p className="text-sm text-gray-700">
          <strong>Active Voices:</strong>{' '}
          {VOICES.filter(voice => config[voice.id].enabled && (!anySolo || config[voice.id].solo))
            .map(voice => voice.label)
            .join(', ') || 'None'}
        </p>
        {anySolo && (
          <p className="text-sm text-blue-700 mt-1">
            🎵 Solo mode active
          </p>
        )}
      </div>
    </div>
  );
}
