import game from './game.js'
import utils from './utils.js'
import tracking from './tracking.js'

let experience = {}; //scene, renderer, and camera
let video = document.querySelector('#webcam');
let predictions = [];
let gameObjects = [];
let masterAnimations = []; //array of animation arrays
let portalVideos = [];

const init = () => {

    experience = game.assembleScene()

    if (experience.scene && experience.camera && experience.renderer) console.log('scene assembled...')
    game.assemblePortal();
    populateScene();

    //debug
    console.log(experience)

    setupDOM(experience)

    tracking.init();


};

const predictVideo = () => {

    tracking.getPredictions(video)
}


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


const setupDOM = (experience) => {

    //renderer to canvas
    document.querySelector('body').appendChild(experience.renderer.domElement);

    //responsive scaling 
    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    })

    //webcam and video
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
                video.addEventListener('loadeddata', updatePrediction)
            })
    }

    //testing listener
    window.addEventListener('click', predictVideo)

}




export default { init, gameObjects, masterAnimations, portalVideos }