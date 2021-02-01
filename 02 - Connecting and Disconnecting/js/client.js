"use strict";
const socket = io.connect('http://localhost:5500');
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
let clientBalls = new Map();
//setting up the environment
putWallsAround(0, 0, canvas.clientWidth, canvas.clientHeight);
let startX = 40 + Math.random() * 560;
let startY = 40 + Math.random() * 400;
let playerBall = new Ball(startX, startY, 40, 5);
playerBall.player = true;
playerBall.maxSpeed = 5;
//sending the initial positions to the server
socket.emit('newPlayer', { x: startX, y: startY });
//reacting for new and disconnecting clients
socket.on('updatePlayers', (json) => {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    let playersFound = new Map();
    console.log('json : ', json);
    let playersCoords = new Map();
    try {
        playersCoords = new Map(JSON.parse(json));
    }
    catch (ex) {
        return; // nop
    }
    for (let [id, playerCoords] of playersCoords) {
        console.log('clientBalls', clientBalls, id, socket.id);
        if (!clientBalls.has(id) && id !== socket.id)
            if (playerCoords !== undefined)
                clientBalls.set(id, new Ball(playerCoords.x, playerCoords.y, 40, 5));
        playersFound.set(id, true);
    }
    for (let id in clientBalls) {
        if (!playersFound.get(id)) {
            clientBalls.get(id).remove();
            clientBalls.delete(id);
        }
    }
});
function gameLogic() {
    socket.emit('update', { x: playerBall.pos.x, y: playerBall.pos.y });
}
userInput(playerBall);
requestAnimationFrame(mainLoop);
//# sourceMappingURL=client.js.map