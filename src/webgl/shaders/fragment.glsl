/*
precision highp float;

uniform vec2 uResolution;
uniform float uTime;

const float PI = 3.141592653589793;


float random(float p) {
	return fract(sin(p)*10000.0);
}

float noise(vec2 p) {
	float t = uTime/2000.0;

	if(t < 1.0) t -= floor(t);

	return random(p.x*14.0 + p.y*sin(t)*0.05);
}

vec2 sw(vec2 p) {return vec2(floor(p.x), floor(p.y));}
vec2 se(vec2 p) {return vec2(ceil(p.x),	 floor(p.y));}
vec2 nw(vec2 p) {return vec2(floor(p.x), ceil(p.y));}
vec2 ne(vec2 p) {return vec2(ceil(p.x),  ceil(p.y));}

float smoothNoise(vec2 p) {
	vec2 inter = smoothstep(0.0, 1.0, fract(p));

	float s = mix(noise(sw(p)), noise(se(p)), inter.x);
	float n = mix(noise(nw(p)), noise(ne(p)), inter.x);

	return mix(s, n, inter.y);
}


mat2 rotate(in float theta) {
	float c = cos(theta);
	float s = sin(theta);

	return mat2(
		c, -s,
		s,  c
	);
}

float circ(vec2 p) {
	float r = length(p);
	r = log(sqrt(r));

	return abs(mod(r*4.0, PI*2.0)) - PI;
}


void main() {
	vec2 pos = gl_FragCoord.xy/uResolution.xy - 0.5;
	pos.x *= uResolution.x/uResolution.y;

	pos /= exp(mod(uTime*0.25, PI)*smoothNoise(pos/sin(uTime)));

	float rz = abs(circ(pos));

	vec3 color = vec3(0.2, 0.3 / sin(uTime/20.0) -0.5, 0.65)/rz;
	gl_FragColor = vec4(color, 1.0);
}
*/



precision mediump float;

varying vec2 v_texcoord;


uniform float u_time;
uniform vec2 u_resolution;
uniform sampler2D u_texture;


const float PI = 3.141592653589793;


float random(float p) {
	return fract(sin(p)*10000.0);
}

float noise(vec2 p) {
	float t = u_time/2000.0;

	if(t < 1.0) t -= floor(t);

	return random(p.x*14.0 + p.y*sin(t)*0.05);
}

vec2 sw(vec2 p) {return vec2(floor(p.x), floor(p.y));}
vec2 se(vec2 p) {return vec2(ceil(p.x),	 floor(p.y));}
vec2 nw(vec2 p) {return vec2(floor(p.x), ceil(p.y));}
vec2 ne(vec2 p) {return vec2(ceil(p.x),  ceil(p.y));}

float smoothNoise(vec2 p) {
	vec2 inter = smoothstep(0.0, 1.0, fract(p));

	float s = mix(noise(sw(p)), noise(se(p)), inter.x);
	float n = mix(noise(nw(p)), noise(ne(p)), inter.x);

	return mix(s, n, inter.y);
}


mat2 rotate(in float theta) {
	float c = cos(theta);
	float s = sin(theta);

	return mat2(
		c, -s,
		s,  c
	);
}

float circ(vec2 p) {
	float r = length(p);
	r = log(sqrt(r));

	return abs(mod(r*4.0, PI*2.0)) - PI;
}


void main() {
	vec2 pos = v_texcoord;


	pos /= exp(mod(u_time * 0.25, PI) * smoothNoise(pos / sin(u_time)) / 50.0);

	// float rz = abs(circ(pos));
	//
	// vec3 color = vec3(0.2, 0.3 / sin(uTime/20.0) -0.5, 0.65)/rz;
	// gl_FragColor = vec4(color, 1.0);

	gl_FragColor = texture2D(u_texture, pos);
}
