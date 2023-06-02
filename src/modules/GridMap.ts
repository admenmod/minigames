import { Vector2 } from '@ver/Vector2';


export class GridMap {
	public offset: Vector2;
	public tile: Vector2;
	public size: Vector2;
	public scale: Vector2;

	public lineWidth: number;
	public lineColor: string;

	public coordinates: boolean;

	constructor(p: {
		offset?: Vector2;
		tile?: Vector2;
		size?: Vector2;
		scale?: Vector2;

		lineWidth?: number;
		lineColor?: string;

		coordinates?: boolean;
	}) {
		this.offset = (p.offset || new Vector2()).buf();
		this.tile = (p.tile || new Vector2(50, 50)).buf();
		this.size = (p.size || new Vector2()).buf();
		this.scale = (p.scale || new Vector2(1, 1)).buf();

		this.lineWidth = p.lineWidth || 0.2;
		this.lineColor = p.lineColor || '#ffffff';

		this.coordinates = p.coordinates || false;
	}

	draw(ctx: CanvasRenderingContext2D, pos = Vector2.ZERO) {
		const tile = this.tile.buf().inc(this.scale);

		const mar = pos.buf().mod(tile);
		const counts = this.size.buf().add(mar).div(tile);

		// ctx.save();
		// ctx.fillStyle = `rgb(${Math.random()*255}, 100, 100)`;
		// ctx.fillRect(Math.random() * 100, 0, 100, 100);
		// ctx.restore();
		ctx.save();


		// clip area
		ctx.beginPath();
		ctx.rect(this.offset.x, this.offset.y, this.size.x, this.size.y);
		ctx.clip();


		// draw grid
		ctx.beginPath();
		ctx.lineWidth = this.lineWidth;
		ctx.strokeStyle = this.lineColor;

		for(let dx = pos.x > 1 ? 1:0; dx < counts.x; dx++) {
			const x = this.offset.x - mar.x + dx*tile.x;
			ctx.moveTo(x, this.offset.y);
			ctx.lineTo(x, this.offset.y + this.size.y);
		}

		for(let dy = pos.y > 1 ? 1:0; dy < counts.y; dy++) {
			const y = this.offset.y - mar.y + dy*tile.y;
			ctx.moveTo(this.offset.x, y);
			ctx.lineTo(this.offset.x + this.size.x, y);
		}

		ctx.stroke();


		// area stroke
		ctx.beginPath();
		ctx.strokeStyle = '#44ff44';
		ctx.strokeRect(this.offset.x, this.offset.y, this.size.x, this.size.y);


		// coordinates
		if(this.coordinates) {
			const pad = new Vector2(10, 10);

			ctx.beginPath();
			ctx.fillStyle = '#ffff00';
			ctx.globalAlpha = 0.4;

			for(let dx = -1; dx < counts.x; dx++) {
				const coordinates = Math.floor((pos.x*1.01 + dx*tile.x) / tile.x) * tile.x;
				ctx.fillText(coordinates.toFixed(0), this.offset.x + 2 - mar.x + dx*tile.x, this.offset.y + pad.y);
			};

			for(let dy = -1; dy < counts.y; dy++) {
				const coordinates = Math.floor((pos.y*1.01 + dy*tile.y) / tile.y) * tile.y;
				ctx.fillText(coordinates.toFixed(0), this.offset.x + 2, this.offset.y + pad.y - mar.y + dy*tile.y);
			}
		}

		ctx.restore();
	}
}
