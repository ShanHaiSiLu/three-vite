import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import {
  CSS2DRenderer,
  CSS2DObject,
} from "three/examples/jsm/renderers/CSS2DRenderer.js";

import earthAtmos from "./assets/planets/earth_atmos_2048.jpg";
import earthSpecular from "./assets/planets/earth_specular_2048.jpg";
import earthNormal from "./assets/planets/earth_normal_2048.jpg";
import moonMap from "./assets/planets/moon_1024.jpg";

// 变量声明 - 基本元素
let scene, camera, renderer, axesHelper, controls, clock;

// 变量声明 - 特有变量
let earthGeometry, earthMaterial, earth, moonGeometry, moonMaterial, moon;

let textureLoader = new THREE.TextureLoader();

// 场景
scene = new THREE.Scene();

// 相机
let _cameraOption = [45, window.innerWidth / window.innerHeight, 1, 1000];
camera = new THREE.PerspectiveCamera(..._cameraOption);
camera.position.set(1, 3, 10);
camera.lookAt(scene.position);

// 辅助坐标
axesHelper = new THREE.AxesHelper(25);
// scene.add(axesHelper);

// 聚光灯
const dirLight = new THREE.DirectionalLight(0xffffff);
dirLight.position.set(0, 0, 1);
scene.add(dirLight);
const light = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
scene.add(light);

/**
 * @创建地月mesh
 */
earthGeometry = new THREE.SphereGeometry(1, 16, 16);
earthMaterial = new THREE.MeshPhongMaterial({
  specular: 0x333333,
  shininess: 5,
  map: textureLoader.load(earthAtmos),
  specularMap: textureLoader.load(earthSpecular),
  normalMap: textureLoader.load(earthNormal),
});
earth = new THREE.Mesh(earthGeometry, earthMaterial);
earth.rotation.y = Math.PI;
scene.add(earth);

moonGeometry = new THREE.SphereGeometry(0.27, 16, 16);
moonMaterial = new THREE.MeshPhongMaterial({
  shininess: 5,
  map: textureLoader.load(moonMap),
});
moon = new THREE.Mesh(moonGeometry, moonMaterial);
scene.add(moon);

/**
 * @添加提示标签
 */
const earthDiv = document.createElement("div");
earthDiv.className = "label";
earthDiv.innerText = "地球";
const earthLabel = new CSS2DObject(earthDiv);
earthLabel.position.set(0, 1, 0);
earth.add(earthLabel);

// 中国
const chinaDiv = document.createElement("div");
chinaDiv.className = "label";
chinaDiv.innerText = "中国";
const chinaLabel = new CSS2DObject(chinaDiv);
chinaLabel.position.set(-0.3, 0.5, -0.9);
earth.add(chinaLabel);

const moonDiv = document.createElement("div");
moonDiv.className = "label";
moonDiv.innerText = "月球";
const moonLabel = new CSS2DObject(moonDiv);
moonLabel.position.set(0, 0.3, 0);
moon.add(moonLabel);

// 实例化CSS2D渲染器
const labelRenderer = new CSS2DRenderer();
labelRenderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(labelRenderer.domElement);
labelRenderer.domElement.style.position = "fixed";
labelRenderer.domElement.style.top = "0";
labelRenderer.domElement.style.left = "0";
labelRenderer.domElement.style.zIndex = "10";

// 渲染器
renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0c0f0a, 1);
document.body.appendChild(renderer.domElement);

// 控制器
controls = new OrbitControls(camera, labelRenderer.domElement);

// 时钟
clock = new THREE.Clock();

// 创建射线
const raycaster = new THREE.Raycaster();

// 渲染函数
function render() {
  const elapsed = clock.getElapsedTime();

  moon.position.set(Math.sin(elapsed) * 5, 0, Math.cos(elapsed) * 5);

  // 监测标签的显示
  // 将标签的坐标转化为归一化坐标
  let chinaLabelPosition = chinaLabel.position.clone();
  chinaLabelPosition.project(camera);
  let moonLabelPosition = moonLabel.position.clone();
  moonLabelPosition.project(camera);

  // 获取标签到摄像机的距离
  const chinaLabelDistance = chinaLabelPosition.distanceTo(camera.position);

  // 更新射线
  raycaster.setFromCamera(chinaLabelPosition, camera);

  // 检测碰撞
  const intersects = raycaster.intersectObjects(scene.children, true);
  if (intersects.map((i) => i.distance).some((i) => i < chinaLabelDistance)) {
    chinaDiv.classList.add("hidden");
  } else {
    chinaDiv.classList.remove("hidden");
  }

  renderer.render(scene, camera);
  labelRenderer.render(scene, camera);
  requestAnimationFrame(render);
}

render();
