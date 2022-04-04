import game from '../js/game.js'; //might need later, depends on where functions get moved to.
import utils from '../js/utils.js';
import { GLTFLoader } from "../imports/GLTFLoader";
import * as THREE from 'three';

class Fish {
    constructor(name, id, filename) {
        this.name = name;
        this.id = id;
        this.filename = filename;
        this.modelObject = {};
        this.meshObject = {};

        this.position = {
            xPos: 0,
            yPos: 0,
            zPos: 0
        };
        this.rotation = {
            xRot: 0,
            yRot: 0,
            zRot: 0
        };
        this.speed = 0;     //best between 0.03 and 0.1
        this.mixer;
        this.animationClip;
        this.boundingBox = {};
        this.bbox = {};
        this.bboxOriginal = {};
        this.loadModelObject;

        /*

        this.modelObject = utils.loadModelAsync('cfish.gltf').then(() => {
            this.meshObject = this.modelObject.scene;




        });
           
      
        

        
        */
    }

    loadModelAsync = async (filename) => {
        console.log("hi");
        const loader = new GLTFLoader()
        loader.setPath('../../staticFiles/assets/models/');
        const loadedData = await loader.loadAsync(filename);

        return loadedData;

    }

    getModel() {
        const func = async () => {
            const loader = new GLTFLoader();
            loader.setPath('../../staticFiles/assets/models/');
            const loadedData = await loader.loadAsync(this.filename);

            return loadedData;
        }
        //const p = new Promise.loadModelAsync(this.filename)
        this.loadModelObject = utils.loadModelAsync(this.filename);
        this.loadModelObject.then(value => { this.modelObject = value;
        this.meshObject = value.scene;})
    }

    getMesh() {
        //this.meshObject = this.modelObject.scene;
    }

    getAnimationClipData() {
        //Condensed all the clips, mixers, etc into just two components, only ever need to use animationClip
        this.mixer = new THREE.AnimationMixer(this.modelObject.scene);
        let animations = this.modelObject.animations;
        this.animationClip = this.mixer.clipAction(animations[0]);
    }

    getBoundingBox() {
        //actual box from mesh object, then store coords in another object to manipulate
        this.boundingBox = new THREE.Box3().setFromObject(this.modelObject.scene);

        this.bbox = {
            xMin: this.boundingBox.min.x,
            xMax: this.boundingBox.max.x,
            yMin: this.boundingBox.min.y,
            yMax: this.boundingBox.max.y,
            zMin: this.boundingBox.min.z,
            zMax: this.boundingBox.max.z
        };

        //This is only needed if the fish is on a looped track, THEY SHOULD NEVER BE ALTERED
        this.bboxOriginal = {
            xMin: this.boundingBox.min.x,
            xMax: this.boundingBox.max.x,
            yMin: this.boundingBox.min.y,
            yMax: this.boundingBox.max.y,
            zMin: this.boundingBox.min.z,
            zMax: this.boundingBox.max.z
        };
    }
}

export { Fish }