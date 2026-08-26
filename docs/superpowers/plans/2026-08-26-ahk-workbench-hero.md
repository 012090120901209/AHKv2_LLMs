# AHK Workbench Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the marketing page nested inside the fake desktop with a recognizable AHK automation workbench.

**Architecture:** Preserve the existing `demos` data and `selectDemo(name)` interaction boundary. Reshape the homepage DOM and CSS into toolbar/sidebar/editor/result/console regions, then extend the selection function only where the new UI needs dynamic filename and rerun state.

**Tech Stack:** Static HTML, CSS, browser JavaScript, Node.js built-in test runner.

## Global Constraints

- No new dependencies.
- Preserve all existing desktop window, taskbar, Start menu, responsive, and reduced-motion behavior.
- Default to Clipboard Workflows.
- Promotional links and landing-page headlines must remain outside the simulated application.

---

### Task 1: Lock the Workbench Contract

**Files:**
- Modify: `tests/site.test.mjs`

**Interfaces:**
- Consumes: generated `dist/client/index.html`, `dist/client/home-win11.js`
- Produces: regression assertions for the workbench structure and default state

- [ ] **Step 1: Write the failing test**

Add assertions that require `data-workbench-toolbar`, `data-automation-sidebar`,
`data-script-editor`, `data-live-result`, `data-run-demo`, and the initial
`clipboard-workflow.ahk` state. Assert that the old inner headline and its two
promotional links are absent from the simulated application.

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/build-site.mjs && node --test tests/site.test.mjs`

Expected: the homepage test fails because the workbench regions do not exist.

- [ ] **Step 3: Commit the failing contract with the implementation**

The test and implementation form one behavior change and are committed
together after the green phase.

### Task 2: Build the Operational Workbench

**Files:**
- Modify: `index.html`
- Modify: `style.css`

**Interfaces:**
- Consumes: existing `data-ahk-demo`, `data-demo-*`, and window attributes
- Produces: toolbar, sidebar, editor, result, and console DOM regions

- [ ] **Step 1: Replace the inner marketing header**

Replace `.studio-intro` with a compact toolbar containing interpreter status,
workspace name, filename, Run button, and keyboard hint.

- [ ] **Step 2: Add the workbench regions**

Add five sidebar controls, an editor pane using `data-demo-code`, a result pane
using the existing visual/copy hooks, and a console row. Seed all dynamic
content with the Clipboard Workflows demo.

- [ ] **Step 3: Style the desktop and responsive arrangements**

Use a sidebar plus editor/result grid on desktop, stack editor/result at
intermediate widths, and make the sidebar horizontally scrollable on mobile.
Retire `.studio-intro` and nested-window visual rules that are no longer used.

### Task 3: Connect Selection and Rerun Behavior

**Files:**
- Modify: `home-win11.js`

**Interfaces:**
- Consumes: `selectDemo(name, animate = true)`
- Produces: dynamic filename, console state, and `data-run-demo` behavior

- [ ] **Step 1: Track the selected demo**

Initialize the selected name to `clipboard`, update it inside `selectDemo`, and
set both title-bar and toolbar filename hooks from `demo.file`.

- [ ] **Step 2: Wire the Run button**

On click, call `selectDemo(currentDemoName)` so status and streaming code replay
without changing the selected feature.

- [ ] **Step 3: Set the initial state**

Call `selectDemo('clipboard', false)` at startup.

- [ ] **Step 4: Run tests to verify green**

Run: `node scripts/build-site.mjs && node --test tests/site.test.mjs`

Expected: 7 tests pass.

### Task 4: Visual and Interaction Verification

**Files:**
- Verify only

**Interfaces:**
- Consumes: locally served homepage
- Produces: desktop and mobile screenshots and a pass/fail interaction record

- [ ] **Step 1: Serve and render**

Run: `python3 -m http.server 8082`

- [ ] **Step 2: Test desktop interactions**

Exercise all five sidebar controls, all five outer feature cards, Run, close
and reopen, Start menu, maximize/restore, and drag.

- [ ] **Step 3: Test accessibility and responsiveness**

Verify 390×844 layout without horizontal overflow and repeat selection with
`prefers-reduced-motion: reduce`.

- [ ] **Step 4: Commit and push**

```bash
git add index.html style.css home-win11.js tests/site.test.mjs docs/superpowers
git commit -m "Turn desktop hero into AHK workbench"
git push -u origin cursor/desktop-visual-polish-180f
```
