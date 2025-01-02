class CollapsibleComponent extends HTMLElement {
	#handleClick;

	constructor() {
		super();
		this.#handleClick = () => {
			const button = this.querySelector('button');
			const content = this.querySelector('collapsible-content');
			const expanded =
				button.getAttribute('aria-expanded') !== 'true';
			button.setAttribute('aria-expanded', expanded);
			content.hidden = !expanded;
		};
	}

	connectedCallback() {
		const button = this.querySelector('button');
		const content = this.querySelector('collapsible-content');

		if (!button || !content) {
			console.error(
				'CollapsibleComponent requires a <button> and a <collapsible-content>.'
			);
			return;
		}

		button.id ||= `collapsible-button-${Math.random().toString(36).slice(2, 9)}`;
		content.id ||= `collapsible-content-${Math.random().toString(36).slice(2, 9)}`;

		button.setAttribute('aria-controls', content.id);
		content.setAttribute('role', 'region');
		content.setAttribute('aria-labelledby', button.id);

		const expanded = button.getAttribute('aria-expanded') === 'true';
		content.hidden = !expanded;

		button.addEventListener('click', this.#handleClick);
	}

	disconnectedCallback() {
		const button = this.querySelector('button');
		button?.removeEventListener('click', this.#handleClick);
	}
}

class CollapsibleContent extends HTMLElement {
	constructor() {
		super();
		this._onTransitionEnd = this._onTransitionEnd.bind(this);
		// Add event listener to remove height after transition
		this.addEventListener('transitionend', this._onTransitionEnd);
	}

	connectedCallback() {
		if (this.hidden) {
			this.style.height = '0';
		} else {
			this.style.height = `${this.scrollHeight}px`;
		}
	}

	disconnectedCallback() {
		this.removeEventListener('transitionend', this._onTransitionEnd);
	}

	set hidden(value) {
		// animate to closed
		if (value) {
			// reset height to animate from
			this.style.height = `${this.scrollHeight}px`;

			// wait one frame and animate to 0
			requestAnimationFrame(() => {
				this.style.height = '0px';
			});

			this.setAttribute('aria-hidden', 'true');
			this.setAttribute('inert', '');
			this.setAttribute('hidden', '');
		} else {
			// animate to open
			this.style.height = `${this.scrollHeight}px`;
			this.removeAttribute('aria-hidden');
			this.removeAttribute('inert');
			this.removeAttribute('hidden');
		}
	}

	get hidden() {
		return this.hasAttribute('hidden');
	}

	_onTransitionEnd(event) {
		// exit if isn't height property
		if (event.propertyName != 'height') return;

		// Remove the inline height to allow dynamic content changes
		if (!this.hidden) {
			this.style.height = 'auto';
		}
	}
}

customElements.define('collapsible-content', CollapsibleContent);
customElements.define('collapsible-component', CollapsibleComponent);

export { CollapsibleComponent, CollapsibleContent };
//# sourceMappingURL=collapsible-content.esm.js.map
