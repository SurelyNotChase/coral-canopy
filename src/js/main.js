import * as THREE from 'three';
import game from './game.js';
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
let colorTrack;
let aJellyFish = new JellyFish();
let gameObjects = [];
let masterAnimations = []; //array of animation arrays
let portalVideos = [];
let clock = new THREE.Clock();
let mixers;


//// ----- IMMUTABLES ----- ////
const video = document.querySelector('#webcam');
const video2 = document.querySelector('#webcam2');
const predictionDelay = 1000 //minimum time in ms between predictions (alter for benchmarking)
const instructions = 'Orbit Controls are enabled. Click to log current pose predictions.'


//// ----- CORE ----- ////
//Runs at document load
const init = () => {

    experience = game.assembleScene();

    controls = new OrbitControls(experience.camera, experience.renderer.domElement);


    game.assemblePortal();

    populateScene();

    tracking.init();

    mount();

    experience.renderer.render(experience.scene, experience.camera);
    controls.update();

    animate();

    devMessages();
};
//Runs every frame
const animate = () => {
    requestAnimationFrame(animate)
    //controls.update();
    experience.scene.children.forEach((object, index) => {
        if (object.type === 'Group') {
            // object.position.x += utils.lerp(0, utils.random(-1, 1), 0.1)
            // object.position.y += utils.lerp(0, utils.random(-1, 1), 0.1)
            // object.position.z += utils.random(-0.2, 0.2)

            // object.rotation.x += 0.01
            // object.rotation.y += 0.01
            // object.rotation.z += 0.01

            // NOSE TEST keypoints[0] WRIST 9
            //let poseX = -utils.scale(poses.allPoses[0].keypoints[10].position.x, 0, 640, -12, 12);
            // let poseY = -utils.scale(poses2.allPoses[0].keypoints[6].position.y, 0, 480, -4, 4);
            // let poseZ = -utils.scale(poses2.allPoses[0].keypoints[6].position.x, 0, 650, 0, 1000);
            //let poseZ = -utils.scale(poses2.allPoses[0].keypoints[10].position.x, 0, 640, -10, 10);
            // object.position.x -= (utils.lerp(0, poseX, 0.01))
            // object.position.y -= (utils.lerp(0, poseY, 0.01))
            // if (utils.random(0, 1) > 0.99) {
           //object.position.x = utils.lerp(object.position.x, poseX, 0.01)
            //object.position.y = utils.lerp(object.position.y, poseY, 0.01)
             //object.position.y = utils.lerp(object.position.y, poseZ, 0.01)
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
const predictColors = () => {
    const prediction = tracking.getColorPredictions(video, video2);
    //console.log(prediction)
    colorTrack = prediction

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
            'deviceId': "056c0fb78420392d280f976844e2e53a37bc5a051b834280e136b1e69e5904b8",

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
            webcam.addEventListener('loadeddata', predictColors)
        })

    navigator.mediaDevices.getUserMedia(cam2Constraints)
        .then(function (stream) {
            webcam2.srcObject = stream;
            webcam2.addEventListener('loadeddata', predictColors)
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
    console.log(webcam)
}
//Puts entities in the scene
const populateScene = async () => {


    let generate = await game.generateCharacters();
    let getGroups = await game.getGroups(generate);


    getGroups.forEach(object => {
        experience.scene.add(object);
    });
    await animateModels(generate);

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
    requestAnimationFrame(runAnimation);
    controls.update();
    //render();
}

const render = () => {
    experience.renderer.render(experience.scene, experience.camera);
}
export default { init, gameObjects, masterAnimations, portalVideos }