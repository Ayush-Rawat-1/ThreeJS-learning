import * as THREE from 'three';
import * as YUKA from 'yuka';
import {GLTFLoader} from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js';

const renderer = new THREE.WebGLRenderer({antialias: true});

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

renderer.setClearColor(0xA3A3A3);

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 10, 0);
camera.lookAt(scene.position);

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
scene.add(directionalLight);

// const vehicleGeometry = new THREE.ConeGeometry(0.1, 0.5, 8);
// vehicleGeometry.rotateX(Math.PI * 0.5);
// const vehicleMaterial = new THREE.MeshNormalMaterial();
// const vehicleMesh = new THREE.Mesh(vehicleGeometry, vehicleMaterial);
// vehicleMesh.matrixAutoUpdate = false;
// scene.add(vehicleMesh);

const entityManager=new YUKA.EntityManager();

function sync(entity, renderComponent) {
    renderComponent.matrix.copy(entity.worldMatrix);
}

const gltfLoader=new GLTFLoader();
let mixer;

gltfLoader.load('./assets/clown_fish.glb',(glb)=>{
    const model=glb.scene;
    const clips=glb.animations;
    const fishes=new THREE.AnimationObjectGroup();
    mixer=new THREE.AnimationMixer(fishes);
    const clip=THREE.AnimationClip.findByName(clips,"Fish_001_animate_preview");
    const action=mixer.clipAction(clip);
    action.play();

    for(let i=0;i<50;i++){
        // const vehicleMesh = new THREE.Mesh(vehicleGeometry, vehicleMaterial);
        const fishClone=new SkeletonUtils.clone(model);
        fishClone.matrixAutoUpdate = false;
        scene.add(fishClone);
        fishes.add(fishClone);
        const vehicle=new YUKA.Vehicle();
        vehicle.setRenderComponent(fishClone,sync);
        vehicle.scale.set(0.01,0.01,0.01);
        const wandererBehavior=new YUKA.WanderBehavior();
        vehicle.steering.add(wandererBehavior);
    
        entityManager.add(vehicle);
    
        vehicle.position.x=2.5-Math.random()*5;
        vehicle.position.z=2.5-Math.random()*5;
        vehicle.rotation.fromEuler(0,2*Math.random()*Math.PI,0);
    }
});


const time = new YUKA.Time();
const clock=new THREE.Clock();
function animate() {
    const delta = time.update().getDelta();
    if(mixer) mixer.update(clock.getDelta());
    entityManager.update(delta);
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});