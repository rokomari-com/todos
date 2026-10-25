# Elm TodoMVC with types

TodoMVC (Elm 0.19.1) plus Personal/Work todo types. Original TodoMVC styling is vendored in `css/` (todomvc-common 1.0.5, todomvc-app-css 2.4.3); `css/types.css` adds the type UI. No CDN at runtime.

## Build and run

    elm make src/Main.elm --output=elm.js
    python3 -m http.server 8000   # or: npx serve
    # open http://localhost:8000/

## Types

- New todo: pick type under the input (default = last used); Alt+T in the input cycles.
- Hover a row to see its type label; click the mark to cycle the type. Marks are hidden while a type filter is on.
- Footer type menu (All types / Personal / Work; Enter/Space opens, arrows move, Esc closes) combines with the All/Active/Completed hash filters. Counter, toggle-all, and clear-completed act on the visible type scope.
- Saved data without a type loads as Personal (localStorage key `elm-todo-save`).

## Adding a type

1. Add a constructor to `EntryType` in `src/Main.elm`.
2. Compiler flags the non-exhaustive `nextType`, `typeKey`, `typeLabel`, `typeShape`, `requireListed`: extend all five, and add the type to `allTypes`. `nextType` must cycle back to Personal. Pick a new `Shape` (add a constructor plus a `.shape-*` rule in `css/types.css`) so color is never the only cue.
3. Add a `.mark-<key>` color in `css/types.css` (fallback is Slate).
