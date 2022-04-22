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
let generate = [];

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

let colorY
let colorX;
let colorZ;

// let bubble

let activeDetection = false; //bool for when a color is being detected
let eating = false;
let eatingModel;

let trackedColor = "cyan";

//// ----- IMMUTABLES ----- ////
const video = document.querySelector('#webcam');
const video2 = document.querySelector('#webcam2');
const instructions = 'Orbit Controls are enabled. Click to log current pose predictions.'
const option = 'variantB'

// TEST
let rotX, rotY, rotZ;


//// ----- CORE ----- ////  
//Runs at document load
const init = async () => {

    experience = game.assembleScene();

    controls = new OrbitControls(experience.camera, experience.renderer.domElement);

    let textures = await game.assemblePortal();
    console.log(textures);
    experience.scene.add(textures[0], textures[1]);

    let coralRing = await utils.loadModelAsync('CoralExport_Final.gltf');
    //console.log(coralRing);
    coralRing.scene.name = "coralRing";
    coralRing.scene.scale.x = .06;
    coralRing.scene.scale.y = .06;
    coralRing.scene.scale.z = .06;
    coralRing.scene.rotation.y = (180 * Math.PI) / 180;
    coralRing.scene.position.y = -22;

    // bubble = await utils.loadModelAsync("Bubbles_Bubbling.gltf");

    // bubble.scene.name = "bubble"; //added bubbles name
    // bubble.scene.scale.x = .05;
    // bubble.scene.scale.y = .05;
    // bubble.scene.scale.z = .05;

    await populateScene();

    // experience.scene.add(coralRing.scene, bubble.scene);
    experience.scene.add(coralRing.scene);
    // console.log(bubble);

    tracker.init();

    mount();

    setupColorTracker(video, 0);
    setupColorTracker(video2, 1);

    let test = experience.scene.children.filter((item) => item.type === "Group");

    experience.renderer.render(experience.scene, experience.camera);
    controls.update();

    animate();

    devMessages();
};

