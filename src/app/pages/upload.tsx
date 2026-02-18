/**
 * Upload & Conversion Page
 * 
 * Main conversion workflow:
 * 1. Upload sheet music
 * 2. Preview detected notation
 * 3. Select instruments or SATB configuration
 * 4. Initiate conversion
 * 5. Monitor conversion status
 * 6. Navigate to playback when complete
 * 
 * API Integration Points:
 * - POST /scores/upload - Upload file
 * - POST /scores/:scoreId/convert - Start conversion
 * - GET /conversions/:conversionId - Poll conversion status
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { UploadArea } from '../components/upload-area';
import { InstrumentSelector } from '../components/instrument-selector';
import { SATBSelector } from '../components/satb-selector';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { apiCall } from '../../lib/supabase';
import { SATBConfig, Conversion } from '../../lib/types';
import { toast } from 'sonner';

type ConversionMode = 'instruments' | 'satb';

export function UploadPage() {
  const navigate = useNavigate();
  
  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [scoreId, setScoreId] = useState<string | null>(null);
  const [scoreUrl, setScoreUrl] = useState<string | null>(null);
  
  // Conversion configuration
  const [mode, setMode] = useState<ConversionMode>('instruments');
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [satbConfig, setSatbConfig] = useState<SATBConfig>({
    soprano: { enabled: true, solo: false, volume: 100 },
    alto: { enabled: true, solo: false, volume: 100 },
    tenor: { enabled: true, solo: false, volume: 100 },
    bass: { enabled: true, solo: false, volume: 100 },
  });
  const [tempo, setTempo] = useState(120);
  
  // Conversion status
  const [converting, setConverting] = useState(false);
  const [conversionId, setConversionId] = useState<string | null>(null);
  
  async function handleFileSelect(file: File) {
    setSelectedFile(file);
    await handleUpload(file);
  }
  
  async function handleUpload(file: File) {
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await apiCall('/scores/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }
      
      setScoreId(data.scoreId);
      setScoreUrl(data.url);
      toast.success('Sheet music uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  }
  
  async function handleConvert() {
    if (!scoreId) {
      toast.error('Please upload a score first');
      return;
    }
    
    if (mode === 'instruments' && selectedInstruments.length === 0) {
      toast.error('Please select at least one instrument');
      return;
    }
    
    setConverting(true);
    
    try {
      const response = await apiCall(`/scores/${scoreId}/convert`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instruments: mode === 'instruments' ? selectedInstruments : [],
          satbConfig: mode === 'satb' ? satbConfig : undefined,
          tempo,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Conversion failed');
      }
      
      setConversionId(data.conversionId);
      toast.success('Conversion started!');
      
      // Poll for completion
      pollConversionStatus(data.conversionId);
    } catch (error: any) {
      console.error('Conversion error:', error);
      toast.error(error.message || 'Failed to start conversion');
      setConverting(false);
    }
  }
  
  async function pollConversionStatus(id: string) {
    const maxAttempts = 30; // 30 seconds max
    let attempts = 0;
    
    const interval = setInterval(async () => {
      attempts++;
      
      try {
        const response = await apiCall(`/conversions/${id}`);
        const data: Conversion = await response.json();
        
        if (data.status === 'completed') {
          clearInterval(interval);
          setConverting(false);
          toast.success('Conversion complete!');
          
          // Navigate to playback page
          setTimeout(() => {
            navigate(`/playback/${id}`);
          }, 1000);
        } else if (data.status === 'failed') {
          clearInterval(interval);
          setConverting(false);
          toast.error('Conversion failed: ' + (data.error || 'Unknown error'));
        } else if (attempts >= maxAttempts) {
          clearInterval(interval);
          setConverting(false);
          toast.error('Conversion timeout. Please check library later.');
        }
      } catch (error) {
        console.error('Polling error:', error);
        clearInterval(interval);
        setConverting(false);
      }
    }, 1000);
  }
  
  const canConvert = scoreId && (
    (mode === 'instruments' && selectedInstruments.length > 0) ||
    (mode === 'satb')
  );
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Convert Sheet Music</h1>
          <p className="text-gray-600 mt-2">
            Upload your score, choose instruments or voices, and generate audio.
          </p>
        </div>
        
        <div className="space-y-6">
          {/* Step 1: Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                  1
                </div>
                Upload Sheet Music
              </CardTitle>
            </CardHeader>
            <CardContent>
              <UploadArea onFileSelect={handleFileSelect} disabled={uploading || converting} />
              
              {uploading && (
                <div className="mt-4 flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Uploading...</span>
                </div>
              )}
              
              {scoreId && (
                <div className="mt-4 flex items-center gap-2 text-green-600">
                  <CheckCircle className="w-5 h-5" />
                  <span>Upload complete!</span>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Step 2: Select Mode */}
          {scoreId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                    2
                  </div>
                  Choose Playback Mode
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <button
                    onClick={() => setMode('instruments')}
                    className={`flex-1 p-4 border-2 rounded-lg text-left transition-all ${
                      mode === 'instruments'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                    disabled={converting}
                  >
                    <h3 className="font-semibold text-lg mb-1">Instruments</h3>
                    <p className="text-sm text-gray-600">
                      Solo or ensemble playback with orchestral instruments
                    </p>
                  </button>
                  
                  <button
                    onClick={() => setMode('satb')}
                    className={`flex-1 p-4 border-2 rounded-lg text-left transition-all ${
                      mode === 'satb'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400'
                    }`}
                    disabled={converting}
                  >
                    <h3 className="font-semibold text-lg mb-1">SATB Choir</h3>
                    <p className="text-sm text-gray-600">
                      Soprano, Alto, Tenor, Bass voice controls
                    </p>
                  </button>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 3: Configure */}
          {scoreId && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-bold">
                    3
                  </div>
                  Configure Playback
                </CardTitle>
              </CardHeader>
              <CardContent>
                {mode === 'instruments' ? (
                  <InstrumentSelector
                    selectedInstruments={selectedInstruments}
                    onSelectionChange={setSelectedInstruments}
                    mode="ensemble"
                  />
                ) : (
                  <SATBSelector
                    config={satbConfig}
                    onChange={setSatbConfig}
                    disabled={converting}
                  />
                )}
                
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tempo (BPM)
                  </label>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="40"
                      max="240"
                      value={tempo}
                      onChange={(e) => setTempo(parseInt(e.target.value))}
                      disabled={converting}
                      className="flex-1"
                    />
                    <input
                      type="number"
                      min="40"
                      max="240"
                      value={tempo}
                      onChange={(e) => setTempo(parseInt(e.target.value))}
                      disabled={converting}
                      className="w-20 px-3 py-2 border rounded-lg"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Step 4: Convert */}
          {scoreId && (
            <Card>
              <CardContent className="p-6">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={handleConvert}
                  disabled={!canConvert || converting}
                >
                  {converting ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Converting...
                    </>
                  ) : (
                    'Convert to Audio'
                  )}
                </Button>
                
                {converting && (
                  <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      🎵 Analyzing notation and generating audio... This usually takes 5-15 seconds.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
