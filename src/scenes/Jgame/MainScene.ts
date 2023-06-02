import { Vector2 } from '@ver/Vector2';
import type { Viewport } from '@ver/Viewport';

import { Node } from '@/scenes/Node';
import { Node2D } from '@/scenes/nodes/Node2D';
import { PopupContainer } from '@/scenes/nodes/Popup';

import { GridMap } from '@/scenes/gui/GridMap';
import { SystemInfo } from '@/scenes/gui/SystemInfo';

import { Camera2D } from '@/scenes/nodes/Camera2D';
import { Joystick } from '@/scenes/gui/Joystick';
import { Button } from '@/scenes/gui/Button';
import { Box } from './nodes/Box';
import { Car } from './nodes/Car';
import { Tank } from './nodes/Tank';
import { Player } from './nodes/Player';
import { BulletContainer } from './nodes/Bullet';

import { b2Vec2 } from '@/modules/Box2DWrapper';
import { gm } from '@/global';
import type { PhysicsBox2DItem } from '@/scenes/PhysicsBox2DItem';


type ITransport = PhysicsBox2DItem & {
	control(joystickL: Joystick, joystickR?: Joystick): void;
};


export class MainScene extends Node2D {
	public TREE() { return {
		Camera2D,
		GridMap,
		Player,
		Car,
		Tank,

		PopupContainer,
		BulletContainer,
		BigBulletContainer: BulletContainer,

		Box1: Box,
		Box2: Box,
		Box3: Box,
		Box4: Box,

		ButtonAction: Button,
		JoystickL: Joystick,
		JoystickR: Joystick,

		SystemInfo
	}}

	// aliases
	public get $camera() { return this.get('Camera2D'); }

	public get $gridMap() { return this.get('GridMap'); }
	public get $player() { return this.get('Player'); }
	public get $car() { return this.get('Car'); }
	public get $tank() { return this.get('Tank'); }
	public get $popups() { return this.get('PopupContainer'); }
	public get $bullets() { return this.get('BulletContainer'); }
	public get $big_bullets() { return this.get('BigBulletContainer'); }

	public get $btnAction() { return this.get('ButtonAction'); }
	public get $joystickL() { return this.get('JoystickL'); }
	public get $joystickR() { return this.get('JoystickR'); }


	private focused: Node2D | null = null;
	private currentTransport: ITransport | null = null;
	private transports: ITransport[] = [];


	protected async _init(this: MainScene): Promise<void> {
		await super._init();

		this.$camera.viewport = gm.viewport;
		this.$camera.current = true;

		this.$gridMap.tile.set(60);
		this.$gridMap.coordinates = true;

		const size = gm.screen.buf().div(2);
		const cs = 100;
		this.$joystickL.position.set(size.buf().inc(-1, 1).sub(-cs, cs));
		this.$joystickR.position.set(size.buf().sub(cs));

		this.$btnAction.position.add(0, size.y - 30);

		this.get('Box1')!.position.set(100, -270);
		this.get('Box1')!.size.inc(4);


		this.$player.position.set(-100, 150);
		this.$car.position.set(-200, 0);


		this.$player.on('shoot', o => {
			this.$bullets.createItem(
				o.globalPosition.moveAngle(20, o.$head.globalRotation - Math.PI/2).div(o.pixelDensity),
				o.$head.globalRotation - Math.PI/2, 0.1, 2
			);
		});

		this.$tank.on('shoot', o => {
			this.$big_bullets.createItem(
				o.$head.globalPosition.moveAngle(60, o.$head.globalRotation - Math.PI/2).div(o.pixelDensity),
				o.$head.globalRotation - Math.PI/2, 0.3, 5
			);
		});


		const updateOnResize = (size: Vector2) => {
			this.$gridMap.size.set(size).inc(3);
		};
		updateOnResize(gm.screen);
		gm.on('resize', updateOnResize);
	}

	protected _ready(this: MainScene): void {
		this.$camera.zIndex = 100;
		this.$popups.zIndex = 10;

		this.focused = this.$player;

		const moveChild = (o: Node, p: Node) => {
			o.parent!.removeChild(o.name, true);
			p.addChild(o);
		};

		moveChild(this.$btnAction, this.$camera);
		moveChild(this.$joystickL, this.$camera);
		moveChild(this.$joystickR, this.$camera);

		this.transports.push(this.$car, this.$tank);

		const getSortTransport = (d: number) => {
			const arr: ITransport[] = [];

			for(let i = 0; i < this.transports.length; i++) {
				if(this.$player.globalPosition.getDistance(this.transports[i].globalPosition) < d) {
					arr.push(this.transports[i]);
				}
			}

			arr.sort((a, b) => this.$player.globalPosition.getDistance(a.globalPosition)
				-
			this.$player.globalPosition.getDistance(b.globalPosition));

			return arr;
		};

		this.$btnAction.text = 'action';
		this.$btnAction.on('pressed', () => {
			if(!this.currentTransport) {
				const ts = getSortTransport(100);
				if(!ts.length) return;

				this.$player.visible = false;
				this.$player.b2body!.SetActive(false);

				this.currentTransport = ts[0];
				this.focused = this.currentTransport;
			} else {
				this.$player.visible = true;
				this.$player.b2body!.SetActive(true);
				const pos = Vector2.from(this.currentTransport.b2_position).moveAngle(-2, this.currentTransport.globalRotation);
				this.$player.b2body?.SetPosition(new b2Vec2(pos.x, pos.y));

				this.currentTransport = null;
				this.focused = this.$player;
			}
		});
	}

	protected _process(this: MainScene, dt: number): void {
		if(this.focused) {
			this.$camera.position.moveTime(this.focused.globalPosition, 10);
			if(this.focused === this.$tank) {
				this.$camera.rotation += (this.focused.globalRotation - gm.viewport.rotation) / 10;
				// this.$camera.rotation += (this.focused.$head.globalRotation - gm.viewport.rotation) / 10;
			} else this.$camera.rotation += (this.focused.globalRotation - gm.viewport.rotation) / 10;
		}

		if(this.currentTransport === null) {
			this.$player.moveAngle(this.$joystickL);
			this.$player.headMove(this.$joystickR);
		} else {
			this.currentTransport.control(this.$joystickL, this.$joystickR);
		}
	}

	protected _draw({ ctx }: Viewport): void {
		const center = Vector2.ZERO.buf();
		const a = 30;

		ctx.beginPath();
		ctx.strokeStyle = '#ffff00';
		ctx.moveTo(center.x, center.y-a);
		ctx.lineTo(center.x, center.y+a);
		ctx.moveTo(center.x-a, center.y);
		ctx.lineTo(center.x+a, center.y);
		ctx.stroke();

		ctx.resetTransform();

		ctx.beginPath();
		ctx.fillStyle = '#eeeeee';
		ctx.fillText((this.$joystickL.angle / (Math.PI/180)).toFixed(), 20, 70);
	}
}