//returns color tracker
const setupColorTracker = (videoSource, index) => {

    const myColors = [trackedColor];
    const myColorTracker = tracker.getColorTracker(myColors);

    //mount color events
    myColorTracker.on('track', function (event) {

        let detectedColors = event.data;

        if (detectedColors.length === 0) activeDetection = false; //need this for activeDetection to work -kenny

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


    experience.scene.children.filter((item) => item.type === "Group" && item.name !== "coralRing").forEach((object, index) => {
        //generate.forEach((object) => {
        //console.log(object.name);
        object.name = generate[index].name;
        let name = object.name;
        //console.log(name);

        if (name == 'turtle') {
            object.position.x += .01;
            object.position.z += .06;
            if (object.position.z > 10) {
                object.position.x = -6;
                object.position.z = -9;
            }
        }
        else if (name == 'maoriWrasse' && generate[index].speed > 0) {
            if (!activeDetection) {
                if (generate[index].id == 1) {
                    object.position.x -= .02;
                    object.position.z -= .05;
                    // console.log(object.rotation.x, object.rotation.y, object.rotation.z)
                    object.rotation.x = utils.lerp(object.rotation.x, 0, 0.1);
                    object.rotation.y = utils.lerp(object.rotation.y, (25 * Math.PI) / 180, 0.1);
                    object.rotation.z = utils.lerp(object.rotation.z, 0, 0.1);

                    if (object.position.z < -10) {
                        object.position.x = 9;
                        object.position.z = 9;
                    }
                } else {
                    object.position.x -= .05;
                    object.position.z += .05;

                    object.rotation.x = utils.lerp(object.rotation.x, 0, 0.1);
                    object.rotation.y = utils.lerp(object.rotation.y, (145 * Math.PI) / 180, 0.1);
                    object.rotation.z = utils.lerp(object.rotation.z, 0, 0.1);

                    if (object.position.x < -10) {
                        object.position.x = 7;
                        object.position.z = -8;
                    }
                }
            }
            else {
                // rotX = object.rotation.x;
                // rotZ = object.rotation.z;
                // rotX = utils.lerp(rotX, colorX, 0.1);
                // // rotY = utils.lerp(object.rotation.y, colorY, 0.1);
                // rotZ = utils.lerp(rotZ, colorZ, 0.1);
                // object.lookAt(rotX, Math.abs(rotZ), 0);

                object.lookAt(colorX, Math.abs(colorZ), colorZ);
                // console.log(object.position.x, object.position.z)
            }
            // console.log(activeDetection)
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
        else if (name == 'clownfish' && generate[index].speed > 0) {
            if (!activeDetection) {
                // if (generate[index].id == 1) {
                //     object.position.x -= .02;
                //     object.position.z -= .05;
                //     // console.log(object.rotation.x, object.rotation.y, object.rotation.z)
                //     object.rotation.x = utils.lerp(object.rotation.x, 0, 0.1);
                //     // object.rotation.y = utils.lerp(object.rotation.y, -(145 * Math.PI) / 180, 0.1);
                //     object.rotation.y = utils.lerp(object.rotation.y, -(25 * Math.PI) / 180, 0.1);
                //     object.rotation.z = utils.lerp(object.rotation.z, 0, 0.1);

                //     if (object.position.z < -10) {
                //         object.position.x = 9;
                //         object.position.z = 9;
                //     }
                // } else {
                    object.position.x -= .05;
                    object.position.z += .05;

                    object.rotation.x = utils.lerp(object.rotation.x, 0, 0.1);
                    object.rotation.y = utils.lerp(object.rotation.y, -(145 * Math.PI) / 180, 0.1);
                    object.rotation.z = utils.lerp(object.rotation.z, 0, 0.1);

                    if (object.position.x < -10) {
                        object.position.x = 7;
                        object.position.z = -8;
                    }
                // }
            }
            else {
                // rotX = object.rotation.x;
                // rotZ = object.rotation.z;
                // rotX = utils.lerp(rotX, colorX, 0.1);
                // // rotY = utils.lerp(object.rotation.y, colorY, 0.1);
                // rotZ = utils.lerp(rotZ, colorZ, 0.1);
                // object.lookAt(rotX, Math.abs(rotZ), 0);

                object.lookAt(colorX, Math.abs(colorZ), colorZ);
                // console.log(object.position.x, object.position.z)
            }
            // console.log(activeDetection)
        }

        if (activeDetection && !eating) {
            let rng = Math.floor(utils.random(1, 5));
            if (name == 'moorishEating' && rng == 1) {
                generate[index].mixer._actions[0].time = 0;
                object.position.x = 3.75;
                object.position.y = -6;
                object.position.z = .5;
                eating = true;
                eatingModel = object;
                generate[index].mixer._actions[0].paused = false;
                const myTimeout = setTimeout(resetEating, 11700);
            } else if (name == 'sharkEating' && rng == 2) {
                //console.log(object);
                generate[index].mixer._actions[0].time = 0;
                object.position.x = 2;
                object.position.y = -12;
                eating = true;
                eatingModel = object;
                generate[index].mixer._actions[0].paused = false;
                const myTimeout = setTimeout(resetEating, 8000);
            } else if (name == 'turtleEating' && rng == 3) {
                generate[index].mixer._actions[0].time = 0;
                object.position.x = 2.5;
                object.position.z = 0;
                object.position.y = -20;
                eating = true;
                eatingModel = object;
                generate[index].mixer._actions[0].paused = false;
                const myTimeout = setTimeout(resetEating, 8000);
            } else if (name == 'octopusEating' && rng == 4) {
                generate[index].mixer._actions[0].time = 0;
                object.position.x = -8;
                object.position.z = 2;
                object.position.y = -5;
                eating = true;
                eatingModel = object;
                generate[index].mixer._actions[0].paused = false;
                const myTimeout = setTimeout(resetEating, 11000);
            }
        }
        else if (name == 'bubble') {
            if (!activeDetection) {
                object.position.y = utils.lerp(object.position.y, 11, 0.05);
                if (object.position.y > 10) {
                    object.position.x = 0;
                    object.position.z = 0;
                }
            }
            else {
                object.position.x = utils.lerp(object.position.x, -colorX, 0.1);
                object.position.y = -9; //default y for bubbles
                object.position.z = utils.lerp(object.position.z, -colorZ, 0.1);
            }
            // console.log(object.position.x, object.position.y, object.position.z)
        }

    });

    experience.renderer.render(experience.scene, experience.camera);


}

const resetEating = () => {
    eatingModel.position.y = 20;
    setTimeout(() => { eating = false; }, 5000);
}

//// ----- SIDE EFFECTS ----- ////
//Logs information to the console

const colorEvent = (detection, cameraIndex) => {

    // activeDetection = true;
    let color = detection.color;
    colorY = utils.scale(detection.y, 0, 480, -10, 10);


    if (cameraIndex === 0) {
        colorX = utils.scale(detection.x, 0, 640, -10, 10);
    }

    if (cameraIndex === 1) {
        colorZ = utils.scale(detection.x, 0, 640, -10, 10);
    }

    //when trackedColor is active, change activeDetection bool to true
    if (color === trackedColor) {
        activeDetection = true;
        // console.log(trackedColor);
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


    window.addEventListener('click', (e) => {

        let mouseX = utils.scale(e.clientX, 0, window.innerWidth, -20, 20);
        let mouseY = utils.scale(e.clientY, 0, window.innerHeight, -20, 20); //scaled

        console.log(mouseX, mouseY)
        mouseCube.position.x = mouseX;
        mouseCube.position.y = mouseY;

    })

    window.addEventListener("keypress", (e) => {
        e.preventDefault();
        //console.log(e.key)
        if (e.key === 'v') {
            videoVisibility ? videoVisibility = false : videoVisibility = true;
            cams.style.zIndex = videoVisibility ? '1' : "-99"
        }

        if (e.key === 'c') {
            game.resetCamera();
        }
        if (e.key === " ") game.openPortal(e);
        if (e.key === 'e') {
            activeDetection = true;
            console.log(activeDetection)
        };
        if (e.key === 'r') {
            activeDetection = false;
            console.log(activeDetection)
        };

    });


}

//Puts entities in the scene
const populateScene = async () => {

    // all the portal stuff

    generate = await game.generateCharacters(option); //this used to get array of gltfs which were then used to get meshes and animations,
    //now it returns array of Fish objects with all that completed.

    generate.forEach(object => {
        let objectMesh = object.meshObject;

        experience.scene.add(objectMesh);
    });

    let getGroups = await game.getGroups(generate);

    let light = new THREE.PointLight('white', 1, 1);
    const spotLight = new THREE.SpotLight(16777215, 3); //INTENSITY OF EITHER 1.5 OR 2 IS GREAT -KENNY
    spotLight.position.set(0, -9, 0);
    spotLight.angle = Math.PI / 2;
    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    experience.scene.add(light, spotLight);

    await animateModels(generate);


}

//Calls function to get animation, set up mixers and clips, basically get ready to call update for 'wiggling' animations
const animateModels = async (models) => {
    let animations = await game.getAnimations(models, mixers);
    console.log(animations);
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
            case "sharkEating":
                if (!activeDetection && !eating) generate[i].mixer._actions[0].paused = true;
                break;
            case "moorishEating":
                if (!activeDetection && !eating) generate[i].mixer._actions[0].paused = true;
                break;
            case "octopusEating":
                if (!activeDetection && !eating) generate[i].mixer._actions[0].paused = true;
                break;
            case "turtleEating":
                if (!activeDetection && !eating) generate[i].mixer._actions[0].paused = true;
                break;
        }
    }
    experience.renderer.render(experience.scene, experience.camera);
    controls.update();
    requestAnimationFrame(runAnimation);
}

export default { init, gameObjects, masterAnimations, pause }