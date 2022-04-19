import * as THREE from 'three';
import utils from './utils.js'
import main from "./main.js";
import loader from './loader.js';
import { async } from 'regenerator-runtime';
import { Fish } from '../classes/Fish.js';
//import * as ThreeBSP from 'threebsp';

let portalVideos = [];
let portalParam = {};
let portalTextures = [];
let portalMaterials = [];
let portalGeo, backgroundGeo;
let portalCube, backgroundCube;
let backgroundVideo = document.getElementById('background');
let backgroundTexture, backgroundMaterial;
let backgroundParam = {};


let angelfishCount = 1;
let blueTangCount = 1;
let maoriCount = 1;
let turtleCount = 1;
let whaleCount = 1;

let clownfishCount = 1;
let sharkCount = 1;
let yellowtangCount = 1;

let keyP = false;   //bool for spacebar being pressed

let groups;


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
        maoriWrasse: () => new Fish("maoriWrasse", maoriCount, 'MaoriWrasse.gltf'),
        blueTang: () => new Fish("blueTang", blueTangCount, 'BlueTang.gltf'),
        turtle: () => new Fish("turtle", turtleCount, 'Turtle.gltf'),
        whale: () => new Fish("whale", whaleCount, 'HumpbackWhale.gltf'),
        angelfish: () => new Fish("angelfish", angelfishCount, 'BluefaceAngelfish.gltf'),
        greenBox: () => new THREE.Mesh(modelData.geometries.cube(), modelData.materials.greenLambert()),
        clownFish: () => new Fish("clownfish", clownfishCount, 'clownTest.gltf'),   //utils.loadModelAsync('cfish.gltf'),
        shark: () => utils.loadModelAsync('shark.gltf'),
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

    portalVideos = loadPortalVideos();

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

    videoTextures = { portalCube, backgroundCube };

}
// >>> Array of game objects
const generateCharacters = async (count = 3) => {

    let array = [];

    //Add whale
    whenReady = await modelData.meshes.whale();
    await whenReady.getModel();
    array.push(whenReady);

    //Add 2 turtles
    for (let i = 0; i < 2; i++) {
        whenReady = await modelData.meshes.turtle();
        await whenReady.getModel();
        turtleCount++;
        array.push(whenReady);
    }

    //Add 1-3 maoriWrasse
    let rng = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < rng; i++) {
        whenReady = await modelData.meshes.maoriWrasse();
        await whenReady.getModel();
        maoriCount++;
        array.push(whenReady);
    }

    //Add 2-3 angelfish
    rng = Math.floor(Math.random() * 2) + 2;
    for (let i = 0; i < rng; i++) {
        whenReady = await modelData.meshes.angelfish();
        await whenReady.getModel();
        angelfishCount++;
        array.push(whenReady);
    }

    //Add 5-7 blue tang
    rng = Math.floor(Math.random() * 3) + 4;
    for (let i = 0; i < rng; i++) {
        whenReady = await modelData.meshes.blueTang();
        await whenReady.getModel();
        blueTangCount++;
        array.push(whenReady);
    }

    return array;
}

const getGroups = async (characters, count = 3) => {
    let array = [];
    count = characters.length;

    groups = characters;

    for (let i = 0; i < count; i++) {


        let group = characters[i].meshObject;
        let name = characters[i].name;

        switch (name) {
            case "maoriWrasse":
                if (characters[i].id == 1) {
                    group.position.x = utils.random(7, 9);
                    group.position.z = utils.random(7, 9);
                    group.rotation.y = (25 * Math.PI) / 180;
                } else {
                    group.position.x = utils.random(6, 9);
                    group.position.z = utils.random(-10, -6);
                    group.rotation.y = (145 * Math.PI) / 180;
                }
                group.position.y = utils.random(-9, 7);
                group.scale.x = .015;
                group.scale.y = .015;
                group.scale.z = .015;
                break;
            case "angelfish":
                group.position.x = utils.random(-7, -4);
                group.position.z = utils.random(5, 8);
                group.position.y = utils.random(-4, 0);
                group.rotation.y = -(35 * Math.PI) / 180;
                group.scale.x = .003;
                group.scale.y = .003;
                group.scale.z = .003;
                break;
            case "blueTang":
                group.position.x = utils.random(4, 8);
                group.position.z = utils.random(-3, -1);
                group.position.y = utils.random(-9, -5);
                group.rotation.y = (90 * Math.PI) / 180;
                group.scale.x = .004;
                group.scale.y = .004;
                group.scale.z = .004;
                break;
            case "whale":
                group.position.x = utils.random(-12, -10);
                group.position.z = utils.random(1, 3);
                group.position.y = 5;
                group.rotation.y = -(90 * Math.PI) / 180;
                group.scale.x = .05;
                group.scale.y = .05;
                group.scale.z = .05;
                break;
            case "turtle":
                group.position.x = utils.random(-6, -1);
                group.position.z = utils.random(-9, -5);
                group.position.y = utils.random(-8, -4);
                group.scale.x = .015;
                group.scale.y = .015;
                group.scale.z = .015;
                group.rotation.y = (200 * Math.PI) / 180;
                break;
            case "clownfish":
                /*
                group.position.x = utils.random(-10, -7);
                group.position.z = utils.random(-2, 2);
                group.position.y = utils.random(-9, -6);
                */
                if (characters[i].id == 1) {
                    group.position.x = -5;
                    group.position.z = 5;
                } else if (characters[i].id == 2) {
                    group.position.x = 5;
                    group.position.z = 5;
                } else {
                    group.position.x = 0;
                    group.position.z = -7;
                }
                group.position.y = utils.random(-4.5, -4);
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

                }
                group.scale.x = .023;
                group.scale.y = .023;
                group.scale.z = .023;
                break;
        }


        array.push(group);
    }

    let aLight = modelData.lights.whitePointLight();
    aLight.position.set(10, 0, 25);
    array.push(aLight);

    return array;
}

