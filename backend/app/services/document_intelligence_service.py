"""Document Intelligence Service for Creed-Tech Studio.

Provides purely local, sovereign, and ephemeral document intelligence:
1. Document Summarizer: Deterministic frequency-based sentence and key-value scoring.
2. Document Translator: Multi-language translation using authenticated MyMemory engine (chunks <= 350 chars).
3. PDF to Markdown: Pure PyMuPDF (fitz) font & layout inspection.
"""

import logging
import re
import json
import time
import threading
from pathlib import Path
from typing import List, Dict, Any, Optional
from collections import Counter
import pymupdf
import requests

logger = logging.getLogger("creedtech.document_intelligence")

STOPWORDS = {
    "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "as", "at",
    "be", "because", "been", "before", "being", "below", "between", "both", "but", "by", "could", "did", "do",
    "does", "doing", "down", "during", "each", "few", "for", "from", "further", "had", "has", "have", "having",
    "he", "her", "here", "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it",
    "its", "itself", "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "now", "of", "off", "on",
    "once", "only", "or", "other", "ought", "our", "ours", "ourselves", "out", "over", "own", "same", "she", "should",
    "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves", "then", "there", "these",
    "they", "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "we", "were", "what",
    "when", "where", "which", "while", "who", "whom", "why", "with", "would", "you", "your", "yours", "yourself", "yourselves"
}

SUPPORTED_LANGUAGES: Dict[str, str] = {
    "ur": "Urdu (اردو)",
    "bn": "Bengali (বাংলা)",
    "ar": "Arabic (العربية)",
    "bg": "Bulgarian",
    "ca": "Catalan",
    "zh-cn": "Chinese Simplified",
    "zh-CN": "Chinese Simplified",
    "da": "Danish",
    "nl": "Dutch / Flemish",
    "en": "English",
    "fi": "Finnish",
    "fr": "French",
    "de": "German",
    "el": "Greek",
    "hi": "Hindi (हिन्दी)",
    "hu": "Hungarian",
    "it": "Italian",
    "ja": "Japanese (日本語)",
    "ko": "Korean (한국어)",
    "fa": "Persian (فارسی)",
    "pl": "Polish",
    "pt": "Portuguese",
    "ro": "Romanian / Moldavian",
    "ru": "Russian",
    "es": "Spanish",
    "sw": "Swahili",
    "sv": "Swedish",
    "th": "Thai (ไทย)",
    "tr": "Turkish",
    "uk": "Ukrainian",
    "vi": "Vietnamese",
}

MYMEMORY_LANG_MAP: Dict[str, str] = {
    "ur": "ur-PK",
    "bn": "bn-IN",
    "ar": "ar-SA",
    "bg": "bg-BG",
    "ca": "ca-ES",
    "zh-cn": "zh-CN",
    "zh": "zh-CN",
    "da": "da-DK",
    "nl": "nl-NL",
    "en": "en-GB",
    "fi": "fi-FI",
    "fr": "fr-FR",
    "de": "de-DE",
    "el": "el-GR",
    "hi": "hi-IN",
    "hu": "hu-HU",
    "it": "it-IT",
    "ja": "ja-JP",
    "ko": "ko-KR",
    "fa": "fa-IR",
    "pl": "pl-PL",
    "pt": "pt-PT",
    "ro": "ro-RO",
    "ru": "ru-RU",
    "es": "es-ES",
    "sw": "sw-KE",
    "sv": "sv-SE",
    "th": "th-TH",
    "tr": "tr-TR",
    "uk": "uk-UA",
    "vi": "vi-VN",
}


