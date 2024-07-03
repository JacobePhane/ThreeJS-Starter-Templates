import * as THREE from './scripts/three.module.js';
import { OrbitControls } from './scripts/OrbitControls.js';
import { GLTFLoader } from './scripts/GLTFLoader.js';

//deleted the imports from the cdn for gltf loader and orbitcontrols
//since they are stored locally
let model, sun;

function createRenderer() {
    const renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ReinhardToneMapping;
    renderer.toneMappingExposure = 3;
    renderer.shadowMap.enabled = true;
    return renderer;
}

function createCamera() {
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;
    return camera;
}

const textureLoader = new THREE.TextureLoader();
const checkerNormal = textureLoader.load('assets/little_hermit_crab/textures/Checker_normal.png')
const shaderMaterial = new THREE.RawShaderMaterial({
    vertexShader: `
        uniform mat4 projectionMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 modelMatrix;

        attribute vec3 position;
        //attribute vec2 uv;

        void main()
        {
            gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);
        }
    `,
    fragmentShader: `
        precision mediump float;
        uniform vec3 uColor;
        uniform sampler2D uTexture;
        //varying vec2 vUv;
        void main()
        {
            //vUv = uv;
            //vec4 textureColor = texture2D(uTexture, vUv);
            gl_FragColor = vec4(uColor, 1.0);
        }
    `,
    uniforms:
    {
        uTestFloat: { value: 10 },
        utestVectorTwo: { value: new THREE.Vector2(10, 5) },
        uTime: { value: 0 },
        uColor: { value: new THREE.Color('orange') },
        uTexture: { value: checkerNormal }
    }
})

function addModel(scene) {
    const loader = new GLTFLoader();
    loader.load('assets/little_hermit_crab/scene.gltf', result => {
        model = result.scene.children[0];
        
        model.traverse(obj => {
            if (obj.isMesh) {
                console.log(obj)
                obj.castShadow = true;
                obj.receiveShadow = true;
                obj.material = shaderMaterial;
                /*
                if (obj.material.map) {
                    obj.material.map.anisotrophy = 16;
                }*/
            }
        });
        scene.add(model);


        // Ground plane
        const geo = new THREE.PlaneGeometry(6, 6, 8, 8);
        const mat = new THREE.MeshPhongMaterial({ color: 0xffffff, side: THREE.DoubleSide });
        const plane = new THREE.Mesh(geo, mat);
        plane.rotateX(- Math.PI / 2);
        plane.position.y -= 0.5;
        plane.receiveShadow = true;
        scene.add(plane);
    });
}

function addCubemap(scene) {
    const path = "https://threejs.org/examples/textures/cube/skyboxsun25deg/";
    const format = '.jpg';
    const urls = [
        `${path}px.jpg`,
        `${path}nx.jpg`,
        `${path}py.jpg`,
        `${path}ny.jpg`,
        `${path}pz.jpg`,
        `${path}nz.jpg`,
    ];
    const loader = new THREE.CubeTextureLoader();
    const cubeMap = loader.load(urls);
    cubeMap.format = THREE.RGBFormat;

    scene.background = cubeMap;
}
function addLights(scene) {
    const skyCol = new THREE.Color(0.513, 0.835, 0.866);
    const groundCol = new THREE.Color(0.815, 0.184, 0.439);
    const hemiLight = new THREE.HemisphereLight(skyCol, groundCol, 2);
    scene.add(hemiLight);

    sun = new THREE.SpotLight(0xffffff, 2.2);
    sun.castShadow = true;
    sun.shadow.bias = -0.0001;
    sun.shadow.mapSize = new THREE.Vector2(4096, 4096);
    scene.add(sun);
}

export function main() {
    const scene = new THREE.Scene();
    const camera = createCamera();
    const renderer = createRenderer();
    const controls = new OrbitControls(camera, renderer.domElement);
    document.body.appendChild(renderer.domElement);

    addCubemap(scene);
    addLights(scene);
    addModel(scene);

    function render(time) {
        time *= 0.001; // convert time to seconds

        sun.position.set(
            camera.position.x + 5,
            camera.position.y + 20,
            camera.position.z + 10,
        );

        renderer.render(scene, camera);
        requestAnimationFrame(render);
    }
    requestAnimationFrame(render);
}