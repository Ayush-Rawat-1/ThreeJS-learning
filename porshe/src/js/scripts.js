import * as THREE from "three";
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import {RGBELoader} from "/node_modules/three/examples/jsm/loaders/RGBELoader.js";

const renderer=new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth,window.innerHeight);

renderer.setClearColor(0xA3A3A3);

document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();

const camera=new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);

const orbit=new OrbitControls(camera,renderer.domElement);

camera.position.set(-10,30,30);
orbit.update();

const grid=new THREE.GridHelper(30,30);
scene.add(grid);

// const ambientLight=new THREE.AmbientLight(0xededed,0.8);
// scene.add(ambientLight);

// const directionalLight=new THREE.DirectionalLight(0xffffff,1);
// scene.add(directionalLight);
// directionalLight.position.set(10,11,7);

const gltfLoader=new GLTFLoader();
const rgbeLoader=new RGBELoader();

renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=4;
let car;

rgbeLoader.load("./assets/MR_INT-005_WhiteNeons_NAD.hdr",(texture)=>{
    texture.mapping=THREE.EquirectangularReflectionMapping;
    scene.environment=texture;
    
    gltfLoader.load('./assets/scene.gltf',(gltf)=>{
        const model=gltf.scene;
        scene.add(model);
        car=model;
        
    });
});

function animate(time){
    if(car) car.rotation.y=-time/3000;
    renderer.render(scene,camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize',()=>{
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
});