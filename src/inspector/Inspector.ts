import { Scene } from '@ver/Scene';
import {Vector2} from '@ver/Vector2';
import { prototype_chain } from '@ver/helpers';


export interface ISceneData {
	src: string;
	name: string;
	owner: string;
	oninit: {
		[K: string]: string;
	}
}


const getExportsData = (scene: Scene) => {
	const data: {
		type: string;
		exports: Record<string, string>;
	}[] = [];

	for(const c of prototype_chain(scene, Scene.prototype, false)) {
		const arr: any = {};

		for(const id of Object.getOwnPropertyNames(c)) {
			if(id.startsWith('%')) {
				let type = 'unknown';
				let value = (scene as any)[id];

				if(typeof value === 'object') type = value.constructor?.name;
				else type = typeof value;

				arr[id.replace(/^%/, '')] = { type, value };
			}
		}

		data.push({
			type: c.constructor.name,
			exports: arr
		});
	}

	return data;
};


const getPropsScene = <T extends Scene>(scene: T): Exports.Of<T> => {
	const props: Exports.Of<T> = {};

	for(const id in scene) {
			console.log(id);
		if(id.startsWith('%')) {
			//@ts-ignore
			props[id] = scene[id];
			console.log(id);
		}
	}

	return props;
};


const setter = (scene: Scene, type: string, value: any) => {
	if(`%${type}` in scene) (scene as any)[`%${type}`] = value;
}


export class Inspector {
	public json(data: ISceneData): string {
		return JSON.stringify(data, null, '\t');
	}

	public saveToLocalStorage(json: string): void {
		window.localStorage.setItem('test_pack', json);
	}

	public loadFromLocalStorage(): void {
		const json = window.localStorage.getItem('test_pack');

		if(!json) throw new Error('not saved');

		console.log(json);
	}

	// public async create(data: {
	// 	src: string;
	// 	name?: string;
	// }) {
	// 	const m = await import(data.src);
	// 	const scenes: string[] = [];
	//
	// 	for(const id in m) {
	// 		if(this.isScene(m[id])) scenes.push(id);
	// 	}
	//
	// 	console.log(scenes);
	//
	// 	let Class: typeof Scene;
	// 	if(scenes.length === 1) Class = m[scenes[0]];
	// 	else throw new Error('one file - one scene');
	//
	//
	// 	await Class.load();
	//
	// 	const scene = new Class();
	// 	if(data.name) scene.name = data.name;
	// 	await scene.init();
	//
	//
	// 	console.log(scene);
	// }


	public create<Class extends typeof Scene>(Class: Class, exports: Exports.Of<InstanceType<Class>>): InstanceType<Class> {
		const scene = new Class() as InstanceType<Class>;
		//@ts-ignore
		for(const id in exports) `%${id}` in scene && (scene[`%${id}`] = exports[id]);

		return scene;
	}


	public save(scene: Scene): string {
		const json = JSON.stringify({
			type: scene.SCENE_TYPE,
			props: getExportsData(scene)
		});

		return json;
	}


	public load(json: string) {
		const data = JSON.parse(json);

		// const scene = ;

		// return scene;
	}
}


declare namespace Exports {
	type types = any;
	type name<T extends string = string> = `%${T}`;

	type ConvertDel<T extends name> = T extends name<infer S> ? S : never;

	type Of<Class extends Scene, K extends keyof Class = keyof Class> = {
		[ID in K as ID extends name ? Class[ID] extends types ? ConvertDel<ID> : never : never]?: Class[ID];
	};
}


export class ScenePack<Class extends typeof Scene> {
	public _json: string;
	public _data: { src: string; name: string; };

	public Class!: Class;

	constructor(src: string, name: string) {
		this._data = { src, name };
		this._json = JSON.stringify(this._data);
	}

	public save(scene: InstanceType<Class>): string {
		const json = JSON.stringify({
			src: this._data.src,
			name: this._data.name,
			type: scene.SCENE_TYPE,
			props: getExportsData(scene)
		});

		return json;
	}

	public async load() {
		const { src, name } = this._data;

		const m = await import(src);
		if(!m[name]) throw new Error('one file - one scene');

		this.Class = m[name];

		await this.Class.load();
	}


	public prefabFrom(json: string) {
		//@ts-ignore
		const { src, name, props } = JSON.parse(json);

		const exports: any = {};

		for(const id in props) {
			const { type, value } = props[id];

			if(type === 'string') exports[id] = value;
			else if(type === 'number') exports[id] = +value;
			else if(type === 'Vector2') exports[id] = Vector2.from(value);
		}

		return this.prefab(exports);
	}

	public prefab(props: Exports.Of<InstanceType<Class>>) {
		if(!this.Class) throw new Error('not loaded');

		return () => {
			const scene = new this.Class() as InstanceType<Class>;
			for(const id in props) setter(scene, id, (props as any)[id]);
			return scene;
		};
	}
}
function prototypes_chain(scene: Scene, prototype: Scene, arg2: boolean) {
	throw new Error('Function not implemented.');
}

