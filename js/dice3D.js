import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";

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
let battlefield;

export const activeDice = []; // kept for compatibility

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

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.6));
  const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
  directionalLight.position.set(10, 20, 10);
  scene.add(directionalLight);

  // Animate loop
  animate();
}

// ---------- Roll a die (smooth animation only) ----------
export function rollByName(dieName, onResult = null, opts = {}) {
  if (!scene) return null;
  const type = diceTypes.find(d => d.name === dieName);
  if (!type) return null;

  const mesh = createDieMesh(type.sides, type.color);
  scene.add(mesh);

  // Start on right side
  const start = opts.position || { x: 7, y: 1, z: 0 };
  mesh.position.set(start.x, start.y, start.z);

  const duration = 3000; // ms
  const startX = start.x;
  const endX = -7;
  let startTime = null;

  function animateDice(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = (timestamp - startTime) / duration;

    if (progress < 1) {
      mesh.position.x = startX + (endX - startX) * progress;
      mesh.rotation.x += 0.1;
      mesh.rotation.y += 0.12;
      requestAnimationFrame(animateDice);
    } else {
      const value = Math.floor(Math.random() * type.sides) + 1;
      if (typeof onResult === "function") onResult(value);
      scene.remove(mesh);
    }
  }

  requestAnimationFrame(animateDice);
  return { mesh, dieType: type, noPhysics: true };
}

// ---------- Remove dice (kept for compatibility) ----------
export function removeDice(d) {
  if (!d || !d.mesh) return;
  scene.remove(d.mesh);
}

// ---------- Animation loop ----------
function animate() {
  requestAnimationFrame(animate);
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
}
