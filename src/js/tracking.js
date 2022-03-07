import utils from './utils.js'
import * as tf from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix'; 
import 'regenerator-runtime/runtime'



const init = () => {
    tf.setBackend('webgl');

}


async function  getPredictions(video,video2) {
    
    const net = await bodyPix.load();
    

    const segmentation =   net.segmentPerson(video, { maxDetections: 1 });
    const segmentation2 =   net.segmentPerson(video2, { maxDetections: 1 });
   
    return {segmentation,segmentation2};


}

const logBackend = () => tf.getBackend()



export default {
    getPredictions,logBackend,init
}