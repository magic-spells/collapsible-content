# Collapsible Content

Accessible collapsible/accordion web component.

## Architecture

Two custom elements work together:

- `<collapsible-component>` - Container that orchestrates button + content
- `<collapsible-content>` - Animated content wrapper

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
- Duration clamped between 250ms and 1s
- `#setDynamicDuration` sets `--collapsible-duration` inline; cleaned up in `transitionend`

## CSS Custom Properties

- `--collapsible-duration` (dynamically set by JS based on content height)
- `--collapsible-easing` (default: ease)
