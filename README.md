# Elm TodoMVC with types

Live: https://rokomari-com.github.io/todos/

Built on [Evan Czaplicki's Elm TodoMVC](https://github.com/evancz/elm-todomvc) (BSD-3-Clause) and the [TodoMVC](https://todomvc.com) stylesheets. MIT licensed; see `LICENSE` and `THIRD_PARTY_NOTICES.md`.

TodoMVC (Elm 0.19.1) plus Personal/Work todo types. Original TodoMVC styling is vendored in `css/` (todomvc-common 1.0.5, todomvc-app-css 2.4.3); `css/types.css` adds the type UI. No CDN at runtime.

## Build and run

    elm make src/Main.elm --output=elm.js
    python3 -m http.server 8000   # or: npx serve
    # open http://localhost:8000/

## Types

- New todo: pick type under the input (default = last used); Alt+T in the input cycles.
- Hover a row to see its type label; click the mark to cycle the type. Marks are hidden while a type filter is on.
- Footer type menu (All types / Personal / Work; Enter/Space opens, arrows move, Esc closes) combines with the All/Active/Completed hash filters. Counter, toggle-all, and archive-completed act on the visible type scope.
- Saved data without a type loads as Personal (localStorage key `elm-todo-save`).

## Archive

- Footer "Archive completed" archives all completed todos in the current type scope (nothing is deleted). Completed rows also get a hover archive icon (desktop) or an "Archive" button in the long-press overlay (touch).
- Completed todos untouched for 30 days archive automatically (checked on load and hourly). Toggling or editing a completed todo resets its clock.
- `#/archive` lists archived todos as one card per month of completion (newest first, date at the right edge, no title), with Restore (back to active) and Delete. The type filter applies; a fixed bottom-right link "Archive · N" appears only when N > 0.
- Archived todos are excluded from the lists, counts, toggle-all and hidden hint.
- Saved entries carry `completedAt` and `archivedAt` (epoch ms or null). Old data without them loads fine; completed entries lacking `completedAt` are stamped with the load time so nothing archives right after upgrading. Time comes from `Time.now` / `Time.here` tasks (init, each toggle/archive) and an hourly `Time.every`.

## Adding a type

1. Add a constructor to `EntryType` in `src/Main.elm`.
2. Compiler flags the non-exhaustive `nextType`, `typeKey`, `typeLabel`, `typeShape`, `requireListed`: extend all five, and add the type to `allTypes`. `nextType` must cycle back to Personal. Pick a new `Shape` (add a constructor plus a `.shape-*` rule in `css/types.css`) so color is never the only cue.
3. Add a `.mark-<key>` color in `css/types.css` (fallback is Slate).

Known limit: month grouping uses the zone from `Time.here` at load; a DST change mid-session is not picked up until reload.
