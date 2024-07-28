import * as THREE from "three";
import { OrbitControls } from '/node_modules/three/examples/jsm/controls/OrbitControls';

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

const orbit=new OrbitControls(camera,renderer.domElement);

camera.position.set(10,15,-20);

orbit.update();

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

const sphereMesh=new THREE.Mesh(
    new THREE.SphereGeometry(0.4,4,2),
    new THREE.MeshBasicMaterial({
        wireframe:true,
        color: 0xffea00
    })
);

const objects=[];
window.addEventListener('mousedown',(e)=>{
    const objectExist=objects.find((obj)=>{
        return ((obj.position.x === highlightMesh.position.x) && (obj.position.z === highlightMesh.position.z));
    })
    if(objectExist) return;
    intersects.forEach((intersect)=>{
        if(intersect.object.name === 'ground'){
            const sphereClone=sphereMesh.clone();
            sphereClone.position.copy(highlightMesh.position);
            scene.add(sphereClone);
            objects.push(sphereClone);
            highlightMesh.material.color.setHex(0xff0000);
        }
    });
});


function animate(time){
    highlightMesh.material.opacity=1+Math.sin(time/120);
    objects.forEach((obj)=>{
        obj.rotation.x=time/1000;
        obj.rotation.z=time/1000;
        obj.position.y=0.5+0.5*Math.abs(Math.sin(time/1000));
    });
    renderer.render(scene,camera);
}

renderer.setAnimationLoop(animate);

window.addEventListener('resize',()=>{
    camera.aspect=window.innerWidth,innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth,window.innerHeight);
});