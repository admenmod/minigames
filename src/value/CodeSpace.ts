import { Event, EventDispatcher } from '@ver/events';
import { CodeBlock } from './CodeBlock';


export class CodeSpace extends EventDispatcher {
	public '@destroy' = new Event<CodeSpace, []>(this);

	public '@evalute' = new Event<CodeSpace, []>(this);
	public '@execute' = new Event<CodeSpace, []>(this);


	public items: CodeBlock[] = [];


	public evalute(): void {
		for(const i of this.items) i.evalute();

		this['@evalute'].emit();
	}

	public execute(): void {
		for(const i of this.items) i.execute();

		this['@execute'].emit();
	}

	public run(): void {
		for(const i of this.items) i.run();
	}


	public destroy(): void {
		for(const i of this.items) i.destroy();

		this['@destroy'].emit();

		this.events_off(true);
	}
}
