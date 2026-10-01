"""Contact message handling and administrative inbox endpoints for Creed-Tech Studio."""

import json
import uuid
import logging
import asyncio
from datetime import datetime, timezone
from pathlib import Path
import re
from typing import Literal, Optional, List
from pydantic import BaseModel, Field, field_validator
from fastapi import APIRouter, HTTPException, status

logger = logging.getLogger("creedtech.contact")
router = APIRouter(tags=["Contact & Admin"])

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")

# Resolve file location: backend/data/messages.json
DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
MESSAGES_FILE = DATA_DIR / "messages.json"
_file_lock = asyncio.Lock()


def _ensure_storage_exists():
    """Ensures data directory and initial JSON storage exist."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    if not MESSAGES_FILE.exists():
        MESSAGES_FILE.write_text("[]", encoding="utf-8")


def _read_messages_sync() -> List[dict]:
    """Reads all messages from disk."""
    _ensure_storage_exists()
    try:
        content = MESSAGES_FILE.read_text(encoding="utf-8")
        if not content.strip():
            return []
        data = json.loads(content)
        if isinstance(data, list):
            return data
        return []
    except Exception as e:
        logger.error(f"Failed to read messages file: {e}")
        return []


def _write_messages_sync(messages: List[dict]):
    """Writes all messages to disk atomically."""
    _ensure_storage_exists()
    temp_file = MESSAGES_FILE.with_suffix(".tmp")
    temp_file.write_text(json.dumps(messages, indent=2, ensure_ascii=False), encoding="utf-8")
    temp_file.replace(MESSAGES_FILE)


class ContactSubmitRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: str = Field(..., min_length=5, max_length=255)
    subject: str = Field(..., min_length=3, max_length=200)
    category: Literal[
        "General Inquiry",
        "Security & Privacy",
        "Enterprise Support",
        "Bug Report"
    ] = Field(default="General Inquiry")
    message: str = Field(..., min_length=10, max_length=5000)

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        cleaned = v.strip().lower()
        if not EMAIL_REGEX.match(cleaned):
            raise ValueError("Invalid email address format.")
        return cleaned


class MessageItem(BaseModel):
    id: str
    name: str
    email: str
    subject: str
    category: str
    message: str
    created_at: str
    status: Literal["unread", "read", "replied"]


class UpdateStatusRequest(BaseModel):
    status: Literal["unread", "read", "replied"]


@router.post("/contact/submit", status_code=status.HTTP_201_CREATED)
async def submit_contact_message(payload: ContactSubmitRequest):
    """Submits a new customer inquiry, validates, sanitizes, and stores it."""
    # Sanitize strings
    cleaned_name = payload.name.strip().replace("\x00", "")
    cleaned_subject = payload.subject.strip().replace("\x00", "")
    cleaned_message = payload.message.strip().replace("\x00", "")
    cleaned_email = str(payload.email).strip().lower()

    new_entry = {
        "id": str(uuid.uuid4()),
        "name": cleaned_name,
        "email": cleaned_email,
        "subject": cleaned_subject,
        "category": payload.category,
        "message": cleaned_message,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "status": "unread",
    }

    async with _file_lock:
        messages = _read_messages_sync()
        messages.append(new_entry)
        _write_messages_sync(messages)

    logger.info(f"New contact inquiry received: [{new_entry['id']}] from {cleaned_email} ({payload.category})")

    return {
        "success": True,
        "message_id": new_entry["id"],
        "detail": "Your message has been received. Our team typically replies within 24 hours.",
    }


@router.get("/admin/messages", response_model=List[MessageItem])
async def list_admin_messages():
    """Fetches all stored inquiries, ordered by newest first."""
    async with _file_lock:
        messages = _read_messages_sync()

    # Sort descending by creation timestamp
    messages.sort(key=lambda m: m.get("created_at", ""), reverse=True)
    return messages


@router.patch("/admin/messages/{message_id}", response_model=MessageItem)
async def update_message_status(message_id: str, payload: UpdateStatusRequest):
    """Updates status ('unread', 'read', 'replied') of a specific message."""
    async with _file_lock:
        messages = _read_messages_sync()
        target = None
        for m in messages:
            if m.get("id") == message_id:
                m["status"] = payload.status
                target = m
                break

        if not target:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Message with ID {message_id} not found."
            )

        _write_messages_sync(messages)

    logger.info(f"Updated status of message {message_id} to {payload.status}")
    return target


@router.delete("/admin/messages/{message_id}")
async def delete_message(message_id: str):
    """Deletes a message from the storage."""
    async with _file_lock:
        messages = _read_messages_sync()
        initial_len = len(messages)
        messages = [m for m in messages if m.get("id") != message_id]

        if len(messages) == initial_len:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Message with ID {message_id} not found."
            )

        _write_messages_sync(messages)

    logger.info(f"Deleted message {message_id}")
    return {"success": True, "detail": f"Message {message_id} successfully deleted."}
