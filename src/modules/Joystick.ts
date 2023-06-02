import { Vector2, vec2 } from '@ver/Vector2';
import { TouchesController, Touch } from '@ver/TouchesController';


export class Joystick {
	public pos: Vector2;
	private _angle: number;
	public radius: number;
	public coreRadius: number;
	public colors: [number, string];

	public core: {
		pos: Vector2,
		radius: number,
		coreRadius: number,
		colors: [number, string]
	};

	public touch: Touch | null;

	constructor(p: any = {}) {
		this.pos = p.pos||vec2();
		this._angle = 0;

		this.radius = p.radius||70;
		this.coreRadius = p.coreRadius||50;
		this.colors = p.colors || [0, '#112233', 1, '#223344'];

		this.core = {
			pos: this.pos.buf(),
			radius: 30,
			coreRadius: 5,
			colors: p.coreColors || [0, '#223344', 1, '#112233']
		};

		this.touch = null;
	}

	syncPos() {
		this.core.pos.set(this.pos);
	}

	public get value(): number {
		return Math.round(this.pos.getDistance(this.core.pos) / (this.radius-this.core.radius) * 10000) / 10000;
	}
	public get angle(): number {
		return this._angle = this.value ? this.pos.getAngleRelative(this.core.pos) : this._angle;
	}

	public update(touches: TouchesController): void {
		if(!this.touch) this.touch = touches.findTouch((t: Touch) => this.pos.getDistance(t) < this.radius);
		else if(this.touch) {
			let l = this.pos.getDistance(this.touch);
			this.core.pos.set(this.pos).moveAngle(
				Math.min(l, this.radius-this.core.radius),
				this.core.pos.getAngleRelative(this.touch)
			);

			if(this.touch.isUp()) this.touch = null;
		};
		if(!this.touch) this.core.pos.moveTime(this.pos, 3);
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.save();
		ctx.globalAlpha = 0.7;
		ctx.beginPath();

		let grd = ctx.createRadialGradient(
			this.pos.x, this.pos.y, this.coreRadius,
			this.pos.x, this.pos.y, this.radius
		);

		for(let i = 0; i < this.colors.length; i += 2) {
			grd.addColorStop(this.colors[i] as number, this.colors[i+1] as string);
		};

		ctx.fillStyle = grd;
		ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI*2);
		ctx.fill();

		ctx.beginPath();
		grd = ctx.createRadialGradient(
			this.core.pos.x, this.core.pos.y, this.core.coreRadius,
			this.core.pos.x, this.core.pos.y, this.core.radius
		);

		for(let i = 0; i < this.core.colors.length; i += 2) {
			grd.addColorStop(this.core.colors[i] as number, this.core.colors[i+1] as string);
		};

		ctx.fillStyle = grd;
		ctx.arc(this.core.pos.x, this.core.pos.y, this.core.radius, 0, Math.PI*2);
		ctx.fill();
		ctx.restore();
	}
};
