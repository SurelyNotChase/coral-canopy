import * as THREE from 'three';
import game from './game.js';
import loader from './loader.js';
import utils from './utils.js';
import tracking from './tracking.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { JellyFish } from '../classes/JellyFish';
import { util } from '@tensorflow/tfjs-core';
// import { lerp } from 'three/src/math/mathutils';

/***
 *** 
 ***    Main script - all side-effects are managed here, move any utilities to separate files
 *** 
 ***/


//// ----- MUTABLES ----- ////
let experience = {}; //scene, renderer, and camera
let controls;
let poses;
let poses2;
let aJellyFish = new JellyFish();
let gameObjects = [];
let masterAnimations = []; //array of animation arrays
let clock = new THREE.Clock();
let mixers;
let keyP = false;   //bool for spacebar being pressed
let portalVideos = [];
let videoTextures = [];


//// ----- IMMUTABLES ----- ////
const video = document.querySelector('#webcam');
const video2 = document.querySelector('#webcam2');
const predictionDelay = 1000 //minimum time in ms between predictions (alter for benchmarking)
const instructions = 'Orbit Controls are enabled. Click to log current pose predictions.'


//// ----- CORE ----- ////
//Runs at document load
const init = async () => {

    experience = game.assembleScene();

    controls = new OrbitControls(experience.camera, experience.renderer.domElement);

    portalVideos = loader.loadPortalVideos();
    videoTextures = await game.assemblePortal();

    experience.scene.add(videoTextures.backgroundCube, videoTextures.portalCube);
    console.log(experience.scene);
    //Set up event functions for opening and closing portal, currently based on pressing spacebar
    window.addEventListener("keypress", openPortal);
    window.addEventListener("keyup", closePortal);

    populateScene();

    tracking.init();

    mount();

    experience.renderer.render(experience.scene, experience.camera);
    controls.update();

    animate();

    devMessages();
};


//Swap portal texture to opening texture
function openPortal(e) {
    e.preventDefault();
    if (e.keyCode == 32 && !keyP) {
        console.log("heyo");
        console.log(portalVideos);
        console.log(game.portalParam);
        console.log(game.portalTextures[1]);
        console.log(game.portalMaterials[1]);
        portalVideos[1].currentTime = 0;
        keyP = true;
        game.portalParam = { color: 0x000000, alphaMap: game.portalTextures[1] };
        game.portalMaterials[1] = new THREE.MeshBasicMaterial(game.portalParam);
        game.portalMaterials[1].alphaTest = 0;
        game.portalMaterials[1].transparent = true;
        videoTextures.portalCube.material = game.portalMaterials[1];
        setTimeout(spinPortal, 4000);
    }
}

//Swap portal texture to spinning texture
function spinPortal() {
    portalVideos[2].currentTime = 0;
    game.portalParam = { color: 0x000000, alphaMap: game.portalTextures[2] };
    game.portalMaterials[2] = new THREE.MeshBasicMaterial(game.portalParam);
    game.portalMaterials[2].alphaTest = 0;
    game.portalMaterials[2].transparent = true;
    videoTextures.portalCube.material = game.portalMaterials[2];
}

//Swap portal texture to closing texture
function closePortal(e) {
    e.preventDefault();
    if (e.keyCode == 32 && keyP) {
        portalVideos[3].currentTime = 0;
        keyP = false;
        game.portalParam = { color: 0x000000, alphaMap: game.portalTextures[3] };
        game.portalMaterials[3] = new THREE.MeshBasicMaterial(game.portalParam);
        game.portalMaterials[3].alphaTest = 0;
        game.portalMaterials[3].transparent = true;
        videoTextures.portalCube.material = game.portalMaterials[3];

        setTimeout(blankPortal, 4000);
    }
}

//Swap portal texture to blank texture
function blankPortal() {
    portalVideos[0].currentTime = 0;
    game.portalParam = { color: 0x000000, alphaMap: game.portalTextures[0] };
    game.portalMaterials[0] = new THREE.MeshBasicMaterial(game.portalParam);
    game.portalMaterials[0].alphaTest = 0;
    game.portalMaterials[0].transparent = true;
    videoTextures.portalCube.material = game.portalMaterials[0];
}

