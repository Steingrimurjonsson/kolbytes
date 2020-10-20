let scene, renderer, camera;
const {
    WebGLRenderer, Scene, PerspectiveCamera, Mesh, Color,
    Vector3, SplineCurve, Path, Object3D, MeshBasicMaterial, ShapeGeometry,
    FontLoader,
  } = THREE;
const CHAR_MAP_SIZE_W = 200;
const CHAR_MAP_SIZE_H = 60;

const CHAR_MAP_SIZE_W2 = 600;
const CHAR_MAP_SIZE_H2 = 20;
const smallScreen = 900;

const getRandomNum = (max = 0, min = 0) => {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
}

const render = () => {
    cameraControl.update();
    renderer.render(scene, camera);
    requestAnimationFrame(render);
}

const onResize = () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
}

class CharactersTexture {
    constructor(characters = 'Kolbytes', cellS) {
        this.characters = characters;
        this.charLen = characters.length;
        this.canvas = document.createElement('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.matrix = Math.ceil(Math.sqrt(this.charLen));
        this.cellSize = cellS;
        this.texture;
        this.generateTexture();
    }
    generateTexture() {
        this.canvas.width = this.matrix * this.cellSize;
        this.canvas.height = this.canvas.width;

        this.ctx.font = '420px Arial'; 
        var window_width = $(window).width();
        if( window_width <= smallScreen ){
            this.ctx.font = '70px Arial'; 
        }
        this.ctx.fillStyle = '#ffffff';
        this.ctx.textBaseline = 'middel';
        this.ctx.textAlign = 'start';

        this.ctx.translate(this.cellSize / 2, this.cellSize / 2);
        let cnt = 0;
        for (let y = 0; y < this.matrix; y++) {
            for (let x = 0; x < this.matrix; x++) {
                if (cnt > this.charLen - 1) break;
                this.ctx.fillText(this.characters[cnt],
                    this.cellSize * (x % this.matrix),
                    this.cellSize * Math.floor(cnt / this.matrix));
                cnt++
            }
        }
        const url = this.canvas.toDataURL('image/png', 1.0);
        const image = new Image();
        image.src = url;
        this.texture = new THREE.Texture(image);
        this.texture.needsUpdate = true;
        this.texture.minFilter = THREE.LinearFilter
        // ↓for check canvas
        // const bodyEL = document.getElementById('body');
        // bodyEL.appendChild(this.canvas);
        return this.texture;
    }
}

class CharactersParticles {
    constructor(charTex, charPosMap) {
        this.wrap = new THREE.Object3D();
        this.charactersTexture = charTex;
        this.charactersPositionMap = charPosMap;
        this.texture = charactersTexture.texture;
        this.num = charactersPositionMap.existPos.length;
        this.generateParticle();
    }
    generateParticle() {
        let mapX = 0;
        let mapY = 0;
        let tempIndex = 0;
        let division = 1 / this.charactersTexture.matrix;
        for (let i = 0; i < this.num; i++) {
            const geometory = new THREE.PlaneGeometry(20, 20, 1, 1);
            // uv mapping
            tempIndex = i % this.charactersTexture.charLen;
            mapX = tempIndex % this.charactersTexture.matrix;
            mapY = (this.charactersTexture.matrix - 1 ) - Math.floor(tempIndex / this.charactersTexture.matrix);
            // Specify the UV map for the vertices of each polygon.
            // Specifies which part of the texture image is to be assigned to the vertex of the polygon.
            for (let j = 0; j < geometory.faceVertexUvs[0].length; j++) {
                const uv = geometory.faceVertexUvs[0][j];
                for (let k = 0; k < uv.length; k++) {
                    const point = uv[k];
                    point.x = division * (point.x + mapX);
                    point.y = division * (point.y + mapY);
                }
            }
            const material = new THREE.MeshLambertMaterial({
                color: new THREE.Color("0x959595"),
                map: this.texture,
                transparent: true,
                side: THREE.DoubleSide
            })
            const mesh = new THREE.Mesh(geometory, material);
            this.wrap.add(mesh);
        }
    }
    animation() {
        let cnt = 0;
        for (let i = 0; i < this.charactersPositionMap.canvas.height; i++) {
            for (let j = 0; j < this.charactersPositionMap.canvas.width; j++) {

                if (this.charactersPositionMap.existPosMap[i][j]) {
                    // position
                    const toPos = {
                        x: (j - this.charactersPositionMap.canvas.width / 2) * 20,
                        y: (this.charactersPositionMap.canvas.height / 2 - i) * 20,
                        z: 0
                    }
                    const radius = getRandomNum(10000, 3000);
                    const theta = THREE.Math.degToRad(getRandomNum(180));
                    const phi = THREE.Math.degToRad(getRandomNum(180));
                    const fromPos = {
                        x: Math.sin(theta) * Math.cos(phi) * radius,
                        y: Math.sin(theta) * Math.sin(phi) * radius,
                        z: radius
                    }
                    // rotation
                    const toRotate = {
                        x: 0,
                        y: 0,
                        z: 0
                    }
                    const fromRotate = {
                        x: 0,
                        y: getRandomNum(360 * 3, 360),
                        z: 0
                    }
                    // particle setting
                    const cahrParticle = this.wrap.children[cnt];
                    // potision set
                    TweenMax.set(cahrParticle.position, {
                        x: fromPos.x,
                        y: fromPos.y,
                        z: fromPos.z
                    });

                    //SPEED OF 1 0 
                    const randomPosDuration = getRandomNum(3, 2);
                    TweenMax.to(cahrParticle.position, randomPosDuration, {
                        x: toPos.x,
                        y: toPos.y,
                        z: toPos.z,
                        ease: Power4.easeInOut
                    });
                    // rotation set
                    TweenMax.set(cahrParticle.rotation, {
                        x: fromRotate.x,
                        y: fromRotate.y,
                        z: fromRotate.z
                    });
                    TweenMax.to(cahrParticle.rotation, randomPosDuration * 1.1, {
                        x: toRotate.x,
                        y: toRotate.y,
                        z: toRotate.z,
                        ease: Power2.easeInOut
                    });
                    cnt++
                }
            }
        }
    }
}

class CharactersPositionMap {
    constructor(characters, w, h, fontAndSize, textBL, textA) {
        this.canvas = document.createElement('canvas');
        this.canvas.width = w;
        this.canvas.height = h;
        this.characters = characters;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.font = fontAndSize;
        this.ctx.fillStyle = '#ff0000';
        this.ctx.textBaseline = textBL;
        this.ctx.textAlign = textA;
        var window_width = $(window).width();

        if( window_width <= smallScreen ){
            this.ctx.fillText(characters, w /2, h/5.5);
        }else{
            this.ctx.fillText(characters, w /2, h/2);

        }
        
        this.existPos = [];
        this.existPosMap = [];
        this.getExistPos();
        // ↓for check canvas
        //const bodyEL = document.getElementById('body');
        //bodyEL.appendChild(this.canvas);
    }
    getExistPos() {
        const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
        let index = 0;
        for (let i = 0; i < this.canvas.height; i++) {
            this.existPosMap[i] = [];
            for (let j = 0; j < this.canvas.width; j++) {
                index = (j * 4) + (i * this.canvas.width * 4);
                const redColor = imageData[index];
                this.existPosMap[i][j] = (redColor > 0);
                if (redColor > 0) {
                    this.existPos.push(index);
                }
            }
        }
    }
}

class DustParticles {
    constructor(num = 10) {
        this.num = num;
        this.wrap = new THREE.Object3D();
        for (let i = 0; i < this.num; i++) {
            //JS CONDISTION THAT MAKES dust particals smaller THIS 300 , 250 
            let size = getRandomNum(700, 400);
            var window_width = $(window).width();
            if( window_width <= 480 ){
                size = getRandomNum(300, 250);            
            }
            const geometory = new THREE.BoxGeometry(size, size, size);
            const material = new THREE.MeshLambertMaterial({
                opacity: 0.8,
                transparent: true,
                color: 0xFF921E //orange
            });
            const mesh = new THREE.Mesh(geometory, material);
            const radius = getRandomNum(7000, 2000);
            const theta = THREE.Math.degToRad(getRandomNum(180));
            const phi = THREE.Math.degToRad(getRandomNum(360));
            mesh.position.x = Math.sin(theta) * Math.cos(phi) * radius;
            mesh.position.y = Math.sin(theta) * Math.sin(phi) * radius;
            mesh.position.z = Math.cos(theta) * radius;
            mesh.rotation.x = getRandomNum(360);
            mesh.rotation.y = getRandomNum(360);
            mesh.rotation.z = getRandomNum(360);
            this.wrap.add(mesh);
        }
    }
}


  

//JS CONDISTION THAT MAKES DUSTPARTICLAS 10 WHEN MOBILE
let dustParticles = new DustParticles(50);

let charactersTexture = new CharactersTexture('01', 600);
let charactersPositionMap = new CharactersPositionMap('kolbytes', CHAR_MAP_SIZE_W, CHAR_MAP_SIZE_H, '27px Arial', 'middel', 'center')
let charactersParticles = new CharactersParticles(charactersTexture, charactersPositionMap);

//const charactersTexture = new CharactersTexture('01', 600);
//let charactersPositionMap = new CharactersPositionMap('kolbytes', CHAR_MAP_SIZE_W, CHAR_MAP_SIZE_H, '15px Arial', 'middel', 'center')
//const charactersParticles = new CharactersParticles(charactersTexture, charactersPositionMap);

var window_width = $(window).width();
if( window_width <= smallScreen ){
    charactersTexture = new CharactersTexture('01', 100);
    dustParticles = new DustParticles(40);
    charactersPositionMap = new CharactersPositionMap('kolbytes', CHAR_MAP_SIZE_W, CHAR_MAP_SIZE_H, '15px Arial', 'middel', 'center')
    charactersParticles = new CharactersParticles(charactersTexture, charactersPositionMap);

}



const charactersTexture2 = new CharactersTexture('01', 156);
const charactersPositionMap2 = new CharactersPositionMap('Web & Software solutions', CHAR_MAP_SIZE_W2, CHAR_MAP_SIZE_H2, '5px Arial', 'middel', 'center')
const charactersParticles2 = new CharactersParticles(charactersTexture2, charactersPositionMap2);

/* scene
--------------------------------------*/


/* camera
--------------------------------------*/
//TODO ON RESIZE CHANGE FIRST VAL OF PERSPECTIVECAM TO INCRESE

//ON SCROLL CHANGE PERSPECTIVECAM TO DECREASE TO MAKE ZOOM OUT EFFECT


let windowWidth = window.innerWidth;
let windowHeight = window.innerHeight;
class Webgl {
 constructor(w, h) {
   this.meshCount = 0;
   this.meshListeners = [];
   this.renderer = new WebGLRenderer({ antialias: true, alpha: true });
   this.renderer.setPixelRatio(window.devicePixelRatio);
   this.scene = new Scene();

   
   this.camera = new PerspectiveCamera(70, w / h, 1, 10000);
   var window_width = $(window).width();
   if( window_width <= smallScreen ){
    this.camera = new PerspectiveCamera(110, w / h, 1, 10000);      
   }


    //JS C ONDISTION THAT MAKES POS 3800 when mobile
   this.camera.position.set(0, 0, 1000);
   //var window_width = $(window).width();
   // if( window_width <= 480 ){
   //     this.camera.position.set(0, 0, 3800);
  //  }
   
   this.dom = this.renderer.domElement;
   this.update = this.update.bind(this);
   this.resize = this.resize.bind(this);
   this.resize(w, h); // set render size
 }
 add(mesh) {
   this.scene.add(mesh);
   if (!mesh.update) return;
   this.meshListeners.push(mesh.update);
   this.meshCount++;
 }
 remove(mesh) {
   const idx = this.meshListeners.indexOf(mesh.update);
    if (idx < 0) return;
    this.scene.remove(mesh);
    this.meshListeners.splice(idx, 1);
    this.meshCount--;

 }
 update() {
   let i = this.meshCount;
   while (--i >= 0) {
     this.meshListeners[i].apply(this, null);
   }
   this.renderer.render(this.scene, this.camera);
 }
 resize(w, h) {
   this.camera.aspect = w / h;
   this.camera.updateProjectionMatrix();
   this.renderer.setSize(w, h);
 }
}
const webgl = new Webgl(windowWidth, windowHeight);
camera = webgl.camera;

document.body.appendChild(webgl.dom);

//camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 10000);
class CameraMouseControl {
    constructor(camera) {
      this.camera = camera;
      this.lookAt = new THREE.Vector3();
      this.position = { x: 0, y: 0};
      this.handleMouseMove = this.handleMouseMove.bind(this);
      this.update = this.update.bind(this);
      document.body.addEventListener('mousemove', this.handleMouseMove);
    }
    handleMouseMove(event) {
      this.position.x = -((event.clientX / window.innerWidth) - 1) * 200;
      this.position.y = ((event.clientY / window.innerHeight) - 1) * 200;
    }
    update() {
      this.camera.position.x += (this.position.x - this.camera.position.x) * 1;
      this.camera.position.y += (this.position.y - this.camera.position.y) * 1;
      this.camera.lookAt(this.lookAt);
    }
  }

