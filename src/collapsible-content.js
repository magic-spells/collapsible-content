import './collapsible-content.css';

const DEFAULT_SPEED = 900; // px per second
const MIN_DURATION = 0.25; // seconds
const MAX_DURATION = 1.0; // seconds

/**
 * Custom element that creates a collapsible/expandable component with proper accessibility
 */
class CollapsibleComponent extends HTMLElement {
	#handleClick;
	#abortController;

	/**
	 * Initializes the component and sets up references to child elements
	 */
	constructor() {
		super();
		const _ = this;

		// store references to elements once to avoid re-querying
		_.button = null;
		_.content = null;

		// define click handler — content is source of truth
		_.#handleClick = () => {
			_.content.collapsed = !_.content.collapsed;
			_.button.setAttribute('aria-expanded', !_.content.collapsed);
		};
	}

	/**
	 * Called when element is added to the DOM
	 * Sets up accessibility attributes and event listeners
	 */
	connectedCallback() {
		const _ = this;

		// initialize element references once
		_.button = _.querySelector('button');
		_.content = _.querySelector('collapsible-content');

		if (!_.button || !_.content) {
			const error = new Error(
				'CollapsibleComponent requires a <button> and a <collapsible-content>.'
			);
			console.error(error.message);
			_.dispatchEvent(
				new CustomEvent('collapsible-error', {
					bubbles: true,
					detail: { error },
				})
			);
			return;
		}

		// generate ids if not provided
		_.button.id ||= `collapsible-button-${crypto.randomUUID().slice(0, 8)}`;
		_.content.id ||= `collapsible-content-${crypto.randomUUID().slice(0, 8)}`;

		// set accessibility attributes
		if (!_.button.hasAttribute('type')) {
			_.button.type = 'button';
		}
		_.button.setAttribute('aria-controls', _.content.id);
		_.content.setAttribute('aria-labelledby', _.button.id);
		if (!_.content.hasAttribute('role')) {
			_.content.setAttribute('role', 'region');
		}

		// set initial state without triggering an opening/closing animation
		const open = _.content.hasAttribute('open');
		_.button.setAttribute('aria-expanded', open);
		_.content.style.height = open ? 'auto' : '0px';
		if (open) {
			_.content.removeAttribute('aria-hidden');
			_.content.removeAttribute('inert');
		} else {
			_.content.setAttribute('aria-hidden', 'true');
			_.content.setAttribute('inert', '');
		}

		// use AbortController to prevent duplicate listeners on reconnection
		_.#abortController = new AbortController();
		_.button.addEventListener('click', _.#handleClick, {
			signal: _.#abortController.signal,
		});
	}

	/**
	 * Called when element is removed from the DOM
	 * Cleans up event listeners
	 */
	disconnectedCallback() {
		const _ = this;
		if (_.#abortController) {
			_.#abortController.abort();
			_.#abortController = null;
		}
	}
}

/**
 * Custom element that provides animated collapsible content
 */
class CollapsibleContent extends HTMLElement {
	#handleTransitionEnd;
	#abortController;
	#animating = false;

	/**
	 * Initializes the content element and binds event handlers
	 */
	constructor() {
		super();
		const _ = this;

		// define event handler using arrow function for proper binding
		_.#handleTransitionEnd = (event) => {
			if (event.target !== _) return;
			if (event.propertyName !== 'height') return;

			_.#animating = false;
			_.style.removeProperty('--collapsible-duration');

			// remove the inline height to allow dynamic content changes
			if (!_.collapsed) {
				_.style.height = 'auto';
			}
		};
	}

	/**
	 * Called when element is added to the DOM
	 * Sets initial height based on open attribute
	 */
	connectedCallback() {
		const _ = this;
		_.style.height = _.hasAttribute('open') ? 'auto' : '0';

		// use AbortController to prevent duplicate listeners on reconnection
		_.#abortController = new AbortController();
		_.addEventListener('transitionend', _.#handleTransitionEnd, {
			signal: _.#abortController.signal,
		});
	}

	/**
	 * Called when element is removed from the DOM
	 * Cleans up event listeners
	 */
	disconnectedCallback() {
		const _ = this;
		_.#animating = false;
		if (_.#abortController) {
			_.#abortController.abort();
			_.#abortController = null;
		}
	}

	get #speed() {
		const attr = this.getAttribute('speed');
		if (attr === null) return DEFAULT_SPEED;
		const value = Number(attr);
		return value > 0 ? value : DEFAULT_SPEED;
	}

	get #minDuration() {
		const attr = this.getAttribute('min-duration');
		if (attr === null) return MIN_DURATION;
		const value = Number(attr);
		return value > 0 ? value : MIN_DURATION;
	}

	get #maxDuration() {
		const attr = this.getAttribute('max-duration');
		if (attr === null) return MAX_DURATION;
		const value = Number(attr);
		return value > 0 ? value : MAX_DURATION;
	}

	#setDynamicDuration(currentHeight, targetHeight) {
		const _ = this;
		const delta = Math.abs(targetHeight - currentHeight);
		const duration = Math.min(_.#maxDuration, Math.max(_.#minDuration, delta / _.#speed));
		_.style.setProperty('--collapsible-duration', `${duration.toFixed(3)}s`);
	}

	/**
	 * Handles setting the collapsed state with animation
	 * @param {boolean} value - Whether element should be collapsed
	 */
	set collapsed(value) {
		const _ = this;
		const collapsed = Boolean(value);
		if (_.collapsed === collapsed) return;

		// check if transitions are enabled (respects prefers-reduced-motion)
		const hasTransition = getComputedStyle(_).transitionDuration !== '0s';

		if (collapsed) {
			_.removeAttribute('open');
			_.setAttribute('aria-hidden', 'true');
			_.setAttribute('inert', '');

			if (!hasTransition) {
				_.style.height = '0px';
				return;
			}

			// capture current height in px (converts auto or mid-animation value)
			const currentHeight = _.getBoundingClientRect().height;
			_.style.height = `${currentHeight}px`;
			_.#setDynamicDuration(currentHeight, 0);
			_.#animating = true;
			_.offsetHeight; // force reflow — browser commits the px start value
			_.style.height = '0px';
		} else {
			_.setAttribute('open', '');
			_.removeAttribute('aria-hidden');
			_.removeAttribute('inert');

			if (!hasTransition) {
				_.style.height = 'auto';
				return;
			}

			// capture current height in px (0px or mid-animation value)
			const currentHeight = _.getBoundingClientRect().height;
			_.style.height = `${currentHeight}px`;
			_.#setDynamicDuration(currentHeight, _.scrollHeight);
			_.#animating = true;
			_.offsetHeight; // force reflow — browser commits the px start value
			_.style.height = `${_.scrollHeight}px`;
		}
	}

	/**
	 * Gets the collapsed state
	 * @returns {boolean} Whether element is collapsed
	 */
	get collapsed() {
		return !this.hasAttribute('open');
	}
}

// register custom elements if not already defined
if (!customElements.get('collapsible-content')) {
	customElements.define('collapsible-content', CollapsibleContent);
}
if (!customElements.get('collapsible-component')) {
	customElements.define('collapsible-component', CollapsibleComponent);
}

export { CollapsibleContent, CollapsibleComponent };