const loadPortalVideos = () => {
    let array = [];

    array.push(document.getElementById('blankPortal'));
    array.push(document.getElementById('openingPortal'));
    array.push(document.getElementById('spinningPortal'));
    array.push(document.getElementById('closingPortal'));

    return array;
}

//Swap portal texture to opening texture
function openPortal(e) {
    e.preventDefault();
    if (e.keyCode == 32 && !keyP) {

        // portalVideos[1].currentTime = 0;
        keyP = true;
        portalParam = { color: 0x000000, alphaMap: portalTextures[1] };
        portalMaterials[1] = new THREE.MeshBasicMaterial(portalParam);
        portalMaterials[1].alphaTest = 0;
        portalMaterials[1].transparent = true;
        videoTextures.portalCube.material = portalMaterials[1];
        setTimeout(spinPortal, 4000);
    }
    else if (e.keyCode == 102) {
        let count = groups.length
        for (let i = 0; i < count; i++) {


            let group = groups[i].meshObject;
            let name = groups[i].name;

            switch (name) {
                case "maoriWrasse":
                    if (groups[i].id == 1) {
                        group.rotation.x = -(45 * Math.PI) / 180;
                    } else {
                        group.rotation.x = (45 * Math.PI) / 180;
                    }
                    break;
                case "angelfish":
                    group.rotation.x = -(45 * Math.PI) / 180;
                    if(group.position.x > 0) {
                        group.rotation.x = (35 * Math.PI) / 180;
                        group.rotation.y = (180 * Math.PI) / 180;
                    }
                    break;
            }
            groups[i].speed = 0;
        }
        main.pause = true;

        setTimeout(() => { 
            let count = groups.length
            for (let i = 0; i < count; i++) { 
                groups[i].meshObject.rotation.x = 0; 
                groups[i].speed = 1; 
                //if(groups[i].name == 'angelfish') { groups[i].rotation.y = 0; groups[i].rotation.y = (90 * Math.PI) / 180; console.log("yay"); }
            }
            console.log("done");
        }, 4000);
    }
}

//Swap portal texture to spinning texture
function spinPortal() {
    portalVideos[2].currentTime = 0;
    portalParam = { color: 0x000000, alphaMap: portalTextures[2] };
    portalMaterials[2] = new THREE.MeshBasicMaterial(portalParam);
    portalMaterials[2].alphaTest = 0;
    portalMaterials[2].transparent = true;
    videoTextures.portalCube.material = portalMaterials[2];
}

//Swap portal texture to closing texture
function closePortal(e) {
    e.preventDefault();
    if (e.keyCode == 32 && keyP) {
        portalVideos[3].currentTime = 0;
        keyP = false;
        portalParam = { color: 0x000000, alphaMap: portalTextures[3] };
        portalMaterials[3] = new THREE.MeshBasicMaterial(portalParam);
        portalMaterials[3].alphaTest = 0;
        portalMaterials[3].transparent = true;
        videoTextures.portalCube.material = portalMaterials[3];

        setTimeout(blankPortal, 4000);
    }
}

//Swap portal texture to blank texture
function blankPortal() {
    portalVideos[0].currentTime = 0;
    portalParam = { color: 0x000000, alphaMap: portalTextures[0] };
    portalMaterials[0] = new THREE.MeshBasicMaterial(portalParam);
    portalMaterials[0].alphaTest = 0;
    portalMaterials[0].transparent = true;
    videoTextures.portalCube.material = portalMaterials[0];
}

/*
const getMixers = async (characters, count = 20) => {

    let array = [];

    for (let i = 0; i < count; i++) {
        let mixer = new THREE.AnimationMixer(characters[i].scene);
        array.push(mixer);
    }

    return array;

}*/

const getAnimations = async (characters, mixers, count = 3) => {

    let array = [];
    count = characters.length;

    for (let i = 0; i < count; i++) {
        /*
        let animations = characters[i].animations;
        let mixer = mixers[i];
        const clip = animations[0];
        const action = mixer.clipAction(clip);
        */
        let clipAnimation = characters[i].animationClip;
        array.push(clipAnimation);
        //console.log(clipAnimation);
    }

    return array;
}

export default {
    assembleScene,
    generateCharacters,
    getGroups,
    getAnimations,
    assemblePortal,
    openPortal,
    spinPortal,
    closePortal,
    loadPortalVideos,
    modelData,
    portalVideos,
    portalParam,
    portalTextures,
    portalMaterials
}