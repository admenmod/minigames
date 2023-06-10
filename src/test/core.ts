import { Vector2, vec2 } from '@ver/Vector2';
import { Event, EventAsFunction, EventDispatcher, Notification } from '@ver/events';
import { codeShell } from '@ver/codeShell';
import { Path } from '@ver/Path';
import { List } from '@ver/List';
import { random, JSONcopy, roundLoop, NameSpace, SymbolSpace, prototype_chain, constructor_chain } from '@ver/helpers';


export const loadFile = (src: string) => fetch(`${location.origin}/user-code/${src}`).then(data => data.text());


export declare namespace FileSystem {
	export type File = InstanceType<typeof FileSystem.File>;
	export type Directory = InstanceType<typeof FileSystem.Directory>;
}
export class FileSystem extends EventDispatcher {
	public static File = class File {
		public readonly type = 'file';

		public size: number;
		public rights = {
			native: false,
			rootonly_write: false
		};

		constructor(public data: string) {
			this.size = data.length;
		}

		public read() { return this.data; }

		public write(data: string) {
			this.data = data;
			this.size = this.data.length;
		}
	}

	public static Directory = class Directory {
		public readonly type = 'directory';

		public tree: Record<string, FileSystem.File | FileSystem.Directory> = new NameSpace();

		public get(name: string): FileSystem.File | FileSystem.Directory | null {
			if(~name.search('/')) throw new Error('invalid name');

			return this.tree[name] || null;
		}

		public set(name: string, file: FileSystem.File): typeof file;
		public set(name: string, file: FileSystem.Directory): typeof file;
		public set(name: string, file: FileSystem.File | FileSystem.Directory): typeof file {
			if(~name.search('/')) throw new Error('invalid name');

			if(file.type === 'file') {
				this.tree[name] = file;
			} else if(file.type === 'directory') {
				this.tree[name] = file;
			} else throw new Error('invalid file');

			return file;
		}

		public del(name: string): void {
			if(~name.search('/')) throw new Error('invalid name');

			delete this.tree[name];
		}

		public read(): string[] {
			return Object.keys(this.tree);
		}
	}


	protected root: FileSystem.Directory = new FileSystem.Directory();

	public has(src: Path): boolean {
		if(!Path.isAbsolute(src)) throw new Error('path is not absolute');

		const path = Path.toArray(Path.normalize(src)).filter(Boolean);
		let t: FileSystem.Directory | FileSystem.File | null = this.root;

		for(let i = 0; i < path.length; i++) {
			if(i !== path.length-1) {
				if(!t || t.type === 'file') return false;
				t = t.get(path[i]);
			}
		}

		return true;
	}

	public get(src: Path): FileSystem.File | FileSystem.Directory {
		if(!Path.isAbsolute(src)) throw new Error('path is not absolute');

		const { filename, dir } = Path.file(Path.normalize(src));
		const path = Path.toArray(dir).filter(Boolean);
		let t: FileSystem.Directory | FileSystem.File | null = this.root;

		for(let i = 0; i < path.length; i++) {
			if(!t || t.type === 'file') throw new Error('invalid path');

			t = t.get(path[i]);
		}

		if(t!.type !== 'directory') throw new Error('invalid path');
		return t!.get(filename)!;
	}

	public readDir(src: Path): string[] {
		if(!Path.isAbsolute(src)) throw new Error('path is not absolute');

		const path = Path.toArray(Path.normalize(src)).filter(Boolean);
		let t: FileSystem.Directory | FileSystem.File | null = this.root;

		for(let i = 0; i < path.length; i++) {
			if(!t || t.type === 'file') throw new Error('invalid path');

			t = t.get(path[i]);
		}

		if(t!.type !== 'directory') throw new Error('this is not directory');

		return (t as FileSystem.Directory).read();
	}

