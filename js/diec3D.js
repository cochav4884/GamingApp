// js/dice3D.js
// js/dice3D.js
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.150.1/build/three.module.js';
import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/dist/cannon-es.js';



// export const diceTypes = [
//   { name: "d4", sides: 4, color: "#f44336" },
//   { name: "d6", sides: 6, color: "#2196f3" },
//   { name: "d8", sides: 8, color: "#4caf50" },
//   { name: "d10", sides: 10, color: "#ff9800" },
//   { name: "d12", sides: 12, color: "#ffeb3b" },
//   { name: "d20", sides: 20, color: "#9c27b0" },
//   { name: "d50", sides: 50, color: "#795548" },
// ];

// Main 3D dice setup
export function setup3DDice(battlefield, diceResultCallback) {
  const width = battlefield.clientWidth;
  const height = battlefield.clientHeight;

  // --- Three.js scene ---
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  camera.position.set(0, 15, 25);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(width, height);
  battlefield.appendChild(renderer.domElement);

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
  scene.add(ambientLight);
  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(10, 20, 10);
  scene.add(dirLight);

  // --- Cannon.js physics world ---
  const world = new CANNON.World();
  world.gravity.set(0, -9.82, 0);
  world.broadphase = new CANNON.NaiveBroadphase();
  world.solver.iterations = 10;

  // Ground plane
  const groundMaterial = new CANNON.Material();
  const groundBody = new CANNON.Body({
    mass: 0,
    material: groundMaterial,
    shape: new CANNON.Plane(),
  });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);

  // --- Dice rolling function ---
  function rollDice(dieType) {
    let geometry;
    switch (dieType.name) {
      case "d4":
        geometry = new THREE.TetrahedronGeometry(1);
        break;
      case "d6":
        geometry = new THREE.BoxGeometry(2, 2, 2);
        break;
      case "d8":
        geometry = new THREE.OctahedronGeometry(1.5);
        break;
      case "d10":
        geometry = new THREE.DodecahedronGeometry(1.5); // approximate
        break;
      case "d12":
        geometry = new THREE.DodecahedronGeometry(1.8);
        break;
      case "d20":
        geometry = new THREE.IcosahedronGeometry(2);
        break;
      case "d50":
        geometry = new THREE.SphereGeometry(2, 32, 32); // sphere approximation
        break;
      default:
        geometry = new THREE.BoxGeometry(2, 2, 2);
    }

    const material = new THREE.MeshStandardMaterial({
      color: dieType.color,
      flatShading: true,
    });
    const diceMesh = new THREE.Mesh(geometry, material);
    diceMesh.castShadow = true;
    diceMesh.position.set(
      (Math.random() - 0.5) * 5,
      10 + Math.random() * 5,
      (Math.random() - 0.5) * 5
    );
    scene.add(diceMesh);

    // Cannon.js physics body
    const shape =
      dieType.name === "d6"
        ? new CANNON.Box(new CANNON.Vec3(1, 1, 1))
        : new CANNON.Sphere(1); // approximate for non-cube dice

    const body = new CANNON.Body({ mass: 1, shape });
    body.position.copy(diceMesh.position);
    body.quaternion.set(
      Math.random(),
      Math.random(),
      Math.random(),
      Math.random()
    );
    body.angularVelocity.set(
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20,
      (Math.random() - 0.5) * 20
    );
    world.addBody(body);

    return { mesh: diceMesh, body, dieType };
  }

  let diceList = [];

  // Roll a die by name
  function rollByName(name) {
    const dieType = diceTypes.find((d) => d.name === name);
    if (!dieType) return;
    diceList.push(rollDice(dieType));
  }

  // Animation loop
  function animate() {
    requestAnimationFrame(animate);
    world.step(1 / 60);

    diceList.forEach((dice) => {
      dice.mesh.position.copy(dice.body.position);
      dice.mesh.quaternion.copy(dice.body.quaternion);
    });

    renderer.render(scene, camera);

    // Check for dice stop
    diceList.forEach((dice, i) => {
      if (dice.body.velocity.length() < 0.1 && dice.body.angularVelocity.length() < 0.1) {
        if (dice.dieType.name === "d50") {
          // Random result for sphere
          const value = Math.floor(Math.random() * 50) + 1;
          diceResultCallback(value);
        } else {
          // For other dice, pick random for now (can compute face later)
          const value = Math.floor(Math.random() * dice.dieType.sides) + 1;
          diceResultCallback(value);
        }
        world.removeBody(dice.body);
        scene.remove(dice.mesh);
        diceList.splice(i, 1);
      }
    });
  }
  animate();

  return { rollByName };
}
