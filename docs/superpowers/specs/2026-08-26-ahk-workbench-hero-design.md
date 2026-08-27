# AutoHotkey Search Homepage Hero Design

## Goal

Make the pseudo-desktop instantly legible by using the familiar visual grammar
of a minimal search-engine homepage.

## Approved Direction

The open window contains a light search homepage with:

- a multicolor `AutoHotkey` wordmark
- one large rounded search field
- `Search AutoHotkey` and `Show me an example` buttons
- a short search-status line
- a quiet footer identifying AutoHotkey v2.1

The layout borrows the recognizable structure of a search homepage without
using Google's name or wordmark.

## Interaction

The five existing feature cards remain the primary selector. Selecting one
populates the search field with a corresponding natural-language query. Start
menu shortcuts do the same and reopen the search window.

Submitting the search updates only the small status line. It does not navigate
or transform into a results page, keeping the hero visually equivalent to a
search homepage.

All existing desktop interactions—drag, maximize, close/reopen, Start menu,
mobile layout, and reduced-motion behavior—remain intact.

## Responsive Behavior

At desktop widths the search window is wide and shallow with ample white space
and wallpaper visible around it. On mobile it uses the available width, scales
the wordmark and search field, and causes no horizontal page overflow.

## Verification

- The generated homepage contains `data-search-home`, `data-search-input`, and
  `data-search-status`.
- The wordmark says AutoHotkey, never Google.
- The initial query concerns clipboard formatting.
- Five outer feature cards and five Start menu shortcuts populate distinct
  queries.
- No workbench or native-utility controls remain.
- Existing JavaScript parses and all site tests pass.
- Manual checks cover search submit, both buttons, five selectors, window
  controls, drag, mobile, and reduced motion.
