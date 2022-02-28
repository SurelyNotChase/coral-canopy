import game from './game.js';
import utils from './utils.js';
import tracking from './tracking.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {JellyFish} from '../classes/JellyFish';

/***
 *** 
 ***    Main script - all side-effects are managed here, move any utilities to separate files
 *** 
 ***/

let experience = {}; //scene, renderer, and camera
let controls;
let video = document.querySelector('#webcam');
let poses;
let gameObjects = [];
let masterAnimations = []; //array of animation arrays
let portalVideos = [];

let aJellyFish = new JellyFish();

const predictionDelay = 1500 //minimum time in ms between predictions (alter for benchmarking)
const instructions = 'Orbit Controls are enabled. Click to log current pose predictions.'


//Runs at document load
const init = () => {

    experience = game.assembleScene()

    controls = new OrbitControls( experience.camera, experience.renderer.domElement );
    experience.camera.position.set( 0, 20, 100 );
    
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
    controls.update();
    experience.renderer.render(experience.scene,experience.camera);

}

//Recursive Promise loop, runs as fast as the data is loaded, with a minimum set delay
const  predictVideo = () => {
    const prediction = tracking.getPredictions(video)

    prediction.then((result)=>{
        poses = result
        setTimeout(predictVideo, predictionDelay);
        
    })
    prediction.catch((err)=>{console.log(err)})
}

//Init ...
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
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
                video.addEventListener('loadeddata', predictVideo)
            })
    }

    //testing listener
    window.addEventListener('click', ()=>{console.log(poses)})

}
const devMessages = () => {
    console.log('Instructions: ',instructions)
    console.log('Backend: ', tracking.logBackend());
    console.log('Experience:',experience)
    console.log('Entity Sample:',aJellyFish)
}

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