  const cameraControl = new CameraMouseControl(camera);

//camera.position.x = 0;
//camera.position.y = 100;
//camera.position.z = 900;
//amera.position.x = 310;
//camera.position.y = -90;
//camera.position.z = 270;
//camera.lookAt(scene.position);
//scene.add(camera);


scene = new THREE.Scene();

scene.add(cameraControl);


/* renderer
--------------------------------------*/
renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setClearColor(new THREE.Color(0x0c0c0c));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;

/* AmbientLight
--------------------------------------*/
const ambientLight = new THREE.AmbientLight(0x333333);
scene.add(ambientLight);

/* DirectionalLight
--------------------------------------*/
const directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(0, 1000, 1000);
directionalLight.castShadow = true;
scene.add(directionalLight);

/* OrbitControls
--------------------------------------*/
//const orbitControls = new THREE.OrbitControls(camera);
//orbitControls.autoRotate = false;
//orbitControls.enableDamping = false;
//orbitControls.dampingFactor = 0;
//orbitControls.minDistance = 900;
//orbitControls.maxDistance = 900;
//orbitControls.enabled = true;

/* dust particle
--------------------------------------*/
scene.add(dustParticles.wrap);

/* charactersParticles
--------------------------------------*/
scene.add(charactersParticles.wrap);
charactersParticles.animation();

//scene.add(charactersParticles2.wrap);
//charactersParticles2.animation();
/* resize
--------------------------------------*/
window.addEventListener('resize', onResize);

/* rendering start
--------------------------------------*/
document.getElementById('WebGL-output').appendChild(renderer.domElement);
render();
