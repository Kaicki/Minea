let scene,camera,renderer;
let chunks={},velocity=new THREE.Vector3(),canJump=false;
const CHUNK_SIZE=16,RENDER_DISTANCE=2;
let joystick={x:0,y:0};

let yaw=0,pitch=0,targetYaw=0,targetPitch=0;
const SENS=0.0025,SMOOTH=0.15,MAX_PITCH=Math.PI/2-0.1;

const BLOCKS=[0x22aa22,0x8B4513,0x888888,0xdddd88,0x996633];
let selected=0;

init();animate();

function init(){
 scene=new THREE.Scene();
 camera=new THREE.PerspectiveCamera(75,innerWidth/innerHeight,0.1,1000);
 renderer=new THREE.WebGLRenderer();
 renderer.setSize(innerWidth,innerHeight);
 document.body.appendChild(renderer.domElement);
 scene.add(new THREE.AmbientLight(0xffffff,0.8));
 camera.position.y=10;
 setupMobile();setupHotbar();
}

function height(x,z){return Math.floor(3+Math.sin(x*0.2)*2+Math.cos(z*0.2)*2);}

function key(cx,cz){return cx+","+cz;}

function createChunk(cx,cz){
 let g=new THREE.Group();
 for(let x=0;x<CHUNK_SIZE;x++){
  for(let z=0;z<CHUNK_SIZE;z++){
   let wx=cx*CHUNK_SIZE+x,wz=cz*CHUNK_SIZE+z,h=height(wx,wz);
   for(let y=0;y<h;y++){
    let m=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial({color:y===h-1?0x22aa22:0x8B4513}));
    m.position.set(wx,y,wz);g.add(m);
   }
  }
 }
 scene.add(g);chunks[key(cx,cz)]=g;
}

function updateChunks(){
 let cx=Math.floor(camera.position.x/CHUNK_SIZE);
 let cz=Math.floor(camera.position.z/CHUNK_SIZE);
 let need={};
 for(let x=-RENDER_DISTANCE;x<=RENDER_DISTANCE;x++){
  for(let z=-RENDER_DISTANCE;z<=RENDER_DISTANCE;z++){
   let nx=cx+x,nz=cz+z,k=key(nx,nz);
   need[k]=1;if(!chunks[k])createChunk(nx,nz);
  }
 }
 for(let k in chunks){if(!need[k]){scene.remove(chunks[k]);delete chunks[k];}}
}

function interact(place){
 let ray=new THREE.Raycaster();
 ray.setFromCamera({x:0,y:0},camera);
 let objs=[];for(let k in chunks)objs.push(...chunks[k].children);
 let hit=ray.intersectObjects(objs)[0];if(!hit)return;
 if(!place){hit.object.parent.remove(hit.object);}
 else{
  let p=hit.object.position.clone().add(hit.face.normal);
  let b=new THREE.Mesh(new THREE.BoxGeometry(),new THREE.MeshStandardMaterial({color:BLOCKS[selected]}));
  b.position.copy(p);hit.object.parent.add(b);
 }
}

function setupMobile(){
 let joy=document.getElementById("joystick"),stick=document.getElementById("stick");
 joy.addEventListener("touchmove",e=>{
  let t=e.touches[0],r=joy.getBoundingClientRect();
  let x=t.clientX-r.left-50,y=t.clientY-r.top-50;
  joystick.x=x/40;joystick.y=y/40;
  stick.style.transform=`translate(${x}px,${y}px)`;
 });
 joy.addEventListener("touchend",()=>{joystick.x=joystick.y=0;stick.style.transform="translate(0,0)";});

 let lookId=null;
 window.addEventListener("touchstart",e=>{
  for(let t of e.touches){if(t.target.closest("#joystick"))continue;lookId=t.identifier;}
 });

 window.addEventListener("touchmove",e=>{
  for(let t of e.touches){
   if(t.identifier!==lookId)continue;
   let dx=t.movementX||0,dy=t.movementY||0;
   dx=t.clientX-(t.prevX||t.clientX);
   dy=t.clientY-(t.prevY||t.clientY);
   t.prevX=t.clientX;t.prevY=t.clientY;
   targetYaw-=dx*SENS;targetPitch-=dy*SENS;
   targetPitch=Math.max(-MAX_PITCH,Math.min(MAX_PITCH,targetPitch));
  }
 });

 window.addEventListener("touchend",e=>{
  for(let t of e.changedTouches){if(t.identifier===lookId)lookId=null;}
 });

 renderer.domElement.addEventListener("touchstart",()=>interact(false));
 document.getElementById("placeBtn").onclick=()=>interact(true);
 document.getElementById("jumpBtn").onclick=()=>{if(canJump){velocity.y=0.3;canJump=false;}};
}

function setupHotbar(){
 let slots=document.querySelectorAll(".slot");
 slots.forEach((s,i)=>{
  s.style.background="#"+BLOCKS[i].toString(16);
  s.onclick=()=>{selected=i;updateHotbar();}
 });
 window.addEventListener("keydown",e=>{
  let n=parseInt(e.key);
  if(n>=1&&n<=5){selected=n-1;updateHotbar();}
 });
 updateHotbar();
}

function updateHotbar(){
 document.querySelectorAll(".slot").forEach((s,i)=>s.classList.toggle("selected",i===selected));
}

function move(){
 camera.translateZ(-joystick.y*0.15);
 camera.translateX(joystick.x*0.15);
}

function gravity(){
 velocity.y-=0.02;camera.position.y+=velocity.y;
 if(camera.position.y<3){camera.position.y=3;velocity.y=0;canJump=true;}
}

function updateCam(){
 yaw+=(targetYaw-yaw)*SMOOTH;
 pitch+=(targetPitch-pitch)*SMOOTH;
 camera.rotation.order="YXZ";
 camera.rotation.y=yaw;
 camera.rotation.x=pitch;
}

function animate(){
 requestAnimationFrame(animate);
 move();gravity();updateChunks();updateCam();
 renderer.render(scene,camera);
}
