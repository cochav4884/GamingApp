import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.158.0/build/three.module.js";

// ---------- Dice definitions ----------
export const diceTypes = [
  { name: "d4", sides: 4, color: "#f44336" },
  { name: "d6", sides: 6, color: "#2196f3" },
  { name: "d8", sides: 8, color: "#4caf50" },
  { name: "d10", sides: 10, color: "#ff9800" },
  { name: "d12", sides: 12, color: "#ffeb3b" },
  { name: "d20", sides: 20, color: "#9c27b0" },
  { name: "d50", sides: 50, color: "#607d8b" },
  { name: "d100", sides: 100, color: "#607d8b" },
];

let scene, camera, renderer;
let battlefield;

export const activeDice = [];

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

// ---------- Create dice mesh with numbers ----------
function createDieMesh(sides, color) {
  const geometry = createDieGeometry(sides);
  let material;

  const lightDiceColors = ["#ffeb3b", "#ff9800"];
  const textColor = lightDiceColors.includes(color) ? "#000" : "#fff";

  if (sides === 6) {
    const faceMaterials = [];
    for (let i = 1; i <= 6; i++) {
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 256;
      const ctx = canvas.getContext("2d");

      ctx.fillStyle = color;
      ctx.fillRect(0, 0, 256, 256);

      const value = i <= 3 ? i : 7 - i;
      ctx.font = "bold 128px Arial";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 8;
      ctx.strokeText(value.toString(), 128, 128);
      ctx.fillStyle = textColor;
      ctx.fillText(value.toString(), 128, 128);

      const texture = new THREE.CanvasTexture(canvas);
      faceMaterials.push(new THREE.MeshStandardMaterial({ map: texture }));
    }
    material = faceMaterials;
  } else {
    const canvas = document.createElement("canvas");
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = color;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const cols = Math.ceil(Math.sqrt(sides));
    const rows = Math.ceil(sides / cols);
    const cellWidth = canvas.width / cols;
    const cellHeight = canvas.height / rows;

    for (let i = 1; i <= sides; i++) {
      const col = (i - 1) % cols;
      const row = Math.floor((i - 1) / cols);
      const value = sides % 2 === 0 ? (i <= sides / 2 ? i : sides + 1 - i) : i;

      ctx.font = sides > 20 ? `bold ${cellHeight * 0.6}px Arial` : `bold 128px Arial`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.strokeStyle = "#000";
      ctx.lineWidth = 8;
      ctx.strokeText(value.toString(), col * cellWidth + cellWidth / 2, row * cellHeight + cellHeight / 2);
      ctx.fillStyle = textColor;
      ctx.fillText(value.toString(), col * cellWidth + cellWidth / 2, row * cellHeight + cellHeight / 2);
    }

    const texture = new THREE.CanvasTexture(canvas);
    material = new THREE.MeshStandardMaterial({ map: texture });
  }

  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  return mesh;
}

// ---------- Init Dice 3D ----------
export function initDice3D(container) {
  battlefield = container;

  scene = new THREE.Scene();
  scene.background = null;

  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 15, 20);
  camera.lookAt(0, 0, 0);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  // Stronger ambient light
scene.add(new THREE.AmbientLight(0xffffff, 0.8));

// Brighter directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(10, 25, 15);
scene.add(directionalLight);


  animate();
}

// ---------- Roll a die realistically ----------
export function rollByName(dieName, onResult = null, opts = {}) {
  if (!scene) return null;
  const type = diceTypes.find(d => d.name === dieName);
  if (!type) return null;

  const mesh = createDieMesh(type.sides, type.color);
  scene.add(mesh);

  const start = opts.position || { x: 7, y: 1, z: 0 };
  mesh.position.set(start.x, start.y, start.z);

  // Pick the result first
  const result = Math.floor(Math.random() * type.sides) + 1;

  // Calculate target rotation for the final number on top
  let targetRotation = { x: 0, y: 0, z: 0 };
  if (type.sides === 6) {
    switch (result) {
      case 1: targetRotation = { x: 0, y: 0, z: 0 }; break;
      case 2: targetRotation = { x: Math.PI / 2, y: 0, z: 0 }; break;
      case 3: targetRotation = { x: 0, y: 0, z: -Math.PI / 2 }; break;
      case 4: targetRotation = { x: 0, y: 0, z: Math.PI / 2 }; break;
      case 5: targetRotation = { x: -Math.PI / 2, y: 0, z: 0 }; break;
      case 6: targetRotation = { x: Math.PI, y: 0, z: 0 }; break;
    }
  } else {
    // approximate rotation for other dice
    targetRotation = { x: Math.random() * Math.PI * 2, y: Math.random() * Math.PI * 2, z: Math.random() * Math.PI * 2 };
  }

  const duration = 3000;
  const startX = start.x;
  const endX = -7;
  let startTime = null;

  function animateDice(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = (timestamp - startTime) / duration;

    if (progress < 1) {
      mesh.position.x = startX + (endX - startX) * progress;
      mesh.rotation.x += 0.2;
      mesh.rotation.y += 0.2;
      mesh.rotation.z += 0.15;
      requestAnimationFrame(animateDice);
    } else {
      mesh.rotation.x = targetRotation.x;
      mesh.rotation.y = targetRotation.y;
      mesh.rotation.z = targetRotation.z;

      if (typeof onResult === "function") onResult(result);

      setTimeout(() => scene.remove(mesh), 1500);
    }
  }

  requestAnimationFrame(animateDice);
  return { mesh, dieType: type, noPhysics: true };
}

// ---------- Remove dice ----------
export function removeDice(d) {
  if (!d || !d.mesh) return;
  scene.remove(d.mesh);
}

// ---------- Animation loop ----------
function animate() {
  requestAnimationFrame(animate);
  if (renderer && scene && camera) renderer.render(scene, camera);
}