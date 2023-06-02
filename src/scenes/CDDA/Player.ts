import { Vector2 } from '@ver/Vector2';
import type { Viewport } from '@ver/Viewport';

import { NodeCell } from './NodeCell';


export class Player extends NodeCell {
	public size = new Vector2(20, 20);

	public TREE() { return {
		// Sprite
	}}

	protected async _init(): Promise<void> {
		// const sprite = this.getChild('Sprite')!;
		//
		// sprite.load('assets/img/player.png');
		// sprite.scale.set(5);

		await super._init();
	}


	public move(target: Vector2): void {
		this.tryMoveTo(target)
	}


	protected _process(this: Player, dt: number): void {
		// this.position.moveTo(this.target, this.speed * dt, true);

		// this.get().Mesh.render(0 as any as CanvasRenderingContext2D);
	}


	protected _draw({ ctx }: Viewport) {
		ctx.fillStyle = '#ee1111';
		ctx.fillRect(-this.size.x/2, -this.size.y/2, this.size.x, this.size.y);
	}
}
