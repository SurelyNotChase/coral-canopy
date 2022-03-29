import * as THREE from 'three';
import utils from './utils.js'
import main from "./main.js";
import loader from './loader.js';
import { async } from 'regenerator-runtime';
//import * as ThreeBSP from 'threebsp';

let portalVideos;
let portalParam = {};
let portalTextures = [];
let portalMaterials = [];
let portalGeo, backgroundGeo;
let portalCube, backgroundCube;
let backgroundVideo = document.getElementById('background');
let backgroundTexture, backgroundMaterial;
let backgroundParam = {};


const gameDefaults = {

    camSettings: {
        fov: 75,
        aspectRatio: window.innerWidth / window.innerHeight,
        nearPlane: 0.1,
        farPlane: 1000,
        x: 0,
        y: 0,
        z: 10
    },
    rendSettings: {
        backgroundColor: 'lightgrey',
        width: window.innerWidth,
        height: window.innerHeight

    },
    sceneSettings: {

    }

}

// Data: all loaded models, meshes, textures, and geometries
const modelData = {
    geometries: {
        cube: () => new THREE.BoxGeometry(1, 1, 1),
        wall: (w, h) => new THREE.BoxGeometry(w, h, 1),
        cylinder: () => new THREE.CylinderGeometry(1, 3, 5, 32)

    },

    materials: {
        greenLambert: () => new THREE.MeshLambertMaterial({ color: 'green' }),
        slateBluePhong: () => new THREE.MeshPhongMaterial({ color: 0x6666FF })
    },

    meshes: {
        greenBox: () => new THREE.Mesh(modelData.geometries.cube(), modelData.materials.greenLambert()),
        clownFish: () => utils.loadModelAsync('cfish.gltf'),
        angelfish: () => utils.loadModelAsync('angelfish.gltf'),
        shark: () => utils.loadModelAsync('shark.gltf'),
        maoriWrasse: () => utils.loadModelAsync('MaoriWrasse.gltf'),
        yellowTang: () => utils.loadModelAsync('YellowTang.gltf')
    },


    lights: {
        whitePointLight: () => new THREE.PointLight('white', 1, 500)
    }



}

// >>> Object containing THREE.js scene,renderer, and camera objects
const assembleScene = (defaults = gameDefaults) => {

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(defaults.camSettings.fov, defaults.camSettings.aspectRatio, defaults.camSettings.nearPlane, defaults.camSettings.farPlane);
    camera.position.z = defaults.camSettings.z;
    camera.position.x = defaults.camSettings.x;
    camera.position.y = defaults.camSettings.y;

    const renderer = new THREE.WebGLRenderer({ antialias: true });

    renderer.setClearColor(defaults.rendSettings.backgroundColor);
    renderer.setSize(defaults.rendSettings.width, defaults.rendSettings.height);
   
    return { renderer, camera, scene }

}

const assemblePortal = async () => {

    portalVideos = await loader.loadPortalVideos();

    //Make sure all videos are playing before adding as textures
    portalVideos.forEach(pVideo => {
        pVideo.play();
        pVideo.addEventListener('play', function () {
            this.currentTime = 0;
        });
        portalTextures.push(new THREE.VideoTexture(pVideo));
    });
    backgroundVideo.play();
    backgroundVideo.addEventListener('play', function () {
        this.currentTime = 0;
    });
    backgroundTexture = new THREE.VideoTexture(backgroundVideo);

    //Set up array of portal materials based on different textures
    portalTextures.forEach(texture => {
        portalParam = { color: 0x000000, alphaMap: texture };
        portalMaterials.push(new THREE.MeshBasicMaterial(portalParam));
    });

    //Set each portal material to have an alpha of .5, this allows transparency
    portalMaterials.forEach(material => {
        material.alpaTest = .5;
    });

    //Set up inital texture mapping params to make cubes, start with blankPortal texture
    portalParam = { color: 0x000000, alphaMap: portalTextures[0] };
    backgroundParam = { color: 0xFFFFFF, map: backgroundTexture };

    //Set up geometry to make cubes, current size based on John's original scene
    portalGeo = new THREE.BoxGeometry(40, 20);
    backgroundGeo = new THREE.BoxGeometry(60, 40);
    backgroundMaterial = new THREE.MeshBasicMaterial(backgroundParam);

    //Set up cubes to add to scene for portal and background, (portal initially blank)
    let material = new THREE.MeshBasicMaterial(portalParam);
    material.alphaTest = 0;
    material.transparent = true;
    portalCube = new THREE.Mesh(portalGeo, material);
    portalCube.position.y = -10;
    portalCube.rotation.x = (-90 * Math.PI) / 180;

    backgroundCube = new THREE.Mesh(backgroundGeo, backgroundMaterial);

    backgroundCube.position.y = 10;
    backgroundCube.rotation.x = (-90 * Math.PI) / 180;

    return { portalCube, backgroundCube };
}

