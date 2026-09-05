'use strict';

const DEFAULT_SPEED = 900; // px per second
const MIN_DURATION = 0.25; // seconds
const MAX_DURATION = 0.8; // seconds

// hidden hook the content element uses to report a state change to its component
const NOTIFY = Symbol('collapsible:notify');

// named accordion groups — group attribute value -> Set of components
const namedGroups = new Map();

// <collapsible-group> element -> Set of components that joined it
const elementGroups = new WeakMap();

/**
 * Optional ancestor element that links components without a shared group name.
 * Add the `exclusive` attribute to make opening one item close the others.
 */
class CollapsibleGroup extends HTMLElement {}

/**
 * Custom element that creates a collapsible/expandable component with proper accessibility
 */
class CollapsibleComponent extends HTMLElement {
	static get observedAttributes() {
		return ['group'];
	}

	#handleClick;
	#abortController;
	#groupElement = null;

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
		};
	}

	/**
	 * Called when element is added to the DOM
	 * Sets up accessibility attributes and event listeners
	 */
	connectedCallback() {
		const _ = this;

		// join the nearest <collapsible-group> when no explicit group name is set
		if (!_.hasAttribute('group')) _.#joinGroupElement();

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

	attributeChangedCallback(name, oldValue, newValue) {
		if (name !== 'group') return;
		const _ = this;

		if (oldValue) {
			const group = namedGroups.get(oldValue);
			if (group) {
				group.delete(_);
				if (group.size === 0) namedGroups.delete(oldValue);
			}
		}
		if (newValue) {
			if (!namedGroups.has(newValue)) namedGroups.set(newValue, new Set());
			namedGroups.get(newValue).add(_);
		}

		// an explicit group name wins over any ancestor <collapsible-group>
		if (!_.isConnected) return;
		if (newValue) _.#leaveGroupElement();
		else _.#joinGroupElement();
	}

	/**
	 * Called when element is removed from the DOM
	 * Cleans up event listeners
	 */
	disconnectedCallback() {
		const _ = this;
		const name = _.getAttribute('group');
		if (name) {
			const group = namedGroups.get(name);
			if (group) {
				group.delete(_);
				if (group.size === 0) namedGroups.delete(name);
			}
		}
		_.#leaveGroupElement();
		if (_.#abortController) {
			_.#abortController.abort();
			_.#abortController = null;
		}
	}

	/**
	 * Whether the panel is currently expanded
	 * @returns {boolean}
	 */
	get open() {
		return !!this.content && !this.content.collapsed;
	}

	set open(value) {
		if (this.content) this.content.collapsed = !value;
	}

	/** Expands the panel (no-op if already expanded) */
	show() {
		this.open = true;
	}

	/** Collapses the panel (no-op if already collapsed) */
	hide() {
		this.open = false;
	}

	/** Toggles the panel */
	toggle() {
		this.open = !this.open;
	}

	/**
	 * Reports a state change coming from the content element
	 * @param {CollapsibleContent} content - the content element that changed
	 * @param {boolean} open - the new expanded state
	 */
	[NOTIFY](content, open) {
		const _ = this;
		if (_.content !== content) return;

		if (_.button) _.button.setAttribute('aria-expanded', String(open));
		if (open) _.#closeSiblings();

		_.dispatchEvent(
			new CustomEvent('collapsible:toggle', {
				bubbles: true,
				composed: true,
				detail: { open, content },
			})
		);
	}

	#joinGroupElement() {
		const _ = this;
		const element = _.closest('collapsible-group');
		if (!element) return;
		if (!elementGroups.has(element)) elementGroups.set(element, new Set());
		elementGroups.get(element).add(_);
		_.#groupElement = element;
	}

	#leaveGroupElement() {
		const _ = this;
		if (!_.#groupElement) return;
		elementGroups.get(_.#groupElement)?.delete(_);
		_.#groupElement = null;
	}

	#closeSiblings() {
		const _ = this;
		const name = _.getAttribute('group');
		let siblings = null;
		if (name) siblings = namedGroups.get(name);
		else if (_.#groupElement?.hasAttribute('exclusive'))
			siblings = elementGroups.get(_.#groupElement);
		if (!siblings) return;

		for (const sibling of siblings) {
			if (sibling === _) continue;
			if (sibling.content && !sibling.content.collapsed) sibling.content.collapsed = true;
		}
	}
}

/**
 * Custom element that provides animated collapsible content
 */
class CollapsibleContent extends HTMLElement {
	static get observedAttributes() {
		return ['open'];
	}

	#handleTransitionEnd;
	#abortController;
	#ready = false;
	#selfWrite = false;

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

		// from here on, an external `open` attribute change animates
		_.#ready = true;
	}

	/**
	 * Called when element is removed from the DOM
	 * Cleans up event listeners
	 */
	disconnectedCallback() {
		const _ = this;
		_.#ready = false;
		if (_.#abortController) {
			_.#abortController.abort();
			_.#abortController = null;
		}
	}

	/**
	 * Runs the transition when `open` is added or removed from outside
	 */
	attributeChangedCallback(name, oldValue, newValue) {
		const _ = this;
		if (name !== 'open' || _.#selfWrite || !_.#ready) return;
		// only presence matters — ignore value-only changes (open -> open="x")
		if ((oldValue === null) === (newValue === null)) return;
		_.#transition(newValue === null);
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
	 * Animates to the requested state, then reports the change
	 * @param {boolean} collapsed - target state (the `open` attribute already matches)
	 */
	#transition(collapsed) {
		const _ = this;

		// check if transitions are enabled (respects prefers-reduced-motion)
		const hasTransition = getComputedStyle(_).transitionDuration !== '0s';

		if (collapsed) {
			_.setAttribute('aria-hidden', 'true');
			_.setAttribute('inert', '');

			if (!hasTransition) {
				_.style.height = '0px';
			} else {
				// capture current height in px (converts auto or mid-animation value)
				const currentHeight = _.getBoundingClientRect().height;
				_.style.height = `${currentHeight}px`;
				_.#setDynamicDuration(currentHeight, 0);
				_.offsetHeight; // force reflow — browser commits the px start value
				_.style.height = '0px';
			}
		} else {
			_.removeAttribute('aria-hidden');
			_.removeAttribute('inert');

			if (!hasTransition) {
				_.style.height = 'auto';
			} else {
				// capture current height in px (0px or mid-animation value)
				const currentHeight = _.getBoundingClientRect().height;
				_.style.height = `${currentHeight}px`;
				_.#setDynamicDuration(currentHeight, _.scrollHeight);
				_.offsetHeight; // force reflow — browser commits the px start value
				_.style.height = `${_.scrollHeight}px`;
			}
		}

		_.closest('collapsible-component')?.[NOTIFY]?.(_, !collapsed);
	}

	/**
	 * Handles setting the collapsed state with animation
	 * @param {boolean} value - Whether element should be collapsed
	 */
	set collapsed(value) {
		const _ = this;
		const collapsed = Boolean(value);
		if (_.collapsed === collapsed) return;

		// mirror to the attribute without re-entering attributeChangedCallback
		_.#selfWrite = true;
		if (collapsed) _.removeAttribute('open');
		else _.setAttribute('open', '');
		_.#selfWrite = false;

		_.#transition(collapsed);
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
if (!customElements.get('collapsible-group')) {
	customElements.define('collapsible-group', CollapsibleGroup);
}

exports.CollapsibleComponent = CollapsibleComponent;
exports.CollapsibleContent = CollapsibleContent;
exports.CollapsibleGroup = CollapsibleGroup;
//# sourceMappingURL=collapsible-content.cjs.js.map
