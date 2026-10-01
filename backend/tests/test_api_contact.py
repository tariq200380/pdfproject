"""Integration tests for Contact Form and Admin Message endpoints."""

import pytest
from httpx import ASGITransport, AsyncClient
from backend.app.main import app


@pytest.fixture
def anyio_backend():
    return "asyncio"


@pytest.mark.asyncio
async def test_contact_submit_and_admin_workflow():
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        # 1. Submit a valid contact message
        payload = {
            "name": "Jane Doe",
            "email": "jane.doe@enterprise.com",
            "subject": "Enterprise Compliance Inquiry",
            "category": "Security & Privacy",
            "message": "We would like to review the technical DPA for our organization.",
        }
        res_post = await ac.post("/api/contact/submit", json=payload)
        assert res_post.status_code == 201
        data_post = res_post.json()
        assert data_post["success"] is True
        msg_id = data_post["message_id"]
        assert msg_id is not None

        # 2. Verify validation error on invalid email
        invalid_payload = {
            "name": "J",
            "email": "not-an-email",
            "subject": "Hi",
            "category": "General Inquiry",
            "message": "Short",
        }
        res_invalid = await ac.post("/api/contact/submit", json=invalid_payload)
        assert res_invalid.status_code == 422

        # 3. Fetch all admin messages
        res_get = await ac.get("/api/admin/messages")
        assert res_get.status_code == 200
        messages = res_get.json()
        assert isinstance(messages, list)
        target = next((m for m in messages if m["id"] == msg_id), None)
        assert target is not None
        assert target["name"] == "Jane Doe"
        assert target["category"] == "Security & Privacy"
        assert target["status"] == "unread"

        # 4. Update status to 'read'
        res_patch_read = await ac.patch(f"/api/admin/messages/{msg_id}", json={"status": "read"})
        assert res_patch_read.status_code == 200
        assert res_patch_read.json()["status"] == "read"

        # 5. Update status to 'replied'
        res_patch_replied = await ac.patch(f"/api/admin/messages/{msg_id}", json={"status": "replied"})
        assert res_patch_replied.status_code == 200
        assert res_patch_replied.json()["status"] == "replied"

        # 6. Delete message
        res_delete = await ac.delete(f"/api/admin/messages/{msg_id}")
        assert res_delete.status_code == 200
        assert res_delete.json()["success"] is True

        # 7. Delete non-existent returns 404
        res_delete_404 = await ac.delete(f"/api/admin/messages/{msg_id}")
        assert res_delete_404.status_code == 404
