/**
 * Playback Page
 * 
 * Audio playback interface for converted scores.
 * 
 * Features:
 * - Display score preview
 * - Playback controls
 * - Instrument/voice toggle
 * - Download options
 * - Regenerate with different settings
 * 
 * Route: /playback/:conversionId
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { PlaybackControls } from '../components/playback-controls';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Chip } from '../components/ui/chip';
import { apiCall } from '../../lib/supabase';
import { Conversion, Score } from '../../lib/types';
import { INSTRUMENTS } from '../../lib/instruments';
import { toast } from 'sonner';

export function PlaybackPage() {
  const { conversionId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [conversion, setConversion] = useState<Conversion | null>(null);
  const [score, setScore] = useState<Score | null>(null);
  
  useEffect(() => {
    if (conversionId) {
      loadConversionData(conversionId);
    }
  }, [conversionId]);
  
  async function loadConversionData(id: string) {
    try {
      const response = await apiCall(`/conversions/${id}`);
      const data: Conversion = await response.json();
      
      if (!response.ok) {
        throw new Error('Failed to load conversion');
      }
      
      setConversion(data);
      
      // Load score data
      const scoreResponse = await apiCall(`/library`);
      const libraryData = await scoreResponse.json();
      const scoreData = libraryData.library.find((s: Score) => s.id === data.scoreId);
      
      if (scoreData) {
        setScore(scoreData);
      }
    } catch (error: any) {
      console.error('Load error:', error);
      toast.error('Failed to load conversion');
    } finally {
      setLoading(false);
    }
  }
  
  async function handleDownloadAudio() {
    if (!conversion?.audioUrl) return;
    
    try {
      const link = document.createElement('a');
      link.href = conversion.audioUrl;
      link.download = `${score?.fileName || 'score'}_audio.mp3`;
      link.click();
      
      toast.success('Audio download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download audio');
    }
  }
  
  async function handleDownloadMidi() {
    if (!conversion?.midiUrl) return;
    
    try {
      const link = document.createElement('a');
      link.href = conversion.midiUrl;
      link.download = `${score?.fileName || 'score'}_midi.mid`;
      link.click();
      
      toast.success('MIDI download started');
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download MIDI');
    }
  }
  
  function handleReconvert() {
    if (score) {
      navigate(`/upload`);
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading playback...</p>
        </div>
      </div>
    );
  }
  
  if (!conversion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Conversion Not Found
            </h2>
            <p className="text-gray-600 mb-6">
              The requested conversion could not be found.
            </p>
            <Link to="/library">
              <Button variant="primary">Go to Library</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const instrumentNames = conversion.instruments
    .map(id => INSTRUMENTS.find(inst => inst.id === id)?.name)
    .filter(Boolean);
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <Link to="/library" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            Back to Library
          </Link>
          
          <Button variant="outline" onClick={handleReconvert}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Reconvert
          </Button>
        </div>
        
        {/* Score Preview */}
        {score && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>{score.fileName}</CardTitle>
            </CardHeader>
            <CardContent>
              {score.fileType.startsWith('image/') && (
                <img
                  src={score.url}
                  alt={score.fileName}
                  className="w-full max-h-96 object-contain bg-gray-100 rounded-lg"
                />
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Conversion Info */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Conversion Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Status</p>
                <Chip
                  label={conversion.status}
                  variant={
                    conversion.status === 'completed' ? 'success' :
                    conversion.status === 'processing' ? 'warning' : 'default'
                  }
                />
              </div>
              
              {instrumentNames.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Instruments</p>
                  <div className="flex flex-wrap gap-2">
                    {instrumentNames.map((name, index) => (
                      <Chip key={index} label={name!} variant="primary" />
                    ))}
                  </div>
                </div>
              )}
              
              <div>
                <p className="text-sm font-medium text-gray-700">Tempo</p>
                <p className="text-gray-900">{conversion.tempo} BPM</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Playback Controls */}
        {conversion.status === 'completed' && (
          <Card>
            <CardHeader>
              <CardTitle>Playback</CardTitle>
            </CardHeader>
            <CardContent>
              <PlaybackControls
                audioUrl={conversion.audioUrl}
                initialTempo={conversion.tempo}
                onDownloadAudio={handleDownloadAudio}
                onDownloadMidi={handleDownloadMidi}
              />
            </CardContent>
          </Card>
        )}
        
        {conversion.status === 'processing' && (
          <Card>
            <CardContent className="p-8 text-center">
              <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Conversion in Progress
              </h3>
              <p className="text-gray-600">
                Your score is being converted. This page will update automatically when complete.
              </p>
            </CardContent>
          </Card>
        )}
        
        {conversion.status === 'failed' && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-red-600 mb-4">
                <svg className="w-12 h-12 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Conversion Failed
              </h3>
              <p className="text-gray-600 mb-6">
                {conversion.error || 'An error occurred during conversion.'}
              </p>
              <Button variant="primary" onClick={handleReconvert}>
                Try Again
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
