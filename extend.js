import { Canvas } from "./app/canvas.js";

window.onload = function () {
    const appRoot = document.getElementById("root");

    const canvas = new Canvas();
    canvas.attach(appRoot);
    // createEditor(appRoot);
};
