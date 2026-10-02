"""Contact message handling and administrative inbox endpoints for Creed-Tech Studio."""

import uuid
import logging
from datetime import datetime, timezone
import re
from typing import Literal, List
from pydantic import BaseModel, Field, field_validator
from fastapi import APIRouter, HTTPException, status

from backend.app.core.database import (
    insert_contact_message,
    get_all_contact_messages,
    update_contact_message_status,
    delete_contact_message_by_id,
)

logger = logging.getLogger("creedtech.contact")
router = APIRouter(tags=["Contact & Admin"])

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


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
    """Submits a new customer inquiry, validates, sanitizes, and stores it in SQLite."""
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

    try:
        insert_contact_message(new_entry)
    except Exception as e:
        logger.error(f"Failed to insert contact message into SQLite: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save message. Please try again later."
        )

    logger.info(f"New contact inquiry saved to SQLite: [{new_entry['id']}] from {cleaned_email} ({payload.category})")

    return {
        "success": True,
        "message_id": new_entry["id"],
        "detail": "Your message has been received. Our team typically replies within 24 hours.",
    }


@router.get("/admin/messages", response_model=List[MessageItem])
async def list_admin_messages():
    """Fetches all stored inquiries from SQLite, ordered by newest first."""
    try:
        return get_all_contact_messages(limit=500)
    except Exception as e:
        logger.error(f"Failed to fetch contact messages from SQLite: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to retrieve messages from database."
        )


@router.patch("/admin/messages/{message_id}", response_model=MessageItem)
async def update_message_status(message_id: str, payload: UpdateStatusRequest):
    """Updates status ('unread', 'read', 'replied') of a specific message in SQLite."""
    updated = update_contact_message_status(message_id, payload.status)
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Message with ID {message_id} not found."
        )

    logger.info(f"Updated status of message {message_id} to {payload.status} in SQLite")
    return updated


@router.delete("/admin/messages/{message_id}")
async def delete_message(message_id: str):
    """Deletes a message from SQLite storage."""
    deleted = delete_contact_message_by_id(message_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Message with ID {message_id} not found."
        )

    logger.info(f"Deleted message {message_id} from SQLite")
    return {"success": True, "detail": f"Message {message_id} successfully deleted."}
