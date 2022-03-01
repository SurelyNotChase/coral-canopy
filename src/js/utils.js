const random = (min, max) => Math.random() * (max - min) + min;
const scale = (number, inMin, inMax, outMin, outMax) => (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

export default {
    random,
    scale
}