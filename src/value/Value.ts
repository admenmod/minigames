import { Event, EventDispatcher } from '@ver/events';


export declare namespace Value {
	type Infer<T> = T extends Value<infer V> ? V extends Value ? Infer<V> : V : T;
	type Type<T> = T extends Value<infer V> ? V extends Value ? Infer<V> : V : T;
}


export class Value<T = any> extends EventDispatcher {
	public '@reset' = new Event<Value<T>, [value: T, type: Value['type']]>(this);

	public type: 'value' | 'reference' | 'execute' = 'value';

	public readonly: boolean = true;
	public readonly_link: boolean = true;

	protected _value!: Value.Infer<T>;
	declare public value: Value.Infer<T>;

	constructor(value: T) {
		super();

		this.set(value);
	}

	public ref() {
		;
	}

	public set(value: T): void {
		if(value instanceof Value) {
			this.type = 'reference';

			Object.defineProperty(this, 'value', {
				get: () => value.value,
				set: (v) => !this.readonly && !value.readonly_link && (value.value = v),
				enumerable: true, configurable: true
			});
		} else {
			this.type = 'value';

			Object.defineProperty(this, 'value', {
				get: () => this._value,
				set: (v) => !this.readonly && (this._value = v),
				enumerable: true, configurable: true
			});
		}

		this['@reset'].emit(value, this.type);
	}
}


export class Stream extends EventDispatcher {
	public '@data' = new Event<Stream, [data: string]>(this);
	public ondata: ((data: any) => any) | null = null;

	protected _data: any;

	public read(size?: number): string {
		return this._data || null;
	}

	public write(data: string): void {
		this._data = data;

		this.ondata?.(data);
		this['@data'].emit(data);
	}

	public pipe(stream: Stream): void {
		this['@data'].on(data => stream.write(data));
	}
}



const v1 = new Value(0);
const v2 = new Value(v1);
const v3 = new Value(v2);

v2.set(new Value(9));

v1.set(9);
