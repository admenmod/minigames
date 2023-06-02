import { Vector2 } from '@ver/Vector2';
import { EventDispatcher } from '@ver/events';


const Mineral = {
	SPACE: 0,
	ONE: 1,
	TWO: 2
} as const;

type Mineral = typeof Mineral[keyof typeof Mineral];


class MineralObject {
	constructor(
		public position: Vector2
	) {}
}


class MineralMap {
	constructor(
		public data: Mineral[][]
	) {}

	public search(mineral: Mineral): MineralObject[] {
		const arr: MineralObject[] = [];

		for(let y = 0; y < this.data.length; y++) {
			for(let x = 0; x < this.data[y].length; x++) {
				if(this.data[y][x] === mineral) {
					arr.push(new MineralObject(new Vector2(x, y)));
				}
			}
		}

		return arr;
	}
}


class GameAPI extends EventDispatcher {
	constructor() {
		super();
	}

	scan(): MineralMap {
		return new MineralMap([
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 1, 0],
			[0, 0, 0, 0, 0],
			[0, 0, 0, 0, 0]
		]);
	}
}


class File {
	public data: string;

	constructor(data: string) {
		this.data = data;
	}

	public read(): string { return this.data; }
}


const env = {
	console, Math,

	Game: new GameAPI(),
	Mineral: {
		ONE: 1
	}
};


export class Computer extends EventDispatcher {
	public files: { [K: string]: File } = {};

	constructor(firmware: string) {
		super();

		this.files['main'] = new File(firmware);
	}

	public run() {
		const code = this.files['main'].read();
		codeShell(code, env, { source: 'main' }).call({});
	}
}
