import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import * as dat from "dat.gui";
import { Water } from "three/examples/jsm/objects/Water2";

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

let textureLoader = new THREE.TextureLoader();
let glbLoader = new GLTFLoader();
let hdrLoader = new RGBELoader();

const waterOptions = {
  normalMap0: textureLoader.load("./assets/waterTextures/Water_1_M_Normal.jpg"),
  normalMap1: textureLoader.load("./assets/waterTextures/Water_2_M_Normal.jpg"),
  color: "#ffffff",
  scale: 10,
  flowDirection: new THREE.Vector2(1, 1),
  textureHeight: 1024,
  textureWidth: 1024,
};

// 导入环境场景
hdrLoader.loadAsync("./assets/waterScene/050.hdr").then((hdr) => {
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = hdr;
  scene.environment = hdr;
});

// 导入浴缸
glbLoader.loadAsync("./assets/waterScene/yugang.glb").then((glb) => {
  // scene.add(glb.scene);
  // console.log(glb.scene);
  let [yugang, shuimian] = glb.scene.children;

  yugang.material.side = THREE.DoubleSide;
  // scene.add(yugang);

  let waterPlane = new Water(shuimian.geometry, waterOptions);
  waterPlane.material.side = THREE.DoubleSide;
  scene.add(waterPlane);
});

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

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();
