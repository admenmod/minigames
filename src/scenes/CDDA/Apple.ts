import { Vector2 } from '@ver/Vector2';
import type { Viewport } from '@ver/Viewport';

import { NodeCell } from './NodeCell';


export class Apple extends NodeCell {
	public size = new Vector2(20, 20);

	constructor() {
		super();

		this.isPickupable = true;
	}

	protected _draw({ ctx }: Viewport) {
		ctx.fillStyle = '#11ee11';
		ctx.fillRect(-this.size.x/2, -this.size.y/2, this.size.x, this.size.y);
	}
}
