# AutoHotkey Search Homepage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the fake desktop window into a minimal, familiar search homepage branded AutoHotkey.

**Architecture:** Keep the pseudo-desktop and `selectDemo(name)` boundary. Replace utility demo HTML with a single static search page; each demo supplies only a natural-language query and status message. Form submission remains local and updates an aria-live status line.

**Tech Stack:** Static HTML, CSS, browser JavaScript, Node.js built-in test runner.

## Global Constraints

- No new dependencies.
- Use `AutoHotkey`, never Google's name or trademarked wordmark.
- Preserve outer cards, Start menu, window controls, dragging, responsive drag reset, and reduced motion.
- Do not navigate away on search submission.

---

### Task 1: Define the Search Homepage Contract

**Files:**
- Modify: `tests/site.test.mjs`

- [ ] Require `data-search-home`, `data-search-input`, `data-search-status`,
  `Search AutoHotkey`, and `Show me an example`.
- [ ] Require five distinct queries in `home-win11.js`.
- [ ] Assert native-utility and workbench markers are absent.
- [ ] Run build/tests and verify the homepage test fails.

### Task 2: Build the Search Homepage

**Files:**
- Modify: `index.html`
- Modify: `style.css`

- [ ] Replace native utility markup with multicolor AutoHotkey wordmark, rounded
  search field, two buttons, status, and quiet AHK v2.1 footer.
- [ ] Add light search-page styling inside the dark Windows frame.
- [ ] Make the desktop window wide/shallow and responsive at 390px.
- [ ] Remove obsolete utility component CSS.

### Task 3: Connect Search Interactions

**Files:**
- Modify: `home-win11.js`

- [ ] Replace utility data with five query/status pairs.
- [ ] Update `selectDemo(name)` to fill the search input and outer-card state.
- [ ] Handle form submit locally and update aria-live status.
- [ ] Make `Show me an example` rotate to the next feature query.
- [ ] Preserve Start menu and window lifecycle behavior.

### Task 4: Verify and Ship

- [ ] Run `node scripts/build-site.mjs`.
- [ ] Run `node --test tests/site.test.mjs` and expect 7/7 passing.
- [ ] Run `node --check home-win11.js`.
- [ ] Test both search buttons, five cards, five Start shortcuts, window controls,
  drag, 390×844 responsive layout, responsive drag reset, and reduced motion.
- [ ] Capture clean desktop/mobile screenshots.
- [ ] Commit, push, and update the existing pull request.
