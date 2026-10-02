"""SQLite database engine and schema management for Creed-Tech Studio."""

import sqlite3
import json
import logging
from pathlib import Path
from contextlib import contextmanager
from typing import Generator, List, Optional, Dict, Any

logger = logging.getLogger("creedtech.database")

DATA_DIR = Path(__file__).resolve().parent.parent.parent / "data"
DB_FILE = DATA_DIR / "studio.db"
MESSAGES_JSON_FILE = DATA_DIR / "messages.json"


def get_db_path() -> Path:
    """Returns the SQLite database file path, ensuring parent directory exists."""
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    return DB_FILE


@contextmanager
def get_db() -> Generator[sqlite3.Connection, None, None]:
    """Context manager providing a transactional SQLite connection with WAL mode."""
    db_path = get_db_path()
    conn = sqlite3.connect(
        str(db_path),
        timeout=20.0,
        detect_types=sqlite3.PARSE_DECLTYPES,
    )
    conn.row_factory = sqlite3.Row
    try:
        # WAL mode permits concurrent reads while writing
        conn.execute("PRAGMA journal_mode=WAL;")
        conn.execute("PRAGMA synchronous=NORMAL;")
        conn.execute("PRAGMA foreign_keys=ON;")
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Initializes tables, indexes, and migrates legacy JSON records if present."""
    logger.info("Initializing SQLite database at: %s", DB_FILE)
    with get_db() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS contact_messages (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                subject TEXT NOT NULL,
                category TEXT NOT NULL,
                message TEXT NOT NULL,
                created_at TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'unread' CHECK(status IN ('unread', 'read', 'replied'))
            );
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_contact_created_at 
            ON contact_messages(created_at DESC);
        """)
        conn.execute("""
            CREATE INDEX IF NOT EXISTS idx_contact_status 
            ON contact_messages(status);
        """)

    # Migrate legacy JSON messages if any exist
    _migrate_legacy_json_if_needed()


def _migrate_legacy_json_if_needed():
    """Migrates existing messages from messages.json into SQLite if not already migrated."""
    if not MESSAGES_JSON_FILE.exists():
        return

    try:
        content = MESSAGES_JSON_FILE.read_text(encoding="utf-8").strip()
        if not content:
            return
        items = json.loads(content)
        if not isinstance(items, list) or not items:
            return

        with get_db() as conn:
            for item in items:
                msg_id = item.get("id")
                if not msg_id:
                    continue
                # Check if already present
                cur = conn.execute("SELECT 1 FROM contact_messages WHERE id = ?", (msg_id,))
                if cur.fetchone() is None:
                    conn.execute("""
                        INSERT INTO contact_messages (id, name, email, subject, category, message, created_at, status)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """, (
                        item.get("id"),
                        item.get("name", "Unknown"),
                        item.get("email", ""),
                        item.get("subject", ""),
                        item.get("category", "General Inquiry"),
                        item.get("message", ""),
                        item.get("created_at", ""),
                        item.get("status", "unread"),
                    ))
        logger.info("Migrated legacy JSON messages into SQLite successfully.")
    except Exception as e:
        logger.warning("Could not auto-migrate legacy JSON messages: %s", e)


# ==============================================================================
# Contact Messages Query Layer
# ==============================================================================

def insert_contact_message(msg: Dict[str, Any]) -> None:
    """Inserts a new contact inquiry record."""
    with get_db() as conn:
        conn.execute("""
            INSERT INTO contact_messages (id, name, email, subject, category, message, created_at, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            msg["id"],
            msg["name"],
            msg["email"],
            msg["subject"],
            msg["category"],
            msg["message"],
            msg["created_at"],
            msg.get("status", "unread"),
        ))


def get_all_contact_messages(limit: int = 500, offset: int = 0) -> List[Dict[str, Any]]:
    """Retrieves all contact messages ordered newest first."""
    with get_db() as conn:
        cur = conn.execute("""
            SELECT id, name, email, subject, category, message, created_at, status
            FROM contact_messages
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        """, (limit, offset))
        return [dict(row) for row in cur.fetchall()]


def get_contact_message_by_id(message_id: str) -> Optional[Dict[str, Any]]:
    """Retrieves a single contact message by its UUID."""
    with get_db() as conn:
        cur = conn.execute("""
            SELECT id, name, email, subject, category, message, created_at, status
            FROM contact_messages
            WHERE id = ?
        """, (message_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def update_contact_message_status(message_id: str, new_status: str) -> Optional[Dict[str, Any]]:
    """Updates the status of a specific contact message and returns updated row."""
    with get_db() as conn:
        conn.execute("""
            UPDATE contact_messages
            SET status = ?
            WHERE id = ?
        """, (new_status, message_id))
        cur = conn.execute("""
            SELECT id, name, email, subject, category, message, created_at, status
            FROM contact_messages
            WHERE id = ?
        """, (message_id,))
        row = cur.fetchone()
        return dict(row) if row else None


def delete_contact_message_by_id(message_id: str) -> bool:
    """Deletes a contact message by ID, returns True if deleted, False if not found."""
    with get_db() as conn:
        cur = conn.execute("DELETE FROM contact_messages WHERE id = ?", (message_id,))
        return cur.rowcount > 0
