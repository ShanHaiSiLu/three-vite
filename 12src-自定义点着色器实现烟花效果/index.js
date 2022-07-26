import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader";
import { Water } from "three/examples/jsm/objects/Water2";

// 静态资源，glsl、模型文件等
import vertexShader from "./shader/basic/vertex.glsl?raw";
import fragmentShader from "./shader/basic/fragment.glsl?raw";
import Fireworks from "./firework.js";
import hdrPath from "./assets/2k.hdr?url";
import glbPath from "./assets/flyLight.glb?url";
import glbPath2 from "./assets/newyears_min.glb?url";
import waterNormal1 from "./assets/waterTextures/Water_1_M_Normal.jpg";
import waterNormal2 from "./assets/waterTextures/Water_2_M_Normal.jpg";

// 创建着色器材质
const shaderMaterial = new THREE.ShaderMaterial({
  // transparent: true,
  // 顶点着色器
  vertexShader: vertexShader,
  // 片元着色器
  fragmentShader: fragmentShader,
  // 双面渲染
  side: THREE.DoubleSide,
  // 向着色器中传入变量
  uniforms: {},
});

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
  1,
  1000
);
camera.position.set(10, 10, 65);
camera.lookAt(scene.position);

// 辅助坐标
let axesHelper = new THREE.AxesHelper(25);
// scene.add(axesHelper);

// 创建纹理加载对象，加载环境贴图
const rgbeLoader = new RGBELoader();
rgbeLoader.loadAsync(hdrPath).then((texture) => {
  texture.mapping = THREE.EquirectangularReflectionMapping;
  scene.background = texture;
  scene.environment = texture;
});

// 创建模型加载对象，加载模型

let glbLoader = new GLTFLoader();
let ligntBox = null;
// 加载建筑
glbLoader.load(glbPath2, (glb) => {
  scene.add(glb.scene);
  // 水面覆盖
  let textureLoader = new THREE.TextureLoader();
  let waterPlane = new THREE.PlaneBufferGeometry(100, 100, 1024, 1024);
  let water = new Water(waterPlane, {
    normalMap0: textureLoader.load(waterNormal1),
    normalMap1: textureLoader.load(waterNormal2),
  });
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.5;

  scene.add(water);
});
// 加载孔明灯
glbLoader.load(glbPath, (glb) => {
  // scene.add(glb.scene);
  ligntBox = glb.scene.children[0];
  ligntBox.material = shaderMaterial;

  for (var i = 0; i < 150; i++) {
    let _glb = glb.scene.clone(true);
    const x = Math.random() * 300 - 150;
    const z = Math.random() * 300 - 150;
    const y = Math.random() * 55 + 25;
    _glb.position.set(x, y, z);
    scene.add(_glb);

    gsap.to(_glb.rotation, {
      y: Math.PI,
      duration: 5 + Math.random() * 10,
      repeat: -1,
    });

    gsap.to(_glb.position, {
      y: "+=" + Math.PI * Math.random() * 3,
      duration: 5 + Math.random() * 10,
      yoyo: true,
      repeat: -1,
    });
    gsap.to(_glb.position, {
      z: "+=" + Math.PI * Math.random() * 8,
      duration: 5 + Math.random() * 10,
      yoyo: true,
      repeat: -1,
    });
  }
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
renderer.toneMappingExposure = 0.2;

// 控制器
var controls = new OrbitControls(camera, renderer.domElement);

// 时钟
var clock = new THREE.Clock();
// 烟花组
let fireworks = [];

// 渲染函数
function render() {
  const elapsedTime = clock.getElapsedTime();
  renderer.render(scene, camera);
  requestAnimationFrame(render);

  fireworks.forEach((item, i) => {
    let type = item.update();
    if (type === "remove") {
      // 烟花已经结束，在数组中删除当前烟花
      fireworks.splice(i, 1);
    }
  });
}

render();

// 点击创建烟花
window.addEventListener("click", () => {
  let color = `hsl(${Math.floor(Math.random() * 360)}, 100%, 80%)`,
    position = {
      x: Math.random() * 40 - 20,
      z: Math.random() * 40 - 20,
      y: 15 + Math.random() * 25,
    };

  let firework = new Fireworks(color, position);

  firework.addScene(scene, camera);
  fireworks.push(firework);
});
