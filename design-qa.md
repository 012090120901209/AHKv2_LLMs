# Windows 11 AHK Homepage Design QA

- Source visual truth: `C:\Users\user\AppData\Local\Temp\codex-clipboard-eb1b7a51-f671-412d-8a79-ebb5516aacf8.png`
- Implementation screenshot: `C:\Scripts\AHKv2_LLMs\.codex-win11-qa-final.png`
- Side-by-side comparison: `C:\Scripts\AHKv2_LLMs\.codex-win11-comparison.png`
- Viewport: 1440 × 1000 desktop
- State: AutoHotkey Automation Studio open; Window control selected; Start menu closed

## Full-view comparison evidence

The side-by-side comparison confirms the major Windows 11 signatures: the supplied dark blue folded-ribbon wallpaper, a full-width translucent taskbar attached to the bottom edge, centered app icons, right-aligned system tray and clock, dark Mica-like application material, and restrained rounded geometry. The open AHK application is an intentional product addition over the clean desktop reference.

## Focused region comparison evidence

A separate crop was not required. The raw 1440 × 1000 implementation capture preserves the title bar, 12–16 px Fluent icons, window controls, taskbar, tray, and clock at readable resolution. Those regions were inspected directly in `.codex-win11-qa-final.png`.

## Findings

- No actionable P0, P1, or P2 differences remain.
- Fonts and typography: Segoe UI Variable/Segoe UI is used for the Windows surface, with Semibold titles and regular body text. Sizes, sentence casing, and density align with Windows guidance.
- Spacing and layout rhythm: the app window uses an 8 px radius, controls use tighter 4–6 px geometry, the taskbar is flush to the viewport edge, and the five AHK controls sit directly beneath the desktop screen.
- Colors and visual tokens: navy wallpaper, near-black Mica surfaces, restrained blue selection states, subtle white separators, and green status accents match the reference and dark-mode hierarchy.
- Image quality and asset fidelity: the supplied Windows reference is used as the wallpaper at native quality. Microsoft Fluent System Icons replace approximate text glyphs for taskbar, window, system-tray, and feature controls.
- Copy and content: all visible app copy is specific to AutoHotkey v2 and the five demonstrations use real AHK concepts and syntax.

## Interaction evidence

- Text expansion button selected successfully and changed the app preview to “Turn a short trigger into finished writing.”
- Selected-state `aria-pressed` updated correctly.
- Start menu opened and closed from the taskbar.
- No browser console errors were present.

## Comparison history

### Iteration 1

- Earlier mismatch: the desktop used CSS-generated ribbon shapes, a floating rounded taskbar, non-Windows display typography, and capability controls inside the fake app.
- Fixes: replaced the wallpaper with the supplied reference asset, made the taskbar edge-to-edge, switched the Windows surface to Segoe UI, applied 8 px WinUI-style geometry and Mica layering, used Fluent icons, and moved five capability controls beneath the screen.
- Post-fix evidence: `.codex-win11-qa-final.png` and `.codex-win11-comparison.png`.

## Follow-up polish

- P3: the Start button uses the closest Fluent Apps glyph instead of Microsoft’s trademarked Windows logo.
- P3: the taskbar intentionally shows only the site’s relevant apps instead of duplicating every application in the source screenshot.

### Iteration 2

- Added real window/taskbar state: minimize keeps the running underline, close removes it, taskbar clicks toggle minimize/restore/focus, and the focused app gets the wider active underline.
- Added Windows 11 snap assist: drag to the top edge maximizes, to the left/right edge snaps to half, with a translucent snap preview; dragging a snapped or maximized titlebar restores the window under the cursor.
- Maximize button swaps to a Fluent restore glyph; double-clicking a titlebar toggles maximize.
- Added the notification center from the tray clock: AHK-themed notifications with Clear all, plus a live calendar with month navigation and today highlight.
- Keyboard polish: Escape closes every flyout from anywhere, the Start menu autofocuses search, and Enter launches the first filtered match.
- Evidence: `qa-win11.mjs` (Playwright, 25 interaction checks, all passing), `preview-v5-notif.png`, `preview-v5-start.png`, `preview-v5-snap.png`, `preview-v5-snapped.png`.

