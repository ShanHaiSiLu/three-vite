precision lowp float;

varying float vElenation;
uniform vec3 uHighColor;
uniform vec3 uLowColor;
uniform float uOpacity;

void main() {
    float a = vElenation * 0.5 + 0.5;

    vec3 mixColor = mix(uLowColor, uHighColor, a);

    gl_FragColor = vec4(mixColor, uOpacity);
}