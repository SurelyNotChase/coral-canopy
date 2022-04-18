import * as THREE from 'three';
import game from './game.js';
import loader from './loader.js';
import utils from './utils.js';
import tracker from './tracker.js';
import main from './main.js';

function calculateCollisionPoints(array, mesh, type = 'collision') {
    // Compute the bounding box after scale, translation, etc.
    /*var bbox = new THREE.Box3().setFromObject(mesh);//clownfish2.children[0].children[0].geometry.boundingBox;

    var bounds = {
        type: type,
        //name: mesh.name,
        xMin: bbox.min.x,
        xMax: bbox.max.x,
        yMin: bbox.min.y,
        yMax: bbox.max.y,
        zMin: bbox.min.z,
        zMax: bbox.max.z,
    };

    collisions.push(bounds);*/
    console.log(array);
}

function detectCollisions(collisions, food) {
    // Get the user's current collision area.
    var bbox = new THREE.Box3().setFromObject(food);//clownfish2.children[0].children[0].geometry.boundingBox;

    // Run through each object and detect if there is a collision.
    for (var index = 0; index < collisions.length; index++) {

        var bounds = {
            xMin: bbox.xMin,
            xMax: bbox.xMax,
            yMin: bbox.yMin,
            yMax: bbox.yMax,
            zMin: bbox.zMin,
            zMax: bbox.zMax,
        };/*

        collisions[0].bbox.xMin = boundingBox.xMin;
        collisions[0].bbox.xMax = boundingBox.xMax;
        collisions[0].bbox.yMin = boundingBox.yMin;
        collisions[0].bbox.yMax = boundingBox.yMax;
        collisions[0].zMin = boundingBox.zMin;
        collisions[0].zMax = boundingBox.zMax;

        collisions[1].xMin = boundingBox3.xMin;
        collisions[1].xMax = boundingBox3.xMax;
        collisions[1].yMin = boundingBox3.yMin;
        collisions[1].yMax = boundingBox3.yMax;
        collisions[1].zMin = boundingBox3.zMin;
        collisions[1].zMax = boundingBox3.zMax;

        collisions[2].xMin = boundingBox4.xMin;
        collisions[2].xMax = boundingBox4.xMax;
        collisions[2].yMin = boundingBox4.yMin;
        collisions[2].yMax = boundingBox4.yMax;
        collisions[2].zMin = boundingBox4.zMin;
        collisions[2].zMax = boundingBox4.zMax;

        collisions[3].xMin = boundingBox5.xMin;
        collisions[3].xMax = boundingBox5.xMax;
        collisions[3].yMin = boundingBox5.yMin;
        collisions[3].yMax = boundingBox5.yMax;
        collisions[3].zMin = boundingBox5.zMin;
        collisions[3].zMax = boundingBox5.zMax;

        collisions[4].xMin = boundingBox6.xMin;
        collisions[4].xMax = boundingBox6.xMax;
        collisions[4].yMin = boundingBox6.yMin;
        collisions[4].yMax = boundingBox6.yMax;
        collisions[4].zMin = boundingBox6.zMin;
        collisions[4].zMax = boundingBox6.zMax;

        collisions[5].xMin = boundingBox7.xMin;
        collisions[5].xMax = boundingBox7.xMax;
        collisions[5].yMin = boundingBox7.yMin;
        collisions[5].yMax = boundingBox7.yMax;
        collisions[5].zMin = boundingBox7.zMin;
        collisions[5].zMax = boundingBox7.zMax;
        */

        //console.log("moving: " + bounds.xMin + ", " + bounds.xMax);
        //console.log("static: " + collisions[index].xMin + ", " + collisions[index].xMax);
        if (1 == 1) {
            if ((bounds.xMin <= collisions[index].boundingBox.max.x && bounds.xMax >= collisions[index].boundingBox.min.x) &&
                (bounds.yMin <= collisions[index].boundingBox.max.y && bounds.yMax >= collisions[index].boundingBox.min.y) &&
                (bounds.zMin <= collisions[index].boundingBox.max.z && bounds.zMax >= collisions[index].boundingBox.min.z)) {
                // We hit a solid object! Stop all movements.
                //bCollisions[index] = true;
                //if (index == 0) console.log("hit");
                // Move the object in the clear. Detect the best direction to move.
                /*
                if (bounds.xMin <= collisions[index].xMax && bounds.xMax >= collisions[index].xMin) {
                    // Determine center then push out accordingly.
                    var objectCenterX = ((collisions[index].xMax - collisions[index].xMin) / 2) + collisions[index].xMin;
                    var playerCenterX = ((bounds.xMax - bounds.xMin) / 2) + bounds.xMin;
                    var objectCenterZ = ((collisions[index].zMax - collisions[index].zMin) / 2) + collisions[index].zMin;
                    var playerCenterZ = ((bounds.zMax - bounds.zMin) / 2) + bounds.zMin;

                    //let movement = Math.random()/10;
                    //while(movement < .03) movement = Math.random()/10;

                    // Determine the X axis push.
*/
                    //if (objectCenterX > playerCenterX) {
                        /*
                        clownfish1.position.x += (lerp(0, clownfish1.position.x + .15, 0.01));
                        boundingBox.xMin += (lerp(0, boundingBox.xMin + .15, 0.01));
                        boundingBox.xMax += (lerp(0, boundingBox.xMax + .15, 0.01));
                        clownfish3.position.x += (lerp(0, clownfish3.position.x - .15, 0.01));
                        boundingBox3.xMin += (lerp(0, boundingBox3.xMin - .15, 0.01));
                        boundingBox3.xMax += (lerp(0, boundingBox3.xMax - .15, 0.01));
                        /*
                        clownfish1.position.x += .06;
                        boundingBox.xMax += .06;
                        boundingBox.xMin += .06;
                        clownfish3.position.x -= .06;
                        boundingBox3.xMax -= .06;
                        boundingBox3.xMin -= .06;
                        */
                    //} else {
                        /*
                        clownfish1.position.x += (lerp(0, clownfish1.position.x + .15, 0.01));
                        boundingBox.xMin += (lerp(0, boundingBox.xMin + .15, 0.01));
                        boundingBox.xMax += (lerp(0, boundingBox.xMax + .15, 0.01));
                        clownfish3.position.x += (lerp(0, clownfish3.position.x - .15, 0.01));
                        boundingBox3.xMin += (lerp(0, boundingBox3.xMin - .15, 0.01));
                        boundingBox3.xMax += (lerp(0, boundingBox3.xMax - .15, 0.01));
                        /*
                        clownfish1.position.x -= .06;
                        boundingBox.xMax -= .06;
                        boundingBox.xMin -= .06;
                        clownfish3.position.x += .06;
                        boundingBox3.xMax += .06;
                        boundingBox3.xMin += .06;
                        */
                    //}
                //}
                /*
                if (bounds.zMin <= collisions[index].zMax && bounds.zMax >= collisions[index].zMin) {
                    // Determine the Z axis push.
                    if (objectCenterZ > playerCenterZ) {
                        clownfish1.position.z -= 0;
                    } else {
                        clownfish1.position.z += 0;
                    }
                }
*/
            }
            //else bCollisions[index] = false;
        }
    }
}

export default {calculateCollisionPoints, detectCollisions}