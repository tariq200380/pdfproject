/** TypeScript type definitions for OmniMedia & PDF Studio. */

export type FileTypeCategory = 'pdf' | 'video' | 'audio' | 'image' | 'other';

export interface StagedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  category: FileTypeCategory;
  file: File;
  previewUrl?: string;
  metadata?: any;
  updatedAt: number;
}

export interface CachedWorkspaceItem {
  id: string;
  name: string;
  size: number;
  type: string;
  category: FileTypeCategory;
  blob: Blob;
  updatedAt: number;
  ttlHours: number;
  metadata?: any;
}

export type ActiveStudioTab = 'pdf' | 'converter' | 'compressor';
