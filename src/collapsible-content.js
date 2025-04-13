import './index.scss';

/**
 * Custom element that creates a collapsible/expandable component with proper accessibility
 */
class CollapsibleComponent extends HTMLElement {
	#handleClick;

	/**
	 * Initializes the component and sets up references to child elements
	 */
	constructor() {
		super();
		const _ = this;

		// store references to elements once to avoid re-querying
		_.button = null;
		_.content = null;

		// define click handler with proper this binding
		_.#handleClick = (e) => {
			e.preventDefault();
			// toggle expanded value
			const expanded = _.button.getAttribute('aria-expanded') !== 'true';
			_.button.setAttribute('aria-expanded', expanded);
			_.content.hidden = !expanded;
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
			console.error('CollapsibleComponent requires a <button> and a <collapsible-content>.');
			return;
		}

		// generate ids if not provided
		_.button.id ||= `collapsible-button-${crypto.randomUUID().slice(0, 8)}`;
		_.content.id ||= `collapsible-content-${crypto.randomUUID().slice(0, 8)}`;

		// set accessibility attributes
		_.button.setAttribute('aria-controls', _.content.id);
		_.content.setAttribute('role', 'region');
		_.content.setAttribute('aria-labelledby', _.button.id);

		// set initial state based on aria-expanded attribute
		const expanded = _.button.getAttribute('aria-expanded') === 'true';

		// make sure content state matches button state
		_.content.hidden = !expanded;

		// add event listener
		_.button.addEventListener('click', _.#handleClick);
	}

	/**
	 * Called when element is removed from the DOM
	 * Cleans up event listeners
	 */
	disconnectedCallback() {
		const _ = this;
		if (_.button) {
			_.button.removeEventListener('click', _.#handleClick);
		}
	}
}

/**
 * Custom element that provides animated collapsible content
 */
class CollapsibleContent extends HTMLElement {
	#handleTransitionEnd;

	/**
	 * Initializes the content element and binds event handlers
	 */
	constructor() {
		super();
		const _ = this;

		// define event handler using arrow function for proper binding
		_.#handleTransitionEnd = (event) => {
			// exit if isn't height property
			if (event.propertyName != 'height') return;

			// remove the inline height to allow dynamic content changes
			if (!_.hidden) {
				_.style.height = 'auto';
			}
		};

		// add event listener to remove height after transition
		_.addEventListener('transitionend', _.#handleTransitionEnd);
	}

	/**
	 * Called when element is added to the DOM
	 * Sets initial height based on hidden state
	 */
	connectedCallback() {
		const _ = this;

		// get aria-expanded state from button
		const component = _.closest('collapsible-component');
		const button = component.querySelector('button');
		const expanded = button.getAttribute('aria-expanded') === 'true';

		if (expanded) {
			_.style.height = 'auto';
		} else {
			_.style.height = '0';
		}
	}

	/**
	 * Called when element is removed from the DOM
	 * Cleans up event listeners
	 */
	disconnectedCallback() {
		const _ = this;
		_.removeEventListener('transitionend', _.#handleTransitionEnd);
	}

	/**
	 * Handles setting the hidden attribute with animation
	 * @param {boolean} value - Whether element should be hidden
	 */
	set hidden(value) {
		const _ = this;

		// animate to closed
		if (value) {
			// reset height to animate from
			_.style.height = `${_.scrollHeight}px`;

			// wait one frame and animate to 0
			setTimeout(() => {
				_.style.height = '0px';
			}, 1);

			// set accessibility attributes
			_.setAttribute('aria-hidden', 'true');
			_.setAttribute('inert', '');
			_.setAttribute('hidden', '');
		} else {
			// only animate if not set to auto
			if (_.style.height !== 'auto') {
				// animate to open
				_.style.height = `${_.scrollHeight}px`;
			}

			// remove accessibility attributes
			_.removeAttribute('aria-hidden');
			_.removeAttribute('inert');
			_.removeAttribute('hidden');
		}
	}

	/**
	 * Gets the hidden state from the attribute
	 * @returns {boolean} Whether element is hidden
	 */
	get hidden() {
		const _ = this;
		return _.hasAttribute('hidden');
	}
}

// register custom elements
customElements.define('collapsible-content', CollapsibleContent);
customElements.define('collapsible-component', CollapsibleComponent);

export { CollapsibleContent, CollapsibleComponent };
