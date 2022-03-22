import * as THREE from 'three';
import utils from './utils.js'
import main from "./main.js";
import { async } from 'regenerator-runtime';
//import * as ThreeBSP from 'threebsp';

let portalParams = [];
let portalParam = {};
let portalTextures = [];
let portalMaterials = [];
let portalGeo, backgroundGeo;
let portalCube, backgroundCube;
let backgroundVideo = document.querySelector('#background');
let backgroundTexture, backgroundMaterial;
let backgroundParam = {};
let keyP = false;   //bool for spacebar being pressed


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

// >>> Array of game objects
const generateCharacters = async (count = 20) => {

    let array = [];

    console.log(4);


    for (let i = 0; i < count; i++) {

        let whenReady = await modelData.meshes.clownFish();
        let group = whenReady.scene;

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

    console.log("array:");
    console.log(array);
    return array;
}



const assemblePortal = () => {

    //Make sure all videos are playing before adding as textures
    main.portalVideos.forEach(pVideo => {
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

    //Set up cubes to add to scene for portal and background, (portal initially blank)
    portalCube = new THREE.Mesh(portalGeo, portalMaterials[0]);
    backgroundCube = new THREE.Mesh(backgroundGeo, backgroundMaterial);

    backgroundCube.position.z = -12;    //Set background behind portal, current coord based on John's scene

    //Set up event functions for opening and closing portal, currently based on pressing spacebar
    window.addEventListener("keypress", openPortal);
    window.addEventListener("keyup", closePortal);
}

//Swap portal texture to opening texture
function openPortal(e) {
    e.preventDefault();
    if (e.keyCode == 32 && !keyP) {
        portalVideos[1].currentTime = 0;
        keyP = true;
        portalParam = { color: 0x000000, alphaMap: portalTextures[1] };
        portalCube.material = portalMaterials[1];

        setTimeout(spinPortal, 4000);
    }
}

//Swap portal texture to spinning texture
function spinPortal() {
    portalVideos[2].currentTime = 0;
    portalParam = { color: 0x000000, alphaMap: portalTextures[2] };
    portalCube.material = portalMaterials[2];
}

//Swap portal texture to closing texture
function closePortal(e) {
    e.preventDefault();
    if (e.keyCode == 32 && keyP) {
        portalVideos[3].currentTime = 0;
        keyP = false;
        portalParam = { color: 0x000000, alphaMap: portalTextures[3] };
        portalCube.material = portalMaterials[3];

        setTimeout(blankPortal, 4000);
    }
}

//Swap portal texture to blank texture
function blankPortal() {
    portalVideos[0].currentTime = 0;
    portalParam = { color: 0x000000, alphaMap: portalTextures[0] };
    portalCube.material = portalMaterials[0];
}


export default { assembleScene, generateCharacters, assemblePortal, modelData }