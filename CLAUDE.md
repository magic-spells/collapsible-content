# Collapsible Content

Accessible collapsible/accordion web component.

## Architecture

Three custom elements:

- `<collapsible-component>` - Container that orchestrates button + content
- `<collapsible-content>` - Animated content wrapper
- `<collapsible-group>` - Optional ancestor that links components (opt-in `exclusive`)

All state changes funnel through `CollapsibleContent#transition()`, which reports to the
owning component through the module-private `NOTIFY` symbol. That one hook sets
`aria-expanded`, closes group siblings, and dispatches `collapsible:toggle` — so every
source (click, `collapsed` setter, `open` attribute, `show()/hide()/toggle()`, group
exclusivity) fires exactly one event per real change.

## Key Files

- `src/collapsible-content.js` - Both component classes
- `src/collapsible-content.css` - Styles with CSS custom properties
- `demo/index.html` - Demo page

## Code Conventions

- Use `const _ = this;` alias in methods for shorter code
- Private fields use `#` prefix
- AbortController for event listener cleanup

## Build

```bash
npm run build    # Build dist/
npm run dev      # Watch mode with local server
npm run lint     # ESLint
npm run format   # Prettier
```

## Animation

- Duration is dynamic: calculated from content height and `speed` attribute (px/sec)
- Default speed: `900` px/sec (override with `speed` attribute on `<collapsible-content>`)
- Duration clamped between `min-duration` (default 0.25s) and `max-duration` (default 0.8s)
- Both clamps are overridable via attributes on `<collapsible-content>`
- `#setDynamicDuration` sets `--collapsible-duration` inline; cleaned up in `transitionend`

## Public API

- `<collapsible-content>`: `collapsed` property, `open` attribute (observed — adding or
  removing it animates), `speed` / `min-duration` / `max-duration`
- `<collapsible-component>`: `open` property, `show()`, `hide()`, `toggle()`, `group` attribute
- Events: `collapsible:toggle` (`bubbles`, `composed`, `detail: { open, content }`) and
  `collapsible-error`

## Attribute Reflection

- `CollapsibleContent` observes `open`; the `collapsed` setter mirrors to the attribute
  behind a `#selfWrite` flag so `attributeChangedCallback` does not run the transition twice
- `#ready` (set at the end of `connectedCallback`) keeps an authored `open` from animating
  on first upgrade — it still means "start expanded"

## Accordion Groups

- `group` attribute on `<collapsible-component>` links items by name
- `<collapsible-group>` links items by position: a component with no `group` attribute joins
  its nearest ancestor group at connect and leaves on disconnect
- `exclusive` on the group turns on accordion behavior; without it the group is inert
- An explicit `group="name"` always wins over the ancestor group
- Named registry is a module-level `Map<string, Set>`; element groups use a
  `WeakMap<CollapsibleGroup, Set>` so no upgrade-order bookkeeping is needed
- Group logic lives in `#closeSiblings()`, called from `[NOTIFY]`

## CSS Custom Properties

- `--collapsible-duration` (dynamically set by JS based on content height)
- `--collapsible-easing` (default: ease)
