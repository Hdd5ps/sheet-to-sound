/**
 * Upload Area Component
 * 
 * Drag-and-drop file upload area for sheet music images/PDFs.
 * 
 * Features:
 * - Drag and drop support
 * - Click to browse files
 * - File type validation
 * - Preview of uploaded image
 * - Error handling and user guidance
 * 
 * Props:
 * - onFileSelect: Callback when file is selected
 * - maxSizeMB: Maximum file size in megabytes (default: 10)
 * - disabled: Disable upload
 * 
 * API Integration Point:
 * After file selection, parent component should call:
 * POST /scores/upload with FormData containing the file
 */

import React, { useState, useRef } from 'react';
import { Upload, FileImage, AlertCircle } from 'lucide-react';
import { cn, formatFileSize } from '../../lib/utils';

export interface UploadAreaProps {
  onFileSelect: (file: File) => void;
  maxSizeMB?: number;
  disabled?: boolean;
}

export function UploadArea({ 
  onFileSelect, 
  maxSizeMB = 10,
  disabled = false 
}: UploadAreaProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  
  function validateFile(file: File): string | null {
    // Check file type
    if (!acceptedTypes.includes(file.type)) {
      return 'Invalid file type. Please upload JPG, PNG, or PDF files only.';
    }
    
    // Check file size
    if (file.size > maxSizeBytes) {
      return `File size exceeds ${maxSizeMB}MB limit. Current size: ${formatFileSize(file.size)}`;
    }
    
    return null;
  }
  
  function handleFile(file: File) {
    setError(null);
    
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Show preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setPreview(null); // PDF files don't show preview
    }
    
    onFileSelect(file);
  }
  
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }
  
  function handleDragLeave(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
  }
  
  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    
    if (disabled) return;
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }
  
  function handleFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }
  
  function handleClick() {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  }
  
  return (
    <div className="w-full">
      <div
        className={cn(
          'relative border-2 border-dashed rounded-lg p-8 text-center transition-all cursor-pointer',
          isDragging && !disabled && 'border-blue-500 bg-blue-50',
          !isDragging && 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed',
          error && 'border-red-300'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={acceptedTypes.join(',')}
          onChange={handleFileInputChange}
          className="hidden"
          disabled={disabled}
        />
        
        {preview ? (
          <div className="space-y-4">
            <img 
              src={preview} 
              alt="Sheet music preview" 
              className="max-h-64 mx-auto rounded-lg shadow-md"
            />
            <p className="text-sm text-gray-600">
              Click or drag a new file to replace
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              {error ? (
                <AlertCircle className="w-12 h-12 text-red-500" />
              ) : (
                <Upload className="w-12 h-12 text-gray-400" />
              )}
            </div>
            
            <div>
              <p className="text-lg font-medium text-gray-900">
                Drop your sheet music here
              </p>
              <p className="text-sm text-gray-500 mt-1">
                or click to browse files
              </p>
            </div>
            
            <div className="text-xs text-gray-400">
              <p>Supported formats: JPG, PNG, PDF</p>
              <p>Maximum size: {maxSizeMB}MB</p>
            </div>
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-800">Upload Error</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
              <p className="text-xs text-red-500 mt-2">
                💡 Tip: For best results, use clear, well-lit photos with the entire score visible.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
