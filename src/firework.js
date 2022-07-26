import * as THREE from "three";
import startShaderVertex from "./shader/starPoint/vertex.glsl?raw";
import startShaderFragment from "./shader/starPoint/fragment.glsl?raw";
import fireworkVertex from "./shader/firework/vertex.glsl?raw";
import fireworkFragment from "./shader/firework/fragment.glsl?raw";

export default class Fireworks {
  constructor(color, to, from = { x: 0, y: 0, z: 0 }) {
    // 创建烟花的起始球
    this.startGeometry = new THREE.BufferGeometry();

    let startBufferPosition = new Float32Array(3);
    startBufferPosition[0] = from.x;
    startBufferPosition[1] = from.y;
    startBufferPosition[2] = from.z;
    this.startGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(startBufferPosition, 3)
    );

    let astepArray = new Float32Array(3);
    astepArray[0] = to.x - from.x;
    astepArray[1] = to.y - from.y;
    astepArray[2] = to.z - from.z;
    this.startGeometry.setAttribute(
      "aStep",
      new THREE.BufferAttribute(astepArray, 3)
    );

    this.startShaderMaterial = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: startShaderVertex,
      fragmentShader: startShaderFragment,
      uniforms: {
        uTime: {
          value: 0,
        },
        uSize: {
          value: 20,
        },
      },
    });

    this.point = new THREE.Points(this.startGeometry, this.startShaderMaterial);

    this.clock = new THREE.Clock();

    // 创建烟花爆炸之后四散的粒子
    this.fireworkGeometry = new THREE.BufferGeometry();

    // 粒子数量
    let fireworkCount = 150 + Math.floor(Math.random() * 100),
      // 位置属性，初始位置统一设定为上一阶段粒子的结束位置
      fireworsPositions = new Float32Array(fireworkCount * 3),
      // 粒子缩放比例
      fireworkScale = new Float32Array(fireworkCount),
      // 粒子的炸裂方向
      fireworkDirection = new Float32Array(fireworkCount * 3);

    for (var i = 0; i < fireworkCount; i++) {
      fireworsPositions[i * 3 + 0] = to.x;
      fireworsPositions[i * 3 + 1] = to.y;
      fireworsPositions[i * 3 + 2] = to.z;

      fireworkScale[i] = Math.random();

      // 粒子炸裂方向由三个变量确定：当前粒子移动半径，水平移动角度，垂直移动角度
      let r = Math.random();
      let beta = Math.random() * Math.PI * 2;
      let theta = Math.random() * Math.PI * 2;
      fireworkDirection[i * 3 + 0] = r * Math.sin(theta) + r * Math.sin(beta);
      fireworkDirection[i * 3 + 1] = r * Math.cos(theta) + r * Math.cos(beta);
      fireworkDirection[i * 3 + 2] = r * Math.sin(theta) + r * Math.cos(beta);
    }
    this.fireworkGeometry.setAttribute(
      "position",
      new THREE.BufferAttribute(fireworsPositions, 3)
    );
    this.fireworkGeometry.setAttribute(
      "aScale",
      new THREE.BufferAttribute(fireworkScale, 1)
    );
    this.fireworkGeometry.setAttribute(
      "direction",
      new THREE.BufferAttribute(fireworkDirection, 3)
    );

    this.fireworkMaterial = new THREE.ShaderMaterial({
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: fireworkVertex,
      fragmentShader: fireworkFragment,
      uniforms: {
        uTime: {
          value: 0,
        },
        uSize: {
          value: 0,
        },
      },
    });

    this.fireworkPoints = new THREE.Points(
      this.fireworkGeometry,
      this.fireworkMaterial
    );
  }

  addScene(scene, camera) {
    this.scene = scene;
    this.camera = camera;

    this.scene.add(this.point);
    this.scene.add(this.fireworkPoints);
  }

  update() {
    let time = this.clock.getElapsedTime();
    if (time < 1) {
      // 烟花使用一秒的时间到达目标地点
      this.startShaderMaterial.uniforms.uTime.value = time;
      this.startShaderMaterial.uniforms.uSize.value = 20.0;
    } else {
      time -= 1;
      // 到达目标点之后就可以销毁初始的点了，准备爆炸
      this.startShaderMaterial.uniforms.uSize.value = 0.0;
      this.point.clear();
      this.startGeometry.dispose();
      this.startShaderMaterial.dispose();

      // 渲染准备爆炸的粒子
      this.fireworkMaterial.uniforms.uSize.value = 20.0;
    }
  }
}
