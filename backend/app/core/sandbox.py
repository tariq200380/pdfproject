"""Ephemeral sandbox manager and automated garbage collection reaper."""

import os
import shutil
import time
import uuid
import re
import threading
import logging
from pathlib import Path
from typing import Optional
from backend.app.core.config import settings

logger = logging.getLogger("omnistudio.sandbox")

# Valid UUID pattern to prevent path injection
UUID_REGEX = re.compile(r"^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$", re.IGNORECASE)


class SandboxManager:
    """Manages isolated ephemeral directories for processing and streaming."""

    def __init__(self, base_dir: Optional[Path] = None, ttl_minutes: Optional[int] = None):
        self.base_dir = base_dir or settings.SANDBOX_BASE_DIR
        self.ttl_minutes = ttl_minutes or settings.SESSION_TTL_MINUTES
        self.base_dir.mkdir(parents=True, exist_ok=True)
        self._stop_event = threading.Event()
        self._reaper_thread: Optional[threading.Thread] = None

    def create_session(self) -> tuple[str, Path]:
        """Creates a new unique session directory and returns (session_id, dir_path)."""
        session_id = str(uuid.uuid4())
        session_dir = self.base_dir / session_id
        session_dir.mkdir(parents=True, exist_ok=False)
        return session_id, session_dir

    def get_session_dir(self, session_id: str) -> Path:
        """Returns the session directory path, ensuring strict isolation."""
        if not UUID_REGEX.match(session_id):
            raise ValueError(f"Invalid session ID format: {session_id}")
        session_dir = (self.base_dir / session_id).resolve()
        base_resolved = self.base_dir.resolve()
        if not session_dir.is_relative_to(base_resolved):
            raise ValueError(f"Path traversal detected for session: {session_id}")
        return session_dir

    def get_safe_path(self, session_id: str, filename: str) -> Path:
        """Returns a safe path for a file inside the session directory."""
        session_dir = self.get_session_dir(session_id)
        safe_filename = Path(filename).name  # Strips directories
        if not safe_filename or safe_filename in (".", ".."):
            raise ValueError(f"Invalid filename: {filename}")
        target_path = (session_dir / safe_filename).resolve()
        if not target_path.is_relative_to(session_dir):
            raise ValueError(f"Path traversal detected for filename: {filename}")
        return target_path

    def cleanup_session(self, session_id: str) -> bool:
        """Deletes the session directory and all its files immediately."""
        try:
            session_dir = self.get_session_dir(session_id)
            if session_dir.exists():
                shutil.rmtree(session_dir, ignore_errors=True)
                logger.info(f"Cleaned up session {session_id}")
                return True
        except Exception as e:
            logger.warning(f"Failed to cleanup session {session_id}: {e}")
        return False

    def reap_expired_sessions(self, ttl_minutes: Optional[int] = None) -> int:
        """Purges any session directories older than TTL."""
        ttl = ttl_minutes if ttl_minutes is not None else self.ttl_minutes
        cutoff = time.time() - (ttl * 60)
        reaped = 0

        if not self.base_dir.exists():
            return 0

        for entry in self.base_dir.iterdir():
            if entry.is_dir() and UUID_REGEX.match(entry.name):
                try:
                    mtime = entry.stat().st_mtime
                    if mtime < cutoff:
                        shutil.rmtree(entry, ignore_errors=True)
                        reaped += 1
                        logger.info(f"Reaped expired session: {entry.name}")
                except Exception as e:
                    logger.warning(f"Error checking/reaping session {entry.name}: {e}")

        return reaped

    def start_reaper(self, interval_seconds: Optional[int] = None):
        """Starts background daemon thread that periodically reaps expired sessions."""
        interval = interval_seconds or settings.REAPER_INTERVAL_SECONDS
        if self._reaper_thread and self._reaper_thread.is_alive():
            return

        self._stop_event.clear()

        def _reap_loop():
            while not self._stop_event.is_set():
                try:
                    self.reap_expired_sessions()
                except Exception as e:
                    logger.error(f"Reaper loop error: {e}")
                self._stop_event.wait(interval)

        self._reaper_thread = threading.Thread(target=_reap_loop, daemon=True, name="sandbox-reaper")
        self._reaper_thread.start()
        logger.info(f"Sandbox reaper started with interval {interval}s")

    def stop_reaper(self):
        """Signals the reaper thread to terminate."""
        self._stop_event.set()
        if self._reaper_thread and self._reaper_thread.is_alive():
            self._reaper_thread.join(timeout=2.0)
            logger.info("Sandbox reaper stopped")


sandbox_manager = SandboxManager()
