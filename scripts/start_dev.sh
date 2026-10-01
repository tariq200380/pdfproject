#!/usr/bin/env bash
# ==============================================================================
# Creed-Tech Studio: Unified Developer Startup Script
# ==============================================================================
set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
VENV_PYTHON="$PROJECT_ROOT/.venv/bin/python"
FRONTEND_DIR="$PROJECT_ROOT/frontend"

echo "=========================================================="
echo "  Creed-Tech Studio - Starting Full-Stack Services"
echo "=========================================================="

if [ ! -f "$VENV_PYTHON" ]; then
    echo "[!] Virtual environment Python not found at: $VENV_PYTHON"
    echo "[!] Please verify .venv exists or run setup."
    exit 1
fi

# Function to clean up background processes on exit
cleanup() {
    echo ""
    echo "[*] Shutting down Creed-Tech Studio services..."
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    wait 2>/dev/null || true
    echo "[✓] All services stopped cleanly."
    exit 0
}

trap cleanup SIGINT SIGTERM EXIT

# 1. Start FastAPI Backend
echo "[+] Starting FastAPI backend on http://127.0.0.1:8000 ..."
cd "$PROJECT_ROOT"
PYTHONPATH="$PROJECT_ROOT" "$VENV_PYTHON" -m uvicorn backend.app.main:app \
    --host 127.0.0.1 \
    --port 8000 \
    --reload &
BACKEND_PID=$!

# Wait briefly for backend to initialize
sleep 2

# 2. Start Next.js Frontend
echo "[+] Starting Next.js frontend on http://localhost:3000 ..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

echo ""
echo "=========================================================="
echo "  Creed-Tech Studio is running!"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend API: http://127.0.0.1:8000/docs"
echo "  Press Ctrl+C to terminate all services."
echo "=========================================================="
echo ""

# Wait for children
wait
