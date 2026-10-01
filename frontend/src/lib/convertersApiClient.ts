/**
 * REST API client for all 23 Adobe Acrobat Online converters in Creed-Tech.
 */

export interface ConverterResult {
  blob: Blob;
  filename: string;
}

export interface ConverterConfig {
  id: string;
  title: string;
  description: string;
  accept: string;
  multiple?: boolean;
  category: 'to-pdf' | 'from-pdf' | 'specialized';
  endpoint: string;
  iconType: 'pdf' | 'word' | 'excel' | 'ppt' | 'image' | 'text' | 'design' | 'scan' | 'universal';
  badge?: string;
  defaultOutputName?: string;
}

export const ALL_23_CONVERTERS: ConverterConfig[] = [
  // --- Convert to PDF ---
  {
    id: 'word-to-pdf',
    title: 'Word to PDF',
    description: 'Convert Microsoft Word documents (.docx) to PDF with precision formatting.',
    accept: '.docx',
    category: 'to-pdf',
    endpoint: '/api/convert/word-to-pdf',
    iconType: 'word',
    defaultOutputName: 'document.pdf',
  },
  {
    id: 'excel-to-pdf',
    title: 'Excel to PDF',
    description: 'Turn spreadsheets (.xlsx) into clean, shareable PDF data tables.',
    accept: '.xlsx',
    category: 'to-pdf',
    endpoint: '/api/convert/excel-to-pdf',
    iconType: 'excel',
    defaultOutputName: 'spreadsheet.pdf',
  },
  {
    id: 'ppt-to-pdf',
    title: 'PowerPoint to PDF',
    description: 'Convert PowerPoint presentations (.pptx) into standard multi-page PDF.',
    accept: '.pptx',
    category: 'to-pdf',
    endpoint: '/api/convert/ppt-to-pdf',
    iconType: 'ppt',
    defaultOutputName: 'presentation.pdf',
  },
  {
    id: 'jpg-to-pdf',
    title: 'JPG to PDF',
    description: 'Convert JPG/JPEG images into high-resolution PDF documents.',
    accept: '.jpg,.jpeg',
    category: 'to-pdf',
    endpoint: '/api/convert/jpg-to-pdf',
    iconType: 'image',
    defaultOutputName: 'image.pdf',
  },
  {
    id: 'png-to-pdf',
    title: 'PNG to PDF',
    description: 'Convert transparent or crisp PNG graphics directly into PDF.',
    accept: '.png',
    category: 'to-pdf',
    endpoint: '/api/convert/png-to-pdf',
    iconType: 'image',
    defaultOutputName: 'graphic.pdf',
  },
  {
    id: 'text-to-pdf',
    title: 'Text to PDF',
    description: 'Transform plain text (.txt) files into clean, readable PDF documents.',
    accept: '.txt',
    category: 'to-pdf',
    endpoint: '/api/convert/text-to-pdf',
    iconType: 'text',
    defaultOutputName: 'document.pdf',
  },
  {
    id: 'rtf-to-pdf',
    title: 'RTF to PDF',
    description: 'Convert Rich Text Format (.rtf) documents to PDF format.',
    accept: '.rtf',
    category: 'to-pdf',
    endpoint: '/api/convert/rtf-to-pdf',
    iconType: 'text',
    defaultOutputName: 'document.pdf',
  },
  {
    id: 'image-to-pdf',
    title: 'Image to PDF',
    description: 'Combine multiple raster images (JPG, PNG, WEBP, BMP) into a multi-page PDF.',
    accept: '.jpg,.jpeg,.png,.webp,.bmp,.tiff',
    multiple: true,
    category: 'to-pdf',
    endpoint: '/api/convert/image-to-pdf',
    iconType: 'image',
    defaultOutputName: 'combined_images.pdf',
  },
  {
    id: 'heic-to-pdf',
    title: 'HEIC to PDF',
    description: 'Convert Apple HEIC / HEIF high-efficiency mobile photos directly to PDF.',
    accept: '.heic,.heif',
    category: 'to-pdf',
    endpoint: '/api/convert/heic-to-pdf',
    iconType: 'image',
    badge: 'Apple iOS',
    defaultOutputName: 'photo.pdf',
  },
  {
    id: 'tiff-to-pdf',
    title: 'TIFF to PDF',
    description: 'Convert multi-frame scanned TIFF image files into a single structured PDF.',
    accept: '.tiff,.tif',
    category: 'to-pdf',
    endpoint: '/api/convert/tiff-to-pdf',
    iconType: 'image',
    defaultOutputName: 'scanned_document.pdf',
  },
  {
    id: 'bmp-to-pdf',
    title: 'BMP to PDF',
    description: 'Convert uncompressed Bitmap (.bmp) image files into lightweight PDF.',
    accept: '.bmp',
    category: 'to-pdf',
    endpoint: '/api/convert/bmp-to-pdf',
    iconType: 'image',
    defaultOutputName: 'image.pdf',
  },
  {
    id: 'gif-to-pdf',
    title: 'GIF to PDF',
    description: 'Extract and assemble GIF animation frames into consecutive PDF pages.',
    accept: '.gif',
    category: 'to-pdf',
    endpoint: '/api/convert/gif-to-pdf',
    iconType: 'image',
    defaultOutputName: 'frames.pdf',
  },
  {
    id: 'psd-to-pdf',
    title: 'PSD to PDF',
    description: 'Extract composite renders from Adobe Photoshop (.psd) files into PDF.',
    accept: '.psd',
    category: 'to-pdf',
    endpoint: '/api/convert/psd-to-pdf',
    iconType: 'design',
    badge: 'Adobe PSD',
    defaultOutputName: 'photoshop_design.pdf',
  },
  {
    id: 'ai-to-pdf',
    title: 'AI to PDF',
    description: 'Convert Adobe Illustrator (.ai) vector graphics artwork directly to PDF.',
    accept: '.ai',
    category: 'to-pdf',
    endpoint: '/api/convert/ai-to-pdf',
    iconType: 'design',
    badge: 'Illustrator',
    defaultOutputName: 'illustrator_vector.pdf',
  },
  {
    id: 'indd-to-pdf',
    title: 'INDD to PDF',
    description: 'Extract embedded print previews from Adobe InDesign (.indd / .idml) packages.',
    accept: '.indd,.idml',
    category: 'to-pdf',
    endpoint: '/api/convert/indd-to-pdf',
    iconType: 'design',
    badge: 'InDesign',
    defaultOutputName: 'indesign_layout.pdf',
  },
  {
    id: 'smart-pdf',
    title: 'PDF Converter',
    description: 'Intelligent router: automatically detects any uploaded document or image and converts to PDF.',
    accept: '.docx,.xlsx,.pptx,.txt,.rtf,.jpg,.jpeg,.png,.webp,.bmp,.tiff,.heic,.psd,.ai,.idml',
    category: 'to-pdf',
    endpoint: '/api/convert/smart-pdf',
    iconType: 'universal',
    badge: 'Auto-Detect',
    defaultOutputName: 'converted.pdf',
  },

  // --- Convert from PDF ---
  {
    id: 'pdf-to-word',
    title: 'PDF to Word',
    description: 'Convert PDF documents into editable Microsoft Word (.docx) files.',
    accept: '.pdf',
    category: 'from-pdf',
    endpoint: '/api/convert/pdf-to-word',
    iconType: 'word',
    defaultOutputName: 'document.docx',
  },
  {
    id: 'pdf-to-excel',
    title: 'PDF to Excel',
    description: 'Extract tables and financial figures from PDF into Microsoft Excel (.xlsx).',
    accept: '.pdf',
    category: 'from-pdf',
    endpoint: '/api/convert/pdf-to-excel',
    iconType: 'excel',
    defaultOutputName: 'spreadsheet.xlsx',
  },
  {
    id: 'pdf-to-ppt',
    title: 'PDF to PowerPoint',
    description: 'Turn PDF slides and pages into editable Microsoft PowerPoint presentations (.pptx).',
    accept: '.pdf',
    category: 'from-pdf',
    endpoint: '/api/convert/pdf-to-ppt',
    iconType: 'ppt',
    defaultOutputName: 'presentation.pptx',
  },
  {
    id: 'pdf-to-jpg',
    title: 'PDF to JPG',
    description: 'Rasterize PDF pages into high-definition JPG images (ZIP archive for multi-page).',
    accept: '.pdf',
    category: 'from-pdf',
    endpoint: '/api/convert/pdf-to-jpg',
    iconType: 'image',
    defaultOutputName: 'pages.zip',
  },
  {
    id: 'pdf-to-png',
    title: 'PDF to PNG',
    description: 'Convert PDF pages into lossless PNG images (ZIP archive for multi-page).',
    accept: '.pdf',
    category: 'from-pdf',
    endpoint: '/api/convert/pdf-to-png',
    iconType: 'image',
    defaultOutputName: 'pages.zip',
  },

  // --- Specialized Engines ---
  {
    id: 'ocr-pdf',
    title: 'OCR PDF',
    description: 'Optical character recognition overlay: turns scanned image PDFs into searchable text.',
    accept: '.pdf',
    category: 'specialized',
    endpoint: '/api/convert/ocr-pdf',
    iconType: 'scan',
    badge: 'Searchable OCR',
    defaultOutputName: 'searchable.pdf',
  },
  {
    id: 'universal-converter',
    title: 'File Converter',
    description: 'Universal cross-format conversion router: transform between documents, images, and audio/video.',
    accept: '*/*',
    category: 'specialized',
    endpoint: '/api/convert/universal',
    iconType: 'universal',
    badge: 'Universal Router',
    defaultOutputName: 'converted_file',
  },
];

class ConvertersApiClient {
  async executeConversion(
    endpoint: string,
    files: File | File[],
    extraParams?: Record<string, string>
  ): Promise<ConverterResult> {
    const formData = new FormData();
    const fileList = Array.isArray(files) ? files : [files];

    if (fileList.length === 1 && !endpoint.endsWith('/image-to-pdf')) {
      formData.append('file', fileList[0]);
    } else {
      fileList.forEach((f) => formData.append('files', f));
      // Also append single 'file' just in case
      if (fileList.length === 1) {
        formData.append('file', fileList[0]);
      }
    }

    if (extraParams) {
      Object.entries(extraParams).forEach(([k, v]) => formData.append(k, v));
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Conversion failed' }));
      throw new Error(err.detail || `Server responded with ${res.status}`);
    }

    // Extract filename from Content-Disposition header if available
    let filename = 'download';
    const disposition = res.headers.get('content-disposition');
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename=["']?([^"';]+)["']?/i);
      if (match && match[1]) {
        filename = match[1].trim();
      }
    }

    const blob = await res.blob();
    return { blob, filename };
  }

  triggerBrowserDownload(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 60000);
  }
}

export const convertersApiClient = new ConvertersApiClient();
