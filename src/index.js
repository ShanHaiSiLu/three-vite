import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import gsap from "gsap";

import { Room, SpriteText } from "./class";

// 变量声明 - 基本元素
let scene, camera, renderer, axesHelper, controls, clock;
let progress;
let room = {};
let positions = {
  客厅: [100, 110],
  厨房: [180, 190],
  阳台: [50, 50],
};

// 添加加载进度管理器
initLoadingManager();
// 初始化
init();
// 移动标记点到指定位置
moveTag("客厅");

function init() {
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

  // 渲染器
  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0c0f0a, 1);
  document.body.appendChild(renderer.domElement);

  // 控制器
  // controls = new OrbitControls(camera, renderer.domElement);

  // 时钟
  clock = new THREE.Clock();

  initControls();

  render();

  createRoom();
}

function initControls() {
  let isPointDown = false;

  renderer.domElement.addEventListener("pointerdown", (e) => {
    console.log("指针按下");
    isPointDown = true;
  });
  renderer.domElement.addEventListener("pointerup", (e) => {
    console.log("指针抬起");
    isPointDown = false;
  });
  renderer.domElement.addEventListener("pointerout", (e) => {
    console.log("指针移出");
    isPointDown = false;
  });
  renderer.domElement.addEventListener(
    "pointermove",
    ({ movementX, movementY }) => {
      if (!isPointDown) return;
      // console.log(`水平移动了${movementX}，垂直移动了${movementY}`);
      camera.rotation.x -= movementY * 0.008;
      camera.rotation.y -= movementX * 0.008;

      camera.rotation.order = "YXZ";
    }
  );
}

function initLoadingManager() {
  let loadingMask = document.querySelector(".loading-wra"),
    loadingText = loadingMask.querySelector("span b");

  THREE.DefaultLoadingManager.onProgress = function (item, loader, total) {
    console.log(item, loader, total);
    progress = ((loader / total) * 100).toFixed(2);

    loadingText.innerText = progress + " %";
    if (+progress === 100) {
      console.log("加载完成");
      loadingMask.parentNode.removeChild(loadingMask);
    }
  };
}

// 渲染函数
function render() {
  const elapsedTime = clock.getElapsedTime();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

function createRoom() {
  // 客厅
  let liveroomPosition = new THREE.Vector3(0, 0, 0);
  room.liveroom = new Room("客厅", 0, "./assets/livingroom", liveroomPosition);
  scene.add(room.liveroom);

  // 创建厨房
  let kitchenPosition = new THREE.Vector3(-5, 0, -10);
  let kitchenEur = new THREE.Euler(0, -Math.PI / 2, 0);
  room.kitchen = new Room(
    "厨房",
    3,
    "./assets/kitchen",
    kitchenPosition,
    kitchenEur
  );
  scene.add(room.kitchen);

  // 厨房文字
  let kitchenTextPosition = new THREE.Vector3(-1.5, -0.2, -4);
  let kitchenText = new SpriteText("厨房", kitchenTextPosition, camera);
  scene.add(kitchenText.sprite);
  kitchenText.onClick(() => {
    moveTag("厨房");
    gsap.to(camera.position, {
      duration: 1,
      x: kitchenPosition.x,
      y: kitchenPosition.y,
      z: kitchenPosition.z,
    });
  });

  // 厨房返回客厅
  let kitchenToKtText = new THREE.Vector3(-4, 0, -6);
  let kitchenToKt = new SpriteText("客厅", kitchenToKtText, camera);
  scene.add(kitchenToKt.sprite);
  kitchenToKt.onClick(() => {
    moveTag("客厅");
    gsap.to(camera.position, {
      duration: 1,
      x: liveroomPosition.x,
      y: liveroomPosition.y,
      z: liveroomPosition.z,
    });
  });

  // 创建阳台
  let balconyPosition = new THREE.Vector3(0, 0, 15);
  room.balcony = new Room("阳台", 8, "./assets/balcony", balconyPosition);
  scene.add(room.balcony);
  // 去阳台的文字
  let balconyText = new SpriteText(
    "阳台",
    new THREE.Vector3(0, 0, 4.8),
    camera
  );
  scene.add(balconyText.sprite);
  balconyText.onClick(() => {
    moveTag("阳台");
    gsap.to(camera.position, {
      duration: 1,
      x: balconyPosition.x,
      y: balconyPosition.y,
      z: balconyPosition.z,
    });
  });

  // 阳台回客厅
  let balconyBackText = new SpriteText(
    "客厅",
    new THREE.Vector3(-1, 0, 11),
    camera
  );
  scene.add(balconyBackText.sprite);
  balconyBackText.onClick(() => {
    moveTag("客厅");
    gsap.to(camera.position, {
      duration: 1,
      x: liveroomPosition.x,
      y: liveroomPosition.y,
      z: liveroomPosition.z,
    });
  });
}

// 移动标签
document.querySelector(".map-wra img.tag").style =
  "transform: translate(100px, 100px)";

function moveTag(name) {
  if (positions[name])
    gsap.to(document.querySelector(".map-wra img.tag"), {
      duration: 1,
      x: positions[name][0],
      y: positions[name][1],
    });
}
