import * as THREE from 'three';
//import * as ThreeBSP from 'threebsp';


const gameDefaults = { 

    camSettings: {
        fov:75,
        aspectRatio:window.innerWidth/window.innerHeight,
        nearPlane:0.1,
        farPlane:1000,
        x: 0,
        y: 0,
        z: 5
    },
    rendSettings: {
        backgroundColor: 'lightgrey',
        width: window.innerWidth,
        height: window.innerHeight

    },
    sceneSettings: {
        
    }

}

//all loaded models, meshes, textures, and geometries
const modelData = {
    geometries: {
        cube: () => new THREE.BoxGeometry(1, 1, 1),
        wall: (w,h) => new THREE.BoxGeometry(w,h,1),
        cylinder: () => new THREE.CylinderGeometry(1, 3, 5, 32)
        
    },

    materials: {
        greenLambert: () => new THREE.MeshLambertMaterial({ color: 'green' }),
        slateBluePhong: () => new THREE.MeshPhongMaterial({ color: 0x6666FF })
    },

    meshes: {
        greenBox: () => new THREE.Mesh(modelData.geometries.cube(), modelData.materials.greenLambert())
    },

    // csgs:{
    //     wall: (w,h) => new ThreeBSP(modelData.geometries.wall(w,h,1)),
    //     cylinder: () => new ThreeBSP(modelData.geometries.cylinder()),
    //     wallSubCylinder: (w,h) => modelData.csgs.wall(w,h).subtract(modelData.csgs.cylinder())

    // },

    lights:{
        whitePointLight: () => new THREE.PointLight('white', 1, 500)
    }



}

// >>> Object containing THREE.js scene,renderer, and camera objects
const assembleScene = (defaults = gameDefaults) => {

const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(defaults.camSettings.fov, defaults.camSettings.aspectRatio, defaults.camSettings.nearPlane, defaults.camSettings.farPlane);
camera.position.z = defaults.camSettings.z;


const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setClearColor(defaults.rendSettings.backgroundColor);
renderer.setSize(defaults.rendSettings.width,defaults.rendSettings.height); 

return {renderer,camera,scene}

}

// >>> Array of game objects
const generateCharacters = (count = 5 ) => {

    let array = [];

    for(let i=0;i<=count;i++){

        array.push(modelData.meshes.greenBox())

    }

    array.push(modelData.lights.whitePointLight())


    return array

}




export default {assembleScene,generateCharacters}