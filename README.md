# Collapsible Content Web Component

A lightweight, accessible Web Component for creating collapsible content sections. Perfect for FAQs, accordions, or any content that needs to be toggled.

[**Live Demo**](https://magic-spells.github.io/collapsible-content/demo/)

## Features

- No dependencies
- Lightweight
- Accessible (ARIA attributes, keyboard support, focus management)
- Smooth animations with `prefers-reduced-motion` support
- Prevents rapid click issues during animation
- Safe to import multiple times (no double-registration errors)

## Installation

```bash
npm install @magic-spells/collapsible-content
```

```javascript
import '@magic-spells/collapsible-content';
```

Or include directly in your HTML:

```html
<script src="https://unpkg.com/@magic-spells/collapsible-content"></script>
```

## Usage

```html
<collapsible-component>
	<button type="button">Product Information</button>
	<collapsible-content>
		<div class="content-wrapper">
			<h3>Details</h3>
			<p>This product is made with 100% organic materials.</p>
		</div>
	</collapsible-content>
</collapsible-component>
```

### Start Expanded

Add the `open` attribute to start with content visible:

```html
<collapsible-component>
	<button type="button">Already Open</button>
	<collapsible-content open>
		<p>This content is visible by default.</p>
	</collapsible-content>
</collapsible-component>
```

## Animation Speed

Animation duration scales dynamically with content height using a px/sec speed model. Short panels animate quickly, tall panels take proportionally longer — no fixed duration that feels too slow or too fast.

The default speed is `900` px/sec. Duration is clamped between 250ms and 1s so animations always feel responsive. Tune it with the `speed` attribute:

```html
<!-- Default: 900px/sec -->
<collapsible-content>...</collapsible-content>

<!-- Faster -->
<collapsible-content speed="1200">...</collapsible-content>

<!-- Slower -->
<collapsible-content speed="80">...</collapsible-content>
```

| Attribute | Default | Description                          |
| --------- | ------- | ------------------------------------ |
| `speed`   | `900`   | Animation speed in pixels per second |

## Customization

Customize the animation easing with CSS custom properties:

```css
collapsible-content {
	--collapsible-easing: ease-in-out;
}
```

| Property                 | Default    | Description                                          |
| ------------------------ | ---------- | ---------------------------------------------------- |
| `--collapsible-duration` | dynamic    | Calculated from content height and `speed` attribute |
| `--collapsible-easing`   | `ease`     | Animation timing function                            |

## Events

### collapsible-error

Fired when the component is missing required children:

```javascript
document.addEventListener('collapsible-error', (e) => {
	console.error('Collapsible setup failed:', e.detail.error);
});
```

## Programmatic Control

Access the `collapsed` property on the `<collapsible-content>` element:

```javascript
const content = document.querySelector('collapsible-content');
content.collapsed = true; // collapse
content.collapsed = false; // expand
console.log(content.collapsed); // get current state
```

## Accessibility

This component follows WCAG guidelines:

- `aria-expanded` on button indicates current state
- `aria-controls` links button to content
- `role="region"` and `aria-labelledby` on content
- `aria-hidden` and `inert` when collapsed
- Keyboard accessible (Space/Enter to toggle)
- Focus-visible styling for keyboard users
- Respects `prefers-reduced-motion`

## Browser Support

Modern browsers with Web Components support (Chrome, Firefox, Safari, Edge).

## License

MIT
