import game from '../js/game.js'
const meshes = game.modelData.meshes
//all meshes, geometries, and materials are loaded from the game.js modelData object

/***
 *** 
 ***    Class library for first-level of inheritance of game entities, final inherited classes will be found in subsequent files
 *** 
 ***/

//parent schema for all game objects that are represented in Three.js meshes 
class Entity {
    constructor(){
        //load the models from game.js like thi:
        this.mesh =  meshes.greenBox();
        this.type = "Entity"

        //other props
    }

    //innate methods to all scene creatures
    loadMesh = () => { }

}

//inherited schema for all aquatic interactive/moving creatures (feel free to change the name from "Fish")
class Fish extends Entity{
    constructor(){
        super();
        this.type = "Fish"
    }
    //methods unique to 'Fish', but not specific to any individual creature go here..
}

//inherited schema for all non-animated environmental game objects
class StaticEnvironment extends Entity{
    constructor(){
        super();
        this.type = "StaticEnvironment"
    }  
}

//inherited schema for all non-animated environmental game objects
class AnimatedEnvironment extends Entity{
    constructor(){
        super();
        this.type = "AnimatedEnvironment"
    }  
}


export {
    Fish,StaticEnvironment,AnimatedEnvironment

}