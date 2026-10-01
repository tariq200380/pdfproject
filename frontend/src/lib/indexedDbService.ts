/**
 * Browser IndexedDB storage service with 2-4 hour TTL auto-recovery and garbage collection.
 */

import { CachedWorkspaceItem, FileTypeCategory, StagedFile } from './types';

const DB_NAME = 'OmniStudioDB';
const DB_VERSION = 1;
const STORE_NAME = 'workspace_files';
const DEFAULT_TTL_HOURS = 3;

export function detectCategory(file: File): FileTypeCategory {
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const mime = file.type.toLowerCase();

  if (mime === 'application/pdf' || ext === 'pdf') {
    return 'pdf';
  }
  if (mime.startsWith('video/') || ['mp4', 'mkv', 'avi', 'webm', 'mov'].includes(ext)) {
    return 'video';
  }
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a'].includes(ext)) {
    return 'audio';
  }
  if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'svg', 'heic'].includes(ext)) {
    return 'image';
  }
  return 'other';
}

class IndexedDBService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private isAvailable(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  private getDB(): Promise<IDBDatabase> {
    if (!this.isAvailable()) {
      return Promise.reject(new Error('IndexedDB is not supported in this environment'));
    }

    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            const store = db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            store.createIndex('updatedAt', 'updatedAt', { unique: false });
          }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
    }

    return this.dbPromise;
  }

  async saveFile(file: File, category?: FileTypeCategory, metadata?: any): Promise<string> {
    const db = await this.getDB();
    const id = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const detected = category || detectCategory(file);

    const item: CachedWorkspaceItem = {
      id,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      category: detected,
      blob: file,
      updatedAt: Date.now(),
      ttlHours: DEFAULT_TTL_HOURS,
      metadata,
    };

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(item);

      req.onsuccess = () => resolve(id);
      req.onerror = () => reject(req.error);
    });
  }

  async removeFile(id: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async clearWorkspace(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.clear();

      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  }

  async getRecoverableFiles(ttlHours = DEFAULT_TTL_HOURS): Promise<{ files: StagedFile[]; lastSavedAt: number }> {
    if (!this.isAvailable()) {
      return { files: [], lastSavedAt: 0 };
    }

    const db = await this.getDB();
    const cutoff = Date.now() - ttlHours * 3600 * 1000;

    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.getAll();

      req.onsuccess = () => {
        const rawItems: CachedWorkspaceItem[] = req.result || [];
        const validFiles: StagedFile[] = [];
        let maxTime = 0;

        for (const item of rawItems) {
          if (item.updatedAt < cutoff) {
            // Expired TTL - purge automatically
            store.delete(item.id);
          } else {
            // Reconstruct File from Blob
            const fileObj = new File([item.blob], item.name, {
              type: item.type,
              lastModified: item.updatedAt,
            });

            const previewUrl = item.category === 'image' || item.type.startsWith('image/')
              ? URL.createObjectURL(fileObj)
              : undefined;

            validFiles.push({
              id: item.id,
              name: item.name,
              size: item.size,
              type: item.type,
              category: item.category,
              file: fileObj,
              previewUrl,
              metadata: item.metadata,
              updatedAt: item.updatedAt,
            });

            if (item.updatedAt > maxTime) {
              maxTime = item.updatedAt;
            }
          }
        }

        resolve({ files: validFiles, lastSavedAt: maxTime });
      };

      req.onerror = () => reject(req.error);
    });
  }
}

export const indexedDBService = new IndexedDBService();
