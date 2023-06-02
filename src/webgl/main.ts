import { canvas } from '@/global';


const cvs = canvas.createLayer('webgl', 'back');
const gl = cvs.getContext('webgl', { premultipliedAlpha: false })! as WebGL2RenderingContext;
cvs.hidden = true;

canvas['@resize'].on(size => gl.viewport(0, 0, size.x, size.y));

const layer = canvas.layers.main;


//==================== functions ====================//
const createShader = (type: number, source: string): WebGLShader => {
	const shader = gl.createShader(type)!;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);

	const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if(success) return shader;

	console.log(gl.getShaderInfoLog(shader));
	gl.deleteShader(shader);

	throw new Error('shader '+type);
};

const createProgram = (vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram => {
	const program = gl.createProgram()!;
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	gl.linkProgram(program);

	const success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if(success) return program;

	console.log(gl.getProgramInfoLog(program));
	gl.deleteProgram(program);

	throw new Error('program');
};

const createTexture = () => {
	const data: {
		tex: WebGLTexture,
		width: number,
		height: number
	} = {} as any;

	const tex = gl.createTexture();

	gl.bindTexture(gl.TEXTURE_2D, tex);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, layer);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		// gl.bindTexture(gl.TEXTURE_2D, tex);
		// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, layer);

	data.width = layer.width;
	data.height = layer.height;

	return data;
};


//==================== DATA_PREPARA ====================//
const screen = new Float32Array([canvas.width, canvas.height]);

const vertexArray = new Float32Array([
	-1.0,  1.0,
	1.0,  1.0,
	1.0, -1.0,

	-1.0,  1.0,
	1.0, -1.0,
	-1.0, -1.0
]);

const texcoordArray = vertexArray;


const gl_locations: {
	a_position: any;
	a_texcoord: any;

	u_time: any;
	u_resolution: any;
	u_texture: any;
} = {} as any;


(async function() {
	let vs_source = '';
	let fs_source = '';

	await Promise.all([
		fetch('shaders/vertex.glsl').then(data => data.text()).then(data => vs_source = data),
		fetch('shaders/fragment.glsl').then(data => data.text()).then(data => fs_source = data)
	]);


	//==================== compile shaders ====================//
	const vertexShader = createShader(gl.VERTEX_SHADER, vs_source);
	const fragmentShader = createShader(gl.FRAGMENT_SHADER, fs_source);

	const program = createProgram(vertexShader, fragmentShader);


	gl_locations.a_position = gl.getAttribLocation(program, 'a_position');
	gl_locations.a_texcoord = gl.getAttribLocation(program, 'a_texcoord');

	gl_locations.u_time = gl.getUniformLocation(program, 'u_time')!;
	gl_locations.u_resolution = gl.getUniformLocation(program, 'u_resolution')!;
	gl_locations.u_texture = gl.getUniformLocation(program, 'u_texture')!;


	const vertexBuffer = gl.createBuffer()!;
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, vertexArray, gl.STATIC_DRAW);

	const texcoordBuffer = gl.createBuffer()!;
	gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, texcoordArray, gl.STATIC_DRAW);


	gl.enableVertexAttribArray(gl_locations.a_position);
	gl.vertexAttribPointer(gl_locations.a_position, 2, gl.FLOAT, false, 0, 0);


	const drawImage = (tex: WebGLTexture, width: number, height: number) => {
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.enableVertexAttribArray(gl_locations.a_position);
		gl.vertexAttribPointer(gl_locations.a_position, 2, gl.FLOAT, false, 0, 0);
		gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
		gl.enableVertexAttribArray(gl_locations.a_texcoord);
		gl.vertexAttribPointer(gl_locations.a_texcoord, 2, gl.FLOAT, false, 0, 0);


		gl.uniform1i(gl_locations.u_texture, 0);

		gl.drawArrays(gl.TRIANGLES, 0, 6);
	};


	const texData = createTexture();


	const timestart = Date.now();

	const _updata = () => {
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);


		gl.useProgram(program);

		gl.uniform1f(gl_locations.u_time, (Date.now() - timestart)/1000);
		gl.uniform2fv(gl_locations.u_resolution, screen);


		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, layer);

		drawImage(texData.tex, texData.width, texData.height);

		requestAnimationFrame(_updata);
	};
	_updata();
})();
