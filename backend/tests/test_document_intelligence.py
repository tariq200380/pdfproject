"""Unit and integration tests for Document Intelligence suite."""

import io
import pytest
import pymupdf
from httpx import ASGITransport, AsyncClient
from backend.app.main import app
from backend.app.services.document_intelligence_service import document_intelligence_service


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.fixture
def sample_pdf_bytes():
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((50, 72), "Document Intelligence Overview", fontsize=20)
    page.insert_text((50, 110), "Section 1: Architecture", fontsize=15)
    page.insert_text(
        (50, 140),
        "Creed Tech Studio delivers privacy-first in-place document intelligence. "
        "The suite features extractive summarization, structure-preserving translation, and Markdown export. "
        "All operations occur ephemerally in sandbox sessions with zero AI training retention.",
        fontsize=11,
    )
    buf = io.BytesIO()
    doc.save(buf)
    doc.close()
    return buf.getvalue()


def test_summarizer_bullets_and_executive():
    long_text = """
    Creed Tech Studio introduces Document Intelligence for frictionless document workflows.
    The system features instant extractive summarization, structure-preserving translation, and PDF to Markdown conversion.
    All operations execute ephemerally in memory with zero cloud ingestion or AI model training.
    Users can upload any PDF or DOCX file and receive immediate insights without registration.
    Security architecture guarantees that temporary session files are purged automatically after execution.
    This makes Creed Tech Studio the leading sovereign platform for privacy-sensitive document operations.
    """

    # Test bullets mode
    res_bullets = document_intelligence_service.summarize(long_text, mode="bullets")
    assert res_bullets["mode"] == "bullets"
    assert len(res_bullets["bullets"]) >= 1
    assert all(b.startswith("•") for b in res_bullets["bullets"])
    assert res_bullets["original_word_count"] > 0
    assert res_bullets["summary_word_count"] <= res_bullets["original_word_count"]

    # Test executive mode
    res_exec = document_intelligence_service.summarize(long_text, mode="executive")
    assert res_exec["mode"] == "executive"
    assert res_exec["sentence_count"] >= 1


def test_translator_pipeline():
    sample_text = "Creed Tech Studio provides secure document intelligence.\n\nAll data is processed ephemerally."
    res = document_intelligence_service.translate(sample_text, target_lang="es")
    assert res["target_lang"] == "es"
    assert len(res["translated_text"]) > 0
    assert res["word_count"] > 0


def test_form_summarizer_compression_and_bullets():
    invoice_form = """
    INVOICE #INV-2026-9081 ,,,, ::::
    Date: October 02, 2026
    Due Date: November 01, 2026
    Billed To: Creed Tech Studio Inc.
    Account Number: AC-98214-X
    Page 1 of 2
    ------------------------------------------------
    Item 1: Enterprise PDF Intelligence API Subscription
    Item 2: Custom In-Place Document Editor Integration
    Subtotal: $4,500.00
    Tax (8.25%): $371.25
    Total Amount Due: $4,871.25
    Payment Method: Wire Transfer / ACH
    Status: Pending Verification
    Thank you for your business! Please remit payment within 30 days.
    """
    res = document_intelligence_service.summarize(invoice_form, mode="bullets")
    assert res["compression_ratio"] > 25.0
    assert 3 <= res["sentence_count"] <= 6
    assert len(res["bullets"]) == res["sentence_count"]
    assert all(b.startswith("•") for b in res["bullets"])


def test_markdown_sanitization():
    raw_html_md = "# <u>Invoice Summary</u>\n<div><span>Account:</span> AC-98214</div>\n<p>Status: Verified</p>"
    clean = document_intelligence_service._sanitize_and_format_markdown(raw_html_md)
    assert "<u>" not in clean
    assert "<div>" not in clean
    assert "<span>" not in clean
    assert "<p>" not in clean
    assert "Invoice Summary" in clean
    assert "Account:" in clean
    assert "Status: Verified" in clean


def test_pdf_to_markdown_conversion(tmp_path, sample_pdf_bytes):
    pdf_file = tmp_path / "sample.pdf"
    pdf_file.write_bytes(sample_pdf_bytes)

    res = document_intelligence_service.to_markdown(pdf_file)
    assert "Document Intelligence Overview" in res["markdown"]
    assert res["word_count"] > 0
    assert res["heading_count"] >= 1


@pytest.mark.asyncio
async def test_api_summarize_endpoint(sample_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("report.pdf", sample_pdf_bytes, "application/pdf")}
        data = {"mode": "bullets"}
        res = await ac.post("/api/intelligence/summarize", files=files, data=data)
        assert res.status_code == 200
        json_data = res.json()
        assert json_data["status"] == "success"
        assert len(json_data["bullets"]) >= 1
        assert json_data["mode"] == "bullets"


@pytest.mark.asyncio
async def test_api_translate_endpoint(sample_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("report.pdf", sample_pdf_bytes, "application/pdf")}
        data = {"target_lang": "ur"}
        res = await ac.post("/api/intelligence/translate", files=files, data=data)
        assert res.status_code == 200
        json_data = res.json()
        assert json_data["status"] == "success"
        assert json_data["target_lang"] == "ur"
        assert len(json_data["translated_text"]) > 0


@pytest.mark.asyncio
async def test_api_to_markdown_endpoint(sample_pdf_bytes):
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        files = {"file": ("report.pdf", sample_pdf_bytes, "application/pdf")}
        res = await ac.post("/api/intelligence/to-markdown", files=files)
        assert res.status_code == 200
        json_data = res.json()
        assert json_data["status"] == "success"
        assert "markdown" in json_data
        assert json_data["heading_count"] >= 1


@pytest.mark.asyncio
async def test_encrypted_pdf_handling():
    # Create an encrypted PDF with password 'bankpass123'
    doc = pymupdf.open()
    page = doc.new_page()
    page.insert_text((50, 72), "Confidential Bank Account Statement", fontsize=14)
    page.insert_text((50, 100), "Balance: $50,000", fontsize=12)
    enc_bytes = doc.tobytes(
        deflate=True,
        encryption=pymupdf.PDF_ENCRYPT_AES_256,
        owner_pw="bankpass123",
        user_pw="bankpass123",
    )
    doc.close()

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Test without password -> returns 400 with password-protected message
        files = {"file": ("statement.pdf", enc_bytes, "application/pdf")}
        res = await ac.post("/api/intelligence/summarize", files=files)
        assert res.status_code == 400
        assert "password" in res.json()["detail"].lower() or "encrypted" in res.json()["detail"].lower()

        # 2. Test with correct password -> unlocks and returns 200
        files2 = {"file": ("statement.pdf", enc_bytes, "application/pdf")}
        data2 = {"password": "bankpass123"}
        res2 = await ac.post("/api/intelligence/summarize", files=files2, data=data2)
        assert res2.status_code == 200
        assert res2.json()["status"] == "success"
        assert "Statement" in res2.json()["summary"] or "Balance" in res2.json()["summary"]
