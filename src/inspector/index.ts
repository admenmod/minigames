// import { Vector2 } from '@ver/Vector2';
// import type { MainScene } from '@/scenes/MainScene';
// import { Inspector, ScenePack } from './Inspector';
//
//
// // const inspector = new Inspector();
// //
// // await MainScene.load();
// // const main_scene = new MainScene();
// // await main_scene.init();
// //
// // const json = inspector.save(main_scene);
// // console.log(json);
// // console.log(JSON.parse(json));
//
//
// let tik = 3;
// window.onclick = async () => {
// 	tik -= 1;
// 	// if(tik < 0 && main_scene) localStorage.setItem('test_pack', main_pack.save(main_scene));
//
// 	let json;
// 	if(tik === 0) json = localStorage.getItem('test_pack');
// 	if(!json) return;
//
// 	const data = JSON.parse(json);
// 	console.log(data);
//
//
// 	const main_pack = new ScenePack<typeof MainScene>(data.src, data.type);
// 	await main_pack.load();
//
// 	const main_prefab = main_pack.prefabFrom(json);
// 	console.log(main_prefab);
//
// 	const main_scene = main_prefab();
// 	await main_scene.init();
// 	console.log(main_scene);
// };
