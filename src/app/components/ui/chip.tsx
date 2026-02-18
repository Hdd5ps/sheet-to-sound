/**
 * Chip Component
 * 
 * Small tag-like component for displaying instruments, voices, or other selections.
 * Can be interactive (selectable/removable) or static.
 */

import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../../lib/utils';

export interface ChipProps {
  label: string;
  selected?: boolean;
  onSelect?: () => void;
  onRemove?: () => void;
  variant?: 'default' | 'primary' | 'success' | 'warning';
  size?: 'sm' | 'md';
  disabled?: boolean;
}

export function Chip({
  label,
  selected = false,
  onSelect,
  onRemove,
  variant = 'default',
  size = 'md',
  disabled = false,
}: ChipProps) {
  const isInteractive = onSelect || onRemove;
  
  const baseStyles = 'inline-flex items-center gap-1 rounded-full font-medium transition-all';
  
  const variantStyles = {
    default: selected 
      ? 'bg-gray-700 text-white' 
      : 'bg-gray-200 text-gray-700 hover:bg-gray-300',
    primary: selected 
      ? 'bg-blue-600 text-white' 
      : 'bg-blue-100 text-blue-700 hover:bg-blue-200',
    success: selected 
      ? 'bg-green-600 text-white' 
      : 'bg-green-100 text-green-700 hover:bg-green-200',
    warning: selected 
      ? 'bg-orange-600 text-white' 
      : 'bg-orange-100 text-orange-700 hover:bg-orange-200',
  };
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm',
  };
  
  const interactiveStyles = isInteractive && !disabled 
    ? 'cursor-pointer' 
    : 'cursor-default';
  
  return (
    <div
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        interactiveStyles,
        disabled && 'opacity-50 cursor-not-allowed'
      )}
      onClick={!disabled && onSelect ? onSelect : undefined}
    >
      <span>{label}</span>
      
      {onRemove && !disabled && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:bg-black/20 rounded-full p-0.5 transition-colors"
          aria-label={`Remove ${label}`}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}
