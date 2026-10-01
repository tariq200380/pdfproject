/**
 * REST API client for PDF operations and in-place editing.
 */

export interface PageInfo {
  page_index: number;
  page_number: number;
  width: number;
  height: number;
  rotation: number;
}

export interface PDFMetadata {
  title: string | null;
  author: string | null;
  subject: string | null;
  creator: string | null;
  producer: string | null;
  creation_date: string | null;
  modification_date: string | null;
  page_count: number;
  is_encrypted: boolean;
  file_size_bytes: number;
  pages: PageInfo[];
}

export interface InspectResponse {
  session_id: string;
  filename: string;
  metadata: PDFMetadata;
}

export interface TextSpan {
  span_id: string;
  page_index: number;
  text: string;
  bbox: [number, number, number, number]; // [x0, y0, x1, y1]
  origin: [number, number]; // [x, y] baseline
  font_name: string;
  font_size: number;
  flags: number;
  is_bold: boolean;
  is_italic: boolean;
  color_rgb: [number, number, number];
  color_hex: string;
}

export interface PageSpansResponse {
  page_index: number;
  total_spans: number;
  spans: TextSpan[];
}

export interface EditTextPayload {
  session_id: string;
  page_index: number;
  span_id: string;
  replacement_text: string;
  font_size?: number;
  color_hex?: string;
  font_name?: string;
  download_immediately?: boolean;
}

class PdfApiClient {
  private baseUrl = '/api/pdf';

  async inspectPdf(file: File): Promise<InspectResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${this.baseUrl}/inspect`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to inspect PDF' }));
      throw new Error(err.detail || 'Inspection failed');
    }

    return res.json();
  }

  async getPageSpans(sessionId: string, pageIndex: number): Promise<PageSpansResponse> {
    const res = await fetch(`${this.baseUrl}/spans/${sessionId}/${pageIndex}`);
    if (!res.ok) {
      throw new Error(`Failed to load text spans for page ${pageIndex}`);
    }
    return res.json();
  }

  async editTextInPlace(payload: EditTextPayload): Promise<{ status: string; session_id: string; message: string }> {
    const res = await fetch(`${this.baseUrl}/edit-text`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...payload, download_immediately: false }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to replace text' }));
      throw new Error(err.detail || 'Text replacement failed');
    }

    return res.json();
  }

  async rotatePdf(file: File, rotations: Record<number, number>): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('rotations_json', JSON.stringify(rotations));

    const res = await fetch(`${this.baseUrl}/rotate`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Failed to rotate PDF pages');
    }

    return res.blob();
  }

  async splitPdf(file: File, pageRanges: string): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('page_ranges', pageRanges);

    const res = await fetch(`${this.baseUrl}/split`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Failed to split PDF');
    }

    return res.blob();
  }

  async mergePdfs(files: File[]): Promise<Blob> {
    const formData = new FormData();
    files.forEach((file) => formData.append('files', file));

    const res = await fetch(`${this.baseUrl}/merge`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to merge PDFs' }));
      throw new Error(err.detail || 'Merge failed');
    }

    return res.blob();
  }

  async burstPdf(file: File): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);

    const res = await fetch(`${this.baseUrl}/burst`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      throw new Error('Failed to burst PDF pages');
    }

    return res.blob();
  }

  async protectPdf(file: File, password: string): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('password', password);

    const res = await fetch(`${this.baseUrl}/protect`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to protect PDF' }));
      throw new Error(err.detail || 'Protection failed');
    }

    return res.blob();
  }

  async deletePages(file: File, pages: string): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('pages', pages);

    const res = await fetch(`${this.baseUrl}/delete-pages`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to delete pages' }));
      throw new Error(err.detail || 'Page deletion failed');
    }

    return res.blob();
  }

  async cropPdf(file: File, marginPercent: number = 5.0): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('margin_percent', marginPercent.toString());

    const res = await fetch(`${this.baseUrl}/crop`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to crop PDF' }));
      throw new Error(err.detail || 'Crop failed');
    }

    return res.blob();
  }

  async numberPages(file: File, formatStr: string = 'Page {n} of {total}'): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('format_str', formatStr);

    const res = await fetch(`${this.baseUrl}/number-pages`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to number pages' }));
      throw new Error(err.detail || 'Numbering failed');
    }

    return res.blob();
  }

  async reorderPages(file: File, order: number[]): Promise<Blob> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('order_json', JSON.stringify(order));

    const res = await fetch(`${this.baseUrl}/reorder`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Failed to reorder pages' }));
      throw new Error(err.detail || 'Reorder failed');
    }

    return res.blob();
  }

  triggerBrowserDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }

  getThumbnailUrl(sessionId: string, pageIndex: number, timestamp?: number): string {
    const ts = timestamp ? `?t=${timestamp}&dpi=150` : `?dpi=150`;
    return `${this.baseUrl}/thumbnail/${sessionId}/${pageIndex}${ts}`;
  }

  getDownloadUrl(sessionId: string): string {
    return `${this.baseUrl}/download/${sessionId}`;
  }
}

export const pdfApiClient = new PdfApiClient();

