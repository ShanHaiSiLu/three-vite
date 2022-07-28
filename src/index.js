import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import dat from "dat.gui";

// 导入后期效果合成器
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer";

// three框架本身自带效果
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass";
import { DotScreenPass } from "three/examples/jsm/postprocessing/DotScreenPass";
import { SMAAPass } from "three/examples/jsm/postprocessing/SMAAPass";
import { SSAARenderPass } from "three/examples/jsm/postprocessing/SSAARenderPass";
import { GlitchPass } from "three/examples/jsm/postprocessing/GlitchPass";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass";

import nx from "./assets/environmentMaps/nx.jpg";
import ny from "./assets/environmentMaps/ny.jpg";
import nz from "./assets/environmentMaps/nz.jpg";
import px from "./assets/environmentMaps/px.jpg";
import py from "./assets/environmentMaps/py.jpg";
import pz from "./assets/environmentMaps/pz.jpg";
import gltf from "./assets/glTF/DamagedHelmet.gltf?url";
import narmalMap from "./assets/interfaceNormalMap.png";

const gui = new dat.GUI();

// 场景
var scene = new THREE.Scene();

// 相机
let _cameraOption = [45, window.innerWidth / window.innerHeight, 1, 1000];
var camera = new THREE.PerspectiveCamera(..._cameraOption);
camera.position.set(1, 1, 5);
camera.lookAt(scene.position);

// 辅助坐标
let axesHelper = new THREE.AxesHelper(25);
// scene.add(axesHelper);

// 加载纹理

// 创建纹理加载器对象
const textureLoader = new THREE.TextureLoader();

// 添加环境纹理
const cubeTextureLoader = new THREE.CubeTextureLoader();
const envMapTexture = cubeTextureLoader.load([px, nx, py, ny, pz, nz]);
scene.background = envMapTexture;
scene.environment = envMapTexture;

const directionLight = new THREE.DirectionalLight("#ffffff", 1);
directionLight.castShadow = true;
directionLight.position.set(0, 0, 200);
scene.add(directionLight);

// 模型加载
const gltfLoader = new GLTFLoader();
gltfLoader.load(gltf, (gltf) => {
  const mesh = gltf.scene.children[0];

  scene.add(mesh);
});

// 渲染器
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0c0f0a, 1);
document.body.appendChild(renderer.domElement);

// 添加效果合成器
let effectComposer = new EffectComposer(renderer);
effectComposer.setSize(window.innerWidth, window.innerHeight);

// 添加渲染通道
const renderPass = new RenderPass(scene, camera);
effectComposer.addPass(renderPass);

// 点效果
const dotPass = new DotScreenPass();
dotPass.enabled = false; // 禁用效果
effectComposer.addPass(dotPass);

// 优化锯齿
const smaaPass = new SMAAPass();
effectComposer.addPass(smaaPass);

// 发光效果
const unrealBloomPass = new UnrealBloomPass();
unrealBloomPass.strength = 0;
unrealBloomPass.radius = 0;
unrealBloomPass.threshold = 0;
effectComposer.addPass(unrealBloomPass);

renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1;
renderer.threshold = 1;

gui.add(renderer, "threshold").min(0).max(2).step(0.01);
gui.add(unrealBloomPass, "strength").min(0).max(2).step(0.01);
gui.add(unrealBloomPass, "radius").min(0).max(2).step(0.01);
gui.add(unrealBloomPass, "threshold").min(0).max(2).step(0.01);

/**
 * @使用着色器写渲染通道
 *
 */
const colorParams = {
  r: 0,
  g: 0,
  b: 0,
};

const shaderPass = new ShaderPass({
  uniforms: {
    tDiffuse: {
      value: null,
    },
    uColor: {
      value: new THREE.Color(colorParams.r, colorParams.g, colorParams.b),
    },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform vec3 uColor;
    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      color.rgb += uColor;
      gl_FragColor = vec4(color);
    }
  `,
});
effectComposer.addPass(shaderPass);
gui
  .add(colorParams, "r")
  .min(-1)
  .max(1)
  .step(0.01)
  .onChange((val) => (shaderPass.uniforms.uColor.value.r = val));
gui
  .add(colorParams, "g")
  .min(-1)
  .max(1)
  .step(0.01)
  .onChange((val) => (shaderPass.uniforms.uColor.value.g = val));
gui
  .add(colorParams, "b")
  .min(-1)
  .max(1)
  .step(0.01)
  .onChange((val) => (shaderPass.uniforms.uColor.value.b = val));

/**
 * @使用法向纹理合成渲染
 */
const normalTexture = textureLoader.load(narmalMap);
console.log(normalTexture)

const normalPass = new ShaderPass({
  uniforms: {
    tDiffuse: {
      value: null,
    },
    uNormalMap:{
      value:null
    },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    uniform sampler2D tDiffuse;
    uniform sampler2D uNormalMap;
    void main() {
      // 获取每个片元在当前uv坐标的颜色
      vec4 color = texture2D(tDiffuse, vUv);
      // 获取每个片元在当前法向贴图上在当前uv的颜色
      vec4 normalColor = texture2D(uNormalMap, vUv);
      // 设置法相贴图光线的角度
      vec3 lightDirection = normalize(vec3(-5, 5, 2));

      // 将光线和法线贴图进行点积运算，得到法相贴图在当前光线夹角下的颜色
      float lightness = clamp(dot(normalColor.xyz,lightDirection), 0.0 ,1.0);
      color.xyz += lightness;
      gl_FragColor = vec4(color);
    }
  `,
});
normalPass.material.uniforms.uNormalMap.value = normalTexture;
effectComposer.addPass(normalPass);

// 控制器
var controls = new OrbitControls(camera, renderer.domElement);

// 时钟
var clock = new THREE.Clock();

// 渲染函数
function render() {
  const elapsedTime = clock.getElapsedTime();
  // renderer.render(scene, camera);
  effectComposer.render();
  requestAnimationFrame(render);
}

render();
