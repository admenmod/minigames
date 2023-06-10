import {
	loadFile, FileSystem, Computer, generateFs,
	FileSystemNativeModule, SystemSignalsNativeModule, LocationNativeModule
} from './core';

import { Node2D } from '@/scenes/nodes/Node2D';


export class CargoSpace {
	constructor(public size: number) {}
}


export class BaseCore extends Node2D {
	public computer!: Computer;
	public programm!: string;


	public cargospace = new CargoSpace(10000);


	protected async _init(): Promise<void> {
		await super._init();

		const sdcard = generateFs();
		sdcard.writeFile('/main.js', this.programm);

		this.computer = new Computer(sdcard, '/main.js');
		this.computer.addNativeModule('fs', o => new FileSystemNativeModule(o.fs));
		this.computer.addNativeModule('ss', o => new SystemSignalsNativeModule(o.ss));

		this.computer.addNativeModule('location', o => new LocationNativeModule());


		this.computer.ss.onrespons = async (req: string): Promise<any> => {
			const split = req.split(/\s+/);

			if(split[0] === 'cargo') {
				if(split[1] === 'get') {
					if(split[2] === 'size') return this.cargospace.size;
				}
			}
		};
	}


	public run(): void { this.computer.run(); }
}


export class World extends Node2D {
	public objects: Node2D[] = [];


	public add(o: Node2D): void {
		this.objects.push(o);
	}

	protected async _init(): Promise<void> {
		await Promise.all(this.objects.map(i => i.init()));
	}
}


(async () => {
	await World.load();
	await BaseCore.load();

	const world = new World();

	const basecore1 = new BaseCore();
	const basecore2 = new BaseCore();
	basecore2.programm = basecore1.programm = await loadFile('server.js');


	world.add(basecore1);
	world.add(basecore2);

	await world.init();

	basecore1.run();
	basecore2.run();
})();
