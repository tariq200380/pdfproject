/**
 * REST API client for Document Intelligence suite in Creed-Tech Studio:
 * - Local extractive summarizer
 * - Structure-preserving document translator
 * - PDF to Markdown conversion
 */

export interface SummaryResult {
  status: string;
  summary: string;
  bullets: string[];
  mode: string;
  sentence_count: number;
  original_word_count: number;
  summary_word_count: number;
  compression_ratio: number;
  filename?: string;
}

export interface TranslationResult {
  status: string;
  translated_text: string;
  source_lang: string;
  target_lang: string;
  target_lang_name: string;
  is_rtl?: boolean;
  char_count: number;
  word_count: number;
  filename?: string;
}

export interface MarkdownResult {
  status: string;
  markdown: string;
  word_count: number;
  heading_count: number;
  table_count: number;
  filename?: string;
}

class IntelligenceApiClient {
  private baseUrl = '/api/intelligence';

  async summarize(params: {
    file?: File;
    text?: string;
    mode?: 'bullets' | 'executive' | 'digest';
    sentences?: number;
    password?: string;
  }): Promise<SummaryResult> {
    const formData = new FormData();
    if (params.file) {
      formData.append('file', params.file);
    }
    if (params.text) {
      formData.append('text', params.text);
    }
    formData.append('mode', params.mode || 'bullets');
    if (params.sentences) {
      formData.append('sentences', params.sentences.toString());
    }
    if (params.password) {
      formData.append('password', params.password);
    }

    try {
      const res = await fetch(`${this.baseUrl}/summarize`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = 'Summarization failed';
        try {
          const err = await res.json();
          if (err.detail) errorMsg = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
        } catch {
          errorMsg = `Server error (${res.status}): ${res.statusText || 'Unable to process document'}`;
        }
        throw new Error(errorMsg);
      }

      return res.json();
    } catch (err: any) {
      throw new Error(err.message || 'Summarization request failed');
    }
  }

  async translate(params: {
    file?: File;
    text?: string;
    targetLang: string;
    sourceLang?: string;
    password?: string;
  }): Promise<TranslationResult> {
    const formData = new FormData();
    if (params.file) {
      formData.append('file', params.file);
    }
    if (params.text) {
      formData.append('text', params.text);
    }
    formData.append('target_lang', params.targetLang);
    formData.append('source_lang', params.sourceLang || 'auto');
    if (params.password) {
      formData.append('password', params.password);
    }

    try {
      const res = await fetch(`${this.baseUrl}/translate`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = 'Translation failed';
        try {
          const err = await res.json();
          if (err.detail) errorMsg = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
        } catch {
          errorMsg = `Server error (${res.status}): ${res.statusText || 'Translation service error'}`;
        }
        throw new Error(errorMsg);
      }

      return res.json();
    } catch (err: any) {
      throw new Error(err.message || 'Translation request failed');
    }
  }

  async toMarkdown(file: File, password?: string): Promise<MarkdownResult> {
    const formData = new FormData();
    formData.append('file', file);
    if (password) {
      formData.append('password', password);
    }

    try {
      const res = await fetch(`${this.baseUrl}/to-markdown`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        let errorMsg = 'Conversion to Markdown failed';
        try {
          const err = await res.json();
          if (err.detail) errorMsg = typeof err.detail === 'string' ? err.detail : JSON.stringify(err.detail);
        } catch {
          errorMsg = `Server error (${res.status}): ${res.statusText || 'Unable to convert to Markdown'}`;
        }
        throw new Error(errorMsg);
      }

      return res.json();
    } catch (err: any) {
      throw new Error(err.message || 'Markdown extraction request failed');
    }
  }

  downloadText(content: string, filename: string, mimeType: string = 'text/plain;charset=utf-8') {
    const blob = new Blob([content], { type: mimeType });
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

export const intelligenceApiClient = new IntelligenceApiClient();
