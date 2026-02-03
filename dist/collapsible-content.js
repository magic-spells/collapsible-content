(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.CollapsibleContent = {}));
})(this, (function (exports) { 'use strict';

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

			// define click handler with proper this binding
			_.#handleClick = (e) => {
				e.preventDefault();
				// toggle expanded value
				const expanded = _.button.getAttribute('aria-expanded') !== 'true';
				_.button.setAttribute('aria-expanded', expanded);
				_.content.collapsed = !expanded;
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
			_.button.type ||= 'button';
			_.button.setAttribute('aria-controls', _.content.id);
			_.content.setAttribute('aria-labelledby', _.button.id);

			// set initial state based on open attribute
			const open = _.content.hasAttribute('open');
			_.button.setAttribute('aria-expanded', open);
			_.content.collapsed = !open;

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
				// exit if isn't height property
				if (event.propertyName !== 'height') return;

				_.#animating = false;

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
			if (_.#abortController) {
				_.#abortController.abort();
				_.#abortController = null;
			}
		}

		/**
		 * Handles setting the collapsed state with animation
		 * @param {boolean} value - Whether element should be collapsed
		 */
		set collapsed(value) {
			const _ = this;

			// prevent rapid clicking during animation
			if (_.#animating) return;

			// check if transitions are enabled (respects prefers-reduced-motion)
			const hasTransition = getComputedStyle(_).transitionDuration !== '0s';

			if (value) {
				if (hasTransition) {
					_.#animating = true;
				}

				// animate to closed
				_.style.height = `${_.scrollHeight}px`;

				// use requestAnimationFrame for reliable frame timing
				requestAnimationFrame(() => {
					requestAnimationFrame(() => {
						_.style.height = '0px';
					});
				});

				_.removeAttribute('open');
				_.setAttribute('aria-hidden', 'true');
				_.setAttribute('inert', '');
			} else {
				// only animate if not already auto
				if (_.style.height !== 'auto') {
					if (hasTransition) {
						_.#animating = true;
					}
					_.style.height = `${_.scrollHeight}px`;
				}

				_.setAttribute('open', '');
				_.removeAttribute('aria-hidden');
				_.removeAttribute('inert');
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

	exports.CollapsibleComponent = CollapsibleComponent;
	exports.CollapsibleContent = CollapsibleContent;

}));
//# sourceMappingURL=collapsible-content.js.map
