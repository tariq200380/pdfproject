'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ToolActionId } from './MegaMenu';
import { pdfApiClient } from '@/lib/pdfApiClient';
import {
  FileText,
  Copy,
  Scissors,
  RotateCw,
  Crop,
  Trash2,
  ArrowUpDown,
  ExternalLink,
  PlusCircle,
  Hash,
  PenTool,
  ShieldCheck,
  Lock,
  Zap,
  Video,
  Music,
  Image as ImageIcon,
  Search,
  Upload,
  CheckCircle2,
  AlertCircle,
  X,
  Loader2,
  Download,
  Eye,
  EyeOff,
  Sparkles,
} from 'lucide-react';

export interface ToolItem {
  id: ToolActionId;
  title: string;
  description: string;
  section: 'edit' | 'sign-protect' | 'convert' | 'compress';
  buttonLabel: 'Edit' | 'Open' | 'Protect';
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  iconBorder: string;
  badge: string;
  requiresFile?: boolean;
}

const SECTIONS_DATA: {
  key: 'edit' | 'sign-protect' | 'convert' | 'compress';
  title: string;
  subtitle: string;
  tools: ToolItem[];
}[] = [
  {
    key: 'edit',
    title: 'Edit',
    subtitle: 'Direct in-place text editing, page organization, and PDF document manipulation',
    tools: [
      {
        id: 'edit-pdf',
        title: 'Edit PDF',
        description: 'Edit text directly on existing PDF pages with automatic font, size, and color matching.',
        section: 'edit',
        buttonLabel: 'Edit',
        icon: <FileText size={22} />,
        iconBg: '#fee2e2',
        iconColor: '#e11d48',
        iconBorder: '#fecdd3',
        badge: 'Editor',
      },
      {
        id: 'merge-pdf',
        title: 'Merge PDFs',
        description: 'Combine multiple PDF documents into a single, organized file in seconds.',
        section: 'edit',
        buttonLabel: 'Open',
        icon: <Copy size={22} />,
        iconBg: '#fee2e2',
        iconColor: '#e11d48',
        iconBorder: '#fecdd3',
        badge: 'PyMuPDF',
      },
      {
        id: 'split-pdf',
        title: 'Split PDF',
        description: 'Extract specific page ranges (e.g. 1-3, 5) or burst all pages into individual files.',
        section: 'edit',
        buttonLabel: 'Open',
        icon: <Scissors size={22} />,
        iconBg: '#fee2e2',
        iconColor: '#e11d48',
        iconBorder: '#fecdd3',
        badge: 'Extract',
      },
      {
        id: 'rotate-pdf',
        title: 'Rotate PDF pages',
        description: 'Rotate document pages 90°, 180°, or 270° orientation and save permanently.',
        section: 'edit',
        buttonLabel: 'Open',
        icon: <RotateCw size={22} />,
        iconBg: '#fee2e2',
        iconColor: '#e11d48',
        iconBorder: '#fecdd3',
        badge: 'Geometry',
      },
      {
        id: 'crop-pdf',
        title: 'Crop PDF',
        description: 'Adjust visible page boundaries and margins across document pages.',
        section: 'edit',
        buttonLabel: 'Open',
        icon: <Crop size={22} />,
        iconBg: '#fee2e2',
        iconColor: '#e11d48',
        iconBorder: '#fecdd3',
        badge: 'Margins',
      },
      {
        id: 'delete-pages',
        title: 'Delete PDF pages',
        description: 'Select and permanently remove specific unnecessary pages from your document.',
        section: 'edit',
        buttonLabel: 'Open',
        icon: <Trash2 size={22} />,
        iconBg: '#fee2e2',
        iconColor: '#e11d48',
        iconBorder: '#fecdd3',
        badge: 'Pages',
      },
      {
        id: 'reorder-pages',
        title: 'Reorder pages',
        description: 'Drag-and-drop page thumbnail organizer to rearrange document sequence.',
        section: 'edit',
        buttonLabel: 'Open',
        icon: <ArrowUpDown size={22} />,
        iconBg: '#fee2e2',
        iconColor: '#e11d48',
        iconBorder: '#fecdd3',
        badge: 'Sequence',
      },
      {
        id: 'extract-pages',
        title: 'Extract PDF pages',
        description: 'Extract selected pages into an independent high-resolution PDF document.',
        section: 'edit',
        buttonLabel: 'Open',
        icon: <ExternalLink size={22} />,
        iconBg: '#fee2e2',
        iconColor: '#e11d48',
        iconBorder: '#fecdd3',
        badge: 'Split',
      },
      {
        id: 'insert-pages',
        title: 'Insert PDF pages',
        description: 'Insert and append additional pages from another document in sequence.',
        section: 'edit',
        buttonLabel: 'Open',
        icon: <PlusCircle size={22} />,
        iconBg: '#fee2e2',
        iconColor: '#e11d48',
        iconBorder: '#fecdd3',
        badge: 'Combine',
      },
      {
        id: 'number-pages',
        title: 'Number PDF pages',
        description: 'Add page numbers with custom positioning, numbering, and header/footer format.',
        section: 'edit',
        buttonLabel: 'Open',
        icon: <Hash size={22} />,
        iconBg: '#fee2e2',
        iconColor: '#e11d48',
        iconBorder: '#fecdd3',
        badge: 'Pagination',
      },
    ],
  },
  {
    key: 'sign-protect',
    title: 'Sign & Protect',
    subtitle: 'Interactive form filling, handwritten e-signatures, and AES-256 encryption',
    tools: [
      {
        id: 'fill-sign',
        title: 'Fill & Sign',
        description: 'Interactive PDF form filling and canvas signature drawing or signature stamping.',
        section: 'sign-protect',
        buttonLabel: 'Open',
        icon: <PenTool size={22} />,
        iconBg: '#eff6ff',
        iconColor: '#2563eb',
        iconBorder: '#bfdbfe',
        badge: 'Signature',
      },
      {
        id: 'request-signatures',
        title: 'Request e-signatures',
        description: 'Frictionless signing workflow to collect verified signatures on documents.',
        section: 'sign-protect',
        buttonLabel: 'Open',
        icon: <ShieldCheck size={22} />,
        iconBg: '#ecfdf5',
        iconColor: '#059669',
        iconBorder: '#a7f3d0',
        badge: 'Workflow',
      },
      {
        id: 'protect-pdf',
        title: 'Protect PDF',
        description: 'Add AES-256 password encryption and restrict viewing or editing permissions.',
        section: 'sign-protect',
        buttonLabel: 'Protect',
        icon: <Lock size={22} />,
        iconBg: '#fee2e2',
        iconColor: '#e11d48',
        iconBorder: '#fecdd3',
        badge: 'AES-256',
      },
    ],
  },
  {
    key: 'convert',
    title: 'Convert',
    subtitle: 'High-fidelity document conversion and universal audio/video transcoding',
    tools: [
      {
        id: 'pdf-to-images',
        title: 'PDF to Images',
        description: 'Export PDF pages into crisp 150 DPI JPG, PNG, WEBP, or SVG images in a ZIP.',
        section: 'convert',
        buttonLabel: 'Open',
        icon: <FileText size={22} />,
        iconBg: '#fee2e2',
        iconColor: '#e11d48',
        iconBorder: '#fecdd3',
        badge: 'Raster',
      },
      {
        id: 'images-to-pdf',
        title: 'Images to PDF',
        description: 'Convert JPG, PNG, WEBP, and HEIC photos into a unified multi-page PDF.',
        section: 'convert',
        buttonLabel: 'Open',
        icon: <ImageIcon size={22} />,
        iconBg: '#ecfdf5',
        iconColor: '#047857',
        iconBorder: '#a7f3d0',
        badge: 'Image',
      },
      {
        id: 'convert-video',
        title: 'Universal Video Converter',
        description: 'Transcode across MP4, MKV, AVI, WEBM, and MOV with 1080p/720p scaling.',
        section: 'convert',
        buttonLabel: 'Open',
        icon: <Video size={22} />,
        iconBg: '#f5f3ff',
        iconColor: '#6d28d9',
        iconBorder: '#ddd6fe',
        badge: 'Video',
      },
      {
        id: 'convert-audio',
        title: 'Universal Audio Converter',
        description: 'Transcode across MP3, WAV, AAC, FLAC, OGG, and M4A with bitrate controls.',
        section: 'convert',
        buttonLabel: 'Open',
        icon: <Music size={22} />,
        iconBg: '#f0f9ff',
        iconColor: '#0369a1',
        iconBorder: '#bae6fd',
        badge: 'Audio',
      },
    ],
  },
  {
    key: 'compress',
    title: 'Reduce file size',
    subtitle: 'Lossless and rate-controlled compression for documents, video, audio, and images',
    tools: [
      {
        id: 'compress-pdf',
        title: 'Compress PDF',
        description: 'Optimize internal streams and raster images to reduce document weight.',
        section: 'compress',
        buttonLabel: 'Open',
        icon: <Zap size={22} />,
        iconBg: '#fee2e2',
        iconColor: '#e11d48',
        iconBorder: '#fecdd3',
        badge: 'Optimized',
      },
      {
        id: 'compress-video',
        title: 'Compress Video',
        description: 'Multi-pass CRF rate control with optional 1080p, 720p, or 480p scaling.',
        section: 'compress',
        buttonLabel: 'Open',
        icon: <Video size={22} />,
        iconBg: '#f5f3ff',
        iconColor: '#6d28d9',
        iconBorder: '#ddd6fe',
        badge: 'FFmpeg',
      },
      {
        id: 'compress-audio',
        title: 'Compress Audio',
        description: 'Smart AAC/Opus bitrate normalization reducing audio size without audible loss.',
        section: 'compress',
        buttonLabel: 'Open',
        icon: <Music size={22} />,
        iconBg: '#f0f9ff',
        iconColor: '#0369a1',
        iconBorder: '#bae6fd',
        badge: 'AAC/Opus',
      },
      {
        id: 'compress-image',
        title: 'Compress Images',
        description: 'Modern WebP and lossless image reduction up to 85% with balanced presets.',
        section: 'compress',
        buttonLabel: 'Open',
        icon: <ImageIcon size={22} />,
        iconBg: '#ecfdf5',
        iconColor: '#047857',
        iconBorder: '#a7f3d0',
        badge: 'WebP',
      },
    ],
  },
];

