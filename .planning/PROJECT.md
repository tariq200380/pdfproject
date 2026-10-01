# Project Context: PDF Toolkit

## Vision
A modern, responsive, web-based PDF utility that provides high-performance document viewing and manipulation. Users can stage PDF files, preview pages, merge multiple documents, split pages, reorder/rotate pages, and compress files through an intuitive and aesthetically pleasing interface.

## Tech Stack
- **Backend**: Python 3 (FastAPI, Uvicorn)
- **PDF Engine**: PyMuPDF (`fitz`) for high-speed page manipulation, rendering, and metadata extraction; `pypdf` / `pdfplumber` for complementary operations
- **Frontend**: Clean, modern web application (HTML5, Vanilla CSS with custom design tokens, modern JavaScript)
- **API Architecture**: RESTful endpoints with multipart file upload support, stream responses, and automatic cleanup of temporary files

## Core Features
1. **Interactive PDF Viewer & Thumbnail Grid**: Stage PDFs and inspect individual pages or entire documents with high fidelity.
2. **Merge PDFs**: Combine multiple PDF files in custom order with drag-and-drop sorting.
3. **Split & Extract**: Extract specific page ranges, individual pages, or burst documents.
4. **Reorder & Rotate**: Rotate pages (90°, 180°, 270°) and resequence pages visually.
5. **Compress & Optimize**: Reduce PDF file size with adjustable quality/compression settings.
6. **Information & Metadata**: Inspect document metadata, page count, file size, and security status.

## Guiding Principles & Constraints
- **Privacy & Security**: Files are processed locally on the server without third-party cloud leaks; temporary files are strictly cleaned up after processing.
- **Fast Performance**: Leverage native C-bindings via PyMuPDF for near-instant rendering and manipulation.
- **Step-by-Step Delivery**: Each phase builds a verifiable slice with zero broken intermediate states.
