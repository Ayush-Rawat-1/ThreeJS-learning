import * as THREE from "three";
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls';
import {RGBELoader} from "/node_modules/three/examples/jsm/loaders/RGBELoader.js";

const hdrTextureURL=new URL("../img/MR_INT-003_Kitchen_Pierre.hdr",import.meta.url);

const renderer=new THREE.WebGLRenderer({antialias:true});

renderer.setSize(window.innerWidth,window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();

const camera=new THREE.PerspectiveCamera(45,window.innerWidth/window.innerHeight,0.1,1000);

const orbit=new OrbitControls(camera,renderer.domElement);

camera.position.set(0,0,7);

orbit.update();

renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.8;

const loader=new RGBELoader();
loader.load(hdrTextureURL,(texture)=>{
    texture.mapping=THREE.EquirectangularReflectionMapping;
    scene.background=texture;
    scene.environment=texture;

    const sphere=new THREE.Mesh(
        new THREE.SphereGeometry(1,50,50),
        new THREE.MeshStandardMaterial({
            roughness:0,
            metalness:0.5,
            color: 0xffea00
        })
    );
    scene.add(sphere);
});

function animate(){
    renderer.render(scene,camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize',()=>{
    camera.aspect=window.innerWidth,innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
});