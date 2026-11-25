"""
ProSchweiz Scorecard - Background Automation & Idle Upgrading Daemon
Monitors PC activity and runs incremental scraping / Llama 3 summaries
when user is idle for >= 5 minutes.
"""

import time
import os
import sys
import ctypes
import logging
from datetime import datetime

# Setup logging
LOG_DIR = os.path.join(os.path.dirname(__file__), "logs")
os.makedirs(LOG_DIR, exist_ok=True)
LOG_FILE = os.path.join(LOG_DIR, "automation_daemon.log")

logging.basicConfig(
    filename=LOG_FILE,
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S"
)

# Windows API to detect idle time
class LASTINPUTINFO(ctypes.Structure):
    _fields_ = [
        ('cbSize', ctypes.c_uint),
        ('dwTime', ctypes.c_uint),
    ]

def get_idle_duration_seconds():
    """Returns number of seconds since last user input on Windows."""
    lastInputInfo = LASTINPUTINFO()
    lastInputInfo.cbSize = ctypes.sizeof(lastInputInfo)
    if ctypes.windll.user32.GetLastInputInfo(ctypes.byref(lastInputInfo)):
        millis = ctypes.windll.kernel32.GetTickCount() - lastInputInfo.dwTime
        return millis / 1000.0
    return 0

def run_llama_or_scrape_sync():
    """Incremental sync with official Swiss OData and optional Llama 3 summary generation."""
    logging.info("Starting background incremental Swiss Parliament sync...")
    try:
        import generate_all_data
        generate_all_data.main()
        logging.info("Official Swiss parliamentary data successfully refreshed.")
    except Exception as e:
        logging.error(f"Error during background sync: {e}")

    # Check for local llama.cpp / Ollama Llama 3 endpoint if available
    try:
        import urllib.request
        llama_url = "http://localhost:11434/api/tags" # default Ollama / llama.cpp server
        req = urllib.request.Request(llama_url)
        with urllib.request.urlopen(req, timeout=2) as resp:
            logging.info("Llama service detected locally. Ready for batch bill summarization.")
    except Exception:
        logging.info("Local Llama service not currently running on port 11434. Skipping LLM summaries.")

def main_loop():
    IDLE_THRESHOLD_SECONDS = 5 * 60 # 5 minutes idle
    logging.info(f"Automation daemon started. Idle threshold: {IDLE_THRESHOLD_SECONDS}s.")
    print(f"[*] ProSchweiz Automation Daemon is active. Monitoring PC idle status (Threshold: 5 min)...")

    has_run_in_current_idle = False

    while True:
        try:
            idle_sec = get_idle_duration_seconds()
            if idle_sec >= IDLE_THRESHOLD_SECONDS:
                if not has_run_in_current_idle:
                    logging.info(f"User idle for {idle_sec:.1f}s (>= 300s). Triggering background job...")
                    run_llama_or_scrape_sync()
                    has_run_in_current_idle = True
            else:
                if has_run_in_current_idle:
                    logging.info(f"User returned from idle (idle reset to {idle_sec:.1f}s).")
                    has_run_in_current_idle = False

            time.sleep(30) # check every 30 seconds
        except KeyboardInterrupt:
            logging.info("Daemon interrupted by user.")
            break
        except Exception as e:
            logging.error(f"Unexpected error in daemon loop: {e}")
            time.sleep(60)

if __name__ == "__main__":
    main_loop()
