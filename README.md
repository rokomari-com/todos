# Elm TodoMVC with categories

Live: https://rokomari-com.github.io/todos/

Built on [Evan Czaplicki's Elm TodoMVC](https://github.com/evancz/elm-todomvc) (BSD-3-Clause) and the [TodoMVC](https://todomvc.com) stylesheets. MIT licensed; see `LICENSE` and `THIRD_PARTY_NOTICES.md`.

TodoMVC (Elm 0.19.1) plus user-configurable categories. Original TodoMVC styling is vendored in `css/` (todomvc-common 1.0.5, todomvc-app-css 2.4.3); `css/types.css` adds the category UI. No CDN at runtime.

## Build and run

    elm make src/Main.elm --output=elm.js
    python3 -m http.server 8000   # or: npx serve
    # open http://localhost:8000/

## Editing

- No on-page hint text. Desktop: double-click a todo to edit. Touch: tap to edit, press and hold for the delete overlay.
- In the edit field Enter saves, Shift+Enter adds a newline, Esc cancels; saving blank text deletes the todo.

## Categories

- Fresh install has none: no picker, no marks, no category menu; the footer shows "Add categories…" in its place.
- Manage view `#/categories` (footer menu "Edit categories…"): rows show mark + name; ↑ ↓ × fade in on hover / keyboard focus (always visible, faint, on touch). Click, tap or Enter on a name to edit that row (one at a time): the name becomes a field and the 8-colour strip appears under it. Enter or leaving the row saves a valid name, Esc restores; colour picks save at once. ↑/↓ order drives the picker and menu; × deletes after an inline confirm. Back returns to the last list route.
- Limits: max 12 categories; names trimmed, non-empty, unique case-insensitively ("Name already used"), max 40 chars.
- Delete: that category's todos (archived included) keep their text and get no category; a filter or new-todo choice pointing at it resets to Any category / None.
- New todo: picker under the input cycles None → each category → None (Alt+T in the input does the same; choice persists). Marks are hidden while a category filter is on.
- Picker follows the filter: choosing a category filter (or one restored on load) presets the picker to it, "No category" presets None, Any leaves it; the picker can still be changed until the filter changes again.
- Row mark opens a menu (same keys as the footer menus): "No category" + each category, current one ticked; picking sets it and refocuses the mark. A todo without a category shows a hollow ring only on row hover / focus (faint on touch). Archive rows have no control.
- Toggle-all and archive-completed act on the category scope. The archive view's category menu matches the footer one minus "Edit categories…", with counts of archived todos.
- Each category has a colour (palette slot 0..7 = `--cat-0..7` in `css/types.css`, all ≥ 3:1 on white) and a shape (circle, square, diamond, triangle, round-robin by creation order) so colour is never the only cue.
- Storage (localStorage `elm-todo-save`): `categories: [{id, name, color, shape}]`, `nextCategoryId`, `newCategory` (id or null), `categoryFilter` (`"all"`, `"none"` or an id); each entry has `category` (id or null). Decoding is lenient: invalid categories are dropped, dangling ids become null / `"all"`.
- Migration: if `categories` is absent and any entry has legacy `"type": "personal" | "work"`, Personal (id 1, blue, circle) and Work (id 2, orange, square) are created and entries, `newType` and `typeFilter` are mapped; entries without a type get no category. Without legacy types the list starts empty. `seed.html` writes legacy data, so it exercises this path.

## Footer

- Two centred pill dropdowns (grey text; pale fill on hover / open; no border, no chevron): status ("Active") and category ("Any category", or mark + name when set, truncated at about 14 characters). A non-default choice (All, Completed, any category) shows its text in red.
- Status menu: Active / Completed / All, each with its count in the current category scope. Category menu: Any category / each category / No category, each with its count in the current status scope, then "Edit categories…".
- Both menus: Enter, Space, ↓ or ↑ opens; arrows wrap, Home/End jump, Esc closes and refocuses the button, Tab closes. They open upward, or downward when there is no room above.
- "Archive completed" appears at the right only in the Completed view when the category scope has a completed todo.
- Routes: `#/active` (also `#/` and any unknown hash, the default), `#/completed`, `#/all`, `#/archive`, `#/categories`.

## Archive

- Footer "Archive completed" archives all completed todos in the current category scope (nothing is deleted). Completed rows also get a hover archive icon (desktop) or an "Archive" button in the long-press overlay (touch).
- Completed todos untouched for 30 days archive automatically (checked on load and hourly). Toggling or editing a completed todo resets its clock.
- `#/archive` lists archived todos as one card per month of completion (newest first, date at the right edge, no title), with Restore (back to active) and Delete. The category filter applies; a fixed bottom-right link "Archive · N" appears only when N > 0.
- Archived todos are excluded from the lists, menu counts and toggle-all.
- Each month card has "Copy for summary" (hover/focus; always faint on touch): copies an LLM prompt plus that month's shown todos ("- [Category] text (completed 20 Oct)"). With a category filter the category is named once in the prompt and brackets are dropped. Clipboard goes through the `copyText` / `copied` ports (navigator.clipboard, execCommand fallback); the label shows "Copied" or "Copy failed" for 1.5s.
- Saved entries carry `completedAt` and `archivedAt` (epoch ms or null). Old data without them loads fine; completed entries lacking `completedAt` are stamped with the load time so nothing archives right after upgrading. Time comes from `Time.now` / `Time.here` tasks (init, each toggle/archive) and an hourly `Time.every`.

## Reorder

- Main list only. Desktop: press and drag a row (not its checkbox, buttons or text field) past 6px; the other rows shift to open the drop slot, Esc cancels. The page autoscrolls when the pointer nears the top or bottom edge (mouse and touch). Touch: drag the left-edge handle; long-press on the text still opens the delete overlay.
- Keyboard: Alt+↑ / Alt+↓ on a focused row moves it one visible slot; the move is announced ("Moved to position N of M").
- Saved entries carry `order` (integer). Entries saved without it take their stored position. New todos append at the bottom. After a drop, all non-archived entries are renumbered 0..n-1; with a filter on, the row lands after its visible neighbour and hidden rows keep their relative positions.

Known limit: month grouping uses the zone from `Time.here` at load; a DST change mid-session is not picked up until reload.
