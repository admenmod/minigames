import { Vector2 } from '@ver/Vector2';
import { BaseCore } from '@/modules/BaseCore';


const main_file = `
let mineralmap = Game.scan();

let minerals = mineralmap.search(Mineral.ONE);
let target = minerals[0].position;

console.log(mineralmap);
console.log(minerals);
console.log(target);
`;


const basecore = new BaseCore({
	firmware: main_file
});


console.log(basecore);


basecore.init();
