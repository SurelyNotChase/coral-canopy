import main from "./main.js";

//The bundler will create this directory in the /dist folder for the browser to read. 
//If you want to add or change files in assets, go to ../staticFiles/assets

window.onload = () => {
    main.init();

}


const loadPortalVideos = () => {
    let array = [];

    array.push(document.getElementById('blankPortal'));
    array.push(document.getElementById('openingPortal'));
    array.push(document.getElementById('spinningPortal'));
    array.push(document.getElementById('closingPortal'));

    return array;
}

export default { loadPortalVideos }