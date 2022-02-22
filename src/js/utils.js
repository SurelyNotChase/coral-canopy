const random = (max) => Math.random() * max;
const scale = (number, inMin, inMax, outMin, outMax) => (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;

export default {
    random,
    scale
}