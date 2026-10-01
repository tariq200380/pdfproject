"""Unit tests for SandboxManager and reaper."""

import time
import pytest
from pathlib import Path
from backend.app.core.sandbox import SandboxManager


@pytest.fixture
def temp_sandbox(tmp_path):
    manager = SandboxManager(base_dir=tmp_path / "sandbox", ttl_minutes=1)
    yield manager
    manager.stop_reaper()


def test_create_session(temp_sandbox):
    session_id, session_dir = temp_sandbox.create_session()
    assert session_dir.exists()
    assert session_dir.is_dir()
    assert session_id in str(session_dir)


def test_path_traversal_prevention(temp_sandbox):
    session_id, _ = temp_sandbox.create_session()
    
    with pytest.raises(ValueError, match="Invalid session ID format"):
        temp_sandbox.get_session_dir("../../etc")

    # Safe path strips leading directories
    safe_path = temp_sandbox.get_safe_path(session_id, "../../passwd")
    assert safe_path.name == "passwd"
    assert safe_path.parent == temp_sandbox.get_session_dir(session_id)


def test_cleanup_session(temp_sandbox):
    session_id, session_dir = temp_sandbox.create_session()
    test_file = session_dir / "test.txt"
    test_file.write_text("sample content")
    assert test_file.exists()

    result = temp_sandbox.cleanup_session(session_id)
    assert result is True
    assert not session_dir.exists()


def test_reap_expired_sessions(temp_sandbox):
    session_id, session_dir = temp_sandbox.create_session()
    
    # Session is fresh, should not be reaped
    reaped = temp_sandbox.reap_expired_sessions(ttl_minutes=10)
    assert reaped == 0
    assert session_dir.exists()

    # Session simulated as old (ttl=0)
    reaped = temp_sandbox.reap_expired_sessions(ttl_minutes=0)
    assert reaped == 1
    assert not session_dir.exists()


def test_reaper_thread_lifecycle(temp_sandbox):
    temp_sandbox.start_reaper(interval_seconds=1)
    assert temp_sandbox._reaper_thread is not None
    assert temp_sandbox._reaper_thread.is_alive()
    temp_sandbox.stop_reaper()
    assert not temp_sandbox._reaper_thread.is_alive()
