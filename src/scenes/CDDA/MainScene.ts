import { Vector2 } from '@ver/Vector2';
import { Event } from '@ver/events';
import type { Viewport } from '@ver/Viewport';

import { MapParser } from '@ver/MapParser';
import { KeyboardInputInterceptor } from '@ver/KeyboardInputInterceptor';
import { KeymapperOfActions, MappingsMode } from '@ver/KeymapperOfActions';

import { Node } from '@/scenes/Node';
import { Node2D } from '@/scenes/nodes/Node2D';
import { TileMap } from '@/scenes/nodes/TileMap';
import { Popup, PopupContainer } from '@/scenes/nodes/Popup';
import { World } from './World';
import { NodeCell } from './NodeCell';
import { Player } from './Player';
import { Apple } from './Apple';

import { GridMap } from '@/scenes/gui/GridMap';
import { SystemInfo } from '@/scenes/gui/SystemInfo';
import { touches, canvas, gm } from '@/global';

import { TextNode } from '@/scenes/gui/TextNode';


export class MainScene extends Node2D {
	private keymapperOfActions!: KeymapperOfActions;
	private normal_mode = new MappingsMode('normal');


	public TREE() { return {
		GridMap,
		World, TileMap, Player, PopupContainer,

		Apple1: Apple,
		Apple2: Apple,
		Apple3: Apple,
		Apple4: Apple,
		Apple5: Apple,

		textdata: TextNode,
		texthelp: TextNode,

		SystemInfo
	}}

	public static map: MapParser.Map;

	protected static async _load(scene: typeof this): Promise<void> {
		await Promise.all([
			super._load(scene),

			NodeCell.load(),
			Popup.load()
		]);

		this.map = await MapParser.instance().loadMap('maps/test-map.json');
	}


	// aliases
	public get $gridMap() { return this.get('GridMap'); }

	public get $world() { return this.get('World'); }
	public get $tilemap() { return this.get('TileMap'); }
	public get $player() { return this.get('Player'); }
	public get $popups() { return this.get('PopupContainer'); }

	public get $apple1() { return this.get('Apple1'); }
	public get $apple2() { return this.get('Apple2'); }
	public get $apple3() { return this.get('Apple3'); }
	public get $apple4() { return this.get('Apple4'); }
	public get $apple5() { return this.get('Apple5'); }

	public get $textdata() { return this.get('textdata'); }
	public get $texthelp() { return this.get('texthelp'); }


	public async _init(this: MainScene): Promise<void> {
		this.get('TileMap')!.map = MainScene.map;


		const hiddenInput = document.createElement('input');
		hiddenInput.style.position = 'fixed';
		hiddenInput.style.top = '-1000px';
		canvas.append(hiddenInput);

		const keyboardInputInterceptor = new KeyboardInputInterceptor(hiddenInput);
		keyboardInputInterceptor.init();
		canvas.addEventListener('click', () => keyboardInputInterceptor.focus());

		this.$world.size.set(20, 20);
		this.$world.date.setHours(6);

		this.$player.cellpos.set(8, 8);

		this.$apple1.cellpos.set(6, 6);
		this.$apple2.cellpos.set(7, 6);
		this.$apple3.cellpos.set(6, 7);
		this.$apple4.cellpos.set(5, 6);
		this.$apple5.cellpos.set(6, 5);


		this.keymapperOfActions = new KeymapperOfActions(this.normal_mode);
		this.keymapperOfActions.init(keyboardInputInterceptor);
		this.keymapperOfActions.enable();


		const updateOnResize = (size: Vector2) => {
			this.$gridMap.size.set(size);
		};

		updateOnResize(gm.viewport.size);

		gm.on('resize', updateOnResize);


		await super._init();


		this.$world.addObject(this.$player);

		this.$world.addObject(this.$apple1);
		this.$world.addObject(this.$apple2);
		this.$world.addObject(this.$apple3);
		this.$world.addObject(this.$apple4);
		this.$world.addObject(this.$apple5);


		const tilemap = this.$tilemap.map!;
		console.log(tilemap);


		const layer = tilemap.layers[0];
		const oInits: Promise<any>[] = [];
		if(layer.type === 'tilelayer') {
			for(let i = 0; i < layer.data.length; i++) {
				if(layer.data[i] === 0) continue;

				const x = i % layer.width;
				const y = Math.floor(i / layer.width);

				const o = new NodeCell();
				o.isPickupable = false;

				oInits.push(o.init().then(() => {
					o.cellpos.set(x, y);
					this.$world.addObject(o);
				}));
			}
		}

		await Promise.all([oInits]);
	}

