import * as THREE from "three";

export class Room {
  constructor(
    name,
    roomIndex,
    textureUrl,
    position = new THREE.Vector3(0, 0, 0),
    euler = new THREE.Euler(0, 0, 0)
  ) {
    this.name = name;

    let cubeGeometry = new THREE.BoxGeometry(10, 10, 10);
    cubeGeometry.scale(1, 1, -1);

    let imgArr = [
      `${roomIndex}_l`,
      `${roomIndex}_r`,
      `${roomIndex}_u`,
      `${roomIndex}_d`,
      `${roomIndex}_b`,
      `${roomIndex}_f`,
    ];

    imgArr = imgArr.map((i, j) => {
      let texture = new THREE.TextureLoader().load(`${textureUrl}/${i}.jpg`);

      // 顶部和底部的纹理需要旋转
      if (i === `${roomIndex}_d` || i === `${roomIndex}_u`) {
        texture.rotation = Math.PI;
        texture.center = new THREE.Vector2(0.5, 0.5);
      }

      return new THREE.MeshBasicMaterial({
        map: texture,
      });
    });

    let cube = new THREE.Mesh(cubeGeometry, imgArr);
    cube.position.copy(position);
    cube.rotation.copy(euler);

    return cube;
  }
}

export class SpriteText {
  constructor(text, position, camera) {
    this.callbacks = [];

    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const context = canvas.getContext("2d");
    context.fillStyle = "rgba(100,100,100,0.7)";
    context.fillRect(0, 0, 1024, 1024);
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.font = "bold 300px Arial";
    context.fillStyle = "white";
    context.fillText(text, canvas.width / 2, canvas.height / 1.3);

    let texture = new THREE.CanvasTexture(canvas);
    texture.repeat.y = 0.5;

    let material = new THREE.SpriteMaterial({
      map: texture,
      transparent: true,
    });

    let sprite = new THREE.Sprite(material);
    sprite.position.copy(position);
    sprite.scale.set(0.5, 0.25, 0.5);

    this.mouse = new THREE.Vector2();
    this.ray = new THREE.Raycaster();
    window.addEventListener("click", (e) => {
      this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
      this.mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

      this.ray.setFromCamera(this.mouse, camera);

      let is = this.ray.intersectObject(sprite);
      if (is.length) this.callbacks.forEach((cb) => cb());
    });

    this.sprite = sprite;
  }

  onClick(cb) {
    this.callbacks.push(cb);
  }
}
