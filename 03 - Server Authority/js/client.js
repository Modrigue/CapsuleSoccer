"use strict";
const DEPLOY_CLIENT = true;
let socket;
if (DEPLOY_CLIENT)
    socket = io.connect();
else
    socket = io.connect(`http://localhost:${PORT}`);
//import * as MC from "./mocorgo.js";
//import { io } from "./server.js";
//import { userInput } from "./userInput.js";
//export const socket = io.connect('http://localhost:5500');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let clientBalls = new Map();
let selfID;
putWallsAround(0, 0, canvas.clientWidth, canvas.clientHeight);
socket.on('connect', () => {
    selfID = socket.id;
    let startX = 40 + Math.random() * 560;
    let startY = 40 + Math.random() * 400;
    clientBalls.set(socket.id, new Capsule(startX, startY, startX + 40, startY, 40, 5));
    clientBalls.get(socket.id).player = true;
    clientBalls.get(socket.id).maxSpeed = 5;
    clientBalls.get(socket.id).angle = 0;
    userInput(clientBalls.get(socket.id));
    socket.emit('newPlayer', { x: startX, y: startY, angle: 0 });
});
socket.on('updatePlayers', (json) => {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    let playersFound = new Map();
    let playersCoords = new Map();
    try {
        playersCoords = new Map(JSON.parse(json));
    }
    catch (ex) {
        return; // nop
    }
    for (let [id, playerCoords] of playersCoords) {
        if (!clientBalls.has(id) && id !== socket.id) {
            if (playerCoords !== undefined) {
                let newPlayer = new Capsule(playerCoords.x, playerCoords.y, playerCoords.x + 40, playerCoords.y, 40, 5);
                newPlayer.maxSpeed = 5;
                newPlayer.angle = playerCoords.angle;
                clientBalls.set(id, newPlayer);
            }
        }
        playersFound.set(id, true);
    }
    for (let [id, player] of clientBalls) {
        if (!playersFound.get(id)) {
            player.remove();
            clientBalls.delete(id);
        }
    }
});
socket.on('positionUpdate', (json) => {
    let playersCoords = new Map();
    try {
        playersCoords = new Map(JSON.parse(json));
    }
    catch (ex) {
        return; // nop
    }
    for (let [id, player] of playersCoords) {
        if (player !== undefined && clientBalls.has(id)) {
            clientBalls.get(id).setPosition(player.x, player.y, player.angle);
        }
    }
});
canvas.focus();
requestAnimationFrame(renderOnly);
//# sourceMappingURL=client.js.map