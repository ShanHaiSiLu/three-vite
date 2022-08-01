import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import gsap from "gsap";
import sphere1 from "./assets/sphere1.glb?url";
import sphere2 from "./assets/sphere2.glb?url";

// 变量声明 - 基本元素
let scene, camera, renderer, axesHelper, controls, clock;

// 场景
scene = new THREE.Scene();

// gltf加载器
const gltfLoader = new GLTFLoader();

// 相机
let _cameraOption = [45, window.innerWidth / window.innerHeight, 1, 1000];
camera = new THREE.PerspectiveCamera(..._cameraOption);
camera.position.set(1, 1, 10);
camera.lookAt(scene.position);

// 辅助坐标
axesHelper = new THREE.AxesHelper(25);
scene.add(axesHelper);

// 灯光
let spotLight = new THREE.SpotLight(0xffffbb, 2);
spotLight.position.set(0.5, 0, 1);
spotLight.position.multiplyScalar(700);
scene.add(spotLight);
let spotLight2 = new THREE.SpotLight(0xffffbb, 2);
spotLight2.position.set(-0.5, 0, -1);
spotLight2.position.multiplyScalar(700);
scene.add(spotLight2);

// 辅助gsap进行形变的参数
const gsapParams = {
  value: 0,
};

// 加载模型，执行变形动画
gltfLoader.load(sphere1, (gltf1) => {
  scene.add(gltf1.scene);
  const sphere1 = gltf1.scene.children[0];

  gltfLoader.load(sphere2, (gltf2) => {
    sphere1.geometry.morphAttributes.position = [];
    sphere1.geometry.morphAttributes.position.push(
      gltf2.scene.children[0].geometry.attributes.position
    );
    console.log(gltf2.scene.children[0].geometry.attributes.position);
    sphere1.updateMorphTargets();
    // sphere1.morphTargetInfluences[0] = 1;
    gsap.to(gsapParams, {
      value: 1,
      duration: 2,
      repeat: -1, // 无限次重复
      yoyo: true, // 动画执行完之后再反着执行回去
      onUpdate() {
        sphere1.morphTargetInfluences[0] = gsapParams.value;
      },
    });
  });
});

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
