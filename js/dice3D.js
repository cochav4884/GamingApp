// js/diec3D.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';

// Keep the type list here to avoid cross-file imports
const diceTypes = [
  { name: "d4",  sides: 4,  color: "#f44336" },
  { name: "d6",  sides: 6,  color: "#2196f3" },
  { name: "d8",  sides: 8,  color: "#4caf50" },
  { name: "d10", sides: 10, color: "#ff9800" },
  { name: "d12", sides: 12, color: "#ffeb3b" },
  { name: "d20", sides: 20, color: "#9c27b0" },
  { name: "d50", sides: 50, color: "#795548" },
];

export function setup3DDice(battlefield, onResult) {
  const width = battlefield.clientWidth;
  const height = battlefield.clientHeight;

  // THREE scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 15, 25);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  renderer.domElement.style.position = "absolute";
  renderer.domElement.style.left = "0";
  renderer.domElement.style.top = "0";
  renderer.domElement.style.pointerEvents = "none"; // don’t block UI
  battlefield.appendChild(renderer.domElement);

  // Lights
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const dir = new THREE.DirectionalLight(0xffffff, 0.6);
  dir.position.set(10, 20, 10);
  scene.add(dir);

  // CANNON world
  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 10;

  // Ground plane
  const ground = new CANNON.Body({
    mass: 0,
    shape: new CANNON.Plane(),
  });
  ground.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(ground);

  // Helpers
  function makeGeometry(type) {
    switch (type) {
      case "d4":  return new THREE.TetrahedronGeometry(1);
      case "d6":  return new THREE.BoxGeometry(2, 2, 2);
      case "d8":  return new THREE.OctahedronGeometry(1.5);
      case "d10": return new THREE.DodecahedronGeometry(1.5); // simple approx
      case "d12": return new THREE.DodecahedronGeometry(1.8);
      case "d20": return new THREE.IcosahedronGeometry(2);
      case "d50": return new THREE.SphereGeometry(2, 24, 24);
      default:    return new THREE.BoxGeometry(2, 2, 2);
    }
  }

  function rollDie(dieType, startX = -8, startZ = (Math.random() - 0.5) * 10) {
    const geom = makeGeometry(dieType.name);
    const mat = new THREE.MeshStandardMaterial({ color: dieType.color, flatShading: true });
    const mesh = new THREE.Mesh(geom, mat);
    mesh.castShadow = true;
    mesh.position.set(startX, 6, startZ);
    scene.add(mesh);

    // Physics shape: box for d6, sphere approx for others (simple + fast)
    const shape = (dieType.name === "d6")
      ? new CANNON.Box(new CANNON.Vec3(1, 1, 1))
      : new CANNON.Sphere(1.2);

    const body = new CANNON.Body({ mass: 1, shape });
    body.position.copy(mesh.position);
    body.velocity.set(12 + Math.random() * 4, 6, (Math.random() - 0.5) * 4);
    body.angularVelocity.set(
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12,
      (Math.random() - 0.5) * 12
    );

    world.addBody(body);
    return { mesh, body, dieType };
  }

  const active = [];

  function rollByName(name) {
    const type = diceTypes.find(d => d.name === name);
    if (!type) return;
    active.push(rollDie(type));
  }

  // Tick
  function animate() {
    requestAnimationFrame(animate);
    world.step(1 / 60);

    for (let i = active.length - 1; i >= 0; i--) {
      const d = active[i];
      d.mesh.position.copy(d.body.position);
      d.mesh.quaternion.copy(d.body.quaternion);

      // Has it settled?
      if (d.body.velocity.length() < 0.12 && d.body.angularVelocity.length() < 0.12) {
        // For now, we generate the face value randomly
        const value = (d.dieType.name === "d50")
          ? Math.floor(Math.random() * 50) + 1
          : Math.floor(Math.random() * d.dieType.sides) + 1;

        if (typeof onResult === "function") onResult(value);

        world.removeBody(d.body);
        scene.remove(d.mesh);
        active.splice(i, 1);
      }
    }

    renderer.render(scene, camera);
  }
  animate();

  return { rollByName };
}
