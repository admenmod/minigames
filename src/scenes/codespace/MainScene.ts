import { Vector2 } from '@ver/Vector2';
import type { Viewport } from '@ver/Viewport';

import { Node } from '@/scenes/Node';
import { Node2D } from '@/scenes/nodes/Node2D';

import { GridMap } from '@/scenes/gui/GridMap';
import { SystemInfo } from '@/scenes/gui/SystemInfo';

import { Camera2D } from '@/scenes/nodes/Camera2D';
import { Joystick } from '@/scenes/gui/Joystick';
import { Button } from '@/scenes/gui/Button';

import { Player } from './nodes/Player';

import { gm } from '@/global';


export class MainScene extends Node2D {
	public TREE() { return {
		Camera2D,
		GridMap,

		Player,

		ButtonAction: Button,
		JoystickL: Joystick,
		JoystickR: Joystick,

		SystemInfo,

		// CodeBlock1: CodeBlockNode,
		// CodeBlock2: CodeBlockNode,
		// CodeBlock3: CodeBlockNode
	}}

	// aliasesa
	// public get $codeblock1() { return this.get('CodeBlock1'); }
	// public get $codeblock2() { return this.get('CodeBlock2'); }
	// public get $codeblock3() { return this.get('CodeBlock3'); }

	public get $camera() { return this.get('Camera2D'); }
	public get $player() { return this.get('Player'); }
	public get $gridMap() { return this.get('GridMap'); }
	public get $btnAction() { return this.get('ButtonAction'); }
	public get $joystickL() { return this.get('JoystickL'); }
	public get $joystickR() { return this.get('JoystickR'); }


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


		const updateOnResize = (size: Vector2) => {
			this.$gridMap.size.set(size).inc(3);
		};
		updateOnResize(gm.screen);
		gm.on('resize', updateOnResize);

/*
		const cb1 = this.$codeblock1.codeblock;
		this.$codeblock1.position.set(-300, -100);
		this.$codeblock1.size.set(200, 50);
		this.$codeblock1.color = '#99ee99';
		this.$codeblock1.code =
`
console.log('if', valueOf());

stdin.ondata = data => {
	console.log('stdin1 :', stdin.read());
	stdout.write('4');
};

(function() {
	console.log(this);
})();

this.onupdate = dt => {
	this.pos.x += 0.1;
};`;

		const cb2 = this.$codeblock2.codeblock;
		this.$codeblock2.position.set(0, 0);
		this.$codeblock2.size.set(200, 50);
		this.$codeblock2.color = '#99ee99';
		this.$codeblock2.code =
`stdin.ondata = data => {
	console.log('stdin2 :', stdin.read());
	stdout.write(+stdin.read() * 5 + 'k');
};`;

		const cb3 = this.$codeblock3.codeblock;
		this.$codeblock3.position.set(300, 100);
		this.$codeblock3.size.set(200, 50);
		this.$codeblock3.color = '#99ee99';
		this.$codeblock3.code =
`stdin.ondata = data => {
	console.log('stdin3 :', stdin.read());
	stdout.write(+stdin.read() * 5 + 'k');
}`;


		(cb1)['>>'](cb2)['>>'](cb3);

		this.api1 = {
			pos: this.$camera.position,
			onupdate: () => {}
		};

		console.log('ret cb1', cb1.run(this.api1));
		cb2.run(null);
		cb3.run(null);

		this.$btnAction.on('pressed', () => {
			cb1.stdin.write('9');
		});


		$btnExec.onclick = () => {
			cb1.run(this.api1);
		};
*/
	}

	protected _ready(this: MainScene): void {
		this.$camera.zIndex = 100;

		this.$btnAction.text = 'execute';
		

		const moveChild = (o: Node, p: Node) => {
			o.parent!.removeChild(o.name, true);
			p.addChild(o);
		};

		moveChild(this.$btnAction, this.$camera);
		moveChild(this.$joystickL, this.$camera);
		moveChild(this.$joystickR, this.$camera);
	}

	protected _process(this: MainScene, dt: number): void {
		if(this.$joystickL.touch) {
			const value = this.$joystickL.value;
			const angle = this.$joystickL.angle;

			this.$camera.position.moveAngle(value**3 * 0.1*dt, angle);
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
