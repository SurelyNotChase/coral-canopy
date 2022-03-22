import { GLTFLoader } from "../imports/GLTFLoader";

const random = (min, max) => Math.random() * (max - min) + min;
const scale = (number, inMin, inMax, outMin, outMax) => (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
const lerp = (min, max, p) => min * (1 - p) + max * p;

const loadModelAsync = async (filename) => {
 
    const loader = new GLTFLoader()
    loader.setPath('/assets/models/');
    const loadedData = await loader.loadAsync(filename);
    console.log(5);
    return loadedData;

}


export default {
    random,
    scale,
    lerp,
    loadModelAsync    
}