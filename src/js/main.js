import game from './game.js'
import utils from './utils.js'
import tracking from './tracking.js'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


let experience = {}; //scene, renderer, camera
let video = document.querySelector('#webcam');
let poses;
let controls;

const mount = () => {
    //renderer
    document.querySelector('body').appendChild(experience.renderer.domElement);  //mounted to DOM

    //webcam
    if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(function (stream) {
                video.srcObject = stream;
            })
    }

    //EVENT LISTENERS

    //resize
    window.addEventListener('resize', () => {
        experience.renderer.setSize(window.innerWidth, window.innerHeight);
        experience.camera.aspect = window.innerWidth / window.innerHeight;
        experience.camera.updateProjectionMatrix();
    }) 

    //loadeddata
    video.addEventListener('loadeddata', predictVideo)


    //click
    window.addEventListener('click',()=>{console.log(poses)})



}

const init = () => {

    experience = game.assembleScene()
    console.log('scene assembled...',experience)
    
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

    prediction.catch((err)=>{console.log(err)})

}

const animate = () => {
    requestAnimationFrame(animate)
    controls.update();
    experience.renderer.render(experience.scene,experience.camera);

} 

const populateScene = () => {
    game.generateCharacters().forEach(object=>experience.scene.add(object))
}



export default {init}