import { Event, EventDispatcher } from '@ver/events';
import { codeShell } from '@ver/codeShell';
import { Value, Stream } from './Value';
import { type Fn, NameSpace } from '@ver/helpers';


export class CodeBlock<This = any, Args extends any[] = any[], Return = any> extends EventDispatcher {
	public '@evalute' = new Event<CodeBlock<This, Args, Return>, []>(this);
	public '@execute' = new Event<CodeBlock<This, Args, Return>, [api: This]>(this);
	public '@stdin' = new Event<CodeBlock<This, Args, Return>, [data: string]>(this);
	public '@stdout' = new Event<CodeBlock<This, Args, Return>, [data: string]>(this);


	protected _value: any = null;
	public get value() { return this._value; }
	public set value(v) { this._value = v }

	protected _code: string = '';
	public get code() { return this._code; }
	public set code(v) { this._code = v; }


	public stdin = new Stream();
	public stdout = new Stream();


	protected uuid: string;
	protected api: This;
	protected env = new NameSpace();
	protected evaluted: Fn<This, Args, Return> | null = null;

	constructor() {
		super();

		const self = this;
		const o = new EventDispatcher();

		this.uuid = `${Math.random()}${Math.random()}`;

		this.api = {} as This;

		Object.defineProperty(this.env, 'value', {
			get: () => self._value,
			set: (v) => self._value = v,
			enumerable: true, configurable: true
		});

		this.env.stdin = self.stdin;
		this.env.stdout = self.stdout;

		this.env.o = o;

		this.env.api = this.api;

		this.env.console = console;
	}


	public evalute(): void {
		this.evaluted = codeShell<Fn<This, Args, Return>>(this._code, this.env, {
			source: `codeblock#${this.uuid}`
		});
	}

	public execute(api: This = this.api, ...args: Args): Return {
		if(!this.evaluted) throw new Error('not evaluted');

		const r = this.evaluted.apply(api, args);

		this['@execute'].emit(api);

		return r;
	}

	public run(api: This = this.api, ...args: Args): any {
		this.evalute();
		return this.execute(api, ...args);
	}


	public '>>'(cobl: CodeBlock): CodeBlock { this.stdout.pipe(cobl.stdin); return cobl; }
	public '<<'(cobl: CodeBlock): CodeBlock { cobl.stdout.pipe(this.stdin); return cobl; }

	public destroy(): void {
		this.stdin.events_off(true);
		this.stdout.events_off(true);

		this.events_off(true);
	}
}
