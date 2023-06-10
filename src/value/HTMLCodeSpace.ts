import { Event } from '@ver/events';
import { codeShell } from '@ver/codeShell';
import { NameSpace } from '@ver/helpers';


interface IOption {
	type?: typeof type_enum[number];
}

const type_enum = ['math', 'never'] as const;


export class HTMLCodeSpaceElement extends HTMLElement {
	public '@execute' = new Event<HTMLCodeSpaceElement, []>(this);


	public $code: HTMLInputElement;

	public get value() { return this.$code.value; }
	public set value(v) { this.$code.value = v; }

	#type: typeof type_enum[number] = 'never';
	public get type() { return this.#type; }
	public set type(v) { this.#type = v; }

	public evaluted: (() => void) | null = null;


	constructor(p: IOption = {}) {
		super();

		const root = this.attachShadow({ mode: 'open' });

		this.draggable = true;

		this.type = p.type ||
			type_enum.includes(this.getAttribute('type') as any) && this.getAttribute('type') as IOption['type'] ||
			'never';

		this.style.cssText = `display: grid; align-items: center; justify-items: center;`;
		root.innerHTML = `<input class="code" type="text"/>`;

		this.$code = root.querySelector('.code')!;

		this.$code.addEventListener('input', e => this.evaluted = null);
	}

	public static get observedAttributes() {
		return ['value'];
	}

	public attributeChangedCallback(name: string, oldValue: string, newValue: string) {
		if(oldValue === newValue) return;

		if(name === 'value') this.$code.value = this.value;
	}


	public evalute(): void {
		let value = this.value;
		let env = new NameSpace();

		if(this.type === 'math') {
			//@ts-ignore
			for(const id of Object.getOwnPropertyNames(Math)) env[id] = Math[id];

			value = `return +(${value || '0'})`;
		}

		this.evaluted = codeShell(value, env, { source: 'HTMLCodeSpaceElement' });
	}

	public execute(api: any): any {
		if(!this.evaluted) throw new Error('not evaluted');

		const r = this.evaluted.call(api);

		this['@execute'].emit();

		return r;
	}

	public run(): any {
		if(!this.evaluted) this.evalute();
		return this.execute({});
	}
}


customElements.define('code-space', HTMLCodeSpaceElement);
