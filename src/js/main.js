import game from './game.js'
import utils from './utils.js'
import tracking from './tracking.js'

let experience = {}; //scene, renderer, and camera
let video = document.querySelector('#webcam');
let prediction;

const init = () => {

    experience = game.assembleScene()

    if(experience.scene && experience.camera && experience.renderer) console.log('scene assembled...')

    populateScene();

    //debug
    console.log(experience)
    
    //Mount to DOM
    document.querySelector('body').appendChild(experience.renderer.domElement);  //mounted to DOM

    window.addEventListener('resize', () => {
        renderer.setSize(window.innerWidth, window.innerHeight);
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
    }) //resposive


    tracking.init();

    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
                video.addEventListener('loadeddata', updatePrediction)
            })
    }

    window.addEventListener('click',predictVideo)


};

const predictVideo = () => {

    tracking.getPredictions(video)
}

let num = 0;

const updatePrediction = () => {
    requestAnimationFrame(updatePrediction)

    //prediction = tracking.getPredictions(video)
    //tracking.logBackend();
    
}

const populateScene = () => {
    game.generateCharacters().forEach(object=>experience.scene.add(object))
}



// >>> 




export default {init}