	public makeDir(src: Path) {
		if(!Path.isAbsolute(src)) throw new Error('path is not absolute');

		const { filename, dir } = Path.file(Path.normalize(src));
		const path = Path.toArray(dir).filter(Boolean);
		let t: FileSystem.Directory | FileSystem.File | null = this.root;

		for(let i = 0; i < path.length; i++) {
			if(!t || t.type === 'file') throw new Error('invalid path');

			t = t.get(path[i]);
		}

		if(!(t as FileSystem.Directory).get(filename)) {
			return (t as FileSystem.Directory).set(filename, new FileSystem.Directory());
		} throw new Error('this is not file');
	}

	public readFile(src: Path): string {
		if(!Path.isAbsolute(src)) throw new Error('path is not absolute');

		const { filename, dir } = Path.file(Path.normalize(src));
		const path = Path.toArray(dir).filter(Boolean);
		let t: FileSystem.Directory | FileSystem.File | null = this.root;

		for(let i = 0; i < path.length; i++) {
			if(!t || t.type === 'file') throw new Error('invalid path');

			t = t.get(path[i]);
		}

		const file = (t as FileSystem.Directory).get(filename);
		if(!file || file!.type !== 'file') throw new Error('this is not file');

		return file.read();
	}

	public writeFile(src: Path, data: string, rights = {
		root_write: false
	}): void {
		if(!Path.isAbsolute(src)) throw new Error('path is not absolute');

		const { filename, dir } = Path.file(Path.normalize(src));
		const path = Path.toArray(dir).filter(Boolean);
		let t: FileSystem.Directory | FileSystem.File | null = this.root;

		for(let i = 0; i < path.length; i++) {
			if(!t || t.type === 'file') throw new Error('invalid path');

			t = t.get(path[i]);
		}

		const file = (t as FileSystem.Directory).get(filename) || (t as FileSystem.Directory).set(filename, new FileSystem.File(data));
		if(file!.type !== 'file') throw new Error('this is not file');

		if(file.rights.rootonly_write && !rights.root_write) throw new Error('not have permission to write this file');

		return file.write(data);
	}

	public getRightsFile(src: Path) {
		const file = this.get(src);
		if(file.type !== 'file') throw new Error('this is not fils');

		return file.rights;
	}
}

export class SystemSignals {
	public signals: Record<PropertyKey, Event<null, [id: PropertyKey]>> = new NameSpace();

	public onrespons: (req: string) => Promise<any> = async () => {};

	public on(id: PropertyKey, fn: (id: PropertyKey) => any): void {
		if(!this.signals[id]) this.signals[id] = new Event(null);
		this.signals[id].on(fn);
	}

	public off(id: PropertyKey, fn?: (id: PropertyKey) => any): void {
		if(!this.signals[id]) return;

		this.signals[id].off(fn);
	}

	public emit(id: PropertyKey): void {
		this.signals[id]?.emit(id);
	}

	public request(req: string): Promise<any> {
		return this.onrespons(req);
	}
}


export const generateFs = (fs = new FileSystem()) => {
	const $dev = fs.makeDir('/dev/');

	const $List = new FileSystem.File(`module.exports.List = ${List.toString()}`);
	$List.rights.native = true;
	$List.rights.rootonly_write = true;
	$dev.set('List', $List);

	const $Path = new FileSystem.File(`module.exports.Path = ${Path.toString()}`);
	$Path.rights.native = true;
	$Path.rights.rootonly_write = true;
	$dev.set('Path', $Path);

	const $Vector2 = new FileSystem.File(
`module.exports.Vector2 = ${Vector2.toString()}
module.exports.vec2 = ${vec2.toString()}`);
	$Vector2.rights.native = true;
	$Vector2.rights.rootonly_write = true;
	$dev.set('path', $Vector2);

	const $events = new FileSystem.File(
`module.exports.EventAsFunction = ${EventAsFunction.toString()}
module.exports.Event = ${Event.toString()}
module.exports.Notification = ${Notification.toString()}
module.exports.EventDispatcher = ${EventDispatcher.toString()}`);
	$events.rights.native = true;
	$events.rights.rootonly_write = true;
	$dev.set('events', $events);

	const $helpers = new FileSystem.File(
`module.exports.random = ${random.toString()}
module.exports.JSONcopy = ${JSONcopy.toString()}
module.exports.roundLoop = ${roundLoop.toString()}
module.exports.NameSpace = ${NameSpace.toString()}
module.exports.SymbolSpace = ${SymbolSpace.toString()}
module.exports.prototype_chain = ${prototype_chain.toString()}
module.exports.constructor_chain = ${constructor_chain.toString()}`);
	$helpers.rights.native = true;
	$helpers.rights.rootonly_write = true;
	$dev.set('helpers', $helpers);

	return fs;
};


