import * as THREE from 'three';
import game from './game.js';
import loader from './loader.js';
import utils from './utils.js';
import tracker from './tracker.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { ClownFish } from '../classes/ClownFish.js';
import { Fish } from '../classes/Fish.js'
import { exp, util } from '@tensorflow/tfjs-core';

require('@tensorflow/tfjs-backend-cpu');
require('@tensorflow/tfjs-backend-webgl');

/***
 *** ----------------------------------------------------------------------------------------
 ***    Main script - all side-effects are managed here, move any utilities to separate files
 *** ---------------------------------------------------------------------------------------- /
 ***/


//// ----- MUTABLES ----- ////
let experience = {}; //scene, renderer, and camera
let controls; //ordbit controls
let generate;

let aJellyFish = new ClownFish(); //testing object
let mouseCube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), game.modelData.materials.greenLambert())


let gameObjects = [];
let masterAnimations = []; //array of animation arrays

let clock = new THREE.Clock();
let mixers;

let pause = false;

let camera1Index = 0;
let camera2Index = 1;

let videoVisibility = false;

let prevMag = -25;
let prevCy = -25;
let prevYel = -25;

//// ----- IMMUTABLES ----- ////
const video = document.querySelector('#webcam');
const video2 = document.querySelector('#webcam2');
const instructions = 'Orbit Controls are enabled. Click to log current pose predictions.'


//// ----- CORE ----- ////
//Runs at document load
const init = async () => {

    experience = game.assembleScene();

    controls = new OrbitControls(experience.camera, experience.renderer.domElement);

    game.assemblePortal();
    experience.scene.add(videoTextures.backgroundCube, videoTextures.portalCube);

    await populateScene();

    tracker.init();

    mount();

    setupColorTracker(video, 1);
    setupColorTracker(video2, 2);

    experience.renderer.render(experience.scene, experience.camera);
    controls.update();

    animate();

    devMessages();
};

//returns color tracker
const setupColorTracker = (videoSource, index) => {

    const myColors = ['magenta', 'yellow', 'cyan'];
    const myColorTracker = tracker.getColorTracker(myColors);

    //mount color events
    myColorTracker.on('track', function (event) {

        let detectedColors = event.data;

        // if (detectedColors.length === 0) return

        detectedColors.forEach((detection) => {

            colorEvent(detection, index);


        })
    });

    tracking.track(videoSource, myColorTracker)



}

