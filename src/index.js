import * as THREE from "three";
import { BoxGeometry } from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// 变量声明 - 基本元素
let scene, camera, renderer, axesHelper, controls, clock;

// 场景
scene = new THREE.Scene();

// 相机
let _cameraOption = [45, window.innerWidth / window.innerHeight, 1, 1000];
camera = new THREE.PerspectiveCamera(..._cameraOption);
camera.position.set(0, 0, 1);
camera.lookAt(scene.position);

// 辅助坐标
axesHelper = new THREE.AxesHelper(25);
scene.add(axesHelper);

const textureLoader = new THREE.TextureLoader();

// 按照顺序排列图片并加载为材质
let imgArr = ["4_b", "4_f", "4_l", "4_r", "4_u", "4_d"];
imgArr = imgArr.map(
  (i) =>
    new THREE.MeshBasicMaterial({
      map: textureLoader.load(`./assets/living/${i}.jpg`),
      side: THREE.DoubleSide
    })
);

const cube = new THREE.Mesh(new THREE.BoxGeometry(10, 10, 10), imgArr);
scene.add(cube);

// 渲染器
renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0c0f0a, 1);
document.body.appendChild(renderer.domElement);

// 控制器
controls = new OrbitControls(camera, renderer.domElement);

// 时钟
clock = new THREE.Clock();

// 渲染函数
function render() {
  const elapsedTime = clock.getElapsedTime();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
