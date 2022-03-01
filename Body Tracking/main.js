const video = document.querySelector("#webcam");

const random = (max) => Math.random() * max;
const scale = (number, inMin, inMax, outMin, outMax) => (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

let poses;
let pose;
let keyPoints;
let leftShoulder;
let rightShoulder;
let leftShoulderX;
let leftShoulderY;
let rightShoulderX;
let rightShoulderY;

let w = video.width;
let h = video.height;
let x = 0;
let y = 0;

// THREE
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000) //FOV, aspect ratio, near plane, far plane
camera.position.z = 5;


const renderer = new THREE.WebGLRenderer({ antialias: true });

renderer.setClearColor('lightgrey'); //background color

renderer.setSize(window.innerWidth, window.innerHeight); //initial sizing

document.querySelector('body').appendChild(renderer.domElement);  //mounted to DOM

window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}) //resposive



const box = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshLambertMaterial({ color: 'green' });
const mesh = new THREE.Mesh(box, material);
mesh.position.x = 0;
mesh.position.z = -5;

scene.add(mesh)


const light = new THREE.PointLight('white', 1, 500)
light.position.set(10, 0, 25)
scene.add(light)


// SUBTRACTIVE GEOMETRY
const cube1 = new THREE.BoxGeometry(w, h, 1);
const material1 = new THREE.MeshPhongMaterial({ color: 0x6666FF });
const mesh1 = new THREE.Mesh(cube1, material1);

const cylinder1 = new THREE.CylinderGeometry(1, 3, 5, 32);
const cylinderMaterial1 = new THREE.MeshPhongMaterial({ color: 0xFFFF00 });
const cylinderMesh = new THREE.Mesh(cylinder1, cylinderMaterial1);
cylinderMesh.rotation.x = 1.575;

// CSG
const csgCube1 = new ThreeBSP(cube1);
const csgCylinder1 = new ThreeBSP(cylinderMesh);

const subtraction = csgCube1.subtract(csgCylinder1);
const subtractionMesh = subtraction.toMesh();

subtractionMesh.material = material1;

scene.add(subtractionMesh);

subtractionMesh.scale.x = 0.1;
subtractionMesh.scale.y = 0.1;

// PORTAL ANIMATION
let active = false;
let grow;

function growPortal() {
    if (subtractionMesh.scale.x <= 0.8) {
        grow = true;
    }
    else if (subtractionMesh.scale.x >= 1) {
        grow = false;
    }

    if (grow) {
        // subtractionMesh.scale.x += random(0.03);
        // subtractionMesh.scale.y += random(0.03);
        subtractionMesh.scale.x += 0.005;
        subtractionMesh.scale.y += 0.005;
    }
    else {
        // subtractionMesh.scale.x -= random(0.03);
        // subtractionMesh.scale.y -= random(0.03);
        subtractionMesh.scale.x -= 0.005;
        subtractionMesh.scale.y -= 0.005;
    }
}

// BODY TRACKING
// if (navigator.mediaDevices.getUserMedia) {
//     navigator.mediaDevices.getUserMedia({ video: true })
//         .then(function (stream) {
//             video.srcObject = stream;
//             video.addEventListener('loadeddata', animate)
//         })
// }

if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            video.srcObject = stream;
            // video.addEventListener('loadeddata', animate)
            // video.addEventListener('loadeddata', loadAndPredict)
            
            setInterval(() => {
                loadAndPredict();
            }, 100);

            video.addEventListener('loadeddata', animate)
        })
}

async function loadAndPredict() {
    const net = await bodyPix.load();

    const segmentation = await net.segmentPerson(video, { maxDetections: 1 });
    // console.log(segmentation);
    poses = await segmentation.allPoses[0].keypoints;
    if (poses.length === 0) {
        active = false;
    }
    else {
        active = true;

        // pose = poses[0];
        // keyPoints = pose.keypoints;
        // leftShoulder = keyPoints[5];
        // rightShoulder = keyPoints[6];
        leftShoulder = poses[5];
        rightShoulder = poses[6];
        leftShoulderX = scale(leftShoulder.position.x, 0, w, -7, 7);
        leftShoulderY = scale(leftShoulder.position.y, 0, h, -4, 4);
        rightShoulderX = scale(rightShoulder.position.x, 0, w, -7, 7);
        rightShoulderY = scale(rightShoulder.position.y, 0, h, -4, 4);

        x = (leftShoulderX + rightShoulderX) / 2;
        y = (leftShoulderY + rightShoulderY) / 2;
    }
}

const animate = () => {
    requestAnimationFrame(animate);

    // loadAndPredict();

    renderer.render(scene, camera) //render scene

    if (x >= -4 && x <= 4) {
        active = true;
    }
    else {
        active = false;
    }

    mesh.position.x = -x;
    mesh.position.y = -y;

    if (active) {
        growPortal();
    }
    else {
        if (subtractionMesh.scale.x >= 0.1) {
            subtractionMesh.scale.x -= 0.005;
            subtractionMesh.scale.y -= 0.005;
        }
    }
}