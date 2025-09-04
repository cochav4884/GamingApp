// js/dice3D.js
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js";

// Dice definitions
const diceTypes = [
  { name: "d4", sides: 4, color: "#f44336" },
  { name: "d6", sides: 6, color: "#2196f3" },
  { name: "d8", sides: 8, color: "#4caf50" },
  { name: "d10", sides: 10, color: "#ff9800" },
  { name: "d12", sides: 12, color: "#ffeb3b" },
  { name: "d20", sides: 20, color: "#9c27b0" },
  { name: "d100", sides: 100, color: "#607d8b" },
];

let scene, camera, renderer;
let world;
let activeDice = [];
let battlefield;

// ---------- Geometry and mesh ----------
function createDieGeometry(sides) {
  switch (sides) {
    case 4: return new THREE.TetrahedronGeometry(1);
    case 6: return new THREE.BoxGeometry(1, 1, 1);
    case 8: return new THREE.OctahedronGeometry(1);
    case 10: return new THREE.CylinderGeometry(1, 1, 1, 10);
    case 12: return new THREE.DodecahedronGeometry(1);
    case 20: return new THREE.IcosahedronGeometry(1);
    default: return new THREE.SphereGeometry(1, 32, 32); // d100
  }
}

function createDieMesh(sides, color) {
  const geometry = createDieGeometry(sides);

  const canvas = document.createElement("canvas");
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 256, 256);

  ctx.fillStyle = "#fff";
  ctx.font = "48px Arial";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(sides.toString(), 128, 128);

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshStandardMaterial({ map: texture });

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;

  return mesh;
}

// ---------- Init battlefield ----------
export function initDice3D(containerId = "battlefield") {
  battlefield = document.getElementById(containerId);
  if (!battlefield) return;

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    45,
    battlefield.clientWidth / battlefield.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 10, 20);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(battlefield.clientWidth, battlefield.clientHeight);
  battlefield.appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  // Cannon world
  world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0),
  });

  const ground = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane(),
  });
  ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(ground);

  // Simple walls to contain dice
  const walls = [
    { pos: [7, 0, 0], rot: [0, Math.PI/2, 0] },
    { pos: [-7, 0, 0], rot: [0, -Math.PI/2, 0] },
    { pos: [0, 0, 5], rot: [Math.PI/2, 0, 0] },
    { pos: [0, 0, -5], rot: [-Math.PI/2, 0, 0] },
  ];
  walls.forEach(w => {
    const b = new CANNON.Body({ mass: 0, shape: new CANNON.Plane() });
    b.position.set(...w.pos);
    b.quaternion.setFromEuler(...w.rot);
    world.addBody(b);
  });

  // Animate loop
  function animate() {
    requestAnimationFrame(animate);
    world.step(1 / 60);

    activeDice.forEach((d) => {
      d.mesh.position.copy(d.body.position);
      d.mesh.quaternion.copy(d.body.quaternion);

      // Check if settled
      if (
        d.body.velocity.length() < 0.05 &&
        d.body.angularVelocity.length() < 0.05
      ) {
        if (!d.settled) {
          d.settled = true;
          if (typeof d.onResult === "function") {
            const value = getTopFace(d.dieType.name, d.mesh);
            d.onResult(value);
          }
        }
      }
    });

    renderer.render(scene, camera);
  }
  animate();
}

// ---------- Dice physics sizes ----------
const diceSizes = {
  d4: 1.2,
  d6: 1,
  d8: 1.1,
  d10: 1.1,
  d12: 1.2,
  d20: 1.3,
  d100: 1
};

// ---------- Roll a die ----------
export function rollByName(dieName, onResult) {
  if (!scene || !world) return;

  const type = diceTypes.find(d => d.name === dieName);
  if (!type) return;

  const mesh = createDieMesh(type.sides, type.color);
  mesh.position.set(0, 3, 0);
  scene.add(mesh);

  // Physics shape
  const size = diceSizes[dieName];
  let shape;
  if (dieName === "d100") {
    shape = new CANNON.Sphere(size / 2);
  } else {
    shape = new CANNON.Box(new CANNON.Vec3(size / 2, size / 2, size / 2));
  }

  const body = new CANNON.Body({ mass: 1, shape });
  body.position.set(mesh.position.x, mesh.position.y, mesh.position.z);
  body.velocity.set(
    (Math.random() - 0.5) * 10,
    6 + Math.random() * 3,
    (Math.random() - 0.5) * 10
  );
  body.angularVelocity.set(
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10,
    (Math.random() - 0.5) * 10
  );

  world.addBody(body);

  activeDice.push({
    mesh,
    body,
    dieType: type,
    onResult,
    settled: false
  });
}

// ---------- Top-face calculation ----------
function getUpVector(mesh) {
  const up = new THREE.Vector3(0, 1, 0);
  up.applyQuaternion(mesh.quaternion);
  return up;
}

// Approximate face normals (exact for d4/d6, approximate for others)
const dieFaceNormals = {
  d4: [
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, -1, 1).normalize(),
    new THREE.Vector3(1, -1, 0).normalize(),
    new THREE.Vector3(-1, -1, -1).normalize(),
  ],
  d6: [
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(1, 0, 0),
    new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 0, 1),
    new THREE.Vector3(0, 0, -1),
  ],
  d8: [...Array(8).keys()].map(i => new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize()),
  d10: [...Array(10).keys()].map(i => new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize()),
  d12: [...Array(12).keys()].map(i => new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize()),
  d20: [...Array(20).keys()].map(i => new THREE.Vector3(Math.random(), Math.random(), Math.random()).normalize()),
  d100: []
};

function getTopFace(dieType, mesh) {
  if (dieType === "d100") {
    return Math.floor(Math.random() * 100) + 1;
  }

  const up = getUpVector(mesh);
  const normals = dieFaceNormals[dieType];
  let maxDot = -Infinity;
  let topIndex = 0;

  normals.forEach((n, i) => {
    const dot = n.dot(up);
    if (dot > maxDot) {
      maxDot = dot;
      topIndex = i;
    }
  });

  return topIndex + 1; // 1-based face number
}
