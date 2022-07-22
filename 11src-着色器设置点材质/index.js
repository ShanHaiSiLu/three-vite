import * as THREE from "three";
import gsap from "gsap";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import * as dat from "dat.gui";
import vertexShader from "./shader/basic/vertex.glsl?raw";
import fragmentShader from "./shader/basic/fragment.glsl?raw";

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
camera.position.set(0, 15, 0);
camera.lookAt(scene.position);

// 导入纹理
const textureLoader = new THREE.TextureLoader();
const texture1 = textureLoader.load("./assets/textures/particles/9.png");
const texture2 = textureLoader.load("./assets/textures/particles/10.png");
const texture3 = textureLoader.load("./assets/textures/particles/11.png");

// 设置星系旋臂参数
const params = {
  count: 100000, // 所有旋臂上顶点的数量的和（会被平均分配到各个旋臂，若不能整除则分配完为止）
  size: 0.2, // 顶点大小
  radius: 5, // 星系半径
  branch: 4, // 分支数/旋臂数
  color: "#ff6030", // 顶点颜色
  rotateScale: 0, // 旋臂的弯曲程度
  endColor: "#1b3984",
};

let geometry = null;
let material = null;

let startColor = new THREE.Color(params.color);
let endColor = new THREE.Color(params.endColor);

function generateGalaxy() {
  geometry = new THREE.BufferGeometry();
  let points = new Float32Array(params.count * 3);
  let colors = new Float32Array(params.count * 3);
  let imgIndex = new Float32Array(params.count); // 顶点使用哪张纹理贴图，在顶点着色器中获取并传入片元着色器
  let uScale = new Float32Array(params.count);

  for (var i = 0; i < params.count; i++) {
    // 获取当前所处旋臂的角度（当前旋臂的旋转角度）
    let branchAngel = (i % params.branch) * ((Math.PI * 2) / params.branch);

    // 当前顶点到圆心的距离（当前顶点所在圆的半径）
    let _r = Math.random() * params.radius * Math.random() ** 3;
    // 离散参数，表示当前点分别向x/y/z偏移的分量。这里的几何意义实际上是点的坐标向中间的线趋近的过程。取[-1, 1]的范围是因为有些点的坐标处于负数范围（此句解释存疑）
    let rendomX = ((Math.random() * 2 - 1) ** 3 * (params.radius - _r)) / 5;
    let rendomY = ((Math.random() * 2 - 1) ** 3 * (params.radius - _r)) / 5;
    let rendomZ = ((Math.random() * 2 - 1) ** 3 * (params.radius - _r)) / 5;

    let _current = i * 3;

    points[_current] =
      Math.cos(branchAngel + _r * params.rotateScale) * _r + rendomX;
    points[_current + 1] = 0 + rendomY;
    points[_current + 2] =
      Math.sin(branchAngel + _r * params.rotateScale) * _r + rendomZ;

    // 生成混合色
    let mixColor = startColor.clone();
    mixColor.lerp(endColor, _r / params.radius);
    // console.log(mixColor)
    colors[_current] = mixColor.r;
    colors[_current + 1] = mixColor.g;
    colors[_current + 2] = mixColor.b;

    uScale[i] = Math.random();
    imgIndex[i] = i % 3;
  }

  console.log(imgIndex);

  geometry.setAttribute("position", new THREE.BufferAttribute(points, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  geometry.setAttribute("uScale", new THREE.BufferAttribute(uScale, 1));
  console.log(uScale);
  geometry.setAttribute("imgIndex", new THREE.BufferAttribute(imgIndex, 1));

  // material = new THREE.PointsMaterial({
  //   color: new THREE.Color(params.color),
  //   size: params.size,
  //   sizeAttenuation: true, // 关闭点大小随着相机深度衰减
  //   depthWrite: false,
  //   blending: THREE.AdditiveBlending,
  //   // map: particlesTexture,
  //   // alphaMap: particlesTexture,
  //   transparent: true,
  //   vertexColors: true, // 优先使用顶点颜色
  // });

  material = new THREE.ShaderMaterial({
    vertexShader: vertexShader,
    fragmentShader: fragmentShader,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending, // 亮度叠加
    sizeAttenuation: true, // 关闭点大小随着相机深度衰减
    vertexColors: true, // 优先使用顶点颜色
    uniforms: {
      uTexture1: {
        value: texture1,
      },
      uTexture2: {
        value: texture2,
      },
      uTexture3: {
        value: texture3,
      },
      uTime: {
        value: 0,
      },
    },
  });

  let pointMesh = new THREE.Points(geometry, material);
  scene.add(pointMesh);
  console.log(pointMesh);

  return pointMesh;
}

generateGalaxy();

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

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

  material.uniforms.uTime.value = elapsedTime;

  renderer.render(scene, camera);
  requestAnimationFrame(render);
}
render();