	protected _ready(this: MainScene): void {
		this.$popups.zIndex += 100;

		this.$textdata.color = '#99ee22';
		this.$textdata.position.set(-200, 100);

		this.$texthelp.color = '#779933';
		this.$texthelp.position.set(400, 40);
		this.$texthelp.text =
`w + Arrow - взять в руки
d + Arrow - выбросить предмет в руках
i + i - open inventory
a + a - default action

dblclick - полноэкранный режим
`


		const onmappings: KeymapperOfActions.Action = ({ mapping }) => {
			let text: string = '';

			switch(mapping.join('|')) {
				case 'i|i': text = 'open inventory';
					break;
				case 'Ctrl-l': text = 'list l';
					break;
				case 'Ctrl- ': text = 'list space';
					break;
				case 'a|a': text = 'default action';
					break;
				case 'a|s': text = 'save action';
					break;
				case '\\|h': text = 'Hi';
					break;
				case '\\|h|s': text = 'Hello';
					break;
				default: text = 'Забыл обработать :)'
					break;
			}


			this.$popups.createPopap(text, this.$player.globalPosition.add(0, -1.5));
		};

		this.normal_mode.register(['i', 'i'], onmappings);

		this.normal_mode.register(['Ctrl- '], onmappings);
		this.normal_mode.register(['Ctrl-l'], onmappings);

		this.normal_mode.register(['\\', 'h'], onmappings);
		this.normal_mode.register(['\\', 'h', 's'], onmappings);
		this.normal_mode.register(['a', 's'], onmappings);
		this.normal_mode.register(['a', 'a'], onmappings);

		this.normal_mode.register(['ArrowUp'], () => this.$player.move(Vector2.UP));
		this.normal_mode.register(['ArrowDown'], () => this.$player.move(Vector2.DOWN));
		this.normal_mode.register(['ArrowLeft'], () => this.$player.move(Vector2.LEFT));
		this.normal_mode.register(['ArrowRight'], () => this.$player.move(Vector2.RIGHT));


		const map_pikeup: KeymapperOfActions.Action = mapping => {
			const dir = new Vector2();

			if(mapping.mapping[1] === 'ArrowUp') dir.set(0, -1);
			else if(mapping.mapping[1] === 'ArrowDown') dir.set(0, 1);
			else if(mapping.mapping[1] === 'ArrowLeft') dir.set(-1, 0);
			else if(mapping.mapping[1] === 'ArrowRight') dir.set(1, 0);

			const o = this.$world.getObjectCellUp(this.$player.cellpos.buf().add(dir));
			if(o) this.$player.tryPickup(o);
		};

		this.normal_mode.register(['w', 'ArrowUp'], map_pikeup);
		this.normal_mode.register(['w', 'ArrowDown'], map_pikeup);
		this.normal_mode.register(['w', 'ArrowLeft'], map_pikeup);
		this.normal_mode.register(['w', 'ArrowRight'], map_pikeup);


		const map_put: KeymapperOfActions.Action = mapping => {
			const dir = new Vector2();

			if(mapping.mapping[1] === 'ArrowUp') dir.set(0, -1);
			else if(mapping.mapping[1] === 'ArrowDown') dir.set(0, 1);
			else if(mapping.mapping[1] === 'ArrowLeft') dir.set(-1, 0);
			else if(mapping.mapping[1] === 'ArrowRight') dir.set(1, 0);

			this.$player.tryPutfromHandsTo(dir);
		};

		this.normal_mode.register(['d', 'ArrowUp'], map_put);
		this.normal_mode.register(['d', 'ArrowDown'], map_put);
		this.normal_mode.register(['d', 'ArrowLeft'], map_put);
		this.normal_mode.register(['d', 'ArrowRight'], map_put);
	}

	protected _process(this: MainScene, dt: number): void {
		this.keymapperOfActions.update(dt);

		gm.viewport.position.moveTime(this.$player.globalPosition, 10);
		// gm.camera.process(dt, touches);

		this.$textdata.text = 'DATE: '+this.$world.date.getTimeString();
	}

	protected _draw(this: MainScene, { ctx, size }: Viewport): void {
		ctx.resetTransform();

		const center = Vector2.ZERO;

		let a = 30;

		ctx.beginPath();
		ctx.strokeStyle = '#ffff00';
		ctx.moveTo(center.x, center.y-a);
		ctx.lineTo(center.x, center.y+a);
		ctx.moveTo(center.x-a, center.y);
		ctx.lineTo(center.x+a, center.y);
		ctx.stroke();

		ctx.fillStyle = '#eeeeee';
		// ctx.font = '20px Arial';
		// ctx.fillText('timeout: ' + this.keymapperOfActions.timeout.toFixed(0), 10, 120);
		ctx.font = '15px Arial';
		ctx.fillText('date: '+this.$world.date.getTimeString(), 10, 140);


		ctx.fillStyle = '#eeeeee';
		ctx.font = '15px arkhip';
		ctx.fillText(this.keymapperOfActions.acc.join(''), 10, size.y-10);
	}
}
