# Phase 3 Research: Next.js Shell & IndexedDB Recovery

## 1. Minimal Daylight Aesthetic Design System

### 1.1 Visual Tokens & Aesthetic Architecture
- **Palette**: Clean natural daylighting on a crisp off-white / light-grey canvas.
  - Background Canvas: `#f8fafc` (crisp daylight neutral)
  - Card & Surface: `#ffffff` (pure tactile solid white)
  - Surface Muted / Inset: `#f1f5f9` (clean secondary surface)
  - Borders: `#e2e8f0` (sharp, crisp 1px borders with zero blur)
  - Text Primary: `#0f172a` (deep slate for maximum contrast and legibility)
  - Text Secondary: `#64748b` (balanced neutral grey)
  - Primary Accent: `#0f172a` (refined solid charcoal/black button actions)
  - Accent Interactive: `#2563eb` (crisp editorial royal blue for active tabs/links)
- **Tactile Solids**: Zero glassmorphism, zero backdrop blur, zero neon glow. Instead, sharp, solid surfaces with subtle tactile depth:
  - Default Card: `background: #ffffff; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);`
  - Active / Hover Card: `border-color: #cbd5e1; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);`
- **Typography**: Crisp modern sans-serif (Inter / Geist font stack), strict hierarchy, high legibility.
- **Controls & Buttons**: Solid filled primary buttons (`#0f172a` text `#ffffff`), crisp bordered secondary buttons (`#ffffff` border `#e2e8f0`), zero glowing outlines.

### 1.2 Layout & Workspace Topology
- **Top Navigation**: Clean editorial studio header with crisp border-bottom, mode switcher pills, and session storage status.
- **Hero Staging Zone**: High-impact, minimal dashed/solid staging area with clean daylight styling.
- **Staging Cards**: Tactile white cards displaying file names, format pill badges (PDF, Video, Audio, Image), size indicators, live preview thumbnails, and operation triggers.

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
     - Render minimal floating daylight alert: *"Previous workspace session found (3 files, saved 15m ago). [Restore Session] [Dismiss]"*.
- **On Restore**:
  - Load cached blobs into React memory state as standard `File` objects so the user can continue editing immediately without re-uploading.
- **On Manual Clear**:
  - Clear object store and reset active staging state.
