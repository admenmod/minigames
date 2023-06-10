import { Vector2 } from '@ver/Vector2';
import { Event } from '@ver/events';
import type { Viewport } from '@ver/Viewport';

import { Node2D } from '@/scenes/nodes/Node2D';
import { Button } from '@/scenes/gui/Button';
import { TextNode } from '@/scenes/gui/TextNode';

import { MainScene as DATA_WING_Scene } from './DATA_WING/MainScene';
import { MainScene as GAME_CDDA_Scene } from './CDDA/MainScene';
import { MainScene as Jgame_Scene } from './Jgame/MainScene';
import { MainScene as Codespace_Scene } from './codespace/MainScene';

import { gm } from '@/global';


export class MainScene extends Node2D {
	public TREE() { return {
		'DATA_WING': Button,
		'gameCDDA': Button,
		'Jgame': Button,
		'codespace': Button
	}}


	public async _init(this: MainScene): Promise<void> {
		this.name = 'Menu';

		const updateOnResize = (size: Vector2) => {
			;
		};

		updateOnResize(gm.screen);

		gm.on('resize', updateOnResize);


		await super._init();
	}

	protected _ready(this: MainScene): void {
		this.getChild('DATA_WING')!.position.set(0, -60);
		this.getChild('DATA_WING')!.text = 'DATA WING';
		this.getChild('DATA_WING')!.on('pressed', async () => {
			const parent = this.parent!;
			parent.removeChild(this.name);

			await DATA_WING_Scene.load();
			const scene = new DATA_WING_Scene();
			await scene.init();

			parent!.addChild(scene);

			this.destroy();
		});

		this.getChild('gameCDDA')!.position.set(0, -20);
		this.getChild('gameCDDA')!.text = 'GAME CDDA';
		this.getChild('gameCDDA')!.on('pressed', async () => {
			const parent = this.parent!;
			parent.removeChild(this.name);

			await GAME_CDDA_Scene.load();
			const scene = new GAME_CDDA_Scene();
			await scene.init();

			parent!.addChild(scene);

			this.destroy();
		});

		this.getChild('Jgame')!.position.set(0, 20);
		this.getChild('Jgame')!.text = 'Jgame';
		this.getChild('Jgame')!.on('pressed', async () => {
			const parent = this.parent!;
			parent.removeChild(this.name);

			await Jgame_Scene.load();
			const scene = new Jgame_Scene();
			await scene.init();

			parent!.addChild(scene);

			this.destroy();
		});

		this.getChild('codespace')!.position.set(0, 60);
		this.getChild('codespace')!.text = 'codespace';
		this.getChild('codespace')!.on('pressed', async () => {
			const parent = this.parent!;
			parent.removeChild(this.name);

			await Codespace_Scene.load();
			const scene = new Codespace_Scene();
			await scene.init();

			parent!.addChild(scene);

			this.destroy();
		});
	}
}
