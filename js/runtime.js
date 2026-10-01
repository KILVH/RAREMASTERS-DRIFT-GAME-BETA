/* Lossless collision run tables retain every source pixel without RGBA canvases. */
const Runtime={metadata:null,surface:null,zoom:1,targetZoom:1,
 async load(id){document.getElementById('loading').classList.add('active');try{
  this.metadata??=await fetch('assets/runtime/maps.json',{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Данные трасс');return r.json();});
  const meta=this.metadata[id];currentMap=MAPS[id];const [art,buffer]=await Promise.all([loadImage(`assets/runtime/${id}.webp`),fetch(`assets/runtime/${id}.surface`,{cache:'no-store'}).then(r=>{if(!r.ok)throw Error('Коллизия трассы');return r.arrayBuffer();})]);
  mapImg=art;this.surface=new Uint32Array(buffer);colW=this.surface[0];colH=this.surface[1];colData=null;collisionCanvas=null;collisionCtx=null;collisionImg=null;
  W=meta.width*meta.worldScale;H=meta.height*meta.worldScale;
  markers=JSON.parse(JSON.stringify(meta.markers));for(const list of Object.values(markers))for(const p of list){for(const k of ['x','cx','w'])p[k]*=W/meta.maskWidth;for(const k of ['y','cy','h'])p[k]*=H/meta.maskHeight;}
  carImg=await loadImage('zhiga.png');resize();
 }finally{document.getElementById('loading').classList.remove('active');}},
 at(x,y){const px=Math.floor(x/W*colW),py=Math.floor(y/H*colH),data=this.surface;if(!data||px<0||py<0||px>=colW||py>=colH)return'wall';let lo=data[2+py],hi=data[3+py]-1;const start=colH+3;while(lo<hi){const mid=(lo+hi)>>>1;if((data[start+mid]>>>2)<=px)lo=mid+1;else hi=mid;}return ['wall','shoulder','road'][data[start+lo]&3];},
 camera(){this.zoom+=(this.targetZoom-this.zoom)*.15;const visible=Math.min(innerWidth,innerHeight)/1050;SCALE=visible*this.zoom;CAMERA_ZOOM_LEGAL=CAMERA_ZOOM_ILLEGAL=1;}
};
loadMap=id=>Runtime.load(id);
surfaceAt=(x,y)=>Runtime.at(x,y);
setMobileCameraMultiplier=m=>{Runtime.targetZoom=Math.max(.5,Math.min(2,Number(m)||1));window.__SPB_CAMERA_MULTIPLIER=Runtime.targetZoom;};
const originalResize=resize;resize=function(){originalResize();Runtime.camera();};
addEventListener('resize',()=>Runtime.camera());

// New maps share the original legal car's physical envelope. Legacy street stays exact.
carH=()=>selectedMapId==='autodrom'?ILLEGAL_CAR_H:LEGAL_CAR_H;
carW=()=>selectedMapId==='autodrom'?ILLEGAL_CAR_W:LEGAL_CAR_W;

// Keep the three supplied maps exact; new maps sample the whole body perimeter.
const suppliedCollides=collides;
collides=function(x,y){if(['isakiy','autodrom','green'].includes(selectedMapId))return suppliedCollides(x,y);const c=Math.cos(car.angle),s=Math.sin(car.angle),h=carH()*.4,w=carW()*.4;for(const [dx,dy] of [[0,0],[h,0],[-h,0],[0,w],[0,-w],[h,w],[h,-w],[-h,w],[-h,-w]])if(surfaceAt(x+c*dx-s*dy,y+s*dx+c*dy)==='wall')return true;return false;};
