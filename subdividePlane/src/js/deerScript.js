import * as THREE from "three";
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls';
import {GLTFLoader} from '/node_modules/three/examples/jsm/loaders/GLTFLoader.js';
import * as SkeletonUtils from '/node_modules/three/examples/jsm/utils/SkeletonUtils.js';

const modelUrl = new URL('../assets/Stag.gltf', import.meta.url);

const renderer=new THREE.WebGLRenderer();

renderer.setSize(window.innerWidth,window.innerHeight);

document.body.appendChild(renderer.domElement);

const scene=new THREE.Scene();

const camera=new THREE.PerspectiveCamera(
    45,
    window.innerWidth/window.innerHeight,
    0.1,
    1000
);

renderer.setClearColor(0xA3A3A3);

const orbit=new OrbitControls(camera,renderer.domElement);

camera.position.set(10,15,-20);

orbit.update();

const ambientLight = new THREE.AmbientLight(0xededed, 0.8);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xFFFFFF, 1);
scene.add(directionalLight);
directionalLight.position.set(10, 11, 7);

const planeMesh=new THREE.Mesh(
    new THREE.PlaneGeometry(20,20),
    new THREE.MeshBasicMaterial({
        side:THREE.DoubleSide,
        visible:false
    })
);
planeMesh.name='ground';
planeMesh.rotateX(-Math.PI/2);
scene.add(planeMesh);

const grid=new THREE.GridHelper(20,20);
scene.add(grid);

const highlightMesh=new THREE.Mesh(
    new THREE.PlaneGeometry(1,1),
    new THREE.MeshBasicMaterial({
        side:THREE.DoubleSide,
        transparent:true
    })
);
highlightMesh.rotateX(-Math.PI/2);
highlightMesh.position.set(0.5,0,0.5);
scene.add(highlightMesh);

let stag;
let clips;
// let mixer;
const assetLoader=new GLTFLoader();

assetLoader.load(modelUrl.href,(gltf)=>{
    const model=gltf.scene;
    model.scale.set(0.3,0.3,0.3);
    // scene.add(model);
    stag=model;
    clips=gltf.animations;
    console.log(clips);
},undefined,(err)=>console.log(err));

const mousePosition=new THREE.Vector2();
const rayCaster=new THREE.Raycaster();
let intersects;

window.addEventListener('mousemove',(e)=>{
    mousePosition.x=(e.clientX/window.innerWidth)*2-1;
    mousePosition.y=-(e.clientY/window.innerHeight)*2+1;
    rayCaster.setFromCamera(mousePosition,camera);
    intersects=rayCaster.intersectObjects(scene.children);
    intersects.forEach((intersect)=>{
        if(intersect.object.name === 'ground'){
            const highlightPos=new THREE.Vector3().copy(intersect.point).floor().addScalar(0.5);
            highlightMesh.position.set(highlightPos.x,0,highlightPos.z);
            const objectExist=objects.find((obj)=>{
                return ((obj.position.x === highlightMesh.position.x) && (obj.position.z === highlightMesh.position.z));
            })
            if(objectExist){
                highlightMesh.material.color.setHex(0xff0000);
            }else highlightMesh.material.color.setHex(0xffffff);
        }
    });
});


const objects=[];
const mixers=[];
window.addEventListener('mousedown',(e)=>{
    const objectExist=objects.find((obj)=>{
        return ((obj.position.x === highlightMesh.position.x) && (obj.position.z === highlightMesh.position.z));
    })
    if(objectExist) return;
    intersects.forEach((intersect)=>{
        if(intersect.object.name === 'ground'){
            const stagClone=SkeletonUtils.clone(stag);
            stagClone.position.copy(highlightMesh.position);
            scene.add(stagClone);
            objects.push(stagClone);
            highlightMesh.material.color.setHex(0xff0000);

            const mixer=new THREE.AnimationMixer(stagClone);
            const clip=THREE.AnimationClip.findByName(clips,'Idle_2');
            const action=mixer.clipAction(clip);
            action.play();
            mixers.push(mixer);
        }
    });
});

const clock=new THREE.Clock();
function animate(time){
    highlightMesh.material.opacity=1+Math.sin(time/120);
    // if(mixer) mixer.update(clock.getDelta());
    const delta=clock.getDelta();
    mixers.forEach((mixer)=>mixer.update(delta));
    renderer.render(scene,camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize',()=>{
    camera.aspect=window.innerWidth,innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
});