//Runs every frame
const animate = () => {
    requestAnimationFrame(animate)
    //controls.update();
    experience.scene.children.forEach((object, index) => {
        if (object.type === 'Group' && poses.allPoses.length > 0) {
            // object.position.x += utils.lerp(0, utils.random(-1, 1), 0.1)
            // object.position.y += utils.lerp(0, utils.random(-1, 1), 0.1)
            // object.position.z += utils.random(-0.2, 0.2)

            // object.rotation.x += 0.01
            // object.rotation.y += 0.01
            // object.rotation.z += 0.01

            // NOSE TEST keypoints[0] WRIST 9
            let poseX = -utils.scale(poses.allPoses[0].keypoints[0].position.x, 0, 650, -7, 7);
            let poseY = -utils.scale(poses.allPoses[0].keypoints[0].position.y, 0, 480, -4, 4);
            // object.position.x -= (utils.lerp(0, poseX, 0.01))
            // object.position.y -= (utils.lerp(0, poseY, 0.01))
            // if (utils.random(0, 1) > 0.99) {
            object.position.x = utils.lerp(object.position.x, poseX, 0.01)
            object.position.y = utils.lerp(object.position.y, poseY, 0.01)
            // }



        }

    })
    experience.renderer.render(experience.scene, experience.camera);


}
//// ----- SIDE EFFECTS ----- ////

//Updates poses object with recursive promise loop. (this should be refactored to a utility function so that we can use recursive promises for other things)
const predictVideo = () => {
    const prediction = tracking.getPredictions(video, video2)


    prediction.then((result) => {

        const segmentations = result

        segmentations.segmentation.then((segmentResult) => {
            poses = segmentResult;
        })

        segmentations.segmentation2.then((segmentResult) => {
            poses2 = segmentResult;
        })


        setTimeout(predictVideo, predictionDelay);

    })
    prediction.catch((err) => { console.log(err) })




}
//Puts the scene on the webpage
const mount = () => {

    //renderer to canvas
    document.querySelector('body').appendChild(experience.renderer.domElement);

    //responsive scaling 
    window.addEventListener('resize', () => {
        experience.renderer.setSize(window.innerWidth, window.innerHeight);
        experience.camera.aspect = window.innerWidth / window.innerHeight;
        experience.camera.updateProjectionMatrix();
    })

    //webcam and video
    // if (navigator.mediaDevices.getUserMedia) {
    //     navigator.mediaDevices.getUserMedia({ video: true })
    //         .then(function (stream) {
    //             video.srcObject = stream;
    //             video.addEventListener('loadeddata', predictVideo)
    //         })
    // }

    const cam1Constraints = {
        // 'audio': { 'echoCancellation': true },
        'video': {
            'deviceId': "9d1e62cd5f58748641cfead3b32713680b445fedfd6710d63f867cf56117a6ae",

        }
    }

    const cam2Constraints = {
        // 'audio': { 'echoCancellation': true },
        'video': {
            'deviceId': "5c9fcb83e7bbc6becb94fbafe7ba1669c034a9dbfb519234be01a2f49f82bce4",

        }
    }

    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const filtered = devices.filter(device => device.kind === 'videoinput');
            console.log("Video Devices:", filtered)
        });


    navigator.mediaDevices.getUserMedia(cam1Constraints)
        .then(function (stream) {
            webcam.srcObject = stream;
            webcam.addEventListener('loadeddata', predictVideo)
        })

    navigator.mediaDevices.getUserMedia(cam2Constraints)
        .then(function (stream) {
            webcam2.srcObject = stream;
            webcam2.addEventListener('loadeddata', predictVideo)
        })



    //testing listener
    window.addEventListener('click', () => { console.log(poses, poses2) })

}
//Logs information to the console
const devMessages = () => {
    console.log('Instructions: ', instructions)
    console.log('Backend: ', tracking.logBackend());
    console.log('Experience:', experience)
    console.log('Entity Sample:', aJellyFish)
}
//Puts entities in the scene
const populateScene = async () => {
    console.log(3);

    let generate = await game.generateCharacters();
    let getGroups = await game.getGroups(generate);


    getGroups.forEach(object => {
        experience.scene.add(object);
    });
    await animateModels(generate);
    console.log(6);
}

//Calls function to get animation, set up mixers and clips, basically get ready to call update for 'wiggling' animations
const animateModels = async (models) => {
    mixers = await game.getMixers(models);
    let animations = await game.getAnimations(models, mixers);

    animations.forEach(object => {
        object.play();
    });

    runAnimation();
}

const runAnimation = () => {
    const dt = clock.getDelta();
    for (const mixer of mixers) {
        mixer.update(dt);
    }
    experience.renderer.render(experience.scene, experience.camera);
    controls.update();
    requestAnimationFrame(runAnimation);
}

export default { init, gameObjects, masterAnimations, portalVideos }