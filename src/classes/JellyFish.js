import {Fish} from './Entity.js'
import game from '../js/game.js'
const meshes = game.modelData.meshes
/***
 *** 
 ***    Example final inherited Entity class file (only one class per file)
 *** 
 ***/

class JellyFish extends Fish{
    
    constructor(){
        super();
        //set all JellyFish-unique properties here

    }
    //all JellyFish-unique methods here

}


export {JellyFish}