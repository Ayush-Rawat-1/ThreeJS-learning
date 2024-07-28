import * as THREE from "three";
import gsap from "gsap";

const renderer=new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth,window.innerHeight);

document.body.appendChild(renderer.domElement);

renderer.setClearColor(0xa3a3a3);

const scene=new THREE.Scene();

const camera=new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);

const ambientLight=new THREE.AmbientLight(0xededed,0.8);
scene.add(ambientLight);

const directionalLight=new THREE.DirectionalLight(0xffffff,1);
scene.add(directionalLight);
directionalLight.position.set(0,20,-20);

const grid=new THREE.GridHelper(30,30);
scene.add(grid);

const box=new THREE.Mesh(
    new THREE.BoxGeometry(),
    new THREE.MeshPhongMaterial({color:0x00ff00})
);
box.position.y=0.5;
scene.add(box);

camera.position.set(0,2,5);
camera.lookAt(0,0,0);

const tl=gsap.timeline();
window.addEventListener('mousemove',()=>{
    tl.to(camera.position,{
        z:14,
        duration:1.5,
        onUpdate:()=>camera.lookAt(0,0,0)
    })
    
    .to(camera.position,{
        y:10,
        duration:1.5,
        onUpdate:()=>camera.lookAt(0,0,0)
    })

    .to(camera.position,{
        x:10,
        y:5,
        z:3,
        duration:1.5,
        onUpdate:()=>camera.lookAt(0,0,0)
    });
});


function animate(){
    
    renderer.render(scene,camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize',()=>{
    camera.aspect=window.innerWidth/window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
});