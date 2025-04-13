# Collapsible Content Web Component

A lightweight, customizable Web Component for creating accessible collapsible content sections. Perfect for FAQs, accordions, or any content that needs to be toggled.

[**Live Demo**](https://magic-spells.github.io/collapsible-content/demo/)

## Features

- No dependencies
- Lightweight
- Follows accessibility best practices
- Smooth open/close animations
- Uses proper ARIA attributes
- Keyboard accessible

## Installation

```bash
npm install @magic-spells/collapsible-content
```

```javascript
// Add to your JavaScript file
import '@magic-spells/collapsible-content';
```

Or include directly in your HTML:

```html
<script src="https://unpkg.com/@magic-spells/collapsible-content"></script>
```

## Usage

```html
<collapsible-component>
  <button aria-expanded="false">Product Information</button>
  <collapsible-content>
    <div class="content-wrapper">
      <h3>Details</h3>
      <p>
        This product is made with 100% organic materials. It's durable, eco-friendly, and
        stylish.
      </p>
    </div>
  </collapsible-content>
</collapsible-component>
```

## How It Works

- The collapsible content is initially hidden (unless `aria-expanded="true"` is set on the button)
- Clicking the button toggles the visibility of the content
- The component handles all the ARIA attributes for accessibility
- Smooth animations are provided for opening and closing

## Customization

### Styling

You can style the collapsible component using CSS custom properties:

```css
:root {
  /* Layout */
  --cc-component-display: block;
  --cc-button-width: 100%;
  --cc-button-text-align: left;
  
  /* Appearance */
  --cc-button-background: none;
  --cc-button-border: none;
  --cc-button-cursor: pointer;
  
  /* Animation */
  --cc-content-padding: 10px;
  --cc-transition-duration: 0.5s;
  --cc-transition-timing: ease-in-out;
}
```

### SCSS Integration

For more advanced customization, you can import the SCSS directly:

```scss
// Option 1: Import the compiled CSS
@import '@magic-spells/collapsible-content/css';

// Option 2: Import the SCSS and override variables
@use '@magic-spells/collapsible-content/scss' with (
  $transition-duration: 0.5s,
  $transition-timing: ease-in-out,
  $content-padding: 10px
);

// Option 3: Import specific parts
@use '@magic-spells/collapsible-content/scss/variables' with (
  $button-text-align: center
);
@use '@magic-spells/collapsible-content/scss/collapsible-content';
```

## Accessibility

This component follows WCAG guidelines for accessible accordions:

- Uses proper `aria-expanded` and `aria-controls` attributes
- Content regions have proper `role="region"` and `aria-labelledby` attributes
- Keyboard accessible (toggle with Space or Enter key)
- Focus management for keyboard users

## Browser Support

This component works in all modern browsers that support Web Components.

## License

MIT