// >>> Array of game objects
const generateCharacters = async (count = 25) => {

    let array = [];
    let sharkCount = 0;
    let maoriCount = 0;
    let angelCount = 0;

    for (let i = 0; i < count; i++) {

        let rng = Math.floor(Math.random() * 10);
        let whenReady;
        switch (rng) {
            case 0:
            case 1:
            case 2:
                whenReady = await modelData.meshes.clownFish();
                whenReady.scene.name = "clownfish";
                break;
            case 3:
            case 4:
                if (angelCount < 4) {
                    angelCount++;
                    whenReady = await modelData.meshes.angelfish();
                    whenReady.scene.name = "angelfish";
                } else {
                    whenReady = await modelData.meshes.clownFish();
                    whenReady.scene.name = "clownfish";
                }
                break;
            case 5:
                if (sharkCount < 2) {
                    sharkCount++;
                    whenReady = await modelData.meshes.shark();
                    whenReady.scene.name = "shark";
                } else {
                    whenReady = await modelData.meshes.clownFish();
                    whenReady.scene.name = "clownfish";
                }
                break;
            case 6:
                if (maoriCount < 2) {
                    maoriCount++;
                    whenReady = await modelData.meshes.maoriWrasse();
                    whenReady.scene.name = "maoriWrasse";
                } else {
                    whenReady = await modelData.meshes.clownFish();
                    whenReady.scene.name = "clownfish";
                }
                break;
            case 7:
            case 8:
            case 9:
                whenReady = await modelData.meshes.yellowTang();
                whenReady.scene.name = "yellowTang";
                break;
            default:
                whenReady = await modelData.meshes.clownFish();
                whenReady.scene.name = "clownfish";
                break;
        }

        let model = whenReady;
        array.push(model);
    }

    return array;
}

const getGroups = async (characters, count = 20) => {
    let array = [];
    let sharkCount = 0;
    let maoriCount = 0;
    let angelCount = 0;

    for (let i = 0; i < count; i++) {


        let group = characters[i].scene;
        let name = characters[i].scene.name;

        switch (name) {
            case "clownfish":
                group.position.x = utils.random(-10, -7);
                group.position.z = utils.random(-2, 2);
                group.position.y = utils.random(-9, -6);
                group.scale.x = .004;
                group.scale.y = .004;
                group.scale.z = .004;
                // console.log("cfish:");
                // console.log(group.position);
                break;
            case "yellowTang":
                group.position.x = utils.random(-2, 2);
                group.position.z = utils.random(-10, -7);
                group.position.y = utils.random(-7, -2);
                group.rotation.y = (180 * Math.PI) / 180;
                group.scale.x = .006;
                group.scale.y = .006;
                group.scale.z = .006;
                break;
            case "shark":
                if (sharkCount < 1) {
                    sharkCount++;
                    group.position.x = 10;
                    group.position.z = 9;
                    group.position.y = utils.random(-9, -1);
                } else {
                    group.position.x = -20;
                    group.position.z = -5;
                    group.position.y = -13;
                    group.rotation.y = (90 * Math.PI) / 180;
                    // console.log("sharks:");
                    // console.log(group.position);
                }
                group.scale.x = .023;
                group.scale.y = .023;
                group.scale.z = .023;
                break;
            case "maoriWrasse":
                if (maoriCount < 1) {
                    maoriCount++;
                    group.position.x = utils.random(7, 9);
                    group.position.z = utils.random(-4, -1);
                } else {
                    group.position.x = utils.random(-9, -7);
                    group.position.z = utils.random(-10, -7);
                }
                group.position.y = utils.random(-9, 7);
                group.scale.x = .015;
                group.scale.y = .015;
                group.scale.z = .015;
                break;
            case "angelfish":
                if (angelCount%2 == 0) {
                    angelCount++;
                    group.position.x = utils.random(-6, -2);
                    group.position.z = utils.random(7, 10);
                    group.position.y = utils.random(3, 7);
                } else {
                    angelCount++;
                    group.position.x = utils.random(1, 5);
                    group.position.z = utils.random(7, 10);
                    group.position.y = utils.random(1, 5);
                }
                group.scale.x = .004;
                group.scale.y = .004;
                group.scale.z = .004;
                break;
        }

        
        array.push(group);
    }


    let aLight = modelData.lights.whitePointLight();
    aLight.position.set(10, 0, 25);
    array.push(aLight);

    return array;
}

const getMixers = async (characters, count = 20) => {

    let array = [];

    for (let i = 0; i < count; i++) {
        let mixer = new THREE.AnimationMixer(characters[i].scene);
        array.push(mixer);
    }

    return array;

}

const getAnimations = async (characters, mixers, count = 20) => {

    let array = [];

    for (let i = 0; i < count; i++) {
        let animations = characters[i].animations;
        let mixer = mixers[i];
        const clip = animations[0];
        const action = mixer.clipAction(clip);
        array.push(action);
    }

    return array;
}




export default { assembleScene, generateCharacters, getGroups, getMixers, getAnimations, assemblePortal, modelData, portalVideos, portalParam, portalTextures, portalMaterials }