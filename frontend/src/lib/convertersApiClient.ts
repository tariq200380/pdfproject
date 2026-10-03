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
    accept: '.docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword',
    category: 'to-pdf',
    endpoint: '/api/convert/word-to-pdf',
    iconType: 'word',
    defaultOutputName: 'document.pdf',
  },
  {
    id: 'excel-to-pdf',
    title: 'Excel to PDF',
    description: 'Turn spreadsheets (.xlsx) into clean, shareable PDF data tables.',
    accept: '.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel',
    category: 'to-pdf',
    endpoint: '/api/convert/excel-to-pdf',
    iconType: 'excel',
    defaultOutputName: 'spreadsheet.pdf',
  },
  {
    id: 'ppt-to-pdf',
    title: 'PowerPoint to PDF',
    description: 'Convert PowerPoint presentations (.pptx) into standard multi-page PDF.',
    accept: '.pptx,.ppt,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/vnd.ms-powerpoint',
    category: 'to-pdf',
    endpoint: '/api/convert/ppt-to-pdf',
    iconType: 'ppt',
    defaultOutputName: 'presentation.pdf',
  },
  {
    id: 'jpg-to-pdf',
    title: 'JPG to PDF',
    description: 'Convert JPG/JPEG images into high-resolution PDF documents.',
    accept: '.jpg,.jpeg,image/jpeg,image/jpg',
    category: 'to-pdf',
    endpoint: '/api/convert/jpg-to-pdf',
    iconType: 'image',
    defaultOutputName: 'image.pdf',
  },
  {
    id: 'png-to-pdf',
    title: 'PNG to PDF',
    description: 'Convert transparent or crisp PNG graphics directly into PDF.',
    accept: '.png,image/png',
    category: 'to-pdf',
    endpoint: '/api/convert/png-to-pdf',
    iconType: 'image',
    defaultOutputName: 'graphic.pdf',
  },
  {
    id: 'text-to-pdf',
    title: 'Text to PDF',
    description: 'Transform plain text (.txt) files into clean, readable PDF documents.',
    accept: '.txt,text/plain',
    category: 'to-pdf',
    endpoint: '/api/convert/text-to-pdf',
    iconType: 'text',
    defaultOutputName: 'document.pdf',
  },
  {
    id: 'rtf-to-pdf',
    title: 'RTF to PDF',
    description: 'Convert Rich Text Format (.rtf) documents to PDF format.',
    accept: '.rtf,application/rtf,text/rtf',
    category: 'to-pdf',
    endpoint: '/api/convert/rtf-to-pdf',
    iconType: 'text',
    defaultOutputName: 'document.pdf',
  },
  {
    id: 'image-to-pdf',
    title: 'Image to PDF',
    description: 'Combine multiple raster images (JPG, PNG, WEBP, BMP) into a multi-page PDF.',
    accept: 'image/*,.png,.jpg,.jpeg,.webp,.heic,.heif,.bmp,.tiff,.tif,.gif',
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
    accept: '.heic,.heif,image/heic,image/heif',
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
    accept: '.tiff,.tif,image/tiff',
    category: 'to-pdf',
    endpoint: '/api/convert/tiff-to-pdf',
    iconType: 'image',
    defaultOutputName: 'scanned_document.pdf',
  },
  {
    id: 'bmp-to-pdf',
    title: 'BMP to PDF',
    description: 'Convert uncompressed Bitmap (.bmp) image files into lightweight PDF.',
    accept: '.bmp,image/bmp',
    category: 'to-pdf',
    endpoint: '/api/convert/bmp-to-pdf',
    iconType: 'image',
    defaultOutputName: 'image.pdf',
  },
  {
    id: 'gif-to-pdf',
    title: 'GIF to PDF',
    description: 'Extract and assemble GIF animation frames into consecutive PDF pages.',
    accept: '.gif,image/gif',
    category: 'to-pdf',
    endpoint: '/api/convert/gif-to-pdf',
    iconType: 'image',
    defaultOutputName: 'frames.pdf',
  },
  {
    id: 'psd-to-pdf',
    title: 'PSD to PDF',
    description: 'Extract composite renders from Adobe Photoshop (.psd) files into PDF.',
    accept: '.psd,image/vnd.adobe.photoshop',
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
    accept: '.ai,application/postscript,application/illustrator',
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
    accept: '.indd,.idml,application/x-indesign',
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
    accept: '.pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt,.txt,.rtf,.jpg,.jpeg,.png,.webp,.svg,.heic,.bmp,.tiff,.gif,.psd,.ai,.indd,.idml,image/*,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.*',
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
    accept: '.pdf,application/pdf',
    category: 'from-pdf',
    endpoint: '/api/convert/pdf-to-word',
    iconType: 'word',
    defaultOutputName: 'document.docx',
  },
  {
    id: 'pdf-to-excel',
    title: 'PDF to Excel',
    description: 'Extract tables and financial figures from PDF into Microsoft Excel (.xlsx).',
    accept: '.pdf,application/pdf',
    category: 'from-pdf',
    endpoint: '/api/convert/pdf-to-excel',
    iconType: 'excel',
    defaultOutputName: 'spreadsheet.xlsx',
  },
  {
    id: 'pdf-to-ppt',
    title: 'PDF to PowerPoint',
    description: 'Turn PDF slides and pages into editable Microsoft PowerPoint presentations (.pptx).',
    accept: '.pdf,application/pdf',
    category: 'from-pdf',
    endpoint: '/api/convert/pdf-to-ppt',
    iconType: 'ppt',
    defaultOutputName: 'presentation.pptx',
  },
  {
    id: 'pdf-to-jpg',
    title: 'PDF to JPG',
    description: 'Rasterize PDF pages into high-definition JPG images (ZIP archive for multi-page).',
    accept: '.pdf,application/pdf',
    category: 'from-pdf',
    endpoint: '/api/convert/pdf-to-jpg',
    iconType: 'image',
    defaultOutputName: 'pages.zip',
  },
  {
    id: 'pdf-to-png',
    title: 'PDF to PNG',
    description: 'Convert PDF pages into lossless PNG images (ZIP archive for multi-page).',
    accept: '.pdf,application/pdf',
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
    accept: '.pdf,application/pdf',
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
    accept: '.pdf,.docx,.xlsx,.pptx,.txt,.rtf,.jpg,.jpeg,.png,.webp,.svg,.heic,.bmp,.tiff,.gif,.psd,.ai,.indd,.mp4,.mov,.mkv,.avi,.webm,.mp3,.wav,.aac,.flac,.ogg,.m4a,video/*,audio/*,image/*,application/pdf',
    category: 'specialized',
    endpoint: '/api/convert/universal',
    iconType: 'universal',
    badge: 'Universal Router',
    defaultOutputName: 'converted_file',
  },

  // --- Extended Document & Archive Converters ---
  {
    id: 'odt-to-pdf',
    title: 'ODT to PDF',
    description: 'Convert OpenOffice / LibreOffice Writer documents (.odt) to standard PDF files with formatting preserved.',
    accept: '.odt,application/vnd.oasis.opendocument.text',
    category: 'to-pdf',
    endpoint: '/api/convert/smart-pdf',
    iconType: 'word',
    badge: 'ODT',
    defaultOutputName: 'document.pdf',
  },
  {
    id: 'ods-to-pdf',
    title: 'ODS to PDF',
    description: 'Convert OpenOffice / LibreOffice Calc spreadsheets (.ods) to clean, readable PDF tables.',
    accept: '.ods,application/vnd.oasis.opendocument.spreadsheet',
    category: 'to-pdf',
    endpoint: '/api/convert/smart-pdf',
    iconType: 'excel',
    badge: 'ODS',
    defaultOutputName: 'spreadsheet.pdf',
  },
  {
    id: 'odp-to-pdf',
    title: 'ODP to PDF',
    description: 'Convert OpenOffice / LibreOffice Impress presentations (.odp) into multi-page PDF documents.',
    accept: '.odp,application/vnd.oasis.opendocument.presentation',
    category: 'to-pdf',
    endpoint: '/api/convert/smart-pdf',
    iconType: 'ppt',
    badge: 'ODP',
    defaultOutputName: 'presentation.pdf',
  },
  {
    id: 'html-to-pdf',
    title: 'HTML to PDF',
    description: 'Convert web code, HTML files, and markup (.html, .htm) into high-fidelity PDF documents.',
    accept: '.html,.htm,text/html',
    category: 'to-pdf',
    endpoint: '/api/convert/smart-pdf',
    iconType: 'text',
    badge: 'HTML',
    defaultOutputName: 'webpage.pdf',
  },
  {
    id: 'epub-to-pdf',
    title: 'EPUB to PDF',
    description: 'Convert EPUB digital e-books into beautifully paginated standard PDF documents.',
    accept: '.epub,application/epub+zip',
    category: 'to-pdf',
    endpoint: '/api/convert/smart-pdf',
    iconType: 'text',
    badge: 'EPUB',
    defaultOutputName: 'ebook.pdf',
  },
  {
    id: 'pages-to-pdf',
    title: 'Pages to PDF',
    description: 'Convert Apple Pages documents (.pages) into cross-platform universal PDF documents.',
    accept: '.pages,application/x-iwork-pages-sffpages',
    category: 'to-pdf',
    endpoint: '/api/convert/smart-pdf',
    iconType: 'word',
    badge: 'Pages',
    defaultOutputName: 'document.pdf',
  },
  {
    id: 'csv-to-pdf',
    title: 'CSV to PDF',
    description: 'Convert comma-separated tabular CSV data files into clean, professional PDF tables.',
    accept: '.csv,text/csv',
    category: 'to-pdf',
    endpoint: '/api/convert/excel-to-pdf',
    iconType: 'excel',
    badge: 'CSV',
    defaultOutputName: 'table.pdf',
  },
  {
    id: 'zip-to-pdf',
    title: 'ZIP to PDF',
    description: 'Extract and convert archives containing documents and images into a consolidated PDF.',
    accept: '.zip,application/zip',
    category: 'to-pdf',
    endpoint: '/api/convert/smart-pdf',
    iconType: 'universal',
    badge: 'ZIP',
    defaultOutputName: 'archive.pdf',
  },
  {
    id: 'hwp-to-pdf',
    title: 'HWP to PDF',
    description: 'Convert Hangul Word Processor (.hwp) Korean documents into standard PDF documents.',
    accept: '.hwp,application/x-hwp',
    category: 'to-pdf',
    endpoint: '/api/convert/smart-pdf',
    iconType: 'word',
    badge: 'HWP',
    defaultOutputName: 'document.pdf',
  },
  {
    id: 'pdf-to-pdfa',
    title: 'PDF to PDF/A',
    description: 'Convert standard PDF documents into ISO 19005 compliant archival PDF/A files for long-term preservation.',
    accept: '.pdf,application/pdf',
    category: 'specialized',
    endpoint: '/api/convert/smart-pdf',
    iconType: 'pdf',
    badge: 'PDF/A',
    defaultOutputName: 'archival.pdf',
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
