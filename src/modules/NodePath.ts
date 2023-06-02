/*
export class Path extends Array {
	private _src!: string;
	public input!: string;

	private _isAbsolute!: boolean;
	private _isRelative!: boolean;
	private _isPassive!: boolean;
	private _isDirectory!: boolean;
	private _isNormalize!: boolean;

	public get isAbsolute(): boolean { return this._isAbsolute; }
	public get isRelative(): boolean { return this._isRelative; }
	public get isPassive(): boolean { return this._isPassive; }
	public get isDirectory(): boolean { return this._isDirectory; }
	public get isNormalize(): boolean { return this._isNormalize; }

	constructor(src: string) {
		super();
		this.src = src;
	}

	public get src(): string { return this._src; }
	public set src(src) {
		this.splice(0, this.length, ...Path.parse(src));

		this._isAbsolute = Path.isAbsolute(src);
		this._isRelative = Path.isRelative(src);
		this._isPassive = Path.isPassive(src);
		this._isDirectory = Path.isDirectory(src);

		this.input = src;
		this._src = this.toSource();

		this._isNormalize = Path.isNormalize(this.src);

		Object.assign(this, Path.file(this));
	}

	toSource() { return Path.toSource(this); }

	normalize() { return Path.normalize(this, true); }

	valueOf() { return this.toSource(); }
	toString() { return this.toSource(); }
	[Symbol.toPrimitive]() { return this.toSource(); }


	static _cache = [];

	static dirExp = /\/+/;
	static fileExp = /\.(?!.*\.)/;

	// NOTE: относительный путь, учет ".../", "..."
	static isAbsolute(src: string) { return src.startsWith('/'); }
	static isRelative(src: string) { return src === '.' || src === '..' || src.startsWith('./') || src.startsWith('../'); }
	static isPassive(src: string) { return !(Path.isAbsolute(src) || Path.isRelative(src)); }
	static isDirectory(src: string) { return src.endsWith('/'); }
	static isNormalize(src: string) { return !Path.parse(src).some((i: string) => i === '.' || i === '..'); }

	static parse(src: string) { return src.split(Path.dirExp).filter(Boolean); }
	static toPath(src: string) { return typeof src === 'string' ? new Path(src) : src; }

	static toSource(path: Path, body = path) {
		return (path.isAbsolute ? '/':'')+body.join('/')+(body.length && path.isDirectory ? '/':'');
	}

	static file(src: string) {
		let path = Path.toPath(src);
		if(path.isDirectory) return null;

		let data = { dirpath: '', filename: '', name: '', exp: '' };

		let arr = [...path];
		data.filename = arr.pop();
		data.dirpath = Path.toSource({
			isAbsolute: path.isAbsolute,
			isDirectory: true
		}, arr);

		let [name, exp] = data.filename.split(Path.fileExp);
		data.name = name;
		data.exp = exp;

		return data;
	}

	static normalize(src, f = typeof src === 'string') {
		let path = Path.toPath(src);
		if(path.isNormalize) return path;

		let arr = [];
		for(let i of path) {
			if(i === '..') arr.pop();
			else if(i === '.') continue;
			else arr.push(i);
		};

		let newsrc = Path.toSource(path, arr);

		if(f) {
			path.src = newsrc;
			return path;
		} else return new Path(newsrc);
	}

//	not forget: host, port, protocol
	static relative(...dirs) {
		let l = dirs.findIndex(src => Path.isAbsolute(src.toString()));
		dirs = dirs.slice(0, ~l ? l+1 : dirs.length).reverse();

		return new Path(Path.toSource({
			isAbsolute: Path.isAbsolute(dirs[0].toString()),
			isDirectory: Path.isDirectory(dirs[dirs.length-1].toString())
		}, dirs));
	}

	static get [Symbol.species]() { return Array; }
};
*/

export class NodePath extends String {
	private _src: string;

	public static readonly dir_expr: RegExp = /\//g;

	// private _isAbsolute: boolean;
	// private _isRelative: boolean;
	// private _isPassive: boolean;
	// private _isDirectory: boolean;

	// public get isAbsolute(): boolean { return this._isAbsolute; }
	// public get isRelative(): boolean { return this._isRelative; }
	// public get isPassive(): boolean { return this._isPassive; }
	// public get isDirectory(): boolean { return this._isDirectory; }

	private _input: string;
	public get input() { return this._input; }

	constructor(src: string) {
		super(src);

		this._input = src;

		const arr: string[] = src.split(NodePath.dir_expr).filter(Boolean);

		this._src = src;

		// return (this as (NodePath & string));
	}

	toString() { return this._src; }
	[Symbol.toPrimitive]() { return this.toString(); }


	public getName(idx: number = 0): string {
		// TODO: доделать
		// idx;
		return this._src;
	}


	public static from(src: string | NodePath): NodePath {
		if(typeof src === 'string') return new NodePath(src);
		if(src instanceof NodePath) return src;

		throw new Error('src is not string or NodePath\n'+src);
	}
}
