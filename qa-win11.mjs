import { createRequire } from 'node:module';

const require = createRequire('C:/Users/user/AppData/Roaming/npm/node_modules/@qpd-v/mcp-server-ragdocs/node_modules/');
const { chromium } = require('playwright-core');

const EXE = 'C:/Users/user/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe';
const URL = 'file:///C:/Users/user/Documents/Autohotkey/AHKv2_LLMs/index.html';

const results = [];
const check = (name, ok, detail = '') => {
  results.push(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const browser = await chromium.launch({ executablePath: EXE });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const consoleErrors = [];
page.on('console', (msg) => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
page.on('pageerror', (err) => consoleErrors.push(String(err)));

await page.goto(URL);
await page.waitForTimeout(600);

// 1. Notification center opens from the clock, calendar renders with today
await page.click('[data-notif-button]');
await page.waitForTimeout(250);
check('notif center opens', await page.isVisible('[data-notif-center]'));
const calCells = await page.locator('[data-cal-grid] span').count();
check('calendar renders 7xN grid', calCells >= 35, `${calCells} cells`);
check('calendar highlights today', await page.locator('[data-cal-grid] .cal-today').count() === 1);
await page.screenshot({ path: 'preview-v5-notif.png' });

// calendar month navigation
const calTitle = await page.textContent('[data-cal-title]');
await page.click('[data-cal-next]');
check('calendar next month', (await page.textContent('[data-cal-title]')) !== calTitle);
await page.click('[data-cal-prev]');

// clear all notifications
await page.click('[data-notif-clear]');
check('clear all shows empty state', await page.isVisible('.notif-empty'));

// Escape closes the flyout
await page.keyboard.press('Escape');
check('Escape closes notif center', await page.isHidden('[data-notif-center]'));

// 2. Start menu: autofocus search, filter, Enter opens first match
await page.click('[data-start-button]');
await page.waitForTimeout(200);
check('start search autofocused', await page.evaluate(() => document.activeElement?.hasAttribute('data-start-search')));
await page.keyboard.type('hot');
await page.waitForTimeout(150);
const visibleTiles = await page.locator('.start-grid > *:visible').count();
check('search filters pinned grid', visibleTiles === 1, `${visibleTiles} visible`);
await page.screenshot({ path: 'preview-v5-start.png' });
await page.keyboard.press('Enter');
await page.waitForTimeout(300);
check('Enter runs first match (hotstrings demo)', (await page.textContent('[data-notepad-file]')).includes('hotstrings.ahk'));
check('start menu closed after Enter', await page.isHidden('[data-start-menu]'));

// Calculator computes
for (const key of ['7', 'mul', '8', 'eq']) await page.click(`[data-calc-key="${key}"]`);
check('calculator 7 × 8 = 56', (await page.textContent('[data-calc-display]')) === '56');
await page.click('[data-calc-key="c"]');
check('calculator C resets', (await page.textContent('[data-calc-display]')) === '0');

// Window-control demo tiles the real desktop apps
await page.click('[data-ahk-feature="windows"]');
await page.waitForTimeout(300);
check('windows demo tiles desktop apps', await page.evaluate(() => document.querySelector('.win11-hero').classList.contains('is-tiled')));
await page.click('[data-ahk-feature="files"]');
await page.waitForTimeout(300);
check('other demos until tile', await page.evaluate(() => !document.querySelector('.win11-hero').classList.contains('is-tiled')));
check('notepad switched to files script', (await page.textContent('[data-notepad-file]')).includes('download-sorter.ahk'));

// Notepad tab row: multiple tabs, active tracks demo, clicking switches script
check('notepad shows 3 tabs', await page.locator('.np-tab').count() === 3);
check('active tab tracks files demo', await page.evaluate(() => document.querySelector('[data-np-demo="files"]').classList.contains('is-active')));
check('tabs have no accent top line', await page.evaluate(() => !getComputedStyle(document.querySelector('.np-tab.is-active')).boxShadow.includes('rgb')));
await page.click('[data-np-demo="text"]');
await page.waitForTimeout(200);
check('clicking tab switches script', (await page.textContent('[data-notepad-file]')).includes('hotstrings.ahk'));
check('clicked tab becomes active', await page.evaluate(() => document.querySelector('[data-np-demo="text"]').classList.contains('is-active')));

// Live hotstring demo: script shows an example name, and typing /d + Space inserts today's date
const hsScript = await page.textContent('[data-notepad-body]');
check('no personal name in hotstring example', !hsScript.includes('Justin') && hsScript.includes('::/d::'));
await page.click('[data-notepad-body]', { position: { x: 200, y: 40 } });
await page.keyboard.press('Control+End').catch(() => {});
await page.keyboard.type(' Try: /d ');
const npText = await page.textContent('[data-notepad-body]');
const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
check('typing /d + space inserts the date', npText.includes(today) && !npText.includes('/d '), npText.slice(-80));
await page.click('[data-np-demo="windows"]');
await page.waitForTimeout(300);

// 3. Minimize keeps taskbar underline; taskbar click restores; click again minimizes
await page.click('.win-notepad [data-window-action="minimize"]');
await page.waitForTimeout(150);
check('minimize hides notepad', await page.evaluate(() => document.querySelector('.win-notepad').classList.contains('is-hidden')));
check('minimized app still running in taskbar', await page.evaluate(() => document.querySelector('.task-app[data-open-window="notepad"]').classList.contains('is-running')));
await page.click('.task-app[data-open-window="notepad"]');
await page.waitForTimeout(150);
check('taskbar click restores notepad', await page.evaluate(() => !document.querySelector('.win-notepad').classList.contains('is-hidden')));
await page.click('.task-app[data-open-window="notepad"]');
await page.waitForTimeout(150);
check('taskbar click on focused app minimizes', await page.evaluate(() => document.querySelector('.win-notepad').classList.contains('is-hidden')));
await page.click('.task-app[data-open-window="notepad"]');

// 4. Close removes the underline
await page.click('.task-app[data-open-window="board"]');
await page.waitForTimeout(150);
await page.click('.win-board [data-window-action="close"]');
await page.waitForTimeout(150);
check('close removes running underline', await page.evaluate(() => !document.querySelector('.task-app[data-open-window="board"]').classList.contains('is-running')));
await page.click('.task-app[data-open-window="board"]');

// 5. Double-click titlebar maximizes and swaps the icon
await page.dblclick('.win-board [data-drag-handle]', { position: { x: 120, y: 20 } });
await page.waitForTimeout(200);
check('dblclick maximizes board', await page.evaluate(() => document.querySelector('.win-board').classList.contains('is-maximized')));
check('maximize icon swaps to restore', (await page.getAttribute('.win-board [data-window-action="maximize"] img', 'src')).includes('square_multiple'));

// 6. Drag from maximized restores the window under the cursor
const boardBar = await page.locator('.win-board [data-drag-handle]').boundingBox();
await page.mouse.move(boardBar.x + 150, boardBar.y + 20);
await page.mouse.down();
await page.mouse.move(boardBar.x + 150, boardBar.y + 120, { steps: 8 });
await page.waitForTimeout(100);
check('drag from maximized restores', await page.evaluate(() => !document.querySelector('.win-board').classList.contains('is-maximized')));
check('restore icon swaps back', (await page.getAttribute('.win-board [data-window-action="maximize"] img', 'src')).includes('square_16'));

// 7. Drag to left edge shows snap preview, release snaps left
await page.mouse.move(8, 400, { steps: 10 });
check('snap preview visible at left edge', await page.isVisible('[data-snap-preview]'));
await page.screenshot({ path: 'preview-v5-snap.png' });
await page.mouse.up();
await page.waitForTimeout(150);
check('release snaps window left', await page.evaluate(() => document.querySelector('.win-board').classList.contains('is-snapped-left')));
check('snap preview hidden after drop', await page.isHidden('[data-snap-preview]'));
await page.screenshot({ path: 'preview-v5-snapped.png' });

// 8. Drag snapped window unsnaps it
const snappedBar = await page.locator('.win-board [data-drag-handle]').boundingBox();
await page.mouse.move(snappedBar.x + 100, snappedBar.y + 20);
await page.mouse.down();
await page.mouse.move(snappedBar.x + 300, snappedBar.y + 150, { steps: 8 });
await page.mouse.up();
check('drag unsnaps window', await page.evaluate(() => !document.querySelector('.win-board').classList.contains('is-snapped-left')));

// 8b. Below the old 1180px breakpoint windows must still be draggable (regression: stacked layout now starts at 900px)
await page.click('.win-board [data-window-action="close"]');
await page.setViewportSize({ width: 1100, height: 900 });
await page.waitForTimeout(250);
const npBefore = await page.locator('.win-notepad').boundingBox();
const npBar = await page.locator('.win-notepad [data-drag-handle]').boundingBox();
await page.mouse.move(npBar.x + 60, npBar.y + 18);
await page.mouse.down();
await page.mouse.move(npBar.x + 160, npBar.y + 118, { steps: 8 });
await page.mouse.up();
await page.waitForTimeout(150);
const npAfter = await page.locator('.win-notepad').boundingBox();
check('drag works at 1100px width', Math.abs(npAfter.x - npBefore.x) > 50 && Math.abs(npAfter.y - npBefore.y) > 50,
  `moved ${Math.round(npAfter.x - npBefore.x)},${Math.round(npAfter.y - npBefore.y)}`);
check('calculator visible at 1100px width', await page.isVisible('.win-calc'));
await page.setViewportSize({ width: 1440, height: 1000 });
await page.waitForTimeout(150);

// 9. Escape closes start menu
await page.click('[data-start-button]');
await page.keyboard.press('Escape');
check('Escape closes start menu', await page.isHidden('[data-start-menu]'));

const realErrors = consoleErrors.filter((e) => !/fetch|CORS|ERR_FAILED/i.test(e));
check('no console errors (fetch over file:// excluded)', realErrors.length === 0, realErrors.join(' | '));

await browser.close();
console.log(results.join('\n'));
process.exit(results.some((r) => r.startsWith('FAIL')) ? 1 : 0);
