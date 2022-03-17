
import { GLTFLoader } from "../imports/GLTFLoader";

const random = (min, max) => Math.random() * (max - min) + min;
const scale = (number, inMin, inMax, outMin, outMax) => (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
let loadedModel;

function loadModel(filename) {
    
    let aloader  = new GLTFLoader();
    aloader.crossOrigin = true;
    aloader.setPath('/assets/models/');
    aloader.load(filename, (data) => {
        
        data.scene.traverse(function (object) {
            if (object.isMesh) object.castShadow = true;
        });

        let object = data.scene;
        
        loadedModel = object;
      

        
    });

        
}


const getModel = (filename) => {


}



export default {
    random,
    scale,
    loadModel,
    getModel
}