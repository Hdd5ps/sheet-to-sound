/**
 * Score Library Component
 * 
 * Displays user's uploaded scores and their conversions.
 * 
 * Features:
 * - Grid/list view of scores
 * - Preview thumbnails
 * - Conversion history per score
 * - Quick actions (play, delete, re-convert)
 * - Empty state for new users
 * 
 * Props:
 * - scores: Array of score objects with conversions
 * - onScoreSelect: Callback when score is clicked
 * - onScoreDelete: Callback to delete a score
 * - loading: Show loading state
 * 
 * API Integration:
 * - Fetches library from GET /library
 * - Deletes scores via DELETE /scores/:scoreId
 */

import React from 'react';
import { FileImage, Music, Trash2, Play, Download, Clock } from 'lucide-react';
import { Score } from '../../lib/types';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Chip } from './ui/chip';
import { formatRelativeTime, formatFileSize } from '../../lib/utils';

export interface ScoreLibraryProps {
  scores: Score[];
  onScoreSelect: (score: Score) => void;
  onScoreDelete: (scoreId: string) => void;
  loading?: boolean;
}

export function ScoreLibrary({
  scores,
  onScoreSelect,
  onScoreDelete,
  loading = false,
}: ScoreLibraryProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-gray-200 rounded-t-lg" />
            <CardContent className="space-y-2 pt-4">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (scores.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 mb-4">
          <Music className="w-10 h-10 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No scores yet
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          Upload your first sheet music to start converting it to audio. 
          You can photograph scores with your phone or upload PDF files.
        </p>
        <Button variant="primary" onClick={() => window.location.href = '/upload'}>
          Upload Sheet Music
        </Button>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {scores.map(score => (
        <Card key={score.id} variant="elevated" className="overflow-hidden hover:shadow-xl transition-shadow">
          {/* Score Preview */}
          <div
            className="relative h-48 bg-gray-100 cursor-pointer"
            onClick={() => onScoreSelect(score)}
          >
            {score.fileType.startsWith('image/') ? (
              <img
                src={score.url}
                alt={score.fileName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileImage className="w-16 h-16 text-gray-400" />
                <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                  PDF
                </span>
              </div>
            )}
            
            {/* Conversion Count Badge */}
            {score.conversions && score.conversions.length > 0 && (
              <div className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded-full">
                {score.conversions.length} conversion{score.conversions.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
          
          {/* Score Info */}
          <CardHeader>
            <CardTitle className="text-base truncate" title={score.fileName}>
              {score.fileName}
            </CardTitle>
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              <Clock className="w-3 h-3" />
              {formatRelativeTime(score.uploadedAt)}
              <span className="mx-1">•</span>
              {formatFileSize(score.fileSize)}
            </div>
          </CardHeader>
          
          {/* Conversion List */}
          {score.conversions && score.conversions.length > 0 && (
            <CardContent className="py-0">
              <div className="space-y-2">
                <p className="text-xs font-medium text-gray-700">Recent Conversions:</p>
                {score.conversions.slice(0, 2).map(conversion => (
                  <div key={conversion.id} className="flex items-center gap-2">
                    <Chip
                      label={conversion.status}
                      variant={
                        conversion.status === 'completed' ? 'success' :
                        conversion.status === 'processing' ? 'warning' : 'default'
                      }
                      size="sm"
                    />
                    <span className="text-xs text-gray-600 truncate">
                      {conversion.instruments.length} instrument{conversion.instruments.length > 1 ? 's' : ''}
                      {' • '}
                      {conversion.tempo} BPM
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          )}
          
          {/* Actions */}
          <CardFooter className="pt-3">
            <Button
              variant="primary"
              size="sm"
              onClick={() => onScoreSelect(score)}
              className="flex-1"
            >
              <Play className="w-4 h-4 mr-1" />
              Open
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (confirm(`Delete "${score.fileName}" and all its conversions?`)) {
                  onScoreDelete(score.id);
                }
              }}
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
