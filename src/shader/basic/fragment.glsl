precision lowp float;

varying vec4 vPosition;
varying vec4 gPosition;

void main() {
    vec4 topColor = vec4(1.0, 0.0, 0.0, 1.0);
    vec4 bottomColor = vec4(1.0, 1.0, 0.0, 1.0);
    // 这里的3.0是模型的高度，可以在建模软件中打开模型查看
    vec4 mixColor = mix(bottomColor, topColor, gPosition.y / 3.0);

    if(gl_FrontFacing) {
        // 正面，也就是孔明灯的外侧
        gl_FragColor = vec4(mixColor.xyz - vPosition.y / 150.0 - 0.3, 1.0);
    } else {
        // 内侧，也就是孔明灯的里侧
        gl_FragColor = vec4(mixColor.xyz - vPosition.y / 150.0 - 0.1, 1.0);
    }
}