import * as THREE from "three";
import * as YUKA from "yuka";

const renderer=new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth,window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();

renderer.setClearColor(0xa3a3a3);

const camera=new THREE.PerspectiveCamera(
    45,window.innerWidth/window.innerHeight,0.1,1000
);

camera.position.set(0,20,0);
camera.lookAt(scene.position);

const vehicleMesh=new THREE.Mesh(
    new THREE.ConeGeometry(0.1,0.5,8),
    new THREE.MeshNormalMaterial()
);
vehicleMesh.geometry.rotateX(Math.PI/2);
vehicleMesh.matrixAutoUpdate=false;
scene.add(vehicleMesh);

const vehicle=new YUKA.Vehicle();
vehicle.setRenderComponent(vehicleMesh,sync);

function sync(entity,renderComponent){
    renderComponent.matrix.copy(entity.worldMatrix);
}

const path=new YUKA.Path();
path.add(new YUKA.Vector3(-4,0,4));
path.add(new YUKA.Vector3(-6,0,0));
path.add(new YUKA.Vector3(-4,0,-4));
path.add(new YUKA.Vector3(0,0,0));
path.add(new YUKA.Vector3(4,0,-4));
path.add(new YUKA.Vector3(6,0,0));
path.add(new YUKA.Vector3(4,0,4));
path.add(new YUKA.Vector3(0,0,6));

path.loop=true;

vehicle.position.copy(path.current());

const followPathBehavior=new YUKA.FollowPathBehavior(path,0.5);
vehicle.steering.add(followPathBehavior);

const onPathBehavior=new YUKA.OnPathBehavior(path);
vehicle.steering.add(onPathBehavior);

const entityManager=new YUKA.EntityManager();
entityManager.add(vehicle);

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