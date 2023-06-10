import { Vector2, vec2 } from '@ver/Vector2';
import { Event, EventDispatcher } from '@ver/events';
import { NameSpace } from '@ver/helpers';
import { codeShell } from '@ver/codeShell';
import type { Viewport } from '@ver/Viewport';

import { PhysicsBox2DItem } from '@/scenes/PhysicsBox2DItem';
import { b2Shapes } from '@/modules/Box2DWrapper';


const loadFile = (src: string) => fetch(`${location.origin}/user-code/${src}`).then(data => data.text());

const execute = async (code: string, env: any, source: string) => {
	const module = {
		exports: {}
	};

	// console.log('input: ', code);
	// code = ts.transpile(code, {
	// 	strict: true,
	// 	noEmit: true,
	// 	allowJs: true,
	// 	sourceMap: true,
	// 	target: ts.ScriptTarget.ESNext,
	// 	module: ts.ModuleKind.CommonJS,
	// 	moduleResolution: ts.ModuleResolutionKind.NodeNext
	// });
	// console.log('output: ', code);

	await codeShell<(module: { exports: {} }) => Promise<void>>(code, env, {
		arguments: 'module',
		async: true,
		source: source
	}).call(null, module);

	return module.exports || module;
};


abstract class Component<T> extends EventDispatcher {
	constructor(protected o: T) {
		super();
	}

	public abstract api: new (o: this) => any;
}

class MovementComponent extends Component<Player> {
	public speed: number = 1;

	public isMove: boolean = false;

	private _target = new Vector2();
	public get target() { return this._target; }
	public set target(v) { this._target.set(this.o.position.buf().add(v)); }


	public update(dt: number): void {
		this.o.position.moveTo(this._target, dt / 16 * this.speed);
	}


	public api = class Movement extends EventDispatcher {
		#o: MovementComponent;
		constructor(o: MovementComponent) {
			super();
			this.#o = o;
		}

		move(v?: Vector2) {
			this.#o.isMove = true;
			if(v) this.#o.target = v;
		}

		stop() { this.#o.isMove = false; }
	}
}

declare namespace ScannerComponent {
	export type DetectEvent = {
		type: number;
		position: Vector2;
	};
}
class ScannerComponent extends Component<Player> {
	public '@detect' = new Event<ScannerComponent, []>(this);

	public ondetect: ((e: ScannerComponent.DetectEvent) => any) | null = null;

	public api = class Scanner extends EventDispatcher {
		public '@detect' = new Event<Scanner, [e: ScannerComponent.DetectEvent]>(this);

		#o: ScannerComponent;
		constructor(o: ScannerComponent) {
			super();
			this.#o = o;

			o.ondetect = (e: any) => this['@detect'].emit(e);
		}
	}
}


class FileSystem extends EventDispatcher {
	protected tree: any = {};

	public readFile(src: string): string {
		return this.tree[src];
	}
	public writeFile(src: string, data: string): void {
		this.tree[src] = data;
	}
}


class Process extends EventDispatcher {
	public uuid: string = `${Math.random()}${Math.random()}`;

	public env: any;
	public module: any;

	constructor(public fs: FileSystem, public code: string, public native: (src: string) => any) {
		super();

		const env = this.env = new NameSpace();
		env.console = console;

		env.require = async (src: string) => {
			let module = null;

			const n = native(src);
			const code = fs.readFile(src);

			if(n) module = n;
			if(code) module = await execute(code, env, src);

			if(!module) return void 0;

			return env.require.cache[src] || (env.require.cache[src] = module);
		};
		env.require.cache = {};

		this.module = execute(code, env, 'main');
	}
}


class Computer extends EventDispatcher {
	public fs = new FileSystem();


	constructor(main_s: string, public native: (src: string) => any) {
		super();

		this.fs.writeFile('main.js', main_s);
	}

	public run(): Process {
		return new Process(this.fs, this.fs.readFile('main.js'), this.native);
	}
}


export class Player extends PhysicsBox2DItem {
	public computer!: Computer;

	protected _components = {
		movement: new MovementComponent(this),
		scanner: new ScannerComponent(this)
	};


	public size = new Vector2(20, 20);

	protected async _init(): Promise<void> {
		await super._init();

		this.computer = new Computer(
			await fetch('user-code/main.js').then(data => data.text()),
			id => (id = id.replace(/^api:/, ''), (this._components as any)[id] && new (this._components as any)[id].api(this))
		);
		this.computer.run();


		this.b2bodyDef.type = 2;
		this.b2bodyDef.allowSleep = false;

		const shape = new b2Shapes.b2PolygonShape();
		shape.SetAsBox(this.size.x/this.pixelDensity/2, this.size.y/this.pixelDensity/2);

		this.b2fixtureDef.shape = shape;
	}


	protected _process(dt: number): void {
		this._components.movement.update(dt);

		this.b2_velosity.Multiply(0.995);
		this.b2_angularVelocity *= 0.97;
	}


	protected _draw({ ctx }: Viewport) {
		ctx.fillStyle = '#11ee11';
		ctx.fillRect(-this.size.x/2, -this.size.y/2, this.size.x, this.size.y);
	}
}
