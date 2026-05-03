let scene, camera, renderer, controls;
let world = {};
let raycaster = new THREE.Raycaster();
let velocity = new THREE.Vector3();
let canJump = false;

const GRAVITY = 0.02;
const WORLD_SIZE = 20;

let isMobile = /Mobi|Android/i.test(navigator.userAgent);

// MOBILE STATE
let joystick = { x: 0, y: 0 };
let looking = false;
let touchStart = { x: 0, y: 0 };

init();
animate();

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);

  camera = new THREE.PerspectiveCamera(75, innerWidth/innerHeight, 0.1, 1000);

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(innerWidth, innerHeight);
  document.body.appendChild(renderer.domElement);

  controls = new THREE.PointerLockControls(camera, document.body);

  if (!isMobile) {
    document.body.addEventListener("click", () => controls.lock());
  }

  scene.add(controls.getObject());

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(10, 20, 10);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x888888));

  generateWorld();
  setupMobileControls();

  window.addEventListener("resize", onResize);
  window.addEventListener("mousedown", onMouseDown);
}

function createBlock(x, y, z, color) {
  const geo = new THREE.BoxGeometry(1,1,1);
  const mat = new THREE.MeshStandardMaterial({ color });
  const cube = new THREE.Mesh(geo, mat);
  cube.position.set(x,y,z);
  scene.add(cube);
  world[`${x},${y},${z}`] = cube;
}

function generateWorld() {
  for (let x = -10; x < 10; x++) {
    for (let z = -10; z < 10; z++) {
      let h = Math.floor(Math.random()*3);
      for (let y = 0; y < h; y++) {
        createBlock(x,y,z, y === h-1 ? 0x22aa22 : 0x8B4513);
      }
    }
  }
  camera.position.y = 5;
}

function onMouseDown(e) {
  interact(e.button === 0 ? "break" : "place");
}

function interact(type) {
  raycaster.setFromCamera({x:0,y:0}, camera);
  let hit = raycaster.intersectObjects(Object.values(world))[0];
  if (!hit) return;

  let pos = hit.object.position;

  if (type === "break") {
    scene.remove(hit.object);
    delete world[`${pos.x},${pos.y},${pos.z}`];
  } else {
    let normal = hit.face.normal;
    let p = pos.clone().add(normal);
    createBlock(p.x, p.y, p.z, 0xaaaaaa);
  }
}

/* MOBILE CONTROLS */
function setupMobileControls() {
  if (!isMobile) return;

  const stick = document.getElementById("stick");
  const joy = document.getElementById("joystick");

  joy.addEventListener("touchmove", e => {
    let t = e.touches[0];
    let rect = joy.getBoundingClientRect();

    let x = t.clientX - rect.left - 50;
    let y = t.clientY - rect.top - 50;

    joystick.x = x / 40;
    joystick.y = y / 40;

    stick.style.transform = `translate(${x}px, ${y}px)`;
  });

  joy.addEventListener("touchend", () => {
    joystick.x = 0;
    joystick.y = 0;
    stick.style.transform = `translate(0px,0px)`;
  });

  // LOOK
  window.addEventListener("touchstart", e => {
    if (e.target.id === "joystick") return;
    looking = true;
    touchStart.x = e.touches[0].clientX;
    touchStart.y = e.touches[0].clientY;
  });

  window.addEventListener("touchmove", e => {
    if (!looking) return;

    let dx = e.touches[0].clientX - touchStart.x;
    let dy = e.touches[0].clientY - touchStart.y;

    camera.rotation.y -= dx * 0.002;
    camera.rotation.x -= dy * 0.002;

    touchStart.x = e.touches[0].clientX;
    touchStart.y = e.touches[0].clientY;
  });

  window.addEventListener("touchend", () => looking = false);

  document.getElementById("jumpBtn").onclick = () => {
    if (canJump) {
      velocity.y = 0.3;
      canJump = false;
    }
  };

  document.getElementById("placeBtn").onclick = () => {
    interact("place");
  };

  // TAP TO BREAK
  renderer.domElement.addEventListener("touchstart", () => {
    interact("break");
  });
}

function move() {
  const speed = 0.1;

  if (isMobile) {
    camera.translateZ(-joystick.y * speed);
    camera.translateX(joystick.x * speed);
  }
}

function gravity() {
  velocity.y -= GRAVITY;
  camera.position.y += velocity.y;

  if (camera.position.y < 2) {
    velocity.y = 0;
    camera.position.y = 2;
    canJump = true;
  }
}

function animate() {
  requestAnimationFrame(animate);
  move();
  gravity();
  renderer.render(scene, camera);
}

function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

window.addEventListener("contextmenu", e => e.preventDefault());
