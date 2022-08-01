import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

import earthAtmos from "./assets/planets/earth_atmos_2048.jpg";
import earthSpecular from "./assets/planets/earth_specular_2048.jpg";
import earthNormal from "./assets/planets/earth_normal_2048.jpg";
import moonMap from "./assets/planets/moon_1024.jpg";

// 变量声明 - 基本元素
let scene, camera, renderer, axesHelper, controls, clock;

// 场景
scene = new THREE.Scene();

// 相机
let _cameraOption = [45, window.innerWidth / window.innerHeight, 1, 1000];
camera = new THREE.PerspectiveCamera(..._cameraOption);
camera.position.set(1, 3, 10);
camera.lookAt(scene.position);

// 辅助坐标
axesHelper = new THREE.AxesHelper(25);
scene.add(axesHelper);

// 聚光灯
const dirLight = new THREE.DirectionalLight(0xffffff);
dirLight.position.set(0, 0, 1);
scene.add(dirLight);
const light = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
scene.add(light);

/**
 * @创建地月mesh
 */
let textureLoader = new THREE.TextureLoader();
let earthGeometry = new THREE.SphereGeometry(1, 16, 16);
let earthMaterial = new THREE.MeshPhongMaterial({
  specular: 0x333333,
  shininess: 5,
  map: textureLoader.load(earthAtmos),
  specularMap: textureLoader.load(earthSpecular),
  normalMap: textureLoader.load(earthNormal),
});
let earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.rotation.y = Math.PI;
scene.add(earth);

let moonGeometry = new THREE.SphereGeometry(0.27, 16, 16);
let moonMaterial = new THREE.MeshPhongMaterial({
  shininess: 5,
  map: textureLoader.load(moonMap),
});
let moon = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moon);

/**
 * @创建曲线并绘制
 */
let curve = new THREE.CatmullRomCurve3([
  new THREE.Vector3(10, 0, 0),
  new THREE.Vector3(5, 5, -5),
  new THREE.Vector3(-5, 0, -10),
  new THREE.Vector3(10, 10, 10),
  new THREE.Vector3(10, 10, -10),
  new THREE.Vector3(-10, -10, 0),
  new THREE.Vector3(-10, -10, -10),
  new THREE.Vector3(10, 0, 0),
]);
let points = curve.getPoints(500);
console.log(points);
const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0xff0000 });
const curveObject = new THREE.Line(lineGeometry, lineMaterial);
scene.add(curveObject);

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
  const elapsed = clock.getElapsedTime();

  let point = curve.getPoint((elapsed / 10) % 1);
  moon.position.set(point.x, point.y, point.z);
  // moon.position.set(Math.sin(elapsed) * 5, 0, Math.cos(elapsed) * 5);
  camera.position.copy(point);
  camera.lookAt(earth.position);

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
