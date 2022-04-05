import * as THREE from 'three';
import game from './game.js';
import loader from './loader.js';
import utils from './utils.js';
import tracker from './tracker.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { JellyFish } from '../classes/JellyFish';
import { Fish } from '../classes/Fish.js'
import { exp, util } from '@tensorflow/tfjs-core';

require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');
const cocoSsd = require('@tensorflow-models/coco-ssd');

// import { lerp } from 'three/src/math/mathutils';

/***
 *** 
 ***    Main script - all side-effects are managed here, move any utilities to separate files
 *** 
 ***/


//// ----- MUTABLES ----- ////
let experience = {}; //scene, renderer, and camera
let controls; //ordbit controls

let aJellyFish = new JellyFish(); //testing object

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


const participant1 = {

    x: 0,
    y: 0,
    z: 0

}

const participant2 = {
    x: 0,
    y: 0,
    z: 0

}


//// ----- CORE ----- ////
//Runs at document load
const init = async () => {

    experience = game.assembleScene();

    controls = new OrbitControls(experience.camera, experience.renderer.domElement);

    portalVideos = loader.loadPortalVideos();

    videoTextures = await game.assemblePortal();

    let fishTest = new Fish("testfish", 1, 'cfish.gltf');

    /*
    fishTest.getModel().then(() => {
        fishTest.getMesh();
        fishTest.getAnimationClipData();
        fishTest.getBoundingBox();
    });
    */

    fishTest.getModel();



    experience.scene.add(videoTextures.backgroundCube, videoTextures.portalCube);

    console.log(experience.scene);

    await populateScene();

    //fishTest.getMesh();
    fishTest.getAnimationClipData();
    fishTest.getBoundingBox();

    console.log(fishTest);

    tracker.init();

    mount();

    setupColorTracker(video, 1);
    // setupColorTracker(video2, 2);
    setupColorTracker2(video2, 2);

    experience.renderer.render(experience.scene, experience.camera);
    controls.update();

    animate();

    devMessages();
};