//Runs every frame
const animate = () => {
    requestAnimationFrame(animate)

    controls.update();

    let sharkCount = 0;

    experience.scene.children.filter((item) => item.type === "Group").forEach((object, index) => {
        let name = generate[index].name;
        if (name == 'turtle') {
            object.position.x += .01;
            object.position.z += .06;
            if (object.position.z > 10) {
                object.position.x = -6;
                object.position.z = -9;
            }
        }
        else if (name == 'maoriWrasse' && generate[index].speed > 0) {
            if (generate[index].id == 1) {
                object.position.x -= .02;
                object.position.z -= .05;
                if (object.position.z < -10) {
                    object.position.x = 9;
                    object.position.z = 9;
                }
            } else {
                object.position.x -= .05;
                object.position.z += .05;
                if (object.position.x < -10) {
                    object.position.x = 7;
                    object.position.z = -8;
                }
            }
        }
        else if (name == 'whale') {
            object.position.x += .04;
            if (object.position.x > 25) object.position.x = -25;
        }
        else if (name == 'blueTang') {
            object.position.x -= .12;
            if (object.position.x < -20) object.position.x = 20;
        }
        else if (name == 'angelfish' && generate[index].speed > 0) {
            object.position.x += .03;
            object.position.z -= .03;
            if (object.position.x > 10) {
                object.position.x = -7;
                object.position.z = 8;
            }
        }
        /*
        if (index == 1 || index == 2) {

            // object.position.x = -(utils.lerp(object.position.x, participant1.x, 0.01));
            // object.position.y = -(utils.lerp(object.position.y, participant1.y, 0.01));
            // object.position.z = -(utils.lerp(object.position.z, participant1.z, 0.01));
            //object.position.x = utils.lerp(object.position.x, -participant1.x, 0.01);
            // object.position.y = utils.lerp(object.position.y, -participant1.y, 0.01);
            //object.position.y = -4;
            //object.position.z = utils.lerp(object.position.z, -participant1.y, 0.01);

            //object.lookAt(0, 0, 0);
            //object.position.z = utils.lerp(object.position.z, 0, 0.01);
            //object.position.x = (utils.lerp(object.position.x, 0, 0.01));
            //object.rotation.x += (90 * Math.PI) / 180;
            //object.position.x += .06;
            //object.lookAt(participant1.x, participant1.z, participant1.y)
        }
        else {

            // object.position.x = -(utils.lerp(object.position.x, participant2.x, 0.01));
            // object.position.y = -(utils.lerp(object.position.y, participant2.y, 0.01));
            // object.position.z = -(utils.lerp(object.position.z, participant2.z, 0.01));
            //object.position.x = utils.lerp(object.position.x, -participant2.x, 0.01);
            // object.position.y = utils.lerp(object.position.y, -participant2.y, 0.01);
            //object.position.y = -6;
            //object.position.z = utils.lerp(object.position.z, -participant2.y, 0.01);
            //object.lookAt(0, 0, 0);
            //object.position.z = utils.lerp(object.position.z, 0, 0.01);
            //object.position.x = -(utils.lerp(object.position.x, 0, 0.01));
            //object.rotation.x += (90 * Math.PI) / 180;
            //object.lookAt(participant2.x, participant2.z, participant2.y)
        }
        // if (object.position.x > 12) object.position.x = -12;

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

        */



    })
    experience.renderer.render(experience.scene, experience.camera);


}

//// ----- SIDE EFFECTS ----- ////
//Logs information to the console

const colorEvent = (detection, cameraIndex) => {

    //console.log(detection)
    let color = detection.color;
    let colorY = utils.scale(detection.y, 0, 480, -20, 20);
    let colorX;
    let colorZ;
    //let colorWidth = detection.width;
    //let colorHeight = detection.height;

    if (cameraIndex === 0) {
        colorX = utils.scale(detection.x, 0, 640, -20, 20);
    }

    if (cameraIndex === 1) {
        colorZ = utils.scale(detection.x, 0, 640, -20, 20);
    }

    //raising color to about the top 1/4 of the screen (Scaled to the range -20,20)
    if (colorY < 0) {
        //console.log(`${color} raised`);

        if (color === 'magenta') {
            //when magenta is raised...
            if (colorY < prevMag - 2){
                console.log("magenta raised");
            }
        }
        if (color === 'cyan') {
            //when cyan is raised...
            if (colorY < prevCy - 2){
                //console.log("cyan raised");
            }
        }
        if (color === 'yellow') {
            //when yellow is raised
            if (colorY < prevYel - 2){
                //console.log("yellow raised");
            }
        }

    }

    //constant color detection events
    if (color === "magenta") {
        //when magenta is detected...
        prevMag = colorY;
    }

    if (color === "cyan") {
        //when cyan is detected...
        prevCy = colorY;
    }

    if (color === "yellow") {
        //when yellow is detected...
        prevYel = colorY;
    }

}

