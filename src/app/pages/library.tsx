/**
 * Library Page
 * 
 * User's personal library of uploaded scores and conversions.
 * 
 * Features:
 * - List all uploaded scores
 * - Show conversion history
 * - Quick actions (play, delete, reconvert)
 * - Empty state for new users
 * 
 * API Integration:
 * - GET /library - Fetch all scores and conversions
 * - DELETE /scores/:scoreId - Delete score
 */

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Loader2 } from 'lucide-react';
import { ScoreLibrary } from '../components/score-library';
import { apiCall } from '../../lib/supabase';
import { Score } from '../../lib/types';
import { toast } from 'sonner';

export function LibraryPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState<Score[]>([]);
  
  useEffect(() => {
    loadLibrary();
  }, []);
  
  async function loadLibrary() {
    try {
      const response = await apiCall('/library');
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to load library');
      }
      
      setScores(data.library || []);
    } catch (error: any) {
      console.error('Library load error:', error);
      toast.error(error.message || 'Failed to load library');
    } finally {
      setLoading(false);
    }
  }
  
  function handleScoreSelect(score: Score) {
    // Navigate to the most recent conversion, or upload page if no conversions
    if (score.conversions && score.conversions.length > 0) {
      const latestConversion = score.conversions[0];
      navigate(`/playback/${latestConversion.id}`);
    } else {
      navigate(`/upload`);
    }
  }
  
  async function handleScoreDelete(scoreId: string) {
    try {
      const response = await apiCall(`/scores/${scoreId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete score');
      }
      
      toast.success('Score deleted successfully');
      
      // Remove from local state
      setScores(scores.filter(s => s.id !== scoreId));
    } catch (error: any) {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete score');
    }
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your library...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Library</h1>
          <p className="text-gray-600 mt-2">
            {scores.length > 0 
              ? `${scores.length} score${scores.length > 1 ? 's' : ''} in your library`
              : 'Your uploaded scores will appear here'
            }
          </p>
        </div>
        
        <ScoreLibrary
          scores={scores}
          onScoreSelect={handleScoreSelect}
          onScoreDelete={handleScoreDelete}
          loading={false}
        />
      </div>
    </div>
  );
}
