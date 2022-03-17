import main from "./main.js";
import { GLTFLoader } from '../imports/GLTFLoader.js';

const loader = new GLTFLoader()

loader.setPath('/assets/models/');  //The bundler will create this directory in the /dist folder for the browser to read. 
                                    //If you want to add or change files in assets, go to ../staticFiles/assets

let clownfish1, clownfish2, clownfish3, angelfish, shark, maoriWrasse, tang;

window.onload = () => {
    //loadModels();
    main.init();

}

const loadModels = () => {

    //load any assets here
    loader.load('clownfish.gltf', function (gltf) {
        
        gltf.scene.traverse(function (object) {
            if (object.isMesh) object.castShadow = true;
        });
        console.log("GLTF Asset Sample Loaded:",gltf)
        clownfish1 = gltf.scene;
        //main.gameObjects.push(clownfish1);
        //main.masterAnimations.push(gltf.animations);

        
    });

}

function loadPortalVideos() {
    main.portalVideos.push(document.getElementById('blankPortal'));
    main.portalVideos.push(document.getElementById('openingPortal'));
    main.portalVideos.push(document.getElementById('spinningPortal'));
    main.portalVideos.push(document.getElementById('closingPortal'));

}