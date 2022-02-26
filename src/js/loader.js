import main from "./main.js";

const loader = new GLTFLoader().setPath('../assets/models/');
let clownfish1, clownfish2, clownfish3, angelfish, shark, maoriWrasse, tang;

window.onload = () => {
    //load any assets here
    loader.load('cfish.gltf', function (gltf) {
        gltf.scene.traverse(function (object) {
            if (object.isMesh) object.castShadow = true;
        });

        clownfish1 = gltf.scene;
        main.gameObjects.push(clownfish1);
        main.masterAnimations.push(gltf.animations);

        loader.load('cfish.gltf', function (gltf) {
            gltf.scene.traverse(function (object) {
                if (object.isMesh) object.castShadow = true;
            });

            clownfish2 = gltf.scene;
            main.gameObjects.push(clownfish2);
            main.masterAnimations.push(gltf.animations);

            loader.load('cfish.gltf', function (gltf) {
                gltf.scene.traverse(function (object) {
                    if (object.isMesh) object.castShadow = true;
                });

                clownfish3 = gltf.scene;
                main.gameObjects.push(clownfish3);
                main.masterAnimations.push(gltf.animations);

                loader.load('angelfish.gltf', function (gltf) {
                    gltf.scene.traverse(function (object) {
                        if (object.isMesh) object.castShadow = true;
                    });

                    angelfish = gltf.scene;
                    main.gameObjects.push(angelfish);
                    main.masterAnimations.push(gltf.animations);

                    loader.load('shark.gltf', function (gltf) {
                        gltf.scene.traverse(function (object) {
                            if (object.isMesh) object.castShadow = true;
                        });

                        shark = gltf.scene;
                        main.gameObjects.push(shark);
                        main.masterAnimations.push(gltf.animations);

                        loader.load('MaoriWrasse.gltf', function (gltf) {
                            gltf.scene.traverse(function (object) {
                                if (object.isMesh) object.castShadow = true;
                            });

                            maoriWrasse = gltf.scene;
                            main.gameObjects.push(maoriWrasse);
                            main.masterAnimations.push(gltf.animations);

                            loader.load('YellowTang.gltf', function (gltf) {
                                gltf.scene.traverse(function (object) {
                                    if (object.isMesh) object.castShadow = true;
                                });

                                tang = gltf.scene;
                                main.gameObjects.push(tang);
                                main.masterAnimations.push(gltf.animations);
                                loadPortalVideos();
                            });
                        });
                    });
                });
            });
        });
    });
}

function loadPortalVideos() {
    main.portalVideos.push(document.getElementById('blankPortal'));
    main.portalVideos.push(document.getElementById('openingPortal'));
    main.portalVideos.push(document.getElementById('spinningPortal'));
    main.portalVideos.push(document.getElementById('closingPortal'));
    main.init() 
}