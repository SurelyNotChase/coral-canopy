import game from './game.js';
import utils from './utils.js';
import tracking from './tracking.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import {JellyFish} from '../classes/JellyFish';

let experience = {}; //scene, renderer, and camera
let controls;
let video = document.querySelector('#webcam');
let poses;
let gameObjects = [];
let masterAnimations = []; //array of animation arrays
let portalVideos = [];


const init = () => {

    experience = game.assembleScene()
    console.log('scene assembled...',experience)
    game.assemblePortal();
    populateScene();

    tracking.init();

    mount();

    controls = new OrbitControls( experience.camera, experience.renderer.domElement );
    experience.camera.position.set( 0, 20, 100 );

    experience.renderer.render(experience.scene,experience.camera);

    controls.update();

    //predictVideo();
    animate();
    
};

const  predictVideo = () => {
    const prediction = tracking.getPredictions(video)

    prediction.then((result)=>{
        poses = result
        setTimeout(predictVideo, 1500);
        
    })

const updatePrediction = () => {

    setInterval(() => {
        predictions = tracking.getPredictions(video)
        console.log(predictions)
    }, 200)


}

const animationLoop = () => {
    requestAnimationFrame(animationLoop)


}

const populateScene = () => {
    /*
    //We can just throw assets into array as they're being loaded, then populate here
    game.generateCharacters().forEach(object=>{ 

        gameObjects.push(object) 
        gameObjects.forEach(object=>{experience.scene.add(object)})

    })
    */
    gameObjects.forEach(object => {
        experience.scene.add(object);
    });
}

    prediction.catch((err)=>{console.log(err)})

}

const animate = () => {
    requestAnimationFrame(animate)
    controls.update();
    experience.renderer.render(experience.scene,experience.camera);

} 
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

const populateScene = () => {
    game.generateCharacters().forEach(object=>experience.scene.add(object))
    let aJellyFish = new JellyFish();
    console.log(aJellyFish)
    aJellyFish.loadMesh();
}



export default { init, gameObjects, masterAnimations, portalVideos }