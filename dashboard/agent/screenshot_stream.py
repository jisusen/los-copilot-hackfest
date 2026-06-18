"""
Mock-mode visual navigator — streams live LOS screenshots without any LLM.
Spawned as a sidecar by spawnMockAgent() when MOCK_AGENT=true.
"""

import asyncio
import argparse
import base64
import json
import sys
import httpx

if sys.stdout.encoding != 'utf-8':
    sys.stdout.reconfigure(encoding='utf-8')
if sys.stderr.encoding != 'utf-8':
    sys.stderr.reconfigure(encoding='utf-8')

from playwright.async_api import async_playwright

TABS = [
    "tab-profil-debitur",
    "tab-data-keuangan",
    "tab-slik-ojk",
    "tab-aml-fraud",
    "tab-hasil-crde",
    "tab-agunan",
    "tab-permohonan-kredit",
]

# Seconds spent on each tab (7 tabs × 8s ≈ matches mock step timing)
SECONDS_PER_TAB = 8


async def send_screenshot(page, backend_url: str, task_id: str, app_id: str, tab_id: str = ""):
    try:
        shot = await page.screenshot(type="png")
        b64 = base64.b64encode(shot).decode()
        async with httpx.AsyncClient(timeout=3) as http:
            await http.post(f"{backend_url}/api/internal/screenshot", json={
                "taskId": task_id,
                "appId": app_id,
                "tabId": tab_id,
                "screenshot": b64,
            })
    except Exception:
        pass


async def run(task: dict):
    los_url     = task["losUrl"]
    backend_url = task["backendUrl"]
    app_id      = task["appId"]
    task_id     = task["taskId"]
    creds       = task["credentials"]

    async with async_playwright() as pw:
        browser = await pw.chromium.launch(headless=True)
        page    = await browser.new_page()

        try:
            # ── Login ──────────────────────────────────────────────────────────
            await page.goto(f"{los_url}/login")
            await page.wait_for_selector('[data-testid="input-username"]', timeout=10000)
            
            # Send screenshot immediately on login page
            await send_screenshot(page, backend_url, task_id, app_id, "login-page")
            
            await page.fill('[data-testid="input-username"]', creds["username"])
            await page.fill('[data-testid="input-password"]', creds["password"])
            
            # Send screenshot after filling credentials
            await send_screenshot(page, backend_url, task_id, app_id, "login-filled")
            
            await page.click('[data-testid="btn-login"]')
            await page.wait_for_url(f"{los_url}/loans**", timeout=15000)

            # ── Navigate to loan ───────────────────────────────────────────────
            await page.goto(f"{los_url}/loans/{app_id}")
            await asyncio.sleep(1)
            await send_screenshot(page, backend_url, task_id, app_id, "loan-detail")

            # ── Click through each tab, streaming screenshots ──────────────────
            for tab_id in TABS:
                try:
                    await page.click(f'[data-testid="{tab_id}"]')
                    await asyncio.sleep(0.4)
                except Exception:
                    pass

                # Stream 1 screenshot every 2s for SECONDS_PER_TAB seconds
                for _ in range(SECONDS_PER_TAB // 2):
                    await send_screenshot(page, backend_url, task_id, app_id, tab_id)
                    await asyncio.sleep(2)

        except Exception as e:
            print(f"[screenshot_stream:{app_id}] {e}", file=sys.stderr)
        finally:
            await browser.close()


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--task", required=True)
    args = parser.parse_args()
    asyncio.run(run(json.loads(args.task)))
