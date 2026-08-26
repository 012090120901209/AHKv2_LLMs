# AHK Workbench Hero Design

## Goal

Make the open pseudo-desktop window read immediately as an operational
AutoHotkey application, not a second marketing website nested inside the
landing page.

## Approved Direction

The outer page owns all promotional copy and navigation. The simulated app
contains only product UI:

- a Windows title bar identifying `AHK Automation Lab`
- a compact workspace toolbar with interpreter state and a Run action
- a left automation sidebar
- a script editor
- a live-result pane
- a compact execution console

The initial state is `clipboard-workflow.ahk`. This avoids showing miniature
windows on first load. Window Control remains selectable, but its result uses
abstract workspace zones rather than nested title-bar windows.

## Interaction

The five existing feature cards and the new in-app sidebar call the same
`selectDemo(name)` function. Selecting a demo updates the filename, editor,
result, description, active state, and execution status. The Run button reruns
the selected demo without changing selection.

All existing desktop interactions—drag, maximize, close/reopen, Start menu,
mobile layout, and reduced-motion behavior—remain intact.

## Responsive Behavior

At desktop widths the app uses three functional columns: automation sidebar,
editor, and result. At narrower widths the editor and result stack; on mobile
the in-app sidebar becomes a compact horizontal control row and the simulated
desktop remains free of horizontal page overflow.

## Verification

- The generated homepage contains no marketing headline or promotional links
  inside `.win-studio`.
- The initial app state is Clipboard Workflows.
- Sidebar and Run controls are present and accessible.
- Existing JavaScript parses and all site tests pass.
- Manual desktop and mobile interaction checks cover all five demos, rerun,
  window controls, drag, and reduced motion.
