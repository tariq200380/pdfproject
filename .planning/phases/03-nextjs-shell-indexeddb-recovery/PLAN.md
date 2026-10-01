# Phase 3 Execution Plan: Next.js Shell & IndexedDB Recovery

## Phase Summary
Scaffold the Next.js frontend application with a minimal, solid daylight aesthetic (crisp light-grey canvas, pure white tactile cards, sharp clean borders, zero glass/neon), multi-format drag-and-drop workspace, and browser IndexedDB auto-recovery with 2–4h TTL.

---

## Tasks

### Task 1: Next.js Application Scaffold
- **Directory**: `frontend/`
- **Actions**:
  1. Initialize Next.js project with TypeScript, App Router (`src/app`), and npm.
  2. Configure `next.config.js` with API proxy rewrite to FastAPI backend (`/api/:path*` -> `http://127.0.0.1:8000/api/:path*`).
  3. Ensure clean dependencies (`react`, `react-dom`, `next`, `lucide-react` for modern crisp icons).
- **Verification**: Run `npm install` and verify project structure.

### Task 2: Minimal Daylight Design System & Styling Tokens
- **Files**:
  - `frontend/src/app/globals.css`
- **Actions**:
  1. Implement complete minimal daylight design tokens:
     - Off-white canvas: `--bg-canvas: #f8fafc;`
     - Solid white surfaces: `--bg-surface: #ffffff;`
     - Muted background: `--bg-muted: #f1f5f9;`
     - Sharp crisp borders: `--border-subtle: #e2e8f0; --border-strong: #cbd5e1;`
     - Typography colors: `--text-primary: #0f172a; --text-secondary: #64748b;`
     - Button actions: `--btn-primary: #0f172a; --btn-primary-text: #ffffff;`
     - Clean shadow tokens: `--shadow-card: 0 1px 3px rgba(0, 0, 0, 0.05);`
     - ZERO backdrop-filter blur, ZERO dark neon gradients.
- **Verification**: Visual inspection of rendered tokens and zero CSS parse errors.

### Task 3: IndexedDB Storage & Auto-Recovery Service
- **Files**:
  - `frontend/src/lib/indexedDbService.ts`
  - `frontend/src/lib/types.ts`
- **Actions**:
  1. Define types for `CachedWorkspaceFile`, `WorkspaceSession`, and `FileTypeCategory`.
  2. Implement `IndexedDBService`:
     - Database initialization: `OmniStudioDB` (Version 1) with object store `workspace_files`.
     - `saveFile(file: File, category: string, metadata?: any)`: stores blob with `updatedAt` timestamp and 3h TTL.
     - `removeFile(id: string)`: deletes single cached file.
     - `clearWorkspace()`: purges all files from store.
     - `getRecoverableFiles()`: queries store, purges any items older than TTL, and returns active cached files.
- **Verification**: Unit verification of IndexedDB storage methods, TTL cutoff math, and blob restoration.

### Task 4: UI Components (Header, Staging Zone, Recovery Banner)
- **Files**:
  - `frontend/src/components/Header.tsx`
  - `frontend/src/components/AutoRecoveryBanner.tsx`
  - `frontend/src/components/DragDropZone.tsx`
  - `frontend/src/components/StagedFileCard.tsx`
- **Actions**:
  1. Build `Header`: studio branding, mode switcher (PDF Studio, Media Converter, Smart Compressor), and storage status badge.
  2. Build `AutoRecoveryBanner`: clean floating alert with "Restore Session" and "Dismiss" buttons.
  3. Build `DragDropZone`: minimal daylight drag-and-drop zone with clean tactile borders, file picker trigger, and format badges (PDF, Video, Audio, Image).
  4. Build `StagedFileCard`: tactile solid white card displaying file name, format badge, size indicator, thumbnail preview, and contextual tool actions.
- **Verification**: Component rendering without errors.

### Task 5: Main Studio Page Assembly
- **Files**:
  - `frontend/src/app/layout.tsx`
  - `frontend/src/app/page.tsx`
- **Actions**:
  1. Assemble layout with SEO metadata and daylight typography.
  2. Build main page state:
     - `stagedFiles`: list of active files.
     - `activeTab`: 'pdf' | 'converter' | 'compressor'.
     - Automatic sync with `IndexedDBService` on file add/remove.
     - Session recovery prompt on initial load.
- **Verification**: App renders cleanly in browser.

### Task 6: Comprehensive Verification & Build Test
- **Actions**:
  1. Run `npx tsc --noEmit` to verify TypeScript compile with 0 errors.
  2. Verify dev server runs cleanly on port 3000.
  3. Verify IndexedDB persistence and auto-recovery in browser session.
