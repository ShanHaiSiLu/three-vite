attribute vec3 aStep;

uniform float uTime;
uniform float uSize;

void main() {
    vec4 modelPosition = modelMatrix * vec4(position, 1);

    modelPosition.xyz += aStep.xyz * uTime;

    vec4 viewPosition = viewMatrix * modelPosition;

    gl_Position = projectionMatrix * viewPosition;

    gl_PointSize = uSize;
}