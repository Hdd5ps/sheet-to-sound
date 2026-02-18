/**
 * Playback Controls Component
 * 
 * Audio playback interface with:
 * - Play/Pause button
 * - Progress scrubber with timeline
 * - Tempo control (BPM)
 * - Loop region selection
 * - Time display (current / total)
 * 
 * Props:
 * - audioUrl: URL of the audio file to play
 * - onTempoChange: Callback when tempo changes
 * - onDownloadAudio: Callback to download audio
 * - onDownloadMidi: Callback to download MIDI
 * - disabled: Disable controls
 * 
 * State:
 * Manages playback state including current time, duration, playing status
 * 
 * API Integration:
 * - Audio element for playback
 * - Tempo changes may require re-generation (call conversion API with new tempo)
 */

import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, RotateCcw, Download } from 'lucide-react';
import { Button } from './ui/button';
import { formatDuration } from '../../lib/utils';
import { cn } from '../../lib/utils';

export interface PlaybackControlsProps {
  audioUrl?: string;
  onTempoChange?: (tempo: number) => void;
  onDownloadAudio?: () => void;
  onDownloadMidi?: () => void;
  disabled?: boolean;
  initialTempo?: number;
}

export function PlaybackControls({
  audioUrl,
  onTempoChange,
  onDownloadAudio,
  onDownloadMidi,
  disabled = false,
  initialTempo = 120,
}: PlaybackControlsProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [tempo, setTempo] = useState(initialTempo);
  const [loopEnabled, setLoopEnabled] = useState(false);
  const [loopStart, setLoopStart] = useState(0);
  const [loopEnd, setLoopEnd] = useState(100);
  
  // Update audio source when URL changes
  useEffect(() => {
    if (audioRef.current && audioUrl) {
      audioRef.current.src = audioUrl;
      audioRef.current.load();
    }
  }, [audioUrl]);
  
  // Handle audio time updates
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    
    function handleTimeUpdate() {
      setCurrentTime(audio!.currentTime);
      
      // Handle loop region
      if (loopEnabled && duration > 0) {
        const loopStartTime = (loopStart / 100) * duration;
        const loopEndTime = (loopEnd / 100) * duration;
        
        if (audio!.currentTime >= loopEndTime) {
          audio!.currentTime = loopStartTime;
        }
      }
    }
    
    function handleLoadedMetadata() {
      setDuration(audio!.duration);
    }
    
    function handleEnded() {
      setIsPlaying(false);
      if (!loopEnabled) {
        audio!.currentTime = 0;
      }
    }
    
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    
    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [loopEnabled, loopStart, loopEnd, duration]);
  
  function handlePlayPause() {
    if (!audioRef.current || disabled) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  }
  
  function handleSeek(value: number) {
    if (!audioRef.current || disabled) return;
    
    const newTime = (value / 100) * duration;
    audioRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  }
  
  function handleReset() {
    if (!audioRef.current || disabled) return;
    
    audioRef.current.currentTime = 0;
    setCurrentTime(0);
    setIsPlaying(false);
    audioRef.current.pause();
  }
  
  function handleTempoChange(newTempo: number) {
    setTempo(newTempo);
    onTempoChange?.(newTempo);
  }
  
  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
  const hasAudio = Boolean(audioUrl);
  
  return (
    <div className="space-y-4">
      {/* Hidden audio element */}
      <audio ref={audioRef} />
      
      {/* Main Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="space-y-4">
          {/* Play/Pause and Reset */}
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={handlePlayPause}
              disabled={disabled || !hasAudio}
              className="w-16 h-16 rounded-full"
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={disabled || !hasAudio}
              aria-label="Reset to beginning"
            >
              <RotateCcw className="w-5 h-5" />
            </Button>
            
            {/* Time Display */}
            <div className="flex-1 text-sm text-gray-600 font-mono">
              {formatDuration(currentTime)} / {formatDuration(duration)}
            </div>
          </div>
          
          {/* Progress Scrubber */}
          <div className="space-y-2">
            <input
              type="range"
              min="0"
              max="100"
              value={progress}
              onChange={(e) => handleSeek(parseFloat(e.target.value))}
              disabled={disabled || !hasAudio}
              className={cn(
                'w-full h-2 rounded-lg appearance-none cursor-pointer accent-blue-600',
                (disabled || !hasAudio) && 'opacity-50 cursor-not-allowed'
              )}
            />
            
            {/* Loop Region Controls */}
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={loopEnabled}
                  onChange={(e) => setLoopEnabled(e.target.checked)}
                  disabled={disabled || !hasAudio}
                  className="rounded"
                />
                Loop
              </label>
              
              {loopEnabled && (
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-600">From</span>
                  <input
                    type="number"
                    min="0"
                    max={loopEnd - 1}
                    value={loopStart}
                    onChange={(e) => setLoopStart(parseInt(e.target.value))}
                    disabled={disabled}
                    className="w-16 px-2 py-1 border rounded"
                  />
                  <span className="text-gray-600">to</span>
                  <input
                    type="number"
                    min={loopStart + 1}
                    max="100"
                    value={loopEnd}
                    onChange={(e) => setLoopEnd(parseInt(e.target.value))}
                    disabled={disabled}
                    className="w-16 px-2 py-1 border rounded"
                  />
                  <span className="text-gray-600">%</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Tempo Control */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-gray-700 w-20">
            Tempo (BPM)
          </label>
          
          <input
            type="range"
            min="40"
            max="240"
            value={tempo}
            onChange={(e) => handleTempoChange(parseInt(e.target.value))}
            disabled={disabled}
            className={cn(
              'flex-1 h-2 rounded-lg appearance-none cursor-pointer accent-blue-600',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
          
          <input
            type="number"
            min="40"
            max="240"
            value={tempo}
            onChange={(e) => handleTempoChange(parseInt(e.target.value))}
            disabled={disabled}
            className="w-20 px-3 py-2 border rounded-lg text-center"
          />
        </div>
        
        <p className="text-xs text-gray-500 mt-2">
          💡 Changing tempo will regenerate the audio. Current playback uses original tempo.
        </p>
      </div>
      
      {/* Download Controls */}
      {(onDownloadAudio || onDownloadMidi) && (
        <div className="flex gap-3">
          {onDownloadAudio && (
            <Button
              variant="outline"
              onClick={onDownloadAudio}
              disabled={disabled || !hasAudio}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download Audio
            </Button>
          )}
          
          {onDownloadMidi && (
            <Button
              variant="outline"
              onClick={onDownloadMidi}
              disabled={disabled || !hasAudio}
              className="flex-1"
            >
              <Download className="w-4 h-4 mr-2" />
              Download MIDI
            </Button>
          )}
        </div>
      )}
      
      {!hasAudio && (
        <div className="text-center py-8 text-gray-500">
          <p>No audio available. Convert a score to generate playback.</p>
        </div>
      )}
    </div>
  );
}
