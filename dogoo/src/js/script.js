import * as THREE from 'three';
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls';
import {GLTFLoader} from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';

const dogUrl = new URL('../assets/doggo2.glb', import.meta.url);

const renderer = new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

renderer.setClearColor(0xA3A3A3);

const orbit = new OrbitControls(camera, renderer.domElement);

camera.position.set(10, 10, 10);
orbit.update();

const grid = new THREE.GridHelper(30, 30);
scene.add(grid);

const assetLoader = new GLTFLoader();
// console.log(assetLoader);

let mixer;
assetLoader.load(dogUrl.href,(gltf)=>{
    const model=gltf.scene;
    scene.add(model);
    mixer=new THREE.AnimationMixer(model);
    const clips=gltf.animations;
    //play a certain action
    // const clip=THREE.AnimationClip.findByName(clips,"HeadAction");
    // const action=mixer.clipAction(clip);
    // action.play();
    //play all
    clips.forEach((clip)=>{
        const action=mixer.clipAction(clip);
        action.play();
    });
    
},undefined,(err)=>console.log(err));

const clock=new THREE.Clock();

function animate(){
    if(mixer)
        mixer.update(clock.getDelta());
    renderer.render(scene,camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize', function() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});