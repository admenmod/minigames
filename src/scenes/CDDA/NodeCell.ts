import { Vector2 } from '@ver/Vector2';
import { Event } from '@ver/events';
import { Node2D } from '@/scenes/nodes/Node2D';
import type { World } from './World';


export class NodeCell extends Node2D {
	public '@enter_world' = new Event<NodeCell, [world: World]>(this);
	public '@exit_world' = new Event<NodeCell, [world: World]>(this);

	protected _enter_world(world: World): void {}
	protected _exit_world(world: World): void {}

	public cellpos = new Vector2();
	protected _world: World | null = null;

	protected _isInTree: boolean = false;
	public get isInTree(): boolean { return this._isInTree; }

	public isPickupable: boolean = false;
	public inHands: NodeCell | null = null;


	private _onselfpickup(picker: NodeCell) {
		this._world!.delObject(this);

		// picker.pocket
		picker.inHands = this;
	}

	private _onselfput(picker: NodeCell, target: Vector2) {
		this.cellpos.set(target);

		picker._world!.addObject(this);

		// picker.pocket
		picker.inHands = null;
	}

	public tryPutfromHandsTo(dir: Vector2): boolean {
		if(!this.inHands) return false;

		const target = this.cellpos.buf().add(dir);
		const has = this._world!.hasPut(this, target);

		if(has) this.inHands._onselfput(this, target);

		return has;
	}

	public tryPickup(o: NodeCell): boolean {
		const has = this._world!.hasPickUp(this, o);

		if(has) o._onselfpickup(this);

		return has;
	}


	public tryMoveTo(target: Vector2): boolean {
		if(!this._isInTree) return false;

		const has = this._world!.hasNodeMovedTo(this, target);

		if(has) {
			this.cellpos.add(target);
			this.position.set(this.cellpos.buf().inc(this._world!.cellsize));
		}

		return has;
	}
}
