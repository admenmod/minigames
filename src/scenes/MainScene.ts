import { Vector2 } from '@ver/Vector2';
import { Event } from '@ver/events';
import type { Viewport } from '@ver/Viewport';

import { Node2D } from '@/scenes/nodes/Node2D';
import { Button } from '@/scenes/gui/Button';
import { TextNode } from '@/scenes/gui/TextNode';

import { MainScene as DATA_WING_Scene } from './DATA_WING/MainScene';
import { MainScene as GAME_CDDA_Scene } from './CDDA/MainScene';
import { MainScene as Jgame_Scene } from './Jgame/MainScene';

import { gm } from '@/global';


export class MainScene extends Node2D {
	public TREE() { return {
		'DATA_WING': Button,
		'gameCDDA': Button,
		'Jgame': Button
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
		this.getChild('DATA_WING')!.position.add(0, -20);
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

		this.getChild('gameCDDA')!.position.add(0, 20);
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

		this.getChild('Jgame')!.position.add(0, 60);
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
	}

	protected _process(this: MainScene, dt: number): void {
		;
	}

	// protected _draw(viewport: Viewport): void {
	// 	const ctx = viewport.ctx;
	// 	// ctx.resetTransform();
	// 	// ctx.translate(viewport.size.x/2, viewport.size.y/2);
	//
	// 	const center = viewport.size.buf().div(2).add(50, 50);
	// 	const s = new Vector2(10, 10);
	// 	const a1 = viewport.transformFromScreenToViewport(center.buf().add(-s.x, -s.y));
	// 	const a2 = viewport.transformFromScreenToViewport(center.buf().add(+s.x, -s.y));
	// 	const a3 = viewport.transformFromScreenToViewport(center.buf().add(+s.x, +s.y));
	// 	const a4 = viewport.transformFromScreenToViewport(center.buf().add(-s.x, +s.y));
	//
	// 	ctx.beginPath();
	// 	ctx.fillStyle = '#ffff00';
	// 	ctx.moveTo(a1.x, a1.y);
	// 	ctx.lineTo(a2.x, a2.y);
	// 	ctx.lineTo(a3.x, a3.y);
	// 	ctx.lineTo(a4.x, a4.y);
	// 	ctx.fill();
	// }
}
