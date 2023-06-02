import { Vector2 } from '@ver/Vector2';
import type { Viewport } from '@ver/Viewport';

import { PhysicsBox2DItem } from '@/scenes/PhysicsBox2DItem';

import { b2Shapes, b2Vec2 } from '@/modules/Box2DWrapper';


export class Player extends PhysicsBox2DItem {
	public size = new Vector2(20, 20);

	public TREE() { return {
		// Sprite
	}}

	protected async _init(): Promise<void> {
		await super._init();

		this.b2bodyDef.type = 2;
		this.b2bodyDef.allowSleep = false;

		const shape = new b2Shapes.b2CircleShape();
		shape.SetRadius(this.size.y/this.pixelDensity/2);

		this.b2fixtureDef.shape = shape;
	}

	protected _process(dt: number): void {
		this.b2_angularVelocity *= 0.95;
		this.b2_velosity.Multiply(0.99);
	}

	protected _draw({ ctx }: Viewport) {
		const c = this.size.x;

		ctx.fillStyle = '#ee1122';
		ctx.beginPath();
		ctx.moveTo(0, 0 - c/2);
		ctx.lineTo(0 + c/2, 0 + c);
		ctx.lineTo(0, 0 + c/2);
		ctx.lineTo(0 - c/2, 0 + c);
		ctx.closePath();
		ctx.fill();
	}


	public moveAngle(v: number, a: number): void {
		this.b2_angularVelocity += a;
		this.b2_velosity.x += v * Math.cos(this.b2_angle - Math.PI/2);
		this.b2_velosity.y += v * Math.sin(this.b2_angle - Math.PI/2);
	}
}
