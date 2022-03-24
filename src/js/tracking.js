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

const getColorPredictions = (video,video2) => {
    

    let colorTrack; //{x,y}}
    
    let colors = new tracking.ColorTracker(['magenta']);

    colors.on('track', function (event) {
        if (event.data.length === 0) {
            // No colors were detected in this frame.
            //console.log("nothing found")

        } else {
            event.data.forEach(function (rect) {

                colorTrack = {x:rect.x, y:rect.y};
                
            });
        }
    });

    // tracking.track('#myVideo', colors);
    tracking.track(video, colors)

    //const segmentation2 =   net.segmentPerson(video2, { maxDetections: 1 });

    return colorTrack;


}



const logBackend = () => tf.getBackend()



export default {
    getPredictions,logBackend,init,getColorPredictions
}