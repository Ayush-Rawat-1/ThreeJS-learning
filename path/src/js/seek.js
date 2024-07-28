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

camera.position.set(0,10,4);
camera.lookAt(scene.position);

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
scene.add(directionalLight);

const vehicleMesh=new THREE.Mesh(
    new THREE.ConeGeometry(0.1,0.5,8),
    new THREE.MeshNormalMaterial()
);
vehicleMesh.geometry.rotateX(Math.PI/2);
vehicleMesh.matrixAutoUpdate=false;
scene.add(vehicleMesh);

const vehicle=new YUKA.Vehicle();
vehicle.maxSpeed=1.5;
vehicle.setRenderComponent(vehicleMesh,sync);

function sync(entity,renderComponent){
    renderComponent.matrix.copy(entity.worldMatrix);
}

const entityManager=new YUKA.EntityManager();
entityManager.add(vehicle);

const targetMesh=new THREE.Mesh(
    new THREE.SphereGeometry(0.1),
    new THREE.MeshPhongMaterial({color:0xffea00})
);
scene.add(targetMesh);
// targetMesh.matrixAutoUpdate=false;

const planeMesh=new THREE.Mesh(
    new THREE.PlaneGeometry(25,25),
    new THREE.MeshBasicMaterial({visible:false})
);
scene.add(planeMesh);
planeMesh.rotation.x=-Math.PI/2;
planeMesh.name='plane';

// const target=new YUKA.GameEntity();
// target.setRenderComponent(targetMesh,sync);
// entityManager.add(target);

// const seekBehavior=new YUKA.SeekBehavior(target.position);
// vehicle.steering.add(seekBehavior);

const target=new YUKA.Vector3();

const fleeBehavior=new YUKA.FleeBehavior(target);
vehicle.steering.add(fleeBehavior);

vehicle.position.set(-2,0,-2);

// setInterval(()=>{
//     const x=Math.random()*3;
//     const y=Math.random()*3;
//     const z=Math.random()*3;
//     target.position.set(x,y,z);
// },2000);

const mousePosition=new THREE.Vector2();
const raycaster=new THREE.Raycaster();

window.addEventListener('click',(e)=>{
    mousePosition.x=(e.clientX/window.innerWidth)*2-1;
    mousePosition.y=-(e.clientY/window.innerHeight)*2+1;
    raycaster.setFromCamera(mousePosition,camera);
    const intersects=raycaster.intersectObjects(scene.children);
    intersects.forEach((intersect)=>{
        if(intersect.object.name == 'plane'){
            targetMesh.position.set(intersect.point.x,0,intersect.point.z);
            target.set(intersect.point.x,0,intersect.point.z);
        }
    });
});

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