const devMessages = () => {
    console.log('Instructions: ', instructions)
    console.log('Backend: ', tracker.logBackend());
    console.log('Experience:', experience)
    console.log('Entity Sample:', aJellyFish)
    console.log('Cameras:', [webcam, webcam2])
}
//all initial changes to the web document, event listners, DOM elements, etc...
const mount = () => {

    //add renderer to canvas
    document.querySelector('body').appendChild(experience.renderer.domElement);

    //set default visibility
    cams.style.zIndex = videoVisibility ? '1' : "-99"

    //Set up event functions for opening and closing portal, currently based on pressing spacebar
    
    

    navigator.mediaDevices.enumerateDevices()
        .then(devices => {
            const filtered = devices.filter(device => device.kind === 'videoinput');
            console.log("Video Devices:", filtered)

            navigator.mediaDevices.getUserMedia({
                'video': {
                    'deviceId': filtered[camera1Index].deviceId,

                }
            })
                .then(function (stream) {
                    webcam.srcObject = stream;
                    webcam.addEventListener('loadeddata', () => {
                        //when camera is ready...


                    })
                })

            navigator.mediaDevices.getUserMedia({
                'video': {
                    'deviceId': filtered[camera2Index].deviceId,

                }
            })
                .then(function (stream) {
                    webcam2.srcObject = stream;
                    webcam2.addEventListener('loadeddata', () => {
                        //when camera is ready...



                    })
                })

        });


        //responsive scaling event listener
         window.addEventListener('resize', () => {
            experience.renderer.setSize(window.innerWidth, window.innerHeight);
            experience.camera.aspect = window.innerWidth / window.innerHeight;
            experience.camera.updateProjectionMatrix();
        })

        window.addEventListener("keyup", game.closePortal);
        
        window.addEventListener("keypress", (e)=>{
            e.preventDefault();
            //console.log(e.key)
            if(e.key === 'v') {
                 videoVisibility ? videoVisibility = false : videoVisibility = true;
                // console.log(videoVisibility)
                 cams.style.zIndex = videoVisibility ? '1' : "-99"
            }

            if(e.key = 'c'){
                game.resetCamera();
            }
            if (e.key == " ") game.openPortal(e);
        });

        experience.scene.add(mouseCube) // debugging the scaling 
        window.addEventListener('click',(e)=>{
            canvasX = utils.scale(e.clientX,0,window.innerWidth,-20,20);
            canvasY = utils.scale(e.clientY,0,window.innerHeight,-20,20);
            
            mouseCube.position.x = canvasX;
            mouseCube.position.z = -canvasY;
            
        })
            
       

}

//Puts entities in the scene
const populateScene = async () => {

    // all the portal stuff


    generate = await game.generateCharacters(); //this used to get array of gltfs which were then used to get meshes and animations,
    //now it returns array of Fish objects with all that completed.

    generate.forEach(object => {
        let objectMesh = object.meshObject;

        experience.scene.add(objectMesh);
    });

    let getGroups = await game.getGroups(generate);

    let light = new THREE.PointLight('white', 1, 500);
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(4, 0, 12);
    experience.scene.add(light, dirLight);

    await animateModels(generate);


}

//Calls function to get animation, set up mixers and clips, basically get ready to call update for 'wiggling' animations
const animateModels = async (models) => {
    let animations = await game.getAnimations(models, mixers);

    animations.forEach(object => {
        object.play();
    });

    runAnimation();
}

const runAnimation = () => {
    const dt = clock.getDelta();
    for (let i = 0; i < generate.length; i++) {
        generate[i].mixer.update(dt);

        let name = generate[i].name;
        let time = generate[i].mixer._actions[0].time;

        switch (name) {
            case "maoriWrasse":
                if (time > 1) generate[i].mixer._actions[0].time = 0;
                break;
            case "angelfish":
                if (time > 1) generate[i].mixer._actions[0].time = 0;
                break;
            case "blueTang":
                if (time < 1 || time > 3.4) generate[i].mixer._actions[0].time = 1;
                break;
            case "whale":
                break;
            case "turtle":
                if (time < 1 || time > 6.25) generate[i].mixer._actions[0].time = 1;
                break;
        }
    }
    experience.renderer.render(experience.scene, experience.camera);
    controls.update();
    requestAnimationFrame(runAnimation);
}

export default { init, gameObjects, masterAnimations, pause }