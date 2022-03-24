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
        clownFish: () => utils.loadModelAsync('cfish.gltf')
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
    console.log(2);
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

    return {portalCube, backgroundCube};
}

// >>> Array of game objects
const generateCharacters = async (count = 20) => {

    let array = [];

    console.log(4);


    for (let i = 0; i < count; i++) {

        let whenReady = await modelData.meshes.clownFish();

        let model = whenReady;
        array.push(model);
    }

    return array;
}

const getGroups = async (characters, count = 20) => {
    let array = [];

    for (let i = 0; i < count; i++) {


        let group = characters[i].scene;
        
        group.position.x = utils.random(-7, 7);
        group.position.y = utils.random(-7, 7);
        group.scale.x = .01;
        group.scale.y = .01;
        group.scale.z = .01;
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