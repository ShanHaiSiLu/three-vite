precision lowp float;

uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform sampler2D uTexture3;

varying float vImgIndex;
varying vec3 vColor;

void main() {
    // gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);

    // 设置渐变圆
    // float strength = distance(gl_PointCoord, vec2(0.5));
    // strength = 1.0 - strength*2.0;
    // gl_FragColor = vec4(strength);

    // 圆形
    // float strength = distance(gl_PointCoord, vec2(0.5));
    // strength = 1.0 - step(0.5, strength);
    // gl_FragColor = vec4(strength);

    // 根据文理设置图案
    // vec4 textureColor = texture2D(uTexture1, gl_PointCoord);
    // gl_FragColor = vec4(textureColor.rgb, textureColor.r);

    // 分局纹理坐标gl_PointCoord设置彩色图
    vec4 textureColor;
    if(vImgIndex == 0.0) {
        textureColor = texture2D(uTexture1, gl_PointCoord);
    } else if(vImgIndex == 1.0) {
        textureColor = texture2D(uTexture2, gl_PointCoord);
    } else {
        textureColor = texture2D(uTexture3, gl_PointCoord);
    }

    gl_FragColor = vec4(vColor, textureColor.r);

}