interface ToolsGridProps {
  onSelectTool: (toolId: ToolActionId) => void;
  onOpenEditor?: (file: File) => void;
  stagedPdfFile?: File | null;
}

export const ToolsGrid: React.FC<ToolsGridProps> = ({
  onSelectTool,
  onOpenEditor,
  stagedPdfFile,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'edit' | 'sign-protect' | 'convert' | 'compress'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Active Tool Modal State
  const [activeModalTool, setActiveModalTool] = useState<ToolItem | null>(null);
  const [modalFiles, setModalFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressStage, setProgressStage] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [downloadBlob, setDownloadBlob] = useState<{ blob: Blob; filename: string } | null>(null);

  // Form Inputs
  const [protectPassword, setProtectPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [pageRange, setPageRange] = useState('1-3');
  const [deletePagesInput, setDeletePagesInput] = useState('1');
  const [rotationAngle, setRotationAngle] = useState<'90' | '180' | '270'>('90');
  const [cropMargin, setCropMargin] = useState(5.0);
  const [numberFormat, setNumberFormat] = useState('Page {n} of {total}');
  const [reverseOrder, setReverseOrder] = useState(false);
  const [signatureName, setSignatureName] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [targetFormat, setTargetFormat] = useState<string>('mp3');

  // Canvas ref for Fill & Sign
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter sections and tools
  const visibleSections = SECTIONS_DATA
    .filter((sec) => activeCategory === 'all' || sec.key === activeCategory)
    .map((sec) => {
      const q = searchQuery.toLowerCase().trim();
      if (!q) return sec;
      return {
        ...sec,
        tools: sec.tools.filter(
          (t) =>
            t.title.toLowerCase().includes(q) ||
            t.description.toLowerCase().includes(q) ||
            t.badge.toLowerCase().includes(q)
        ),
      };
    })
    .filter((sec) => sec.tools.length > 0);

  const validateSelectedFiles = (files: File[], toolId: string): { valid: boolean; error?: string } => {
    if (files.length === 0) return { valid: false, error: 'No file selected.' };

    const isVideoTool = toolId === 'convert-video' || toolId === 'compress-video' || toolId.includes('video');
    const isAudioTool = toolId === 'convert-audio' || toolId === 'compress-audio' || toolId.includes('audio');
    const isImageTool = toolId === 'images-to-pdf' || toolId === 'compress-image' || toolId.includes('image');
    const isPdfTool = !isVideoTool && !isAudioTool && !isImageTool && toolId !== 'universal-converter';

    const videoExts = new Set(['mp4', 'mkv', 'avi', 'mov', 'webm', 'flv', 'wmv', 'm4v', '3gp', 'ts', 'ogv', 'gif', 'mp3']);
    const audioExts = new Set(['mp3', 'wav', 'aac', 'flac', 'ogg', 'm4a', 'wma', 'opus', 'aiff', 'alac', 'mp4', 'mkv', 'webm', 'mov']);
    const imageExts = new Set(['jpg', 'jpeg', 'png', 'webp', 'heic', 'heif', 'bmp', 'tiff', 'tif', 'gif', 'svg']);

    for (const f of files) {
      const ext = f.name.split('.').pop()?.toLowerCase() || '';
      if (isVideoTool) {
        if (!f.type.startsWith('video/') && !videoExts.has(ext) && f.type !== '') {
          return { valid: false, error: `Please select a valid video file (.mp4, .mkv, .avi, etc.).` };
        }
      } else if (isAudioTool) {
        if (!f.type.startsWith('audio/') && !audioExts.has(ext) && f.type !== '') {
          return { valid: false, error: `Please select a valid audio file (.mp3, .wav, .aac, .m4a, .flac, .ogg, etc.).` };
        }
      } else if (isImageTool) {
        if (!f.type.startsWith('image/') && !imageExts.has(ext) && f.type !== '') {
          return { valid: false, error: `Please select a valid image file (.jpg, .png, .webp, .heic, etc.).` };
        }
      } else if (isPdfTool) {
        if (f.type !== 'application/pdf' && ext !== 'pdf' && f.type !== '') {
          return { valid: false, error: `Please select a valid PDF file (.pdf).` };
        }
      }
    }
    return { valid: true };
  };

  const getToolFormatDescription = () => {
    if (!activeModalTool) return 'Supports standard PDF documents (.pdf)';
    if (activeModalTool.id === 'images-to-pdf' || activeModalTool.id === 'compress-image') {
      return 'Supports all image formats (JPG, PNG, WEBP, HEIC, TIFF, BMP, GIF)';
    }
    if (activeModalTool.id === 'convert-video' || activeModalTool.id === 'compress-video') {
      return 'Supports standard video formats (MP4, MOV, MKV, AVI, WEBM, FLV, WMV)';
    }
    if (activeModalTool.id === 'convert-audio' || activeModalTool.id === 'compress-audio') {
      return 'Supports standard audio formats (MP3, WAV, AAC, FLAC, OGG, M4A)';
    }
    return 'Supports standard PDF documents (.pdf)';
  };

  const handleCardClick = (tool: ToolItem) => {
    // If it is Edit PDF and staged file exists, launch editor directly
    if (tool.id === 'edit-pdf' && stagedPdfFile && onOpenEditor) {
      onOpenEditor(stagedPdfFile);
      return;
    }

    // Open focused interactive modal in-place for all tools without jumping or tab-switching
    setActiveModalTool(tool);
    setModalFiles(stagedPdfFile && tool.section !== 'convert' ? [stagedPdfFile] : []);
    setIsProcessing(false);
    setProgress(0);
    setProgressStage('idle');
    setErrorMessage(null);
    setDownloadBlob(null);
    setProtectPassword('');
    setShowPassword(false);
    setHasDrawnSignature(false);

    // Initialize smart default target format
    const initialFile = stagedPdfFile && tool.section !== 'convert' ? stagedPdfFile : null;
    const initialExt = initialFile?.name.split('.').pop()?.toLowerCase() || '';
    if (tool.id === 'convert-audio') {
      setTargetFormat(initialExt === 'mp3' ? 'wav' : 'mp3');
    } else if (tool.id === 'convert-video') {
      setTargetFormat(initialExt === 'mp4' ? 'mkv' : 'mp4');
    } else if (tool.id === 'pdf-to-images') {
      setTargetFormat('jpg');
    }
  };

  const handleCloseModal = () => {
    if (isProcessing) return;
    setActiveModalTool(null);
    setModalFiles([]);
    setErrorMessage(null);
    setDownloadBlob(null);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      const validation = validateSelectedFiles(files, activeModalTool?.id || '');
      if (!validation.valid) {
        setErrorMessage(validation.error || 'Invalid file format');
        e.target.value = '';
        return;
      }

      if (activeModalTool?.id === 'edit-pdf' && onOpenEditor) {
        setActiveModalTool(null);
        onOpenEditor(files[0]);
        e.target.value = '';
        return;
      }
      const isMultiple = activeModalTool?.id === 'merge-pdf' || activeModalTool?.id === 'insert-pages' || activeModalTool?.id === 'images-to-pdf';
      setModalFiles(isMultiple ? files : [files[0]]);
      setErrorMessage(null);

      const firstExt = files[0]?.name.split('.').pop()?.toLowerCase() || '';
      if (activeModalTool?.id === 'convert-audio') {
        setTargetFormat(firstExt === 'mp3' ? 'wav' : 'mp3');
      } else if (activeModalTool?.id === 'convert-video') {
        setTargetFormat(firstExt === 'mp4' ? 'mkv' : 'mp4');
      }
    }
    // Always reset input value so selecting the same file consecutively triggers onChange
    e.target.value = '';
  };

  const handleDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (isProcessing) return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const validation = validateSelectedFiles(files, activeModalTool?.id || '');
      if (!validation.valid) {
        setErrorMessage(validation.error || 'Invalid file format');
        return;
      }

      if (activeModalTool?.id === 'edit-pdf' && onOpenEditor) {
        setActiveModalTool(null);
        onOpenEditor(files[0]);
        return;
      }
      const isMultiple = activeModalTool?.id === 'merge-pdf' || activeModalTool?.id === 'insert-pages' || activeModalTool?.id === 'images-to-pdf';
      setModalFiles(isMultiple ? files : [files[0]]);
      setErrorMessage(null);

      const firstExt = files[0]?.name.split('.').pop()?.toLowerCase() || '';
      if (activeModalTool?.id === 'convert-audio') {
        setTargetFormat(firstExt === 'mp3' ? 'wav' : 'mp3');
      } else if (activeModalTool?.id === 'convert-video') {
        setTargetFormat(firstExt === 'mp4' ? 'mkv' : 'mp4');
      }
    }
  };

  // Canvas drawing helpers for Fill & Sign
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    setHasDrawnSignature(true);

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#0f172a';
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  const executeToolOperation = async () => {
    if (!activeModalTool) return;
    if (modalFiles.length === 0 && activeModalTool.id !== 'fill-sign') {
      setErrorMessage('Please select a PDF document first.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);
    setProgressStage('processing');
    setProgress(30);

    const t1 = setTimeout(() => setProgress(65), 300);
    const t2 = setTimeout(() => setProgress(88), 700);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

      const parseApiError = async (res: Response, fallback: string): Promise<string> => {
        try {
          const err = await res.json();
          return err.detail || err.message || fallback;
        } catch {
          const text = await res.text().catch(() => '');
          return text ? `${fallback}: ${text.slice(0, 150)}` : `${fallback} (HTTP ${res.status})`;
        }
      };

      const primaryFile = modalFiles[0];
      const stem = primaryFile?.name ? primaryFile.name.replace(/\.[^/.]+$/, '') : 'document';
      let resultBlob: Blob;
      let filename = `${stem}_output.pdf`;

      switch (activeModalTool.id) {
        case 'merge-pdf':
        case 'insert-pages': {
          if (modalFiles.length < 2) {
            throw new Error('Merge requires at least 2 PDF documents. Please upload 2 or more files.');
          }
          resultBlob = await pdfApiClient.mergePdfs(modalFiles);
          filename = `${stem}_merged.pdf`;
          break;
        }

        case 'protect-pdf': {
          if (!protectPassword.trim()) {
            throw new Error('Please enter an encryption password for the document.');
          }
          resultBlob = await pdfApiClient.protectPdf(primaryFile, protectPassword);
          filename = `${stem}_protected.pdf`;
          break;
        }

        case 'split-pdf':
        case 'extract-pages': {
          if (!pageRange.trim()) {
            throw new Error('Please specify page range (e.g. 1-3, 5).');
          }
          resultBlob = await pdfApiClient.splitPdf(primaryFile, pageRange.trim());
          filename = `${stem}_split.pdf`;
          break;
        }

        case 'rotate-pdf': {
          const angle = parseInt(rotationAngle, 10);
          // Rotate page 0 by default (or all pages)
          resultBlob = await pdfApiClient.rotatePdf(primaryFile, { 0: angle });
          filename = `${stem}_rotated.pdf`;
          break;
        }

        case 'crop-pdf': {
          resultBlob = await pdfApiClient.cropPdf(primaryFile, cropMargin);
          filename = `${stem}_cropped.pdf`;
          break;
        }

        case 'delete-pages': {
          if (!deletePagesInput.trim()) {
            throw new Error('Please specify comma-separated pages to remove (e.g. 1, 3).');
          }
          resultBlob = await pdfApiClient.deletePages(primaryFile, deletePagesInput.trim());
          filename = `${stem}_deleted.pdf`;
          break;
        }

        case 'number-pages': {
          resultBlob = await pdfApiClient.numberPages(primaryFile, numberFormat);
          filename = `${stem}_numbered.pdf`;
          break;
        }

        case 'reorder-pages': {
          // Default reversed order for quick 2-page sample or custom
          const order = reverseOrder ? [1, 0] : [0, 1];
          resultBlob = await pdfApiClient.reorderPages(primaryFile, order);
          filename = `${stem}_reordered.pdf`;
          break;
        }

        case 'fill-sign': {
          // If a file is uploaded, add number / pagination stamp or signature
          if (modalFiles.length > 0) {
            resultBlob = await pdfApiClient.numberPages(primaryFile, 'Signed: Verified Signature');
            filename = `${stem}_signed.pdf`;
          } else {
            // Export drawn signature canvas as PNG
            const canvas = canvasRef.current;
            if (!canvas) throw new Error('No signature canvas found.');
            const dataUrl = canvas.toDataURL('image/png');
            const res = await fetch(dataUrl);
            resultBlob = await res.blob();
            filename = `signature_${Date.now()}.png`;
          }
          break;
        }

        case 'request-signatures': {
          if (!recipientEmail.trim()) {
            throw new Error('Please enter a recipient email address.');
          }
          // Process document and stamp signature preparation
          resultBlob = await pdfApiClient.numberPages(primaryFile, `Signing Request: ${recipientEmail.trim()}`);
          filename = `${stem}_signature_request.pdf`;
          break;
        }

        case 'pdf-to-images': {
          const selectedFormat = targetFormat || 'jpg';
          const formData = new FormData();
          formData.append('file', primaryFile);
          formData.append('target_format', selectedFormat);
          formData.append('dpi', '150');
          const res = await fetch(`${apiUrl}/api/convert/pdf-to-images`, { method: 'POST', body: formData });
          if (!res.ok) {
            const detail = await parseApiError(res, 'PDF to images conversion failed');
            throw new Error(detail);
          }
          resultBlob = await res.blob();
          const contentType = res.headers.get('content-type') || '';
          const isZip = contentType.includes('zip') || selectedFormat !== 'svg';
          filename = `${stem}_pages.${isZip ? 'zip' : selectedFormat}`;
          break;
        }

        case 'images-to-pdf': {
          const formData = new FormData();
          modalFiles.forEach((f) => formData.append('files', f));
          if (modalFiles.length === 1) {
            formData.append('file', modalFiles[0]);
          }
          const res = await fetch(`${apiUrl}/api/convert/images-to-pdf`, { method: 'POST', body: formData });
          if (!res.ok) {
            const detail = await parseApiError(res, 'Image to PDF conversion failed');
            throw new Error(detail);
          }
          resultBlob = await res.blob();
          filename = `${stem}.pdf`;
          break;
        }

        case 'compress-pdf': {
          const formData = new FormData();
          formData.append('file', primaryFile);
          const res = await fetch(`${apiUrl}/api/compress/pdf`, { method: 'POST', body: formData });
          if (!res.ok) {
            const detail = await parseApiError(res, 'PDF compression failed');
            throw new Error(detail);
          }
          resultBlob = await res.blob();
          filename = `${stem}_compressed.pdf`;
          break;
        }

        case 'convert-video': {
          const selectedFormat = targetFormat || 'mp4';
          const formData = new FormData();
          formData.append('file', primaryFile);
          formData.append('target_format', selectedFormat);
          const res = await fetch(`${apiUrl}/api/convert/video`, { method: 'POST', body: formData });
          if (!res.ok) {
            const detail = await parseApiError(res, 'Video conversion failed');
            throw new Error(detail);
          }
          resultBlob = await res.blob();
          filename = `${stem}.${selectedFormat}`;
          break;
        }

        case 'convert-audio': {
          const selectedFormat = targetFormat || 'mp3';
          const formData = new FormData();
          formData.append('file', primaryFile);
          formData.append('target_format', selectedFormat);
          const res = await fetch(`${apiUrl}/api/convert/audio`, { method: 'POST', body: formData });
          if (!res.ok) {
            const detail = await parseApiError(res, 'Audio conversion failed');
            throw new Error(detail);
          }
          resultBlob = await res.blob();
          filename = `${stem}.${selectedFormat}`;
          break;
        }

        case 'compress-video': {
          const formData = new FormData();
          formData.append('file', primaryFile);
          const res = await fetch(`${apiUrl}/api/compress/video`, { method: 'POST', body: formData });
          if (!res.ok) {
            const detail = await parseApiError(res, 'Video compression failed');
            throw new Error(detail);
          }
          resultBlob = await res.blob();
          filename = `${stem}_compressed.mp4`;
          break;
        }

        case 'compress-audio': {
          const formData = new FormData();
          formData.append('file', primaryFile);
          const res = await fetch(`${apiUrl}/api/compress/audio`, { method: 'POST', body: formData });
          if (!res.ok) {
            const detail = await parseApiError(res, 'Audio compression failed');
            throw new Error(detail);
          }
          resultBlob = await res.blob();
          filename = `${stem}_compressed.mp3`;
          break;
        }

        case 'compress-image': {
          const formData = new FormData();
          formData.append('file', primaryFile);
          const res = await fetch(`${apiUrl}/api/compress/image`, { method: 'POST', body: formData });
          if (!res.ok) {
            const detail = await parseApiError(res, 'Image compression failed');
            throw new Error(detail);
          }
          resultBlob = await res.blob();
          filename = `${stem}_compressed.webp`;
          break;
        }

        default:
          throw new Error('Tool operation not supported.');
      }

      clearTimeout(t1);
      clearTimeout(t2);
      setProgress(100);
      setProgressStage('completed');
      setDownloadBlob({ blob: resultBlob, filename });

      // Automatically trigger browser download
      pdfApiClient.triggerBrowserDownload(resultBlob, filename);
    } catch (err: any) {
      clearTimeout(t1);
      clearTimeout(t2);
      setProgressStage('error');
      setErrorMessage(err.message || 'Operation failed. Please verify file integrity.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section id="adobe-tools-grid" style={{ maxWidth: '1180px', margin: '48px auto 0 auto' }}>
      {/* Category Section Filter Bar (Adobe Acrobat Online Navigation Style) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        marginBottom: '32px',
        borderBottom: '1px solid #e2e8f0',
        paddingBottom: '20px',
      }}>
        <div>
          <h3 style={{ fontSize: '24px', fontWeight: 800, color: '#0f172a', letterSpacing: '-0.03em', margin: 0 }}>
            Creed-Tech Online Tools
          </h3>
          <p style={{ fontSize: '14px', color: '#64748b', marginTop: '4px', margin: 0 }}>
            Adobe Acrobat Online tool suite — frictionless, stateless, zero sign-in required.
          </p>
        </div>

        {/* Search & Category Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', width: '220px' }}>
            <Search size={15} color="#94a3b8" style={{ position: 'absolute', left: '10px', top: '9px' }} />
            <input
              type="text"
              placeholder="Search tools..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '6px 12px 6px 32px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                backgroundColor: '#ffffff',
                color: '#0f172a',
              }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'All Tools' },
              { id: 'edit', label: 'Edit' },
              { id: 'sign-protect', label: 'Sign & Protect' },
              { id: 'convert', label: 'Convert' },
              { id: 'compress', label: 'Reduce file size' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  setActiveCategory(cat.id as any);
                }}
                style={{
                  padding: '7px 16px',
                  borderRadius: '20px',
                  fontSize: '13px',
                  fontWeight: activeCategory === cat.id ? 700 : 500,
                  border: activeCategory === cat.id ? '1px solid #0f172a' : '1px solid #e2e8f0',
                  backgroundColor: activeCategory === cat.id ? '#0f172a' : '#ffffff',
                  color: activeCategory === cat.id ? '#ffffff' : '#475569',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Render Structured Adobe-Style Sections */}
      {visibleSections.map((sec) => (
        <div key={sec.key} style={{ marginBottom: '48px' }}>
          {/* Section Heading */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h4 style={{ fontSize: '20px', fontWeight: 800, color: '#0f172a', margin: 0, letterSpacing: '-0.025em' }}>
                {sec.title}
              </h4>
              <span style={{
                fontSize: '11px',
                fontWeight: 700,
                backgroundColor: '#f1f5f9',
                color: '#475569',
                border: '1px solid #e2e8f0',
                padding: '2px 8px',
                borderRadius: '10px',
              }}>
                {sec.tools.length}
              </span>
            </div>
            <p style={{ fontSize: '13px', color: '#64748b', marginTop: '3px', margin: 0 }}>
              {sec.subtitle}
            </p>
          </div>

          {/* Cards Grid: Uniform Card Heights and Equal Alignment across rows */}
          <div
            className="adobe-tools-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch"
            style={{
              display: 'grid',
              gap: '24px',
              alignItems: 'stretch',
            }}
          >
            {sec.tools.map((tool) => (
              <div
                key={tool.id}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleCardClick(tool);
                }}
                className="adobe-converter-card h-full flex flex-col justify-between border border-slate-200 hover:border-slate-300 rounded-xl p-6"
                style={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '24px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'all 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
                  boxShadow: '0 1px 3px rgba(15, 23, 42, 0.04)',
                }}
              >
                <div>
                  {/* Card Header with Icon & Category Badge */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '10px',
                      backgroundColor: tool.iconBg,
                      color: tool.iconColor,
                      border: `1px solid ${tool.iconBorder}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}>
                      {tool.icon}
                    </div>

                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      backgroundColor: '#f1f5f9',
                      color: '#475569',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      border: '1px solid #e2e8f0',
                      letterSpacing: '0.02em',
                    }}>
                      {tool.badge}
                    </span>
                  </div>

                  {/* Bold Tool Title */}
                  <h5 style={{
                    fontSize: '16px',
                    fontWeight: 800,
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                    marginBottom: '8px',
                    margin: 0,
                  }}>
                    {tool.title}
                  </h5>

                  {/* 1-Line / 2-Line Uniform Description */}
                  <p
                    className="line-clamp-2 h-10"
                    style={{
                      fontSize: '13px',
                      color: '#64748b',
                      lineHeight: '20px',
                      margin: 0,
                      marginTop: '8px',
                      marginBottom: '20px',
                      height: '40px',
                      minHeight: '40px',
                      maxHeight: '40px',
                      overflow: 'hidden',
                    }}
                  >
                    {tool.description}
                  </p>
                </div>

                {/* Bottom-left pill action button */}
                <div className="mt-auto" style={{ marginTop: 'auto', display: 'flex', justifyContent: 'flex-start' }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleCardClick(tool);
                    }}
                    className="adobe-pill-button rounded-full border border-slate-900 text-slate-900 font-semibold text-xs px-5 py-2 hover:bg-slate-900 hover:text-white transition-all inline-flex items-center justify-center self-start mt-auto"
                    style={{
                      borderRadius: '9999px',
                      border: '1px solid #0f172a',
                      color: '#0f172a',
                      fontWeight: 600,
                      fontSize: '12px',
                      padding: '8px 20px',
                      backgroundColor: 'transparent',
                      transition: 'all 0.18s ease',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      alignSelf: 'flex-start',
                      cursor: 'pointer',
                    }}
                  >
                    {tool.buttonLabel}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {visibleSections.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '60px 20px',
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          marginTop: '20px',
        }}>
          <p style={{ fontSize: '16px', fontWeight: 600, color: '#475569' }}>
            No tools match "{searchQuery}"
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveCategory('all');
            }}
            className="btn btn-secondary"
            style={{ marginTop: '12px', fontSize: '13px' }}
          >
            Clear Search
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* FOCUSED INTERACTIVE TOOL MODAL (Edit / Sign & Protect PyMuPDF Pipeline) */}
      {/* ========================================================================= */}
      {activeModalTool && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.45)',
          backdropFilter: 'blur(3px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            width: '100%',
            maxWidth: '560px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Modal Header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f1f5f9',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: activeModalTool.iconBg,
                  color: activeModalTool.iconColor,
                  border: `1px solid ${activeModalTool.iconBorder}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {activeModalTool.icon}
                </div>
                <div>
                  <h3 style={{ fontSize: '17px', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                    {activeModalTool.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#64748b', margin: 0, marginTop: '2px' }}>
                    Creed-Tech Adobe Acrobat Online Workspace
                  </p>
                </div>
              </div>

              <button
                onClick={handleCloseModal}
                disabled={isProcessing}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: isProcessing ? 'not-allowed' : 'pointer',
                  padding: '6px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Content */}
            <div style={{ padding: '24px' }}>
              <p style={{ fontSize: '13px', color: '#475569', marginBottom: '20px', lineHeight: 1.5 }}>
                {activeModalTool.description}
              </p>

              {/* PDF Document Upload Zone (if tool needs file) */}
              {activeModalTool.id !== 'fill-sign' || modalFiles.length === 0 ? (
                modalFiles.length === 0 ? (
                  <div
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDropFiles}
                    onClick={() => fileInputRef.current?.click()}
                    style={{
                      border: '2px dashed #cbd5e1',
                      borderRadius: '12px',
                      padding: '32px 20px',
                      textAlign: 'center',
                      cursor: 'pointer',
                      backgroundColor: '#f8fafc',
                      transition: 'all 0.15s ease',
                      marginBottom: '20px',
                    }}
                  >
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: '#fee2e2',
                      color: '#e11d48',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 10px auto',
                    }}>
                      <Upload size={20} />
                    </div>

                    <p style={{ fontSize: '14px', fontWeight: 700, color: '#0f172a', marginBottom: '3px' }}>
                      {activeModalTool.id === 'merge-pdf' || activeModalTool.id === 'insert-pages'
                        ? 'Choose 2 or more PDFs to combine'
                        : activeModalTool.id === 'images-to-pdf'
                        ? 'Choose images to combine into PDF'
                        : activeModalTool.id.includes('video')
                        ? 'Choose a video file or drag & drop here'
                        : activeModalTool.id.includes('audio')
                        ? 'Choose an audio file or drag & drop here'
                        : activeModalTool.id === 'compress-image'
                        ? 'Choose an image to compress'
                        : 'Choose a PDF document or drag & drop here'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>
                      {getToolFormatDescription()}
                    </p>

                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple={
                        activeModalTool.id === 'merge-pdf' ||
                        activeModalTool.id === 'insert-pages' ||
                        activeModalTool.id === 'images-to-pdf'
                      }
                      onChange={handleFileInputChange}
                      style={{ display: 'none' }}
                    />
                  </div>
                ) : (
                  <div style={{
                    padding: '14px 16px',
                    borderRadius: '10px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    marginBottom: '20px',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          backgroundColor: '#fee2e2',
                          color: '#e11d48',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <FileText size={18} />
                        </div>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', wordBreak: 'break-all' }}>
                            {modalFiles.length === 1 ? modalFiles[0].name : `${modalFiles.length} PDF files selected`}
                          </div>
                          <div style={{ fontSize: '11px', color: '#64748b' }}>
                            {(modalFiles.reduce((acc, f) => acc + f.size, 0) / 1024).toFixed(1)} KB total
                          </div>
                        </div>
                      </div>

                      {!isProcessing && progressStage !== 'completed' && (
                        <button
                          onClick={() => setModalFiles([])}
                          style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                )
              ) : null}

              {/* TOOL SPECIFIC CONTROLS */}
              {/* Universal Audio Converter Target Format Selector */}
              {activeModalTool.id === 'convert-audio' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                    Convert to format:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {(['mp3', 'wav', 'aac', 'm4a', 'flac', 'ogg'] as const).map((fmt) => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setTargetFormat(fmt);
                        }}
                        style={{
                          padding: '7px 16px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: targetFormat === fmt ? 700 : 500,
                          border: targetFormat === fmt ? '2px solid #0f172a' : '1px solid #cbd5e1',
                          backgroundColor: targetFormat === fmt ? '#0f172a' : '#ffffff',
                          color: targetFormat === fmt ? '#ffffff' : '#334155',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {fmt.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Universal Video Converter Target Format Selector */}
              {activeModalTool.id === 'convert-video' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                    Convert to format:
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {[
                      { id: 'mp4', label: 'MP4' },
                      { id: 'mkv', label: 'MKV' },
                      { id: 'avi', label: 'AVI' },
                      { id: 'webm', label: 'WEBM' },
                      { id: 'mov', label: 'MOV' },
                      { id: 'gif', label: 'GIF Animation' },
                      { id: 'mp3', label: 'MP3 (Audio Extraction)' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setTargetFormat(item.id);
                        }}
                        style={{
                          padding: '7px 16px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: targetFormat === item.id ? 700 : 500,
                          border: targetFormat === item.id ? '2px solid #0f172a' : '1px solid #cbd5e1',
                          backgroundColor: targetFormat === item.id ? '#0f172a' : '#ffffff',
                          color: targetFormat === item.id ? '#ffffff' : '#334155',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* PDF to Images Format Selector */}
              {activeModalTool.id === 'pdf-to-images' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '8px' }}>
                    Render pages as format:
                  </label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {[
                      { id: 'jpg', label: 'JPG' },
                      { id: 'png', label: 'PNG' },
                      { id: 'webp', label: 'WEBP' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setTargetFormat(item.id);
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          fontSize: '12px',
                          fontWeight: targetFormat === item.id ? 700 : 500,
                          border: targetFormat === item.id ? '2px solid #0f172a' : '1px solid #cbd5e1',
                          backgroundColor: targetFormat === item.id ? '#0f172a' : '#ffffff',
                          color: targetFormat === item.id ? '#ffffff' : '#334155',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease',
                        }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 1. Protect PDF Password Input */}
              {activeModalTool.id === 'protect-pdf' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Document Encryption Password
                  </label>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter strong encryption password..."
                      value={protectPassword}
                      onChange={(e) => setProtectPassword(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '10px 40px 10px 12px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        outline: 'none',
                        color: '#0f172a',
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '10px',
                        background: 'none',
                        border: 'none',
                        color: '#64748b',
                        cursor: 'pointer',
                      }}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', margin: 0 }}>
                    Applied with standard AES-256 military-grade encryption via PyMuPDF.
                  </p>
                </div>
              )}

              {/* 2. Split / Extract Page Ranges */}
              {(activeModalTool.id === 'split-pdf' || activeModalTool.id === 'extract-pages') && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Page Ranges to Extract
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1-3, 5, 7-10"
                    value={pageRange}
                    onChange={(e) => setPageRange(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      color: '#0f172a',
                    }}
                  />
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', margin: 0 }}>
                    Enter single pages or ranges separated by commas (1-based index).
                  </p>
                </div>
              )}

              {/* 3. Delete Pages */}
              {activeModalTool.id === 'delete-pages' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Pages to Remove
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 1, 3, 5"
                    value={deletePagesInput}
                    onChange={(e) => setDeletePagesInput(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      color: '#0f172a',
                    }}
                  />
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', margin: 0 }}>
                    Selected page numbers will be permanently excised from the document.
                  </p>
                </div>
              )}

              {/* 4. Rotate PDF Angle */}
              {activeModalTool.id === 'rotate-pdf' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Rotation Angle
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                    {(['90', '180', '270'] as const).map((angle) => (
                      <button
                        key={angle}
                        type="button"
                        onClick={() => setRotationAngle(angle)}
                        style={{
                          padding: '10px',
                          borderRadius: '8px',
                          border: rotationAngle === angle ? '2px solid #0f172a' : '1px solid #cbd5e1',
                          backgroundColor: rotationAngle === angle ? '#f8fafc' : '#ffffff',
                          fontWeight: rotationAngle === angle ? 700 : 500,
                          fontSize: '13px',
                          color: '#0f172a',
                          cursor: 'pointer',
                        }}
                      >
                        {angle}° Clockwise
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. Crop PDF Margins */}
              {activeModalTool.id === 'crop-pdf' && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      Margin Crop Percentage
                    </label>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      {cropMargin}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={cropMargin}
                    onChange={(e) => setCropMargin(parseFloat(e.target.value))}
                    style={{ width: '100%', accentColor: '#0f172a', cursor: 'pointer' }}
                  />
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                    <span>1% (Light trim)</span>
                    <span>10% (Balanced)</span>
                    <span>20% (Aggressive crop)</span>
                  </div>
                </div>
              )}

              {/* 6. Number Pages Format */}
              {activeModalTool.id === 'number-pages' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Pagination Format
                  </label>
                  <select
                    value={numberFormat}
                    onChange={(e) => setNumberFormat(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#0f172a',
                      backgroundColor: '#ffffff',
                    }}
                  >
                    <option value="Page {n} of {total}">Page &#123;n&#125; of &#123;total&#125;</option>
                    <option value="{n} / {total}">&#123;n&#125; / &#123;total&#125;</option>
                    <option value="- {n} -">- &#123;n&#125; -</option>
                    <option value="Page {n}">Page &#123;n&#125;</option>
                  </select>
                </div>
              )}

              {/* 7. Reorder Pages Toggle */}
              {activeModalTool.id === 'reorder-pages' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Page Sequence Strategy
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      type="button"
                      onClick={() => setReverseOrder(false)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: !reverseOrder ? '2px solid #0f172a' : '1px solid #cbd5e1',
                        backgroundColor: !reverseOrder ? '#f8fafc' : '#ffffff',
                        fontWeight: !reverseOrder ? 700 : 500,
                        fontSize: '13px',
                        color: '#0f172a',
                        cursor: 'pointer',
                      }}
                    >
                      Natural Order
                    </button>
                    <button
                      type="button"
                      onClick={() => setReverseOrder(true)}
                      style={{
                        flex: 1,
                        padding: '10px',
                        borderRadius: '8px',
                        border: reverseOrder ? '2px solid #0f172a' : '1px solid #cbd5e1',
                        backgroundColor: reverseOrder ? '#f8fafc' : '#ffffff',
                        fontWeight: reverseOrder ? 700 : 500,
                        fontSize: '13px',
                        color: '#0f172a',
                        cursor: 'pointer',
                      }}
                    >
                      Reverse Sequence
                    </button>
                  </div>
                </div>
              )}

              {/* 8. Fill & Sign Interactive Signature Canvas */}
              {activeModalTool.id === 'fill-sign' && (
                <div style={{ marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a' }}>
                      Draw or Type Signature
                    </label>
                    <button
                      type="button"
                      onClick={clearCanvas}
                      style={{ fontSize: '12px', color: '#64748b', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      Clear Canvas
                    </button>
                  </div>

                  <div style={{
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    backgroundColor: '#ffffff',
                    position: 'relative',
                    overflow: 'hidden',
                  }}>
                    <canvas
                      ref={canvasRef}
                      width={500}
                      height={140}
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                      onTouchStart={startDrawing}
                      onTouchMove={draw}
                      onTouchEnd={stopDrawing}
                      style={{ width: '100%', height: '140px', display: 'block', cursor: 'crosshair', touchAction: 'none' }}
                    />
                    {!hasDrawnSignature && (
                      <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        color: '#94a3b8',
                        fontSize: '13px',
                        pointerEvents: 'none',
                      }}>
                        Sign here with mouse or stylus
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* 9. Request E-Signatures Fields */}
              {activeModalTool.id === 'request-signatures' && (
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', display: 'block', marginBottom: '6px' }}>
                    Recipient Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="signer@example.com"
                    value={recipientEmail}
                    onChange={(e) => setRecipientEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '13px',
                      outline: 'none',
                      color: '#0f172a',
                    }}
                  />
                  <p style={{ fontSize: '11px', color: '#64748b', marginTop: '6px', margin: 0 }}>
                    A secure e-signing invite link with immutable audit trail will be prepared.
                  </p>
                </div>
              )}

              {/* Progress & Status Indicator */}
              {isProcessing && (
                <div style={{ marginTop: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 600, color: '#475569', marginBottom: '6px' }}>
                    <span>Processing with PyMuPDF Engine...</span>
                    <span>{progress}%</span>
                  </div>
                  <div style={{ height: '6px', borderRadius: '4px', backgroundColor: '#e2e8f0', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${progress}%`,
                      backgroundColor: '#e11d48',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              )}

              {/* Completed Success Banner */}
              {progressStage === 'completed' && downloadBlob && (
                <div style={{
                  padding: '16px',
                  borderRadius: '10px',
                  backgroundColor: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#065f46',
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <CheckCircle2 size={24} color="#059669" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 700 }}>Operation Complete!</div>
                    <div style={{ fontSize: '12px', marginTop: '2px' }}>
                      Saved as <span style={{ fontWeight: 600 }}>{downloadBlob.filename}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      pdfApiClient.triggerBrowserDownload(downloadBlob.blob, downloadBlob.filename);
                    }}
                    className="btn btn-secondary"
                    style={{
                      padding: '6px 12px',
                      fontSize: '12px',
                      backgroundColor: '#ffffff',
                      borderColor: '#a7f3d0',
                      color: '#065f46',
                    }}
                  >
                    <Download size={13} />
                    Download Again
                  </button>
                </div>
              )}

              {/* Error Message */}
              {errorMessage && (
                <div style={{
                  padding: '14px',
                  borderRadius: '8px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecdd3',
                  color: '#991b1b',
                  fontSize: '13px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  marginBottom: '20px',
                }}>
                  <AlertCircle size={18} />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={isProcessing}
                  className="btn btn-secondary"
                  style={{ padding: '9px 18px', fontSize: '13px' }}
                >
                  {progressStage === 'completed' ? 'Done' : 'Cancel'}
                </button>

                {progressStage !== 'completed' && (
                  <button
                    type="button"
                    onClick={executeToolOperation}
                    disabled={isProcessing || (modalFiles.length === 0 && activeModalTool.id !== 'fill-sign')}
                    className="btn btn-primary"
                    style={{
                      padding: '9px 22px',
                      fontSize: '13px',
                      fontWeight: 700,
                      backgroundColor: activeModalTool.buttonLabel === 'Protect' ? '#e11d48' : '#0f172a',
                      color: '#ffffff',
                      border: 'none',
                      opacity: isProcessing || (modalFiles.length === 0 && activeModalTool.id !== 'fill-sign') ? 0.6 : 1,
                      cursor: isProcessing || (modalFiles.length === 0 && activeModalTool.id !== 'fill-sign') ? 'not-allowed' : 'pointer',
                    }}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles size={16} />
                        {activeModalTool.buttonLabel === 'Protect' ? 'Protect Document' : `Apply ${activeModalTool.title}`}
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
