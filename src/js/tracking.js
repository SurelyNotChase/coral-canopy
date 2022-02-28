import utils from './utils.js'
import * as tf from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix'; 
import 'regenerator-runtime/runtime'



const init = () => {
    tf.setBackend('webgl');

}


async function  getPredictions(video) {
    
    const net = await bodyPix.load();

    const segmentation =   net.segmentPerson(video, { maxDetections: 1 });

    return segmentation;


}

const logBackend = () => tf.getBackend()



export default {
    getPredictions,logBackend,init
}