# Phase 3 Research: Next.js Shell & IndexedDB Recovery

## 1. Ultra-Modern UI/UX Design System

### 1.1 Visual Tokens & Aesthetic Architecture
- **Color Palette**: Sophisticated dark theme with deep obsidian backdrop (`#090a0f`), elevated card surfaces (`#12151e`), borders with subtle luminescence (`rgba(255, 255, 255, 0.08)`), and electric violet-cyan gradient accents (`linear-gradient(135deg, #6366f1, #06b6d4)`).
- **Glassmorphism**: Backdrop blur (`backdrop-filter: blur(16px)`) with semi-transparent tinted panels for control overlays, navigation headers, and modal dialogs.
- **Typography**: Clean, geometric sans-serif (Inter / Geist font stacks) with tight letter-spacing for headings (`-0.02em`) and high-legibility tabular figures for metrics.
- **Motion & Micro-interactions**: Smooth 150–250ms cubic-bezier transitions (`cubic-bezier(0.16, 1, 0.3, 1)`), hover elevation shifts, and animated drag-over borders with glowing pulse effects.

### 1.2 Layout & Workspace Topology
- **Top Navigation**: Studio branding, active mode selector (PDF Studio, Media Converter, Smart Compressor), and session cache indicator.
- **Hero Staging Zone**: High-impact universal drag-and-drop container with auto-detection for PDF, Image, Audio, and Video files.
- **Staging Drawer / File Grid**: Dynamic staged file cards with format pill badges, size indicators, live image/PDF thumbnail previews, and contextual operation action bars.

---

## 2. Browser IndexedDB Storage & Auto-Recovery Engine

### 2.1 Schema Design
Native browser `indexedDB` database: `OmniStudioDB` (Version 1).
- **Object Store `workspace_files`**:
  - `keyPath`: `id` (UUID or generated key)
  - Indexes: `updatedAt` (timestamp)
  - Record payload:
    ```typescript
    interface CachedWorkspaceFile {
      id: string;
      name: string;
      type: string;        // MIME type
      size: number;
      blob: Blob;          // Stored binary file content
      category: 'pdf' | 'image' | 'audio' | 'video';
      updatedAt: number;   // Epoch millis
      ttlHours: number;    // Default 3 hours (2-4h window)
      metadata?: any;      // Extracted PDF metadata or dimensions
    }
    ```

### 2.2 TTL & Garbage Collection Strategy
- **On App Initialization**:
  1. Open `OmniStudioDB`.
  2. Query all records from `workspace_files`.
  3. Filter expired items: `Date.now() - item.updatedAt > item.ttlHours * 3600 * 1000`.
  4. Automatically delete expired items using a readwrite transaction.
  5. If valid unexpired items remain:
     - Set state `hasRecoverableSession = true`.
     - Render sleek floating recovery prompt: *"Previous workspace session found (3 files, saved 18m ago). [Restore Session] [Dismiss]"*.
- **On Restore**:
  - Load cached blobs into React memory state as standard `File` objects so the user can continue editing immediately without re-uploading.
- **On Manual Clear**:
  - Clear object store and reset active staging state.
