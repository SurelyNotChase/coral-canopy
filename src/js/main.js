import game from './game.js';
import utils from './utils.js';
import tracking from './tracking.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {JellyFish,ClownFish} from '../classes/JellyFish';
import { util } from '@tensorflow/tfjs-core';

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
let portalVideos = [];


//// ----- IMMUTABLES ----- ////
const video = document.querySelector('#webcam');
const video2 = document.querySelector('#webcam2');
const predictionDelay = 1500 //minimum time in ms between predictions (alter for benchmarking)
const instructions = 'Orbit Controls are enabled. Click to log current pose predictions.'


//// ----- CORE ----- ////
//Runs at document load
const init = () => {

    experience = game.assembleScene()

    controls = new OrbitControls( experience.camera, experience.renderer.domElement );
    

    game.assemblePortal();
    
    populateScene();

    tracking.init();

    mount();

    experience.renderer.render(experience.scene,experience.camera);
    controls.update();

    animate();
    
    devMessages();
};


//Runs every frame
const animate = () => {
    requestAnimationFrame(animate)
    //controls.update();
    experience.scene.children.forEach(object=>{
        if(object.type === 'Mesh'){
            object.position.x += utils.random(-0.5,0.5)
            object.position.y += utils.random(-0.5,0.5)
            object.position.z += utils.random(-0.5,0.5)
            
            object.rotation.x += 0.01
            object.rotation.y += 0.01
            object.rotation.z += 0.01

        }

    })
    experience.renderer.render(experience.scene,experience.camera);
    

}
//// ----- SIDE EFFECTS ----- ////

//Updates poses object with recursive promise loop. (this should be refactored to a utility function so that we can use recursive promises for other things)
const predictVideo = () => {
    const prediction = tracking.getPredictions(video,video2)
    

    prediction.then((result)=>{

        const segmentations = result

        segmentations.segmentation.then((segmentResult)=>{
            poses = segmentResult;
        })

        segmentations.segmentation2.then((segmentResult)=>{
            poses2 = segmentResult;
        })

        setTimeout(predictVideo, predictionDelay);
        
    })
    prediction.catch((err)=>{console.log(err)})



    
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
        'audio': {'echoCancellation': true},
        'video': {
            'deviceId': "3a5d61a1edc30ca4239a013f4aa933311acca61e8a30785126b43059be921f1b",

            }
    }

    const cam2Constraints = {
        'audio': {'echoCancellation': true},
        'video': {
            'deviceId': "b96a6b7c2e2e27462fdd077124fbc45f1ddeb23bb03a266412d179281c65aec0",

            }
    }

    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const filtered = devices.filter(device => device.kind === 'videoinput');
            console.log("Video Devices:",filtered)
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
    window.addEventListener('click', ()=>{console.log(poses.allPoses,poses2.allPoses)})

}
//Logs information to the console
const devMessages = () => {
    console.log('Instructions: ',instructions)
    console.log('Backend: ', tracking.logBackend());
    console.log('Experience:',experience)
    console.log('Entity Sample:',aJellyFish)
}
//Puts entities in the scene
const populateScene = () => {
    /*
    //We can just throw assets into array as they're being loaded, then populate here
    game.generateCharacters().forEach(object=>{ 

        gameObjects.push(object) 
        gameObjects.forEach(object=>{experience.scene.add(object)})

    })
    */
    game.generateCharacters().forEach(object=>experience.scene.add(object))
    

}

export default { init, gameObjects, masterAnimations, portalVideos }