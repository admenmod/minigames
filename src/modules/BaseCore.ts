import { Structure } from '@/modules/Structure';
import { Computer } from '@/modules/code/Computer';


export declare namespace BaseCore {
	//@ts-ignore
	interface IOption extends Structure.IOption {
		type?: 'BaseCore',
		HP?: 1000,

		firmware: string;
	}
}


import IOption = BaseCore.IOption;


export class BaseCore extends Structure {
	public readonly processor: Computer;


	constructor(p: IOption = <IOption>{}) {
		Object.assign(p, <IOption>{
			HP: 1000,
			type: 'BaseCore',
		});

		super(<Structure.IOption>p);

		this.processor = new Computer(p.firmware);
	}

	public init() {
		this.processor.run();
	}
}