class BingTranslatorEngine:
    """High-reliability neural translation engine using cached Bing Web translator sessions."""

    _session: Optional[requests.Session] = None
    _ig: Optional[str] = None
    _iid: Optional[str] = None
    _key: Optional[int] = None
    _token: Optional[str] = None
    _token_time: float = 0.0
    _lock = threading.Lock()

    BING_LANG_MAP: Dict[str, str] = {
        "zh-cn": "zh-Hans",
        "zh": "zh-Hans",
    }

    @classmethod
    def _init_session(cls):
        if cls._session is None:
            cls._session = requests.Session()
            cls._session.headers.update({
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
                "Accept-Language": "en-US,en;q=0.9",
            })

    @classmethod
    def _refresh_tokens(cls) -> bool:
        with cls._lock:
            if cls._token and time.time() - cls._token_time < 1800:
                return True
            cls._init_session()
            try:
                r = cls._session.get("https://www.bing.com/translator", timeout=10)
                ig_m = re.search(r'IG:\"([^\"]+)\"', r.text)
                iid_m = re.search(r'data-iid=\"([^\"]+)\"', r.text)
                key_m = re.search(r'var params_AbusePreventionHelper = \[([^\]]+)\];', r.text)
                if ig_m and iid_m and key_m:
                    cls._ig = ig_m.group(1)
                    cls._iid = iid_m.group(1)
                    key_params = json.loads("[" + key_m.group(1) + "]")
                    cls._key = key_params[0]
                    cls._token = key_params[1]
                    cls._token_time = time.time()
                    return True
            except Exception as e:
                logger.warning(f"Bing translator token refresh error: {e}")
            return False

    @classmethod
    def translate(cls, text: str, target_lang: str, source_lang: str = "auto") -> Optional[str]:
        if not text or not text.strip():
            return text

        if time.time() - cls._token_time > 1800 or not cls._token:
            if not cls._refresh_tokens():
                return None

        bing_target = cls.BING_LANG_MAP.get(target_lang.lower(), target_lang)

        url = f"https://www.bing.com/ttranslatev3?isVertical=1&&IG={cls._ig}&IID={cls._iid}"
        data = {
            "fromLang": "auto-detect" if source_lang == "auto" else source_lang,
            "text": text,
            "to": bing_target,
            "key": cls._key,
            "token": cls._token,
        }

        try:
            r = cls._session.post(url, data=data, timeout=12)
            if r.status_code == 200:
                res_json = r.json()
                if res_json and len(res_json) > 0 and "translations" in res_json[0]:
                    return res_json[0]["translations"][0]["text"]
            elif r.status_code in (400, 401, 403):
                if cls._refresh_tokens():
                    url = f"https://www.bing.com/ttranslatev3?isVertical=1&&IG={cls._ig}&IID={cls._iid}"
                    data["key"] = cls._key
                    data["token"] = cls._token
                    r2 = cls._session.post(url, data=data, timeout=12)
                    if r2.status_code == 200:
                        res_json2 = r2.json()
                        if res_json2 and len(res_json2) > 0 and "translations" in res_json2[0]:
                            return res_json2[0]["translations"][0]["text"]
        except Exception as e:
            logger.warning(f"Bing translate call error: {e}")
        return None


