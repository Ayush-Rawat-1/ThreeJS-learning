import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';

import * as CANNON from 'cannon-es';

const renderer = new THREE.WebGLRenderer({antialias: true});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
renderer.shadowMap.enabled=true;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

// Sets orbit control to move the camera around
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.update();

const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
scene.add(directionalLight);
directionalLight.position.set(0, 50, 0);
directionalLight.castShadow=true;
directionalLight.shadow.mapSize.width=1024;
directionalLight.shadow.mapSize.height=1024;

// Camera positioning
camera.position.set(6, 8, 14);

// Sets the x, y, and z axes with each having a length of 4
// const axesHelper = new THREE.AxesHelper(20);
// scene.add(axesHelper);

const world=new CANNON.World({gravity:new CANNON.Vec3(0,-9.81,0)});

const planeMesh=new THREE.Mesh(
    new THREE.PlaneGeometry(10,10),
    new THREE.MeshStandardMaterial({
        color:0xffffff,
        side:THREE.DoubleSide
    })
);
scene.add(planeMesh);
planeMesh.receiveShadow=true;

const planePhyMat=new CANNON.Material();
const planeBody=new CANNON.Body({
    type:CANNON.Body.STATIC,
    shape:new CANNON.Box(new CANNON.Vec3(5,5,0.001)),
    material:planePhyMat
});
planeBody.quaternion.setFromEuler(-Math.PI/2,0,0);
world.addBody(planeBody);

const mouse=new THREE.Vector2();
const intersectionPoint=new THREE.Vector3();
const planeNormal=new THREE.Vector3();
const plane=new THREE.Plane();
const rayCaster=new THREE.Raycaster();

//to hold objects=>{sphereMesh,sphereBody}
const sphereArray=[];

window.addEventListener('click',(e)=>{
    mouse.x=(e.clientX/window.innerWidth)*2-1;
    mouse.y=-(e.clientY/window.innerHeight)*2+1;
    planeNormal.copy(camera.position).normalize();
    plane.setFromNormalAndCoplanarPoint(planeNormal,scene.position);
    rayCaster.setFromCamera(mouse,camera);
    rayCaster.ray.intersectPlane(plane,intersectionPoint);
    const sphereMesh=new THREE.Mesh(
        new THREE.SphereGeometry(0.125,30,30),
        new THREE.MeshStandardMaterial({
            color: Math.random()*0xffffff,
            metalness:0,
            roughness:0
        })
    );
    scene.add(sphereMesh);
    sphereMesh.castShadow=true;
    // sphereMesh.position.copy(intersectionPoint);
    const spherePhyMat=new CANNON.Material();
    const sphereBody=new CANNON.Body({
        mass:0.3,
        shape: new CANNON.Sphere(0.125),
        position: new CANNON.Vec3(intersectionPoint.x,intersectionPoint.y,intersectionPoint.z),
        material:spherePhyMat
    });
    world.addBody(sphereBody);
    sphereArray.push({mesh:sphereMesh,body:sphereBody});
    const planeSphereContactMaterial=new CANNON.ContactMaterial(
        planePhyMat,
        spherePhyMat,
        {restitution:0.3}
    );
    world.addContactMaterial(planeSphereContactMaterial);
});

const timeStep=1/60;
function animate() {
    world.step(timeStep);
    planeMesh.position.copy(planeBody.position);
    planeMesh.quaternion.copy(planeBody.quaternion);
    sphereArray.forEach((sphere)=>{
        sphere.mesh.position.copy(sphere.body.position);
        sphere.mesh.quaternion.copy(sphere.body.quaternion);
    });
    renderer.render(scene, camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});