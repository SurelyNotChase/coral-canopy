import {Fish} from './Entity.js'
import game from '../js/game.js'
const meshes = game.modelData.meshes
/***
 *** 
 ***    Example final inherited Entity class file (only one class per file)
 *** 
 ***/

class ClownFish extends Fish{
    
    constructor(){
        super();
        //set all ClownFish-unique properties here
        this.mesh = meshes.clownfish();
        this.type = "ClownFish"
        
        

    }
    //all ClownFish-unique methods here

}

export {ClownFish}