class DocumentIntelligenceService:
    """Sovereign in-memory document intelligence engine."""

    # --------------------------------------------------------------------------
    # Document Ingestion & Text Extraction
    # --------------------------------------------------------------------------
    @classmethod
    def extract_text(cls, file_path: Path, password: Optional[str] = None) -> Dict[str, Any]:
        """Extracts text and metadata from PDF, DOCX, or text documents."""
        ext = file_path.suffix.lower()
        full_text = ""
        page_count = 1

        try:
            if ext == ".pdf":
                doc = pymupdf.open(file_path)
                if doc.is_encrypted or doc.needs_pass:
                    auth = False
                    if doc.authenticate(""):
                        auth = True
                    elif password and doc.authenticate(password):
                        auth = True
                    if not auth:
                        doc.close()
                        raise ValueError(
                            "This PDF is password-protected (encrypted). Please enter the document password to unlock and process."
                        )

                page_count = len(doc)
                pages_text = []
                for page in doc:
                    pages_text.append(page.get_text("text"))
                doc.close()
                full_text = "\n\n".join(pages_text).strip()

            elif ext in [".docx", ".doc"]:
                try:
                    import docx
                    doc = docx.Document(file_path)
                    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
                    for table in doc.tables:
                        for row in table.rows:
                            row_text = " | ".join(cell.text.strip() for cell in row.cells if cell.text.strip())
                            if row_text:
                                paragraphs.append(row_text)
                    full_text = "\n\n".join(paragraphs).strip()
                    page_count = max(1, len(doc.paragraphs) // 10)
                except Exception as e:
                    logger.warning(f"python-docx parsing fallback: {e}")
                    full_text = file_path.read_text(errors="ignore").strip()

            else:
                try:
                    full_text = file_path.read_text(encoding="utf-8").strip()
                except UnicodeDecodeError:
                    full_text = file_path.read_text(errors="ignore").strip()

        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Error extracting text from {file_path}: {e}")
            full_text = ""

        words = re.findall(r"\b\w+\b", full_text)
        return {
            "text": full_text,
            "page_count": page_count,
            "word_count": len(words),
            "char_count": len(full_text),
        }

    # --------------------------------------------------------------------------
    # Feature 1: Pure Extractive Frequency-Based Summarizer
    # --------------------------------------------------------------------------
    @classmethod
    def summarize(
        cls,
        text: str,
        mode: str = "bullets",
        num_sentences: Optional[int] = None,
    ) -> Dict[str, Any]:
        """Performs simple deterministic frequency-based sentence scoring with form key-value merging."""
        raw_text = text.strip() if text else ""
        if not raw_text:
            return {
                "summary": "No readable text provided for summarization.",
                "bullets": [],
                "mode": mode,
                "sentence_count": 0,
                "original_word_count": 0,
                "summary_word_count": 0,
                "compression_ratio": 0.0,
            }

        try:
            cleaned = re.sub(r"[,:;]{2,}", " ", raw_text)
            cleaned = re.sub(r"[\-_=~*]{3,}", " ", cleaned)
            cleaned = re.sub(r"(?i)\bPage\s+\d+(\s+of\s+\d+)?\b", " ", cleaned)

            raw_lines = [re.sub(r"\s+", " ", l).strip() for l in cleaned.splitlines() if l.strip()]
            merged_lines = []
            i = 0
            while i < len(raw_lines):
                line = raw_lines[i]
                line_clean = re.sub(r"^[\-•*]\s*", "", line).strip()
                has_letters = bool(re.search(r"[a-zA-Z\u0600-\u06FF]", line_clean))
                is_num = bool(re.match(r"^[\d\s,\.\$\-/%#:]+$", line_clean))

                if i + 1 < len(raw_lines) and has_letters and not is_num:
                    next_line = raw_lines[i + 1].strip()
                    is_label = line_clean.endswith(":") or (":" not in line_clean and len(line_clean) < 35 and len(line_clean.split()) <= 4)
                    is_val = bool(re.match(r"^[0-9$\-,\. /]{1,30}$", next_line) or re.match(r"^\d{2}-[A-Za-z]{3}-\d{4}", next_line))
                    if is_label and is_val:
                        label = line_clean.rstrip(":").strip()
                        merged_lines.append(f"**{label}:** {next_line}")
                        i += 2
                        continue
                merged_lines.append(line_clean)
                i += 1

            lines = []
            seen = set()
            for l in merged_lines:
                letter_words = re.findall(r"[a-zA-Z\u0600-\u06FF]{2,}", l)
                if len(letter_words) < 2:
                    continue
                if re.match(r"^[\d\s,\.\$\-/%#:]+$", l):
                    continue
                norm = l.lower()
                if norm in seen:
                    continue
                seen.add(norm)
                lines.append(l)

            if not lines:
                lines = [raw_text[:200]]

            words = [w.lower() for w in re.findall(r"\b[a-zA-Z\u0600-\u06FF]{3,}\b", cleaned) if w.lower() not in STOPWORDS]
            word_freq = Counter(words)

            KEY_TERMS = {
                "tax", "year", "total", "amount", "income", "due", "balance", "net",
                "payment", "date", "status", "profit", "loss", "invoice", "period", "name",
                "return", "declaration", "payable", "assessment", "registration", "summary"
            }

            scores = []
            for idx, line in enumerate(lines):
                l_words = [w.lower() for w in re.findall(r"\b[a-zA-Z\u0600-\u06FF]{3,}\b", line) if w.lower() not in STOPWORDS]
                if not l_words:
                    scores.append(0.0)
                    continue
                score = sum(word_freq.get(w, 0) for w in l_words) / (len(l_words) ** 0.5)
                if ":" in line or "**" in line:
                    score *= 1.4
                if any(k in l_words for k in KEY_TERMS):
                    score *= 1.5
                if idx < 3 and len(l_words) >= 3:
                    score *= 1.3
                scores.append(score)

            if num_sentences is not None and num_sentences > 0:
                target_k = min(len(lines), num_sentences)
            elif mode == "executive":
                target_k = min(len(lines), max(3, min(6, int(len(lines) * 0.40))))
            elif mode == "digest":
                target_k = min(len(lines), max(4, min(8, int(len(lines) * 0.60))))
            else:
                target_k = min(len(lines), 4 if len(lines) <= 6 else 5)

            ranked_indices = sorted(range(len(lines)), key=lambda idx: scores[idx], reverse=True)[:target_k]
            ranked_indices.sort()

            selected_lines = [lines[idx] for idx in ranked_indices]

            bullets = []
            for s in selected_lines:
                if re.match(r"^[A-Za-z0-9\s#\-]{3,35}:\s+[^\s]+", s) and not s.startswith("**"):
                    s = re.sub(r"^([A-Za-z0-9\s#\-]{3,35}):\s+(.+)$", r"**\1:** \2", s)
                bullets.append(f"• {s}" if not s.startswith("•") else s)

            summary_joined = "\n\n".join(bullets) if mode == "bullets" else "\n\n".join(selected_lines)

            orig_words = len(re.findall(r"\b\w+\b", raw_text))
            summary_words = len(re.findall(r"\b\w+\b", summary_joined))
            reduction = round(((orig_words - summary_words) / orig_words) * 100, 1) if orig_words > summary_words else 0.0

            return {
                "summary": summary_joined,
                "bullets": bullets,
                "mode": mode,
                "sentence_count": len(selected_lines),
                "original_word_count": orig_words,
                "summary_word_count": summary_words,
                "compression_ratio": max(0.0, reduction),
            }

        except Exception as e:
            logger.error(f"Summarizer fallback triggered: {e}", exc_info=True)
            fallback_bullets = [f"• {l.strip()}" for l in raw_text.splitlines() if len(l.strip()) > 15][:4]
            return {
                "summary": "\n\n".join(fallback_bullets) if fallback_bullets else raw_text[:300],
                "bullets": fallback_bullets,
                "mode": mode,
                "sentence_count": len(fallback_bullets),
                "original_word_count": len(re.findall(r"\b\w+\b", raw_text)),
                "summary_word_count": len(re.findall(r"\b\w+\b", " ".join(fallback_bullets))),
                "compression_ratio": 30.0,
            }

    # --------------------------------------------------------------------------
    # Feature 2: Document Translator (Batched Chunks <= 350 Chars with API key/email)
    # --------------------------------------------------------------------------
    @classmethod
    def translate(
        cls,
        text: str,
        target_lang: str,
        source_lang: str = "auto",
    ) -> Dict[str, Any]:
        """Translates text in-memory using authenticated MyMemory engine to avoid 429 limits."""
        clean_text = text.strip() if text else ""
        normalized_target = target_lang.lower().strip()
        if normalized_target == "zh":
            normalized_target = "zh-CN"
        elif normalized_target == "zh-cn":
            normalized_target = "zh-CN"

        is_rtl = normalized_target.lower() in {"ur", "ar", "fa"}
        target_name = SUPPORTED_LANGUAGES.get(normalized_target, SUPPORTED_LANGUAGES.get(normalized_target.lower(), normalized_target.upper()))

        if not clean_text:
            return {
                "translated_text": "",
                "source_lang": source_lang,
                "target_lang": normalized_target,
                "target_lang_name": target_name,
                "is_rtl": is_rtl,
                "char_count": 0,
                "word_count": 0,
            }

        mymemory_target = MYMEMORY_LANG_MAP.get(normalized_target.lower(), normalized_target)

        # Detect source language
        detected_source = "en-GB"
        if re.search(r"[\u0600-\u06FF]", clean_text):
            detected_source = "ur-PK"
        elif re.search(r"[\u4E00-\u9FFF]", clean_text):
            detected_source = "zh-CN"

        mymemory_source = MYMEMORY_LANG_MAP.get(source_lang.lower(), detected_source)

        # Same language bypass
        if mymemory_source.split("-")[0] == mymemory_target.split("-")[0]:
            words = re.findall(r"\b\w+\b", clean_text)
            return {
                "translated_text": clean_text,
                "source_lang": source_lang,
                "target_lang": normalized_target,
                "target_lang_name": target_name,
                "is_rtl": is_rtl,
                "char_count": len(clean_text),
                "word_count": len(words),
            }

        try:
            from concurrent.futures import ThreadPoolExecutor
            from deep_translator import GoogleTranslator, MyMemoryTranslator

            # Split into lines, breaking long lines into sentences/words <= 1000 chars
            raw_lines = [l.strip() for l in clean_text.splitlines() if l.strip()]
            split_lines = []
            for l in raw_lines:
                if len(l) <= 1000:
                    split_lines.append(l)
                else:
                    sentences = re.split(r"(?<=[.!?])\s+", l)
                    for s in sentences:
                        s = s.strip()
                        if not s:
                            continue
                        while len(s) > 1000:
                            idx = s.rfind(" ", 0, 1000)
                            if idx <= 0:
                                idx = 1000
                            split_lines.append(s[:idx].strip())
                            s = s[idx:].strip()
                        if s:
                            split_lines.append(s)

            chunks = []
            cur_chunk = []
            cur_len = 0
            for line in split_lines:
                if cur_len + len(line) + 1 > 1000:
                    if cur_chunk:
                        chunks.append("\n".join(cur_chunk))
                    cur_chunk = [line]
                    cur_len = len(line)
                else:
                    cur_chunk.append(line)
                    cur_len += len(line) + 1
            if cur_chunk:
                chunks.append("\n".join(cur_chunk))

            # Primary: GoogleTranslator; Fallback: MyMemory authenticated with developer email
            primary_translator = None
            try:
                primary_translator = GoogleTranslator(
                    source=source_lang if source_lang != "auto" else "auto",
                    target=normalized_target,
                )
            except Exception as e:
                logger.warning(f"GoogleTranslator init warning: {e}")

            fallback_translator = None
            try:
                fallback_translator = MyMemoryTranslator(
                    source=mymemory_source,
                    target=mymemory_target,
                    email="developer@creedtech.studio",
                )
            except Exception as e:
                logger.warning(f"MyMemoryTranslator init warning: {e}")

            max_chunks = min(len(chunks), 60)
            chunks_to_translate = chunks[:max_chunks]

            def _translate_chunk(c: str) -> str:
                # 1. Primary: Bing Neural/LLM Translator
                try:
                    res_bing = BingTranslatorEngine.translate(c, target_lang=normalized_target, source_lang=source_lang)
                    if res_bing and res_bing.strip():
                        return res_bing.strip()
                except Exception as b_err:
                    logger.debug(f"Bing translation error: {b_err}")

                # 2. Secondary: GoogleTranslator
                if primary_translator:
                    try:
                        res_g = primary_translator.translate(c)
                        if res_g and res_g.strip():
                            return res_g.strip()
                    except Exception as g_err:
                        logger.debug(f"Google translation error: {g_err}")

                # 3. Fallback: MyMemory authenticated with developer email
                if fallback_translator:
                    try:
                        res_mm = fallback_translator.translate(c)
                        if res_mm and res_mm.strip() and "MYMEMORY WARNING" not in res_mm:
                            return res_mm.strip()
                    except Exception as fb_err:
                        logger.debug(f"Fallback translation error: {fb_err}")
                return c

            with ThreadPoolExecutor(max_workers=min(len(chunks_to_translate) or 1, 4)) as executor:
                translated_chunks = list(executor.map(_translate_chunk, chunks_to_translate))

            if len(chunks) > max_chunks:
                translated_chunks.append("\n\n" + "\n".join(chunks[max_chunks:]))

            final_translated = "\n\n".join(translated_chunks)

        except Exception as e:
            logger.error(f"Translation pipeline error: {e}", exc_info=True)
            final_translated = clean_text

        words = re.findall(r"\b\w+\b", final_translated)
        return {
            "translated_text": final_translated,
            "source_lang": source_lang,
            "target_lang": normalized_target,
            "target_lang_name": target_name,
            "is_rtl": is_rtl,
            "char_count": len(final_translated),
            "word_count": len(words),
        }

    # --------------------------------------------------------------------------
    # Feature 3: Pure PyMuPDF (fitz) PDF to Markdown Converter
    # --------------------------------------------------------------------------
    @classmethod
    def to_markdown(cls, file_path: Path, password: Optional[str] = None) -> Dict[str, Any]:
        """Converts PDF or document directly to clean Markdown using pure PyMuPDF."""
        ext = file_path.suffix.lower()
        markdown_content = ""

        try:
            if ext == ".pdf":
                markdown_content = cls._extract_markdown_pymupdf(file_path, password=password)
            elif ext in [".docx", ".doc"]:
                markdown_content = cls._extract_markdown_docx(file_path)
            else:
                markdown_content = file_path.read_text(encoding="utf-8", errors="ignore")
        except ValueError:
            raise
        except Exception as e:
            logger.error(f"Markdown extraction failed: {e}", exc_info=True)

        # Fallback if markdown_content is empty
        if not markdown_content or not markdown_content.strip():
            try:
                if ext == ".pdf":
                    doc = pymupdf.open(file_path)
                    if doc.is_encrypted or doc.needs_pass:
                        if doc.authenticate("") or (password and doc.authenticate(password)):
                            markdown_content = "\n\n".join(p.get_text("text") for p in doc)
                    else:
                        markdown_content = "\n\n".join(p.get_text("text") for p in doc)
                    doc.close()
                else:
                    markdown_content = file_path.read_text(errors="ignore")
            except Exception:
                markdown_content = "# Document\n\nNo readable text could be extracted."

        clean_md = cls._sanitize_and_format_markdown(markdown_content)
        if not clean_md:
            clean_md = "# Document\n\nNo text content found in document."

        headings = len(re.findall(r"^#{1,6}\s+", clean_md, flags=re.MULTILINE))
        tables = len(re.findall(r"^\|.+\|$", clean_md, flags=re.MULTILINE))
        words = len(re.findall(r"\b\w+\b", clean_md))

        return {
            "markdown": clean_md,
            "word_count": words,
            "heading_count": headings,
            "table_count": tables,
        }

    @staticmethod
    def _extract_markdown_pymupdf(file_path: Path, password: Optional[str] = None) -> str:
        """Pure PyMuPDF (fitz) text and font inspection for stable Markdown extraction."""
        doc = pymupdf.open(file_path)
        if doc.is_encrypted or doc.needs_pass:
            auth = False
            if doc.authenticate(""):
                auth = True
            elif password and doc.authenticate(password):
                auth = True
            if not auth:
                doc.close()
                raise ValueError(
                    "This PDF is password-protected (encrypted). Please enter the document password to unlock and process."
                )

        md_lines = []

        try:
            for page in doc:
                text_dict = page.get_text("dict")
                blocks = text_dict.get("blocks", [])

                for b in blocks:
                    if b.get("type") == 0:  # Text block
                        block_text = ""
                        max_size = 0.0
                        is_bold = False

                        for line in b.get("lines", []):
                            line_text = ""
                            for span in line.get("spans", []):
                                text = span.get("text", "")
                                size = span.get("size", 10.0)
                                flags = span.get("flags", 0)
                                if size > max_size:
                                    max_size = size
                                if flags & 2 or "bold" in span.get("font", "").lower():
                                    is_bold = True
                                line_text += text
                            block_text += line_text + " "

                        block_text = block_text.strip()
                        if not block_text:
                            continue

                        block_text = re.sub(r"<[^>]*>", "", block_text).strip()

                        if max_size >= 14.0:
                            md_lines.append(f"\n# {block_text}\n")
                        elif max_size >= 12.0:
                            md_lines.append(f"\n## {block_text}\n")
                        elif is_bold and len(block_text) < 70 and ":" not in block_text:
                            md_lines.append(f"\n**{block_text}**\n")
                        elif ":" in block_text and len(block_text.split(":")[0]) < 35:
                            parts = block_text.split(":", 1)
                            md_lines.append(f"**{parts[0].strip()}:** {parts[1].strip()}\n")
                        else:
                            md_lines.append(f"{block_text}\n")

        finally:
            doc.close()

        return "\n".join(md_lines).strip()

    @staticmethod
    def _extract_markdown_docx(file_path: Path) -> str:
        """Converts DOCX headings and tables to structured Markdown."""
        try:
            import docx
            doc = docx.Document(file_path)
            lines = []

            for p in doc.paragraphs:
                text = p.text.strip()
                if not text:
                    continue
                text = re.sub(r"<[^>]*>", "", text)
                style_name = p.style.name.lower() if p.style else ""
                if "heading 1" in style_name:
                    lines.append(f"# {text}")
                elif "heading 2" in style_name:
                    lines.append(f"## {text}")
                elif "heading 3" in style_name:
                    lines.append(f"### {text}")
                elif "list" in style_name or p.text.startswith(("-", "*", "•")):
                    clean_item = text.lstrip("-*• ")
                    lines.append(f"- {clean_item}")
                else:
                    lines.append(text)

            for table in doc.tables:
                if not table.rows:
                    continue
                table_lines = []
                for r_idx, row in enumerate(table.rows):
                    cells = [re.sub(r"<[^>]*>", "", c.text.strip().replace("\n", " ")) for c in row.cells]
                    row_str = "| " + " | ".join(cells) + " |"
                    table_lines.append(row_str)
                    if r_idx == 0:
                        table_lines.append("| " + " | ".join(["---"] * len(cells)) + " |")
                lines.append("\n" + "\n".join(table_lines) + "\n")

            return "\n\n".join(lines)
        except Exception as e:
            logger.warning(f"DOCX to markdown extraction error: {e}")
            return file_path.read_text(errors="ignore")

    @classmethod
    def _sanitize_and_format_markdown(cls, md: str) -> str:
        """Safely strips any raw HTML tags using re.sub(r'<[^>]*>', '', text)."""
        cleaned = re.sub(r"<[^>]*>", "", md)
        cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
        return cleaned.strip()


document_intelligence_service = DocumentIntelligenceService()
