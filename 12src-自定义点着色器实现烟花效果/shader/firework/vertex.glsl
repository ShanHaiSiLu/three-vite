uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute vec3 aRandom;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1);

    modelPosition.xyz += aRandom * uTime * 10.0;

    vec4 viewPosition = viewMatrix * modelPosition;

    gl_Position = projectionMatrix * viewPosition;

    gl_PointSize = uSize * aScale - uTime * 10.0;
}