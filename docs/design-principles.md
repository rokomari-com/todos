# Design principles

Paste this block into every design brief (Claude Design, mockup workers, reviews).

## Surprisal: ink is allocated, not deserved

- Pixels in proportion to surprise × cost of missing it. Expected state is whitespace; a deviation is the one loud thing.
- Every element: what is its expected state, and does showing that state tell the reader anything? If not, hide it until hover, focus or a real change.
- Hide from the view, never from reach: every hidden control keeps a bounded path (hover, Tab, menu, URL).
- Absence must be unambiguous: an empty filtered view says what is filtered, so it can't read as "nothing to do".
- Exactly one low-entropy anchor (the title). No second one.
- Rare + costly states may be loud even if rare.
- When you deviate from a literal request for these reasons, say so and why.

## Craft: deliberate, specific, quiet

- One memorable element; everything else disciplined. Remove one accessory before shipping.
- Typefaces and type scale chosen for this product, not defaults. One family, or two clearly distinct.
- Structure encodes information (borders, dividers, numbering only when the content is a sequence or a real boundary).
- No templated tells: no all-caps or eyebrow labels, no middle-dot meta strings, no identical soft-shadow cards, no cream + terracotta or black + acid palettes, no "→" on buttons, no monospace for data labels.
- Motion only in answer to the user's action, and only to show what changed. Reduced motion respected.
- Copy: plain, active, sentence case; name things as the user sees them; an action keeps its name through the flow; empty states invite an action.
- Quality floor without announcing it: works at 375px, visible keyboard focus, 44px touch targets, ≥4.5:1 text contrast.

## Delivery format for a design round

- Frames at 632px and 375px for: default, non-default filter, empty, and one open menu.
- In chat: exact CSS values per element and state, what is always shown vs only on deviation, with a one-line rationale each.
