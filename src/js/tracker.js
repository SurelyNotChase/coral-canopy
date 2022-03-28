import utils from './utils.js'
import * as tf from '@tensorflow/tfjs';
import * as bodyPix from '@tensorflow-models/body-pix'; 
import * as cocoSsd from '@tensorflow-models/coco-ssd'; 
import 'regenerator-runtime/runtime'




const init = () => {
    tf.setBackend('webgl');

}


async function  getPredictions(video,video2) {
    
    // const net = await cocoSsd.load();
    

    // const segmentation =   net.segmentPerson(video, { maxDetections: 1 });
    // const segmentation2 =   net.segmentPerson(video2, { maxDetections: 1 });
   
    // return {segmentation,segmentation2};


     // Load the model.
  const model = await cocoSsd.load();

  // Classify the image.
  const predictions = await model.detect(video);

   
    return {predictions,predictions};


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

//returns color tracking object 
const getColorTracker = (colors = ['magenta','yellow','cyan']) => {

    const colorTracker = new tracking.ColorTracker(colors);

    colorTracker.on('track', function (event) {
        if (event.data.length === 0) {
            console.log('nothing')

        } else {
            console.log(event.data)
            event.data.forEach(function (rect) {
                console.log(rect)
                

            });
        }
    });

    return colorTracker;
}



const logBackend = () => tf.getBackend()



export default {
    getPredictions,logBackend,init,getColorPredictions,getColorTracker
}