import * as THREE from "three";
import * as YUKA from "yuka";
import {GLTFLoader} from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';

const renderer=new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth,window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();

renderer.setClearColor(0xa3a3a3);

const camera=new THREE.PerspectiveCamera(
    45,window.innerWidth/window.innerHeight,0.1,1000
);

camera.position.set(0,10,15);
camera.lookAt(scene.position);

const ambientLight=new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight=new THREE.DirectionalLight(0xffffff,1);
directionalLight.position.set(0,10,10);
scene.add(directionalLight);

const vehicle = new YUKA.Vehicle();

function sync(entity, renderComponent) {
    renderComponent.matrix.copy(entity.worldMatrix);
}

const path = new YUKA.Path();
path.add( new YUKA.Vector3(-6, 0, 4));
path.add( new YUKA.Vector3(-12, 0, 0));
path.add( new YUKA.Vector3(-6, 0, -12));
path.add( new YUKA.Vector3(0, 0, 0));
path.add( new YUKA.Vector3(8, 0, -8));
path.add( new YUKA.Vector3(10, 0, 0));
path.add( new YUKA.Vector3(4, 0, 4));
path.add( new YUKA.Vector3(0, 0, 6));

path.loop = true;

vehicle.position.copy(path.current());

vehicle.maxSpeed = 3;

const followPathBehavior = new YUKA.FollowPathBehavior(path, 3);
vehicle.steering.add(followPathBehavior);

const onPathBehavior = new YUKA.OnPathBehavior(path);
//onPathBehavior.radius = 2;
vehicle.steering.add(onPathBehavior);

const entityManager = new YUKA.EntityManager();
entityManager.add(vehicle);

const gltfLoader=new GLTFLoader();
gltfLoader.load("./assets/SUV.glb",(glb)=>{
    const model=glb.scene;
    // model.scale.set(0.5,0.5,0.5);
    scene.add(model);
    vehicle.scale=new YUKA.Vector3(0.5,0.5,0.5);
    model.matrixAutoUpdate=false;
    vehicle.setRenderComponent(model,sync);
});

// const vehicleMesh=new THREE.Mesh(
//     new THREE.ConeGeometry(0.1,0.5,8),
//     new THREE.MeshNormalMaterial()
// );
// vehicleMesh.geometry.rotateX(Math.PI/2);
// vehicleMesh.matrixAutoUpdate=false;
// scene.add(vehicleMesh);

const position=[];
for(let i=0;i<path._waypoints.length;i++){
    const waypoint=path._waypoints[i];
    position.push(waypoint.x,waypoint.y,waypoint.z);
}

const lineGeometry=new THREE.BufferGeometry();
lineGeometry.setAttribute('position',new THREE.Float32BufferAttribute(position,3));
const lineMaterial=new THREE.MeshBasicMaterial({color:0xffffff});
const lines=new THREE.LineLoop(lineGeometry,lineMaterial);
scene.add(lines);

const time=new YUKA.Time();
function animate(){
    const delta=time.update().getDelta();
    entityManager.update(delta);
    renderer.render(scene,camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize',()=>{
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
});