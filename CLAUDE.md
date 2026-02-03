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

## CSS Custom Properties

- `--collapsible-duration` (default: 0.35s)
- `--collapsible-easing` (default: ease-out)
