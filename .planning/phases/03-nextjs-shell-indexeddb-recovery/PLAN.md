# Phase 3 Execution Plan: Next.js Shell & IndexedDB Recovery

## Phase Summary
Scaffold the Next.js frontend application with an ultra-modern aesthetic design system, multi-format drag-and-drop workspace, and browser IndexedDB auto-recovery with 2–4h TTL.

---

## Tasks

### Task 1: Next.js Application Scaffold
- **Directory**: `frontend/`
- **Actions**:
  1. Initialize Next.js project using `create-next-app` or clean template with TypeScript, App Router (`src/app`), and npm.
  2. Configure `next.config.js` with API proxy rewrite to FastAPI backend (`/api/:path*` -> `http://127.0.0.1:8000/api/:path*`).
  3. Ensure clean dependencies (`react`, `react-dom`, `next`, `lucide-react` for modern icons).
- **Verification**: Run `npm install` and verify project structure.

### Task 2: Core Design System & Styling Tokens
- **Files**:
  - `frontend/src/app/globals.css`
  - `frontend/src/styles/tokens.css`
- **Actions**:
  1. Implement complete design token system:
     - Obsidian dark theme palettes (`--bg-primary`, `--bg-surface`, `--bg-glass`, `--border-subtle`, `--border-glow`).
     - Gradient variables (`--gradient-accent`, `--gradient-glow`, `--gradient-card`).
     - Typography tokens (Inter/Geist font family, letter spacing, font scale).
     - Glassmorphism utilities (`.glass-panel`, `.glass-modal`, `.glow-border`).
     - Micro-interaction animations (`pulse-glow`, `fade-in`, `slide-up`).
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
  1. Build `Header`: studio logo, mode switcher (PDF Studio, Media Converter, Smart Compressor), and storage indicator.
  2. Build `AutoRecoveryBanner`: floating alert when previous session exists with "Restore Session" and "Clear" buttons.
  3. Build `DragDropZone`: universal drag-and-drop area with glowing border on drag-over, file picker trigger, and supported format pills (PDF, Video, Audio, Images).
  4. Build `StagedFileCard`: displays file name, type badge, size badge, thumbnail preview, and contextual tool actions.
- **Verification**: Component rendering without errors.

### Task 5: Main Studio Page Assembly
- **Files**:
  - `frontend/src/app/layout.tsx`
  - `frontend/src/app/page.tsx`
- **Actions**:
  1. Assemble layout with SEO metadata (title, description, viewport, favicon).
  2. Build main page state:
     - `stagedFiles`: list of active files.
     - `activeTab`: 'pdf' | 'converter' | 'compressor'.
     - Automatic sync with `IndexedDBService` on file add/remove.
     - Session recovery prompt on initial load.
- **Verification**: App renders cleanly in browser.

### Task 6: Comprehensive Verification & Build Test
- **Actions**:
  1. Run `npm run build` or `npx tsc --noEmit` to verify TypeScript compile with 0 errors.
  2. Verify dev server runs cleanly on port 3000.
  3. Check browser DOM rendering and test IndexedDB persistence across page reloads.
