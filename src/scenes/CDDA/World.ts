import { Vector2 } from '@ver/Vector2';
import { Event } from '@ver/events';
import type { Viewport } from '@ver/Viewport';

import { Node2D } from '@/scenes/nodes/Node2D';
import { Date } from '@/modules/Date';
import { NodeCell } from './NodeCell';


export class World extends Node2D {
	public size = new Vector2();
	public cellsize = new Vector2(20, 20);

	public all_nodes: NodeCell[] = [];
	public active_nodes: NodeCell[] = [];


	public enter_date: Date = new Date();
	public date: Date = new Date();

	public getObjectCellUp(target: Vector2): NodeCell | null{
		return this.all_nodes.find(i => i.cellpos.isSame(target)) || null;
	}

	public addObject(o: NodeCell): void {
		//@ts-ignore friend
		if(o._isInTree) return;

		//@ts-ignore friend
		o._isInTree = true;
		//@ts-ignore friend
		o._world = this;

		o.position.set(o.cellpos.buf().inc(this.cellsize));
		//@ts-ignore friend
		o._enter_world(this);
		o.emit('enter_world', this);

		this.all_nodes.push(o);

		o.visible = true;
	}

	public delObject(o: NodeCell): void {
		//@ts-ignore
		if(!o._isInTree) return;

		//@ts-ignore friend
		o._isInTree = false;
		//@ts-ignore friend
		o._world = null;
		//@ts-ignore friend
		o._exit_world(this);
		o.emit('exit_world', this);

		const l = this.all_nodes.indexOf(o);
		if(~l) this.all_nodes.splice(l, 1);

		o.visible = false;
	}

	public hasNodeMovedTo(node1: NodeCell, target: Vector2): boolean {
		const l = target.module;

		if(l > 2) return false;

		for(let i = 0; i < this.all_nodes.length; i++) {
			const diff = this.all_nodes[i].cellpos.buf().sub(node1.cellpos.buf().add(target));

			if(diff.isSame(Vector2.ZERO)) return false;
		}

		this.date.setSeconds(this.date.getSeconds() + 3);

		return true;
	}

	public hasPickUp(node1: NodeCell, node2: NodeCell): boolean {
		if(node1 === node2) throw new Error('node1 === node2');

		if(node1.inHands) return false;

		if(this.getDistance(node1, node2) > 2) return false;

		if(!node2.isPickupable) return false;

		return true;
	}

	public hasPut(node1: NodeCell, target: Vector2): boolean {
		if(node1.cellpos.getDistance(target) > 2) return false;

		// if(!node2.isPickupable) return true;

		if(this.all_nodes.some(i => i.cellpos.isSame(target))) return false;

		return true;
	}

	public getDistance(node1: NodeCell, node2: NodeCell): number {
		return node1.cellpos.getDistance(node2.cellpos);
	}
}
