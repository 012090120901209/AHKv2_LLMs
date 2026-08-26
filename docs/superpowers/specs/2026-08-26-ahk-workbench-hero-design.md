# Native AHK Utility Hero Design

## Goal

Make the pseudo-desktop tell one immediate story: this is a useful native
Windows utility built with AutoHotkey v2.

## Approved Direction

The open window is a Clipboard Formatter by default. It uses recognizable
native-utility controls: text input, transform actions, formatted output, and a
status bar. AutoHotkey appears only as subtle provenance in the title/status
area.

The simulated window does not contain a development environment, internal
navigation, source editor, marketing headline, or promotional links.

## Interaction

The five existing feature cards below the desktop are the only primary demo
selector. They replace the complete native utility shown in the window:

- Clipboard Formatter
- Text Expander
- Downloads Organizer
- Workspace Layout
- Release Builder

The Start menu shortcuts retain the same behavior. Actions inside each mock
utility update its status text so controls feel responsive without introducing
a second navigation system.

All existing desktop interactions—drag, maximize, close/reopen, Start menu,
mobile layout, and reduced-motion behavior—remain intact.

## Responsive Behavior

At desktop widths the utility is a focused, medium-size window with wallpaper
visible around it. On mobile it uses the available pseudo-desktop width and its
form rows stack without causing horizontal page overflow.

## Verification

- The generated homepage contains no workbench toolbar, internal automation
  sidebar, script editor, or developer Run control.
- The initial title is Clipboard Formatter.
- Five outer feature cards and five Start menu shortcuts still switch demos.
- The Workspace Layout utility uses abstract zones, not nested windows.
- Existing JavaScript parses and all site tests pass.
- Manual desktop and mobile checks cover all five demos, native utility actions,
  window controls, drag, and reduced motion.
