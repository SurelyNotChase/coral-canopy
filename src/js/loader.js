import main from "./main.js";
import { GLTFLoader } from '../imports/GLTFLoader.js';
import utils from "./utils.js";



 //The bundler will create this directory in the /dist folder for the browser to read. 
                                    //If you want to add or change files in assets, go to ../staticFiles/assets

let clownfish1, clownfish2, clownfish3, angelfish, shark, maoriWrasse, tang;

window.onload = () => {

    console.log(1);
    main.init();

}


function loadPortalVideos() {
    main.portalVideos.push(document.getElementById('blankPortal'));
    main.portalVideos.push(document.getElementById('openingPortal'));
    main.portalVideos.push(document.getElementById('spinningPortal'));
    main.portalVideos.push(document.getElementById('closingPortal'));

}