"""Cloud Storage & Remote URL Import Router for Creed-Tech Studio."""

import ipaddress
import logging
import re
import socket
from urllib.parse import parse_qs, urlparse

import httpx
from fastapi import APIRouter, HTTPException, status
from fastapi.responses import Response
from pydantic import BaseModel, HttpUrl

from backend.app.core.config import settings

logger = logging.getLogger("creedtech.routes_cloud")
router = APIRouter(prefix="/cloud", tags=["Cloud Storage Import"])


class CloudImportRequest(BaseModel):
    url: str
    service: str = "generic"  # "google_drive", "dropbox", "onedrive", "generic"


def _is_private_host(hostname: str) -> bool:
    """Validate that hostname does not resolve to private or loopback IP (SSRF protection)."""
    try:
        # Check standard local identifiers
        if hostname.lower() in ("localhost", "127.0.0.1", "0.0.0.0", "::1"):
            return True
        ip_str = socket.gethostbyname(hostname)
        ip_obj = ipaddress.ip_address(ip_str)
        return bool(
            ip_obj.is_private
            or ip_obj.is_loopback
            or ip_obj.is_reserved
            or ip_obj.is_link_local
            or ip_obj.is_multicast
        )
    except Exception:
        # If hostname cannot be resolved, reject
        return True


def transform_cloud_url(raw_url: str, service: str) -> str:
    """Transform user-facing share links into direct download links."""
    clean_url = raw_url.strip()

    # Google Drive transformation
    if "drive.google.com" in clean_url or "docs.google.com" in clean_url or service == "google_drive":
        # Check for Google Docs / Sheets / Slides export
        if "docs.google.com/document/d/" in clean_url:
            match = re.search(r"/document/d/([a-zA-Z0-9_-]+)", clean_url)
            if match:
                return f"https://docs.google.com/document/d/{match.group(1)}/export?format=pdf"
        elif "docs.google.com/spreadsheets/d/" in clean_url:
            match = re.search(r"/spreadsheets/d/([a-zA-Z0-9_-]+)", clean_url)
            if match:
                return f"https://docs.google.com/spreadsheets/d/{match.group(1)}/export?format=pdf"
        elif "docs.google.com/presentation/d/" in clean_url:
            match = re.search(r"/presentation/d/([a-zA-Z0-9_-]+)", clean_url)
            if match:
                return f"https://docs.google.com/presentation/d/{match.group(1)}/export/pdf"

        # Drive file IDs: /file/d/{ID}
        file_id_match = re.search(r"/file/d/([a-zA-Z0-9_-]+)", clean_url)
        if file_id_match:
            file_id = file_id_match.group(1)
            return f"https://drive.usercontent.google.com/download?id={file_id}&export=download&confirm=t"

        # Drive file query: ?id={ID}
        parsed = urlparse(clean_url)
        query_params = parse_qs(parsed.query)
        if "id" in query_params and query_params["id"]:
            file_id = query_params["id"][0]
            return f"https://drive.usercontent.google.com/download?id={file_id}&export=download&confirm=t"

    # Dropbox transformation
    if "dropbox.com" in clean_url or service == "dropbox":
        # Replace dl=0 with dl=1
        if "dl=0" in clean_url:
            return clean_url.replace("dl=0", "dl=1")
        elif "dl=1" not in clean_url:
            separator = "&" if "?" in clean_url else "?"
            return f"{clean_url}{separator}dl=1"

    # OneDrive transformation
    if "1drv.ms" in clean_url or "onedrive.live.com" in clean_url or service == "onedrive":
        # For OneDrive URLs, appending download=1 triggers direct download
        if "download=1" not in clean_url:
            separator = "&" if "?" in clean_url else "?"
            return f"{clean_url}{separator}download=1"

    return clean_url


@router.post("/import")
async def import_cloud_file(req: CloudImportRequest):
    """Fetch remote file from Google Drive, Dropbox, OneDrive, or web link."""
    raw_url = req.url.strip()
    if not raw_url.startswith(("http://", "https://")):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid URL scheme. Only HTTP and HTTPS URLs are supported.",
        )

    parsed = urlparse(raw_url)
    if not parsed.hostname:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid URL: Missing hostname.",
        )

    # SSRF Protection
    if _is_private_host(parsed.hostname):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Access to private or local network resources is strictly prohibited.",
        )

    direct_url = transform_cloud_url(raw_url, req.service)
    logger.info(f"Fetching cloud file from: {direct_url} (service: {req.service})")

    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "*/*",
    }

    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024

    try:
        async with httpx.AsyncClient(
            follow_redirects=True,
            timeout=25.0,
            verify=True,
        ) as client:
            # Re-verify redirected host before final fetch
            response = await client.get(direct_url, headers=headers)

            final_parsed = urlparse(str(response.url))
            if final_parsed.hostname and _is_private_host(final_parsed.hostname):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Redirected to restricted private network.",
                )

            if response.status_code >= 400:
                logger.warning(f"Cloud fetch error {response.status_code} for URL: {direct_url}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Unable to fetch file from {req.service.replace('_', ' ').title()} (HTTP {response.status_code}). Please make sure the link is set to 'Anyone with link can view'.",
                )

            content = response.content
            if len(content) > max_bytes:
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_MB}MB.",
                )

            # Determine filename
            content_disposition = response.headers.get("content-disposition", "")
            filename = None
            if "filename=" in content_disposition:
                match = re.search(r'filename\*?=(?:UTF-8\'\')?"?([^";]+)"?', content_disposition)
                if match:
                    filename = match.group(1).strip()

            if not filename:
                # Extract filename from path
                path_parts = final_parsed.path.split("/")
                candidate = path_parts[-1] if path_parts else ""
                if candidate and "." in candidate and len(candidate) > 2:
                    filename = candidate
                else:
                    service_prefix = req.service.replace("_", "-")
                    filename = f"{service_prefix}-import.pdf"

            content_type = response.headers.get("content-type", "application/octet-stream")

            # Check if Google Drive returned HTML (e.g. permission required or virus scan warning)
            if "text/html" in content_type.lower() and not filename.lower().endswith(".html"):
                # Check if it contains virus warning confirmation token
                html_text = content.decode("utf-8", errors="ignore")
                confirm_token_match = re.search(r"confirm=([a-zA-Z0-9_-]+)", html_text)
                if confirm_token_match:
                    confirm_token = confirm_token_match.group(1)
                    confirm_url = f"{direct_url}&confirm={confirm_token}"
                    retry_resp = await client.get(confirm_url, headers=headers)
                    if retry_resp.status_code == 200 and "text/html" not in retry_resp.headers.get("content-type", "").lower():
                        content = retry_resp.content
                        content_type = retry_resp.headers.get("content-type", "application/pdf")
                    else:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="Google Drive file requires permission. Please ensure file sharing is set to 'Anyone with the link'.",
                        )
                else:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="The link provided did not return a downloadable file. Please ensure public sharing is enabled.",
                    )

            return Response(
                content=content,
                media_type=content_type,
                headers={
                    "Content-Disposition": f'attachment; filename="{filename}"',
                    "X-Imported-Filename": filename,
                },
            )

    except httpx.TimeoutException:
        raise HTTPException(
            status_code=status.HTTP_504_GATEWAY_TIMEOUT,
            detail="Connection timed out while fetching file from cloud provider.",
        )
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in import_cloud_file: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to import file: {str(e)}",
        )
