# Phase 4 Execution Plan: Interactive In-Place PDF Editor UI

## Phase Summary
Build the interactive, in-place PDF editor in Next.js with daylight solid styling, high-resolution canvas overlays, interactive text span selection, live typography matching (fonts, sizes, colors, baselines), and multi-page operations.

---

## Tasks

### Task 1: PDF REST API Client
- **Files**:
  - `frontend/src/lib/pdfApiClient.ts`
- **Actions**:
  1. Implement client methods wrapping Phase 1 FastAPI endpoints:
     - `inspectPdf(file: File)`: uploads file, returns session_id and page metadata.
     - `getPageSpans(sessionId: string, pageIndex: number)`: retrieves all text spans with coordinates and typography metrics.
     - `editTextInPlace(payload: EditTextRequest)`: replaces text in-place matching font/baseline/color.
     - `rotatePdf(file: File, rotations: Record<number, number>)`: rotates specified pages.
     - `splitPdf(file: File, ranges: string)`: splits PDF by page ranges.
     - Helper URL generators for page thumbnails and binary downloads.
- **Verification**: Type-check and unit test verification against local API.

### Task 2: High-Fidelity PDF Page Canvas & Coordinate Overlay
- **Files**:
  - `frontend/src/components/pdf/PdfCanvas.tsx`
- **Actions**:
  1. Render page image from `/api/pdf/thumbnail/{session_id}/{page_index}` at 150 DPI.
  2. Implement responsive coordinate scaling (`display_scale = displayed_width / page_point_width`).
  3. Overlay interactive span boxes:
     - On hover: clean 1px highlight with floating typography badge (font name, size, hex color).
     - On click: activates target span for in-place text replacement.
- **Verification**: Visual alignment check of coordinate boxes over rendered text glyphs.

### Task 3: In-Place Edit Popover & Typography Matching
- **Files**:
  - `frontend/src/components/pdf/InPlaceEditPopover.tsx`
- **Actions**:
  1. Floating editor positioned over or adjacent to selected text span.
  2. Live typography controls:
     - Original text reference.
     - Replacement text input field.
     - Font size input (pre-populated with detected font size).
     - Color swatch and hex input (pre-populated with detected color).
  3. Action buttons: "Apply Replacement" (primary solid) and "Cancel".
- **Verification**: Test replacement input and verify round-trip payload structure.

### Task 4: Multi-Page Navigation Strip & Editor Toolbar
- **Files**:
  - `frontend/src/components/pdf/PageSidebar.tsx`
  - `frontend/src/components/pdf/EditorToolbar.tsx`
- **Actions**:
  1. `PageSidebar`: vertical thumbnail list with page numbers, active page indicator, and page click navigation.
  2. `EditorToolbar`: top toolbar with:
     - Back to Files button.
     - Zoom selector (75%, 100%, 125%).
     - Rotate Page (90° clockwise).
     - Split / Extract modal trigger.
     - "Download Edited PDF" action button.
- **Verification**: Component rendering and page navigation testing.

### Task 5: PDF Editor Workspace Integration
- **Files**:
  - `frontend/src/components/pdf/PdfEditorWorkspace.tsx`
  - `frontend/src/app/page.tsx`
- **Actions**:
  1. Assemble complete `PdfEditorWorkspace` combining canvas, sidebar, toolbar, and edit popovers.
  2. Update `page.tsx` so clicking "In-Place Editor" on any staged PDF opens the interactive editor workspace.
  3. Manage active session, cache updates, and return to files list.
- **Verification**: End-to-end user flow: stage PDF -> open editor -> inspect spans -> edit text -> save -> download.

### Task 6: Build Verification & TypeScript Compile Check
- **Actions**:
  1. Run `npx tsc --noEmit` and confirm 0 errors.
  2. Run `npm run build` and confirm successful compilation.