### Iteration 3

- Feedback: the app inside the fake Windows screen rendered the site's landing webpage (hero headline, marketing copy, CTA buttons) instead of showing how AHK v2 works.
- Fix: replaced the webpage hero with an IDE-style editor pane — a file tab, line numbers, and full syntax-highlighted AutoHotkey v2 scripts for each of the five demos (`WinMove` tiling, hotstrings, `OnClipboardChange`, `Loop Files` + `Map`, and a `Gui` builder). The demo runner keeps its visual effect pane and now ends in a green run-output console line. The toolbar path and editor tab track the selected script, and the page h1 moved to a screen-reader-only element.
- Evidence: `preview-v6-studio.png`, `preview-v6-files.png`; 25/25 checks in `qa-win11.mjs`, 7/7 site tests.

### Iteration 4

- Feedback: the studio window still looked like a web section inside a window — big serif headline, web-style library cards, and a global `code` style leaking rounded background bands onto every editor line.
- Fix: neutralized the `code` style leak inside the editor; rebuilt the script library as a VS Code-style Explorer tree (EXPLORER / AHK-LAB, compact single-line file rows with an accent-selected state); replaced the serif marketing title with a single-line app caption; added a tab close glyph; gave the window a VS Code-style blue status bar; and let the preview pane flex to fill the window height.
- Evidence: `preview-v7-studio.png`; 25/25 checks in `qa-win11.mjs`, 7/7 site tests.

### Iteration 5

- Feedback: replace the custom Automation Studio window with real, recognizable Windows apps — Calculator, Terminal, and Notepad.
- Fix: the desktop now opens Notepad (the demo script, plain text with the Win11 Notepad menu/status bar), Windows Terminal (PowerShell tab that runs `.\<script>.ahk` and prints `[ok]` output lines; the command line is a working run-again button), and a fully functional Calculator (all 24 keys compute). The window-control demo now physically tiles the three real app windows across the desktop; other demos untile. Desktop icons, Start tiles, taskbar buttons (four running apps), and the feature dock all drive the demos; the old studio window is gone.
- Evidence: `preview-v8-desktop.png`, `preview-v8-tiled.png`; 30/30 checks in `qa-win11.mjs` (including `7 × 8 = 56` and tile/untile), 7/7 site tests.

### Iteration 6

- Feedback: windows should be movable; apps should look more like the real Windows apps; the Calculator was not visible.
- Root cause: dragging and the floating layout were disabled below a 1180 px breakpoint (windows stacked statically), so at common laptop widths nothing could be dragged and the Calculator was pushed out of view.
- Fix: dropped the drag/stack breakpoint from 1180 px to 900 px in `home-win11.js` and `style.css` (tiling media query now `min-width: 901px`), so windows stay draggable and floating down to 900 px. Repositioned the Terminal (`left: clamp(400px, 38%, 540px)`) so all three apps stay visible at narrower widths.
- Polish: Notepad gained a Win11-style tab row (accent top-border tab with modified dot, close glyph, and a + button; the tab tracks the demo file name); Windows Terminal's tab strip moved into its titlebar like the real app (PowerShell tab with console icon, close glyph, + and chevron); Calculator header now shows the ☰ hamburger, "Standard", and a history clock, the display digits grew to 38 px, and the equals key uses the real light-blue accent with dark text; titlebar Fluent icons are inverted to match the dark chrome.
- Evidence: `preview-v6-1440.png`, `preview-v6-1100.png`; 32/32 checks in `qa-win11.mjs` (new regression: "drag works at 1100px width", "calculator visible at 1100px width"), 7/7 site tests.

final result: passed
