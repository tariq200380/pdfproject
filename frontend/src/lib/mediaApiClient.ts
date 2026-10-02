/**
 * REST API client for Universal Media Conversion and Smart Compression.
 */

export interface CompressionResponse {
  blob: Blob;
  filename: string;
  originalSize: number;
  compressedSize: number;
  bytesSaved: number;
  percentSaved: number;
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

class MediaApiClient {
  private apiHost = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
  private convertBase = `${this.apiHost}/api/convert`;
  private compressBase = `${this.apiHost}/api/compress`;

  private extractFilename(res: Response, fallback: string): string {
    const disposition = res.headers.get('content-disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^";]+)"?/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    return fallback;
  }

  async convertAudio(
    file: File,
    targetFormat: string,
    bitrate = '192k',
    sampleRate?: number,
  ): Promise<{ blob: Blob; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_format', targetFormat);
    if (bitrate) formData.append('bitrate', bitrate);
    if (sampleRate) formData.append('sample_rate', String(sampleRate));

    const res = await fetch(`${this.convertBase}/audio`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      let msg = 'Audio conversion failed';
      try {
        const err = await res.json();
        msg = err.detail || err.message || msg;
      } catch {
        const text = await res.text().catch(() => '');
        if (text) msg = `${msg}: ${text.slice(0, 150)}`;
      }
      throw new Error(msg);
    }

    const blob = await res.blob();
    const filename = this.extractFilename(res, `converted_${file.name.split('.')[0]}.${targetFormat}`);
    return { blob, filename };
  }

  async convertVideo(
    file: File,
    targetFormat: string,
    resolution = 'original',
  ): Promise<{ blob: Blob; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_format', targetFormat);
    if (resolution) formData.append('resolution', resolution);

    const res = await fetch(`${this.convertBase}/video`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      let msg = 'Video conversion failed';
      try {
        const err = await res.json();
        msg = err.detail || err.message || msg;
      } catch {
        const text = await res.text().catch(() => '');
        if (text) msg = `${msg}: ${text.slice(0, 150)}`;
      }
      throw new Error(msg);
    }

    const blob = await res.blob();
    const filename = this.extractFilename(res, `converted_${file.name.split('.')[0]}.${targetFormat}`);
    return { blob, filename };
  }

  async convertImagesToPdf(files: File[]): Promise<{ blob: Blob; filename: string }> {
    const formData = new FormData();
    for (const f of files) {
      formData.append('files', f);
    }

    const res = await fetch(`${this.convertBase}/images-to-pdf`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Images to PDF failed' }));
      throw new Error(err.detail || 'Images to PDF failed');
    }

    const blob = await res.blob();
    const filename = this.extractFilename(res, 'converted_images.pdf');
    return { blob, filename };
  }

  async convertPdfToImages(
    file: File,
    targetFormat = 'png',
    dpi = 150,
  ): Promise<{ blob: Blob; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_format', targetFormat);
    formData.append('dpi', String(dpi));

    const res = await fetch(`${this.convertBase}/pdf-to-images`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'PDF to images failed' }));
      throw new Error(err.detail || 'PDF to images failed');
    }

    const blob = await res.blob();
    const filename = this.extractFilename(res, `extracted_pages.${targetFormat === 'svg' ? 'svg' : 'zip'}`);
    return { blob, filename };
  }

  async convertImage(file: File, targetFormat: string): Promise<{ blob: Blob; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('target_format', targetFormat);

    const res = await fetch(`${this.convertBase}/image`, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Image format conversion failed' }));
      throw new Error(err.detail || 'Image format conversion failed');
    }

    const blob = await res.blob();
    const filename = this.extractFilename(res, `converted_${file.name.split('.')[0]}.${targetFormat}`);
    return { blob, filename };
  }

  async compressAsset(file: File, category: string, preset = 'high_quality'): Promise<CompressionResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('preset', preset);

    let endpoint = `${this.compressBase}/image`;
    if (category === 'pdf') endpoint = `${this.compressBase}/pdf`;
    else if (category === 'video') endpoint = `${this.compressBase}/video`;
    else if (category === 'audio') endpoint = `${this.compressBase}/audio`;

    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Compression failed' }));
      throw new Error(err.detail || 'Compression failed');
    }

    const originalSize = parseInt(res.headers.get('x-original-size') || String(file.size), 10);
    const compressedSize = parseInt(res.headers.get('x-compressed-size') || '0', 10);
    const bytesSaved = parseInt(res.headers.get('x-bytes-saved') || '0', 10);
    const percentSaved = parseFloat(res.headers.get('x-percent-saved') || '0');

    const blob = await res.blob();
    const ext = category === 'pdf' ? 'pdf' : (category === 'video' ? 'mp4' : (category === 'audio' ? 'm4a' : 'webp'));
    const filename = this.extractFilename(res, `compressed_${file.name.split('.')[0]}.${ext}`);

    return {
      blob,
      filename,
      originalSize,
      compressedSize: compressedSize || blob.size,
      bytesSaved: bytesSaved || Math.max(0, originalSize - blob.size),
      percentSaved: percentSaved || (originalSize > 0 ? Math.round(((originalSize - blob.size) / originalSize) * 1000) / 10 : 0),
    };
  }
}

export const mediaApiClient = new MediaApiClient();
