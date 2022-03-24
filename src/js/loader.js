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


const loadPortalVideos = () => {
    let array = [];

    array.push(document.getElementById('blankPortal'));
    array.push(document.getElementById('openingPortal'));
    array.push(document.getElementById('spinningPortal'));
    array.push(document.getElementById('closingPortal'));

    console.log(array);
    
    return array;
}

export default { loadPortalVideos }