export class Process extends EventDispatcher {
	public uuid: string = `${Math.random()}${Math.random()}`;

	public cwd: Path;

	public env: any;
	public module: any;

	#permission: string[] = [];
	constructor(public fs: FileSystem, path: Path, public native: (src: string) => any) {
		super();

		if(!Path.isAbsolute(path)) throw new Error('path is not absolute');

		path = Path.normalize(path);

		this.cwd = Path.file(path).dir;

		const cache: Record<string, any> = {};

		const execute = async (code: string, env: any, path: Path, isNative: boolean = false, ctx?: object) => {
			const module = {
				filename: '',
				exports: {}
			};

			const { dir: __dirname, filename: __filename } = Path.file(path);

			const require = async (src: string) => {
				// if(!Path.isRelative(src)) throw new Error('path is not relative');

				if(Path.isDefault(src)) src = `/dev/${src}`;

				let module = null;
				const path = Path.relative(src, __dirname);

				if(cache[path]) return cache[path];

				const code = fs.readFile(path);
				const rights = fs.getRightsFile(path);
				// BUG
				if(code) module = await execute(code, env, path, rights.native, this);
				if(!module) return void 0;

				return cache[path] = module;
			};
			require.cache = cache;

			await codeShell<(
				__dirname: string,
				__filename: string,
				module: { exports: {} },
				require: (src: string) => Promise<any>
			) => Promise<void>>(code, env, {
				arguments: '__dirname, __filename, module, require',
				async: true,
				insulate: !isNative,
				source: path.toString()
			}).call(ctx || null, __dirname, __filename, module, require);

			return module.exports || module;
		};


		const env = this.env = new NameSpace();
		env.console = console;

		env.native = {
			require: (id: string) => {
				if(env.native.require.cache[id]) return env.native.require.cache[id];

				let module = native(id) || null;
				if(!module) return void 0;

				return env.native.require.cache[id] = module;
			}
		};
		env.native.require.cache = {};

		execute(fs.readFile(path), env, path, false).then(module => this.module = module);
	}
}


export class Computer extends EventDispatcher {
	public nativeModules: Record<string, (o: this) => any> = {};

	public ss = new SystemSignals();

	constructor(public fs: FileSystem, public main_src: string) {
		super();

		if(!Path.isAbsolute(this.main_src)) throw new Error('path is not absolute');
	}

	public addNativeModule(id: string, module: (o: this) => any) {
		this.nativeModules[id] = module;
	}

	public run(): Process {
		return new Process(this.fs, this.main_src, (id: string) => this.nativeModules[id]?.(this));
	}
}


export class FileSystemNativeModule {
	readFile = (src: Path) => this.#fs.readFile(src);
	writeFile = (src: Path, data: string) => this.#fs.writeFile(src, data, { root_write: false });

	readDir = (src: Path) => this.#fs.readDir(src);


	#fs: FileSystem;
	constructor(fs: FileSystem) { this.#fs = fs; }
}

export class SystemSignalsNativeModule {
	getSignalsId = () => Object.keys(this.#ss.signals);
	emit = (id: PropertyKey) => this.#ss.emit(id);
	request = (id: string) => this.#ss.request(id);

	#ss: Computer['ss'];
	constructor(ss: Computer['ss']) { this.#ss = ss; }
}

export class LocationNativeModule {
	position = new Vector2();
}
