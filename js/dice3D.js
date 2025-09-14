// js/dice3D.js
import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";
import * as CANNON from "https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js";

// ---------- Dice definitions ----------
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
let battlefield;
let lastTime = 0;

export const activeDice = []; // only export once

// ---------- Dice geometries ----------
function createDieGeometry(sides) {
  switch (sides) {
    case 4: return new THREE.TetrahedronGeometry(1);
    case 6: return new THREE.BoxGeometry(1, 1, 1);
    case 8: return new THREE.OctahedronGeometry(1);
    case 10: return new THREE.CylinderGeometry(1, 1, 1, 10);
    case 12: return new THREE.DodecahedronGeometry(1);
    case 20: return new THREE.IcosahedronGeometry(1);
    default: return new THREE.SphereGeometry(1, 32, 32);
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

// ---------- Init Dice 3D ----------
export function initDice3D(container) {
  battlefield = container;

  scene = new THREE.Scene();
  scene.background = null;

  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 15, 20);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // ---------- Physics World ----------
  world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 20;

  // Ground
  const groundShape = new CANNON.Plane();
  const groundBody = new CANNON.Body({ mass: 0 });
  groundBody.addShape(groundShape);
  groundBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
  world.addBody(groundBody);

  // Side walls
  const wallMat = new CANNON.Material();
  const wallDistance = 8;
  const wallDepth = 20;

  const leftWall = new CANNON.Body({ mass: 0, material: wallMat });
  leftWall.addShape(new CANNON.Plane());
  leftWall.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);
  leftWall.position.set(-wallDistance, 0, 0);
  world.addBody(leftWall);

  const rightWall = new CANNON.Body({ mass: 0, material: wallMat });
  rightWall.addShape(new CANNON.Plane());
  rightWall.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), -Math.PI / 2);
  rightWall.position.set(wallDistance, 0, 0);
  world.addBody(rightWall);

  const backWall = new CANNON.Body({ mass: 0, material: wallMat });
  backWall.addShape(new CANNON.Plane());
  backWall.quaternion.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI);
  backWall.position.set(0, 0, -wallDepth / 2);
  world.addBody(backWall);

  const frontWall = new CANNON.Body({ mass: 0, material: wallMat });
  frontWall.addShape(new CANNON.Plane());
  frontWall.position.set(0, 0, wallDepth / 2);
  world.addBody(frontWall);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  // Animate loop
  animate();
}

// ---------- Dice sizes ----------
const diceSizes = {
  d4: 1.2, d6: 1, d8: 1.1, d10: 1.1,
  d12: 1.2, d20: 1.3, d100: 1
};

// ---------- Remove dice ----------
export function removeDice(d) {
  if (!d || d.removed) return;
  try { scene.remove(d.mesh); } catch {}
  try { world.removeBody(d.body); } catch {}
  d.removed = true;
  const idx = activeDice.indexOf(d);
  if (idx > -1) activeDice.splice(idx, 1);
}

// ---------- Roll a die ----------
export function rollByName(dieName, onResult = null, opts = {}) {
  if (!scene || !world) return null;
  const type = diceTypes.find(d => d.name === dieName);
  if (!type) return null;

  const mesh = createDieMesh(type.sides, type.color);
  const start = opts.position || { x: 6, y: 2, z: 0 }; // start on right
  mesh.position.set(start.x, start.y, start.z);
  scene.add(mesh);

  // Physics
  const size = diceSizes[dieName] || 1;
  const shape = dieName === "d100" ? new CANNON.Sphere(size / 2) : new CANNON.Box(new CANNON.Vec3(size/2,size/2,size/2));
  const body = new CANNON.Body({ mass: 1, shape });
  body.position.set(start.x, start.y, start.z);

  // Gentle leftward impulse for smooth tumble
  body.velocity.set(-3, 2, (Math.random()-0.5)*1.5);
  body.angularVelocity.set((Math.random()-0.5)*4,(Math.random()-0.5)*4,(Math.random()-0.5)*4);

  body.linearDamping = 0.2;
  body.angularDamping = 0.1;
  world.addBody(body);

  const diceObj = { mesh, body, dieType: type, onResult, settled: false, removed: false };
  activeDice.push(diceObj);

  return diceObj;
}

// ---------- Top-face calculation ----------
function getUpVector(mesh) {
  const up = new THREE.Vector3(0,1,0);
  up.applyQuaternion(mesh.quaternion);
  return up;
}

const dieFaceNormals = {
  d4: [
    new THREE.Vector3(0, 1, 0),
    new THREE.Vector3(0, -1, 1).normalize(),
    new THREE.Vector3(1, -1, 0).normalize(),
    new THREE.Vector3(-1, -1, -1).normalize(),
  ],
  d6: [
    new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, -1, 0),
    new THREE.Vector3(1, 0, 0), new THREE.Vector3(-1, 0, 0),
    new THREE.Vector3(0, 0, 1), new THREE.Vector3(0, 0, -1)
  ],
  d8: [...Array(8)].map(_=>new THREE.Vector3(Math.random(),Math.random(),Math.random()).normalize()),
  d10: [...Array(10)].map(_=>new THREE.Vector3(Math.random(),Math.random(),Math.random()).normalize()),
  d12: [...Array(12)].map(_=>new THREE.Vector3(Math.random(),Math.random(),Math.random()).normalize()),
  d20: [...Array(20)].map(_=>new THREE.Vector3(Math.random(),Math.random(),Math.random()).normalize()),
  d100: []
};

function getTopFace(dieType, mesh) {
  if(dieType==="d100") return Math.floor(Math.random()*100)+1;
  const up = getUpVector(mesh);
  const normals = dieFaceNormals[dieType];
  let maxDot = -Infinity, topIndex = 0;
  normals.forEach((n,i)=>{
    const dot = n.dot(up);
    if(dot>maxDot){ maxDot=dot; topIndex=i; }
  });
  return topIndex+1;
}

// ---------- Animation loop ----------
function animate() {
  requestAnimationFrame(animate);
  if(world) world.step(1/60);

  for(let i=activeDice.length-1;i>=0;i--){
    const d = activeDice[i];
    if(d.removed) continue;

    d.mesh.position.copy(d.body.position);
    d.mesh.quaternion.copy(d.body.quaternion);

    // Settled detection
    if(!d.settled && d.body.velocity.length()<0.05 && d.body.angularVelocity.length()<0.05){
      d.settled = true;
      if(typeof d.onResult==="function"){
        const value = getTopFace(d.dieType.name, d.mesh);
        d.onResult(value);
      }
    }

    // Safety: remove runaway dice
    if(Math.abs(d.body.position.x)>100 || Math.abs(d.body.position.y)>200){
      removeDice(d);
    }
  }

  renderer.render(scene, camera);
}
