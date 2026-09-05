# Collapsible Content Web Component

A lightweight, accessible Web Component for creating collapsible content sections. Perfect for FAQs, accordions, or any content that needs to be toggled.

[**Live Demo**](https://magic-spells.github.io/collapsible-content/demo/)

## Features

- No dependencies
- Lightweight
- Accessible (ARIA attributes, keyboard support, focus management)
- Smooth animations with `prefers-reduced-motion` support
- Smooth mid-animation reversal on rapid clicks
- Fully drivable from markup (`open` attribute, `<collapsible-group>`) or from JS
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

The default speed is `900` px/sec. Duration is clamped between 250ms and 800ms so animations always feel responsive. Tune it with the `speed`, `min-duration`, and `max-duration` attributes:

```html
<!-- Default: 900px/sec -->
<collapsible-content>...</collapsible-content>

<!-- Faster -->
<collapsible-content speed="1200">...</collapsible-content>

<!-- Slower -->
<collapsible-content speed="80">...</collapsible-content>

<!-- Snappier minimum (150ms instead of 250ms) -->
<collapsible-content min-duration="0.15">...</collapsible-content>
```

| Attribute      | Default | Description                                |
| -------------- | ------- | ------------------------------------------ |
| `speed`        | `900`   | Animation speed in pixels per second       |
| `min-duration` | `0.25`  | Minimum animation duration in seconds      |
| `max-duration` | `0.8`   | Maximum animation duration in seconds      |

## Accordion Groups

Link collapsible components together with the `group` attribute so that opening one closes the others:

```html
<collapsible-component group="faq">
	<button type="button">Question One</button>
	<collapsible-content>
		<p>Answer one.</p>
	</collapsible-content>
</collapsible-component>

<collapsible-component group="faq">
	<button type="button">Question Two</button>
	<collapsible-content>
		<p>Answer two.</p>
	</collapsible-content>
</collapsible-component>
```

Items without a `group` attribute continue to work independently. All items in a group can be closed simultaneously — clicking the open item simply closes it.

### Grouping by ancestor

`<collapsible-group>` links items by position instead of by name — handy when the markup is generated and there is no name to share. Add `exclusive` to get accordion behavior:

```html
<collapsible-group exclusive>
	<collapsible-component>
		<button type="button">Question One</button>
		<collapsible-content>
			<p>Answer one.</p>
		</collapsible-content>
	</collapsible-component>

	<collapsible-component>
		<button type="button">Question Two</button>
		<collapsible-content>
			<p>Answer two.</p>
		</collapsible-content>
	</collapsible-component>
</collapsible-group>
```

An authored `open` is taken at face value on first connect — two items in an exclusive group that both start open both stay open, and no events fire. Exclusivity is enforced only on a real state change.

Without `exclusive` the group is just a container and items stay independent. A component joins its *nearest* ancestor group, so nested groups do not interfere. An explicit `group="name"` always wins — such a component ignores any surrounding `<collapsible-group>`.

| Attribute   | Element                     | Default | Description                                            |
| ----------- | --------------------------- | ------- | ------------------------------------------------------ |
| `group`     | `<collapsible-component>`   | —       | Group name; items with the same name form an accordion |
| `exclusive` | `<collapsible-group>`       | —       | Opening one item in the group closes the others        |
| `open`      | `<collapsible-content>`     | —       | Expanded state; add or remove it to animate open/closed |

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

### collapsible:toggle

Fired on `<collapsible-component>` after every state change — a button click, a property or method call, an `open` attribute change, or a sibling closed by an exclusive group. It bubbles and crosses shadow boundaries, so a single listener can cover a whole page. A no-op change fires nothing.

```javascript
document.addEventListener('collapsible:toggle', (e) => {
	console.log(e.detail.open); // boolean — the new state
	console.log(e.detail.content); // the <collapsible-content> element
});
```

### collapsible-error

Fired when the component is missing required children:

```javascript
document.addEventListener('collapsible-error', (e) => {
	console.error('Collapsible setup failed:', e.detail.error);
});
```

## Programmatic Control

`<collapsible-component>` exposes an `open` property plus `show()`, `hide()`, and `toggle()`. All are idempotent:

```javascript
const item = document.querySelector('collapsible-component');
item.show(); // expand
item.hide(); // collapse
item.toggle(); // flip
item.open = true; // same as show()
console.log(item.open); // read current state
```

You can also drive it from markup — adding or removing the `open` attribute on `<collapsible-content>` runs the same animation:

```javascript
content.setAttribute('open', ''); // expand
content.removeAttribute('open'); // collapse
```

Or set the `collapsed` property on the `<collapsible-content>` element directly:

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
