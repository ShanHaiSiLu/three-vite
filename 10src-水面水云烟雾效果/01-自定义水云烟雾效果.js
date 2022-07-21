import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import * as dat from "dat.gui";
/**
 * @raw 引入资源时在后缀名后加上?raw后缀，表示【以字符串方式引入此资源】
 */
import vertexShader from "./shader/vertex.glsl?raw";
import fragmentShader from "./shader/fragment.glsl?raw";

const gui = new dat.GUI();

// 场景
var scene = new THREE.Scene();

//点光源
var point = new THREE.PointLight(0xffffff);
point.position.set(400, 200, 300);
scene.add(point);
//环境光
var ambient = new THREE.AmbientLight(0x444444);
scene.add(ambient);

// 相机
var camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.00001,
  1000
);
camera.position.set(0, 3, 3);
camera.lookAt(scene.position);

// 辅助坐标
let axesHelper = new THREE.AxesHelper(25);
// scene.add(axesHelper);

// 传递给着色器的uniform参数
const params = {
  uWaresFrequencyX: 14,
  uWaresFrequencyZ: 7,
  uScale: 0.03,
  uNoiseFrequency: 10, // 噪声频率
  uNoiseScale: 1.5, // 噪声振幅
  uHighColor: "#ff0000", // 高位颜色
  uLowColor: "#ffff00", // 低位颜色
  uXSpeed: 0, // X轴速率
  uZSpeed: 0, // Z轴速率
  uNoiseSpeed: 1, // 噪声速率
  uOpacity: 1, // 透明度
};
gui
  .add(params, "uWaresFrequencyX")
  .min(1)
  .max(25)
  .step(1)
  .name("X轴频率")
  .onChange((val) => (shaderMaterial.uniforms.sWaresFrequencyX.value = val));
gui
  .add(params, "uWaresFrequencyZ")
  .min(1)
  .max(25)
  .step(1)
  .name("Z轴频率")
  .onChange((val) => (shaderMaterial.uniforms.sWaresFrequencyZ.value = val));

gui
  .add(params, "uScale")
  .min(0.0)
  .max(0.5)
  .step(0.0001)
  .name("振幅")
  .onChange((val) => (shaderMaterial.uniforms.uScale.value = val));

gui
  .add(params, "uNoiseFrequency")
  .min(0)
  .max(50)
  .step(0.5)
  .name("噪声频率")
  .onChange((val) => (shaderMaterial.uniforms.uNoiseFrequency.value = val));
gui
  .add(params, "uNoiseScale")
  .min(0.0)
  .max(5)
  .step(0.01)
  .name("噪声振幅")
  .onChange((val) => (shaderMaterial.uniforms.uNoiseScale.value = val));

gui
  .addColor(params, "uHighColor")
  .name("高位色")
  .onFinishChange(
    (val) => (shaderMaterial.uniforms.uHighColor.value = new THREE.Color(val))
  );

gui
  .addColor(params, "uLowColor")
  .name("低位色")
  .onFinishChange(
    (val) => (shaderMaterial.uniforms.uLowColor.value = new THREE.Color(val))
  );
gui
  .add(params, "uXSpeed")
  .min(-5)
  .max(5)
  .step(0.01)
  .name("X轴速率")
  .onChange((val) => (shaderMaterial.uniforms.uXSpeed.value = val));
gui
  .add(params, "uZSpeed")
  .min(-5)
  .max(5)
  .step(0.01)
  .name("Z轴速率")
  .onChange((val) => (shaderMaterial.uniforms.uZSpeed.value = val));
gui
  .add(params, "uNoiseSpeed")
  .min(-5)
  .max(5)
  .step(0.01)
  .name("噪声速率")
  .onChange((val) => (shaderMaterial.uniforms.uNoiseSpeed.value = val));
gui
  .add(params, "uOpacity")
  .min(0)
  .max(1)
  .step(0.001)
  .name("不透明度")
  .onChange((val) => (shaderMaterial.uniforms.uOpacity.value = val));

// 创建着色器材质
const shaderMaterial = new THREE.ShaderMaterial({
  transparent: true,
  // 顶点着色器
  vertexShader: vertexShader,
  // 片元着色器
  fragmentShader: fragmentShader,
  // 双面渲染
  side: THREE.DoubleSide,
  // 向着色器中传入变量
  uniforms: {
    sWaresFrequencyX: {
      value: params.uWaresFrequencyX,
    },
    sWaresFrequencyZ: {
      value: params.uWaresFrequencyZ,
    },
    uScale: {
      value: params.uScale,
    },
    uNoiseFrequency: {
      value: params.uNoiseFrequency,
    },
    uNoiseScale: {
      value: params.uNoiseScale,
    },
    uTime: {
      value: 0,
    },
    uHighColor: {
      value: new THREE.Color(params.uHighColor),
    },
    uLowColor: {
      value: new THREE.Color(params.uLowColor),
    },
    uXSpeed: {
      value: params.uXSpeed,
    },
    uZSpeed: {
      value: params.uZSpeed,
    },
    uNoiseSpeed: {
      value: params.uNoiseSpeed,
    },
    uOpacity: {
      value: params.uOpacity,
    },
  },
});

// 添加平面
const plane = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1, 1, 512, 512),
  shaderMaterial
);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// 渲染器
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0c0f0a, 1);
document.body.appendChild(renderer.domElement);

// 修改渲染器输出编码
renderer.outputEncoding = THREE.sRGBEncoding;
// 修改色调映射
renderer.toneMapping = THREE.ACESFilmicToneMapping;
// 修改曝光程度
// renderer.toneMappingExposure = 0.2;

// 控制器
var controls = new OrbitControls(camera, renderer.domElement);

// 时钟
var clock = new THREE.Clock();

// 渲染函数
function render() {
  const elapsedTime = clock.getElapsedTime();
  shaderMaterial.uniforms.uTime.value = elapsedTime;

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();
