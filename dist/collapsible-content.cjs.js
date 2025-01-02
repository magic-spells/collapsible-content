'use strict';

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
	}

	connectedCallback() {
		if (this.hidden) {
			this.style.height = '0';
		}
	}

	set hidden(value) {
		if (value) {
			this.style.height = '0';
			this.setAttribute('aria-hidden', 'true');
			this.setAttribute('inert', '');
		} else {
			this.style.height = `${this.scrollHeight}px`;
			this.removeAttribute('aria-hidden');
			this.removeAttribute('inert');
		}
		if (value) {
			this.setAttribute('hidden', '');
		} else {
			this.removeAttribute('hidden');
		}
	}

	get hidden() {
		return this.hasAttribute('hidden');
	}
}

customElements.define('collapsible-content', CollapsibleContent);
customElements.define('collapsible-component', CollapsibleComponent);

exports.CollapsibleComponent = CollapsibleComponent;
exports.CollapsibleContent = CollapsibleContent;
//# sourceMappingURL=collapsible-content.cjs.js.map
