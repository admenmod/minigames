import { Vector2 } from '@ver/Vector2';
import { Event } from '@ver/events';
import type { Viewport } from '@ver/Viewport';

import { Value } from '@/value/Value';
import { CodeBlock } from '@/value/CodeBlock';

import { Node2D } from '@/scenes/nodes/Node2D';
import { Input } from '@/global';


export class CodeBlockNode extends Node2D {
	public '@pressed' = new Event<CodeBlockNode, []>(this);


	protected _lines: string[] = [''];
	public get lines() { return this._lines; }

	protected _text: string = '';
	public get text() { return this._text; }
	public set text(v) {
		this._text = v;
		this._lines.length = 0;
		this._lines.push(...this.text.split('\n'));
	}

	protected _color: string = '#eeeeee';
	public get color() { return this._color; }
	public set color(v) { this._color = v; }

	protected linespace: number = 15;

	public padding = new Vector2(5, 5);
	public size = new Vector2(70, 40);


	public codeblock = new CodeBlock();

	public get code() { return this.codeblock.code; }
	public set code(v) {
		this.codeblock.code = v;
		this.text = v;
	}


	protected async _init(this: CodeBlockNode): Promise<void> {
		await super._init();

		const fn = Input.on('press', tpos => {
			const pos = this.globalPosition;
			const size = this.size;

			if(
				tpos.x < pos.x + size.x/2 && tpos.x > pos.x - size.x/2 &&
				tpos.y < pos.y + size.y/2 && tpos.y > pos.y - size.y/2
			) this['@pressed'].emit();
		});

		this.on('destroy', () => Input.off('press', fn));
	}


	protected _draw({ ctx }: Viewport): void {
		ctx.beginPath();
		ctx.fillStyle = '#222222';
		ctx.fillRect(0, 0, this.size.x + this.padding.x*2, this.size.y + this.padding.y*2);

		ctx.beginPath();
		ctx.strokeStyle = '#555555';
		ctx.strokeRect(0, 0, this.size.x + this.padding.x*2, this.size.y + this.padding.y*2);

		ctx.beginPath();
		ctx.fillStyle = this.color;
		// ctx.font = '12px arkhip';
		ctx.font = '12px monospace';
		ctx.textBaseline = 'top';

		const linespace = this.linespace;

		for(let i = 0; i < this._lines.length; i++) {
			ctx.fillText(this._lines[i], this.padding.x, this.padding.y + linespace * i);
		}

		ctx.restore();
	}
}
