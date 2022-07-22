precision lowp float;

attribute float imgIndex;
attribute float uScale;

uniform float uTime;

varying float vImgIndex;

varying vec3 vColor;

void main() {
    float changeTime = mod(uTime, 10.0);
    // position是模型的原始位置，未经过任何变换
    // modelPosition是模型经过旋转平移之后的坐标位置；
    vec4 modelPosition = modelMatrix * vec4(position, 1);

    // 获取当前点在XZ平明上的角度
    float currentAngle = atan(modelPosition.x, modelPosition.z);
    // 获取当前点的旋转半径，也就是点到中心的距离
    float length = length(modelPosition.xz);

    float changeAngle;
    // 计算点的偏移角度
    if(changeTime < 5.0) {
        changeAngle = changeTime * length;
    } else {
        changeTime = 10.0 - changeTime;
        changeAngle = changeTime / length;
    }

    // 计算偏移后点的X/Z
    modelPosition.x = cos(currentAngle + changeAngle) * length;
    modelPosition.z = sin(currentAngle + changeAngle) * length;

    vec4 viewPosition = viewMatrix * modelPosition;

    gl_Position = projectionMatrix * viewPosition;

    // gl_PointSize = 55.0;
    gl_PointSize = 80.0 * uScale / -viewPosition.z;

    vImgIndex = imgIndex;

    vColor = color; // color是threejs默认传入的参数
}