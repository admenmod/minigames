import { GameObject } from '@/modules/GameObject';


export declare namespace Structure {
	interface IOption extends GameObject.IOption {
		HP: number;
		type: string;
	}
}


import IOption = Structure.IOption;


export class Structure extends GameObject {
	public readonly STRUCTURE_TYPE: string;

	public readonly HP: number;

	constructor(p: IOption = <IOption>{}) {
		super(p);

		this.HP = p.HP;
		this.STRUCTURE_TYPE = p.type;
	}
}
