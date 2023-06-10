const movement = await require('api:movement');
const scanner = await require('api:scanner');

console.log(movement, scanner);

scanner.on('detect', e => {
	movement.move(e.position);
});
