const ss = native.require('ss');
const location = native.require('location');

console.log(ss, location);

// location.on('move', diff => location.position.add(diff));

// ss.emit('create rover');

// const cargo_size = await ss.request('cargo get size');
// console.log(cargo_size);
