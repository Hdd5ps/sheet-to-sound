/**
 * Instrument Selector Component
 * 
 * Comprehensive instrument selection interface with:
 * - Category-based filtering
 * - Multi-select support
 * - Search functionality
 * - Full orchestral palette including percussion (tambourine, tam-tam, cowbell, etc.)
 * 
 * Props:
 * - selectedInstruments: Array of selected instrument IDs
 * - onSelectionChange: Callback when selection changes
 * - maxSelections: Optional limit on number of instruments
 * - mode: 'solo' | 'ensemble' - affects UI messaging
 * 
 * State:
 * - Manages filtered instrument list based on category and search
 * - Handles selection/deselection logic
 */

import React, { useState, useMemo } from 'react';
import { Search, Music } from 'lucide-react';
import { INSTRUMENTS, INSTRUMENT_CATEGORIES, getInstrumentsByCategory } from '../../lib/instruments';
import { Chip } from './ui/chip';
import { Input } from './ui/input';
import { cn } from '../../lib/utils';

export interface InstrumentSelectorProps {
  selectedInstruments: string[];
  onSelectionChange: (instrumentIds: string[]) => void;
  maxSelections?: number;
  mode?: 'solo' | 'ensemble';
}

export function InstrumentSelector({
  selectedInstruments,
  onSelectionChange,
  maxSelections,
  mode = 'ensemble',
}: InstrumentSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Filter instruments based on category and search
  const filteredInstruments = useMemo(() => {
    let instruments = selectedCategory === 'all' 
      ? INSTRUMENTS 
      : getInstrumentsByCategory(selectedCategory);
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      instruments = instruments.filter(inst => 
        inst.name.toLowerCase().includes(query) ||
        inst.category.toLowerCase().includes(query)
      );
    }
    
    return instruments;
  }, [selectedCategory, searchQuery]);
  
  function handleInstrumentToggle(instrumentId: string) {
    if (selectedInstruments.includes(instrumentId)) {
      // Deselect
      onSelectionChange(selectedInstruments.filter(id => id !== instrumentId));
    } else {
      // Select (if under max limit)
      if (mode === 'solo') {
        // Solo mode: only one instrument at a time
        onSelectionChange([instrumentId]);
      } else if (!maxSelections || selectedInstruments.length < maxSelections) {
        onSelectionChange([...selectedInstruments, instrumentId]);
      }
    }
  }
  
  function handleClearAll() {
    onSelectionChange([]);
  }
  
  const selectedCount = selectedInstruments.length;
  const canSelectMore = !maxSelections || selectedCount < maxSelections;
  
  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Music className="w-5 h-5" />
            Select Instruments
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {mode === 'solo' 
              ? 'Choose one instrument for playback' 
              : 'Choose instruments for ensemble playback'}
          </p>
        </div>
        
        {selectedCount > 0 && (
          <button
            onClick={handleClearAll}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Clear all ({selectedCount})
          </button>
        )}
      </div>
      
      {/* Search */}
      <Input
        type="search"
        placeholder="Search instruments..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="max-w-md"
      />
      
      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setSelectedCategory('all')}
          className={cn(
            'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          )}
        >
          All Instruments
        </button>
        
        {INSTRUMENT_CATEGORIES.map(category => (
          <button
            key={category.id}
            onClick={() => setSelectedCategory(category.id)}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
              selectedCategory === category.id
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            <span className="mr-1">{category.icon}</span>
            {category.name}
          </button>
        ))}
      </div>
      
      {/* Instrument Grid */}
      <div className="border border-gray-200 rounded-lg p-4 max-h-96 overflow-y-auto">
        {filteredInstruments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            No instruments found matching "{searchQuery}"
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {filteredInstruments.map(instrument => {
              const isSelected = selectedInstruments.includes(instrument.id);
              const isDisabled = !isSelected && !canSelectMore;
              
              return (
                <button
                  key={instrument.id}
                  onClick={() => handleInstrumentToggle(instrument.id)}
                  disabled={isDisabled}
                  className={cn(
                    'px-3 py-2 rounded-lg text-sm font-medium text-left transition-all',
                    'border-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
                    isSelected && 'bg-blue-600 text-white border-blue-600',
                    !isSelected && !isDisabled && 'bg-white text-gray-700 border-gray-300 hover:border-blue-400',
                    isDisabled && 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                  )}
                >
                  {instrument.name}
                </button>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Selection Summary */}
      {selectedCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm font-medium text-blue-900 mb-2">
            Selected Instruments ({selectedCount}):
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedInstruments.map(id => {
              const instrument = INSTRUMENTS.find(inst => inst.id === id);
              return instrument ? (
                <Chip
                  key={id}
                  label={instrument.name}
                  variant="primary"
                  size="sm"
                  selected
                  onRemove={() => handleInstrumentToggle(id)}
                />
              ) : null;
            })}
          </div>
        </div>
      )}
      
      {maxSelections && (
        <p className="text-xs text-gray-500">
          Maximum {maxSelections} instrument{maxSelections > 1 ? 's' : ''} allowed
        </p>
      )}
    </div>
  );
}
