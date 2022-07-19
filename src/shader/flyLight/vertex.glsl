precision lowp float;

void main() {
    // position是模型的原始位置，未经过任何变换
    // modelPosition是模型经过旋转平移之后的坐标位置；
    vec4 modelPosition = modelMatrix * vec4(position, 1);

    gl_Position = projectionMatrix * viewMatrix * modelPosition;
}