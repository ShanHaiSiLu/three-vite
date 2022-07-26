uniform vec3 uColor;

void main() {
    float distanceToCenter = distance(gl_PointCoord, vec2(0.5));
    float strength = 1.0 - distanceToCenter * 2.0;
    strength = pow(strength, 1.5);
    gl_FragColor = vec4(uColor, strength);
}