//Swap portal texture to opening texture
function openPortal(e) {
    e.preventDefault();
    if (e.keyCode == 32 && !keyP) {
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

//returns color tracker
const setupColorTracker = (videoSource, index) => {

    const myColors = ['magenta', 'yellow', 'cyan'];
    const myColorTracker = tracker.getColorTracker(myColors);

    //mount color events
    myColorTracker.on('track', function (event) {

        let detectedColors = event.data;

        // if (detectedColors.length === 0) return

        detectedColors.forEach((detection) => {

            //console.log(detection)
            colorEvent(detection, index);


        })
    });

    tracking.track(videoSource, myColorTracker)



}

const setupColorTracker2 = (videoSource, index) => {

    const myColors = ['magenta', 'yellow', 'cyan'];
    const myColorTracker = tracker.getColorTracker(myColors);

    //mount color events
    myColorTracker.on('track', function (event) {

        let detectedColors = event.data;

        // if (detectedColors.length === 0) return

        detectedColors.forEach((detection) => {

            //console.log(detection)
            colorEvent(detection, index);


        })
    });

    tracking.track(videoSource, myColorTracker)



}

const colorEvent = (detection, index) => {


    if (detection.color === "magenta") {


        //update participant 1 x,y,z

        if (index === 1) participant1.z = utils.scale(detection.x, 0, 640, -20, 20)
        if (index === 1) participant1.y = utils.scale(detection.y, 0, 640, -10, 10)
        if (index === 2) participant1.x = utils.scale(detection.x, 0, 640, -20, 20)
        console.log(participant1)


    }

    if (detection.color === "cyan") {

        //console.log('cyan detected',detection)

    }

    if (detection.color === "yellow") {



        if (index === 1) participant2.x = utils.scale(detection.x, 0, 640, -10, 10)
        if (index === 1) participant2.y = utils.scale(detection.y, 0, 640, -10, 10)
        if (index === 2) participant2.z = utils.scale(detection.x, 0, 640, -10, 10)
        console.log(participant2)
    }


}

//Runs every frame
const animate = () => {
    requestAnimationFrame(animate)


    controls.update();

    let sharkCount = 0;
    experience.scene.children.forEach((object, index) => {

        // object.position.x = participant1.x
        // object.position.y = participant1.y
        // object.position.z = participant1.z
        if (object.type === 'Group') {
            let fishType = object.name;

            if (fishType == "clownfish") {
                // object.position.x += .4;
                object.position.x = participant1.x;
                object.position.y = participant1.y;
                object.position.z = participant1.z;
                // if (object.position.x > 12) object.position.x = -12;
            }
            // else if (fishType == "angelfish" || fishType == "maoriWrasse" || fishType == "yellowTang") {
            //     if (fishType == "yellowTang") object.position.z += utils.random(.3,.6);
            //     else object.position.z -= utils.random(.3,.6);

            //     if (object.position.z < -14) object.position.z = 14;
            //     else if (object.position.z > 14) object.position.z = -14;
            // }
            // else if (fishType == "shark"){
            //     if (sharkCount == 0) object.position.z += utils.random(0,1.5);
            //     else object.position.x += utils.random(.2,.6);
            //     sharkCount++;
            //     if (object.position.z > 16) object.position.z = -16;
            //     if (object.position.x > 20) object.position.x = -20;
            // }


            //         // object.position.x += utils.lerp(0, utils.random(-1, 1), 0.1)
            //         // object.position.y += utils.lerp(0, utils.random(-1, 1), 0.1)
            //         // object.position.z += utils.random(-0.2, 0.2)

            //         // object.rotation.x += 0.01
            //         // object.rotation.y += 0.01
            //         // object.rotation.z += 0.01

            //         // NOSE TEST keypoints[0] WRIST 9
            //         //let poseX = -utils.scale(poses.allPoses[0].keypoints[10].position.x, 0, 640, -12, 12);
            //         // let poseY = -utils.scale(poses2.allPoses[0].keypoints[6].position.y, 0, 480, -4, 4);
            //         // let poseZ = -utils.scale(poses2.allPoses[0].keypoints[6].position.x, 0, 650, 0, 1000);
            //         //let poseZ = -utils.scale(poses2.allPoses[0].keypoints[10].position.x, 0, 640, -10, 10);
            //         // object.position.x -= (utils.lerp(0, poseX, 0.01))
            //         // object.position.y -= (utils.lerp(0, poseY, 0.01))
            //         // if (utils.random(0, 1) > 0.99) {
            //        //object.position.x = utils.lerp(object.position.x, poseX, 0.01)
            //         //object.position.y = utils.lerp(object.position.y, poseY, 0.01)
            //          //object.position.y = utils.lerp(object.position.y, poseZ, 0.01)
            //         // }



        }

    })
    experience.renderer.render(experience.scene, experience.camera);


}
//// ----- SIDE EFFECTS ----- ////

//Updates poses object with recursive promise loop. (this should be refactored to a utility function so that we can use recursive promises for other things)
const predictVideo = () => {


    // const predictions = tracker.getPredictions(video,video2)

    // console.log(prediction)

    // predictions.prediction1.then((result) => {
    //     console.log(result)

    //     done1 = true;

    // })

    // predictions.prediction2.then((result) => {
    //     console.log(result)

    //     done2 = true;

    // })


    setTimeout(predictVideo, predictionDelay);


    // prediction.then((result) => {

    //     const segmentations = result

    //     segmentations.segmentation.then((segmentResult) => {
    //         poses = segmentResult;
    //     })

    //     segmentations.segmentation2.then((segmentResult) => {
    //         poses2 = segmentResult;
    //     })

    //     setTimeout(predictVideo, predictionDelay);

    // })

    //    predictions.prediction1.catch((err) => { console.log(err) })
    //     predictions.prediction2.catch((err) => { console.log(err) }) 





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

    //Set up event functions for opening and closing portal, currently based on pressing spacebar
    window.addEventListener("keypress", openPortal);
    window.addEventListener("keyup", closePortal);


    const cam1Constraints = {
        // 'audio': { 'echoCancellation': true },
        'video': {
            'deviceId': "def272f22344671423eb09c1a1cfcd6c00ceb0b887e687a43ec0d8b3b78fc3e2",

        }
    }

    const cam2Constraints = {
        // 'audio': { 'echoCancellation': true },
        'video': {
            'deviceId': "9d1e62cd5f58748641cfead3b32713680b445fedfd6710d63f867cf56117a6ae",

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
            webcam.addEventListener('loadeddata', () => { cam1Isready = true })
        })

    navigator.mediaDevices.getUserMedia(cam2Constraints)
        .then(function (stream) {
            webcam2.srcObject = stream;
            webcam2.addEventListener('loadeddata', () => { cam2Isready = true })
        })



    //testing listener
    window.addEventListener('click', () => { console.log(poses, poses2) })

}
//Logs information to the console
const devMessages = () => {
    console.log('Instructions: ', instructions)
    console.log('Backend: ', tracker.logBackend());
    console.log('Experience:', experience)
    console.log('Entity Sample:', aJellyFish)
    console.log(webcam)
}
//Puts entities in the scene
const populateScene = async () => {

    //experience.scene.add(game.modelData.meshes.greenBox())

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
    controls.update();
    requestAnimationFrame(runAnimation);



    // let testX = tracker.x;
    // console.log(tracker.x);
}

export default { init, gameObjects, masterAnimations, portalVideos }