# Native AHK Utility Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the fictional AHK workbench with one recognizable native utility that the five outer feature cards can swap.

**Architecture:** Keep `selectDemo(name)` as the interaction boundary, but make each demo provide an application title, filename, status, and complete native-utility body. The pseudo-desktop retains its existing window/taskbar behavior while the window body becomes presentation of an end-user tool rather than a development environment.

**Tech Stack:** Static HTML, CSS, browser JavaScript, Node.js built-in test runner.

## Global Constraints

- No new dependencies.
- Preserve existing window, taskbar, Start menu, responsive, and reduced-motion behavior.
- Clipboard Formatter is the default utility.
- The outer cards are the only primary demo selector.
- No workbench sidebar, source editor, or developer Run control inside the window.

---

### Task 1: Define the Native Utility Contract

**Files:**
- Modify: `tests/site.test.mjs`

- [ ] Add assertions for `data-utility-content`, `data-app-title`,
  `Clipboard Formatter`, and all five utility names.
- [ ] Assert the generated homepage has no `data-workbench-toolbar`,
  `data-automation-sidebar`, `data-script-editor`, or `data-run-demo`.
- [ ] Run `node scripts/build-site.mjs && node --test tests/site.test.mjs`.
- [ ] Verify the homepage test fails because the old workbench is still present.

### Task 2: Replace the Workbench Shell

**Files:**
- Modify: `index.html`
- Modify: `style.css`

- [ ] Replace toolbar/sidebar/editor/result/console markup with a native
  Clipboard Formatter body and status bar.
- [ ] Add reusable native control styles for fields, buttons, lists, forms,
  workspace zones, and status.
- [ ] Reduce the desktop window to a focused utility size with wallpaper visible
  around it.
- [ ] Stack utility controls on mobile without page overflow.

### Task 3: Drive Five Native Utilities

**Files:**
- Modify: `home-win11.js`

- [ ] Replace code-oriented demo fields with `appTitle`, `file`, `status`, and
  complete `content` HTML for Clipboard Formatter, Text Expander, Downloads
  Organizer, Workspace Layout, and Release Builder.
- [ ] Update `selectDemo(name)` to replace title, filename, body, status, and
  outer-card active state.
- [ ] Delegate native utility action clicks to update status text.
- [ ] Keep `selectDemo('clipboard', false)` as the initial state.

### Task 4: Verify and Ship

**Files:**
- Verify only

- [ ] Run `node scripts/build-site.mjs`.
- [ ] Run `node --test tests/site.test.mjs` and expect 7/7 passing.
- [ ] Run `node --check home-win11.js`.
- [ ] Test five outer cards, five Start menu shortcuts, native utility actions,
  close/reopen, maximize/restore, drag, mobile, and reduced motion.
- [ ] Capture clean desktop and 390×844 screenshots.
- [ ] Commit, push, and update the existing pull request.
