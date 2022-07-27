import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

// 场景
var scene = new THREE.Scene();

// 相机
let _cameraOption = [45, window.innerWidth / window.innerHeight, 1, 1000];
var camera = new THREE.PerspectiveCamera(..._cameraOption);
camera.position.set(1, 1, 5);
camera.lookAt(scene.position);

// 辅助坐标
let axesHelper = new THREE.AxesHelper(25);
scene.add(axesHelper);

// 基础材质
let basicMaterial = new THREE.MeshBasicMaterial({
  color: "#00ff00",
  side: THREE.DoubleSide,
});

basicMaterial.onBeforeCompile = (
  { vertexShader, fragmentShader },
  renderer
) => {
  console.log(vertexShader);
  console.log(
    `%c  ${fragmentShader} `,
    "font-size:13px; background:pink; color:#bf2c9f;"
  );
};

// 标准材质
let standerMaterial = new THREE.MeshStandardMaterial({
  color: "#ffff00",
});

const floor = new THREE.Mesh(
  new THREE.PlaneBufferGeometry(1, 1, 64, 64),
  basicMaterial
);

scene.add(floor);

// 渲染器
var renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0c0f0a, 1);
document.body.appendChild(renderer.domElement);

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
