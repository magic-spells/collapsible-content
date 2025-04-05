import './styles.css';

/**
 * custom element that creates a collapsible/expandable component with proper accessibility
 */
class CollapsibleComponent extends HTMLElement {
	#handleClick;

	/**
	 * initializes the component and sets up references to child elements
	 */
	constructor() {
		super();

		// store references to elements once to avoid re-querying
		this.button = null;
		this.content = null;

		// define click handler with proper this binding
		this.#handleClick = (e) => {
			e.preventDefault();
			// toggle expanded value
			const expanded = this.button.getAttribute('aria-expanded') !== 'true';
			this.button.setAttribute('aria-expanded', expanded);
			this.content.hidden = !expanded;
		};
	}

	/**
	 * called when element is added to the dom
	 * sets up accessibility attributes and event listeners
	 */
	connectedCallback() {
		// initialize element references once
		this.button = this.querySelector('button');
		this.content = this.querySelector('collapsible-content');

		if (!this.button || !this.content) {
			console.error('CollapsibleComponent requires a <button> and a <collapsible-content>.');
			return;
		}

		// generate ids if not provided
		this.button.id ||= `collapsible-button-${crypto.randomUUID().slice(0, 8)}`;
		this.content.id ||= `collapsible-content-${crypto.randomUUID().slice(0, 8)}`;

		// set accessibility attributes
		this.button.setAttribute('aria-controls', this.content.id);
		this.content.setAttribute('role', 'region');
		this.content.setAttribute('aria-labelledby', this.button.id);

		// set initial state based on aria-expanded attribute
		const expanded = this.button.getAttribute('aria-expanded') === 'true';

		// make shure content state matches button state
		this.content.hidden = !expanded;

		// add event listener
		this.button.addEventListener('click', this.#handleClick);
	}

	/**
	 * called when element is removed from the dom
	 * cleans up event listeners
	 */
	disconnectedCallback() {
		if (this.button) {
			this.button.removeEventListener('click', this.#handleClick);
		}
	}
}

/**
 * custom element that provides animated collapsible content
 */
class CollapsibleContent extends HTMLElement {
	/**
	 * initializes the content element and binds event handlers
	 */
	constructor() {
		super();

		// bind event handler to this instance
		this._onTransitionEnd = this._onTransitionEnd.bind(this);

		// add event listener to remove height after transition
		this.addEventListener('transitionend', this._onTransitionEnd);
	}

	/**
	 * called when element is added to the dom
	 * sets initial height based on hidden state
	 */
	connectedCallback() {
		// get aria-expanded state from buton
		const component = this.closest('collapsible-component');
		const button = component.querySelector('button');
		const expanded = button.getAttribute('aria-expanded') === 'true';

		if (expanded) {
			this.style.height = 'auto';
		} else {
			this.style.height = '0';
		}
	}

	/**
	 * called when element is removed from the dom
	 * cleans up event listeners
	 */
	disconnectedCallback() {
		this.removeEventListener('transitionend', this._onTransitionEnd);
	}

	/**
	 * handles setting the hidden attribute with animation
	 * @param {boolean} value - whether element should be hidden
	 */
	set hidden(value) {
		// animate to closed
		if (value) {
			// reset height to animate from
			this.style.height = `${this.scrollHeight}px`;

			// wait one frame and animate to 0
			setTimeout(() => {
				this.style.height = '0px';
			}, 1);

			// set accessibility attributes
			this.setAttribute('aria-hidden', 'true');
			this.setAttribute('inert', '');
			this.setAttribute('hidden', '');
		} else {
			// only animate if not set to auto
			if (this.style.height !== 'auto') {
				// animate to open
				this.style.height = `${this.scrollHeight}px`;
			}

			// remove accessibility attributes
			this.removeAttribute('aria-hidden');
			this.removeAttribute('inert');
			this.removeAttribute('hidden');
		}
	}

	/**
	 * gets the hidden state from the attribute
	 * @return {boolean} whether element is hidden
	 */
	get hidden() {
		return this.hasAttribute('hidden');
	}

	/**
	 * handles the end of css transitions
	 * @param {TransitionEvent} event - the transition event
	 */
	_onTransitionEnd(event) {
		console.log('on transition end');

		// exit if isn't height property
		if (event.propertyName != 'height') return;

		// remove the inline height to allow dynamic content changes
		if (!this.hidden) {
			this.style.height = 'auto';
		}
	}
}

// register custom elements
customElements.define('collapsible-content', CollapsibleContent);
customElements.define('collapsible-component', CollapsibleComponent);

export { CollapsibleContent, CollapsibleComponent };
