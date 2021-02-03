"use strict";
const DEPLOY_CLIENT = true;
let socket;
if (DEPLOY_CLIENT)
    socket = io.connect();
else
    socket = io.connect(`http://localhost:${PORT}`);
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const form = document.getElementById('userForm');
const gameAreaDiv = document.getElementById('gameArea');
buildStadium();
class Player extends Capsule {
    constructor() {
        super(...arguments);
        this.score = 0;
        this.no = 0;
        this.name = "";
    }
}
let football;
let footballInitialized = false;
let clientBalls = new Map();
let selfID;
socket.on('connect', () => {
    selfID = socket.id;
});
socket.on('updateConnections', (player) => {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    if (!clientBalls.has(player.id)) {
        let newPlayer = new Player(player.x + 35, player.y, player.x - 35, player.y, 25, 10);
        newPlayer.maxSpeed = 4;
        newPlayer.angle = player.angle;
        newPlayer.score = 0;
        newPlayer.no = player.no;
        if (newPlayer.no === 1)
            newPlayer.color = "lightblue";
        else if (newPlayer.no === 2)
            newPlayer.color = "lightgreen";
        if (player.id === selfID) {
            document.getElementById('playerWelcome').innerHTML =
                `Hi, enter your nickname and start to play (in room no.${player.roomNo})`;
            userInput(newPlayer);
        }
        clientBalls.set(player.id, newPlayer);
    }
});
socket.on('deletePlayer', (player) => {
    if (clientBalls.has(player.id)) {
        clientBalls.get(player.id).remove();
        clientBalls.delete(player.id);
        football.remove();
        //delete football; // not allowed in strict TS
    }
});
socket.on('playerName', (data) => {
    clientBalls.get(data.id).name = data.name;
});
socket.on('updateFootball', (footballPos) => {
    if (footballPos == null)
        return;
    if (!footballInitialized) {
        football = new Ball(footballPos.x, footballPos.y, 20, 10);
        football.color = "red";
        footballInitialized = true;
    }
    else {
        football.setPosition(footballPos.x, footballPos.y);
    }
});
socket.on('positionUpdate', (playerPos) => {
    for (let [id, player] of clientBalls) {
        if (player !== undefined && id === playerPos.id) {
            player.setPosition(playerPos.x, playerPos.y, playerPos.angle);
        }
    }
});
socket.on('updateScore', (scorerId) => {
    if (scorerId === null) {
        for (let [id, player] of clientBalls)
            player.score = 0;
    }
    else {
        for (let [id, player] of clientBalls) {
            if (id === scorerId) {
                if (player.no === 1)
                    player.score++;
                else if (player.no === 2)
                    player.score++;
                if (player.score === 3) {
                    document.getElementById('winning').innerHTML =
                        `The winner is ${player.name}!!!
                    <br>LET'S PLAY AGAIN!`;
                }
            }
        }
    }
});
requestAnimationFrame(renderOnly);
function userInterface() {
    ctx.font = "30px Arial";
    for (let [id, player] of clientBalls) {
        if (player.no === 1) {
            ctx.fillStyle = "blue";
            ctx.textAlign = "left";
            ctx.fillText(player.score.toString(), 30, 30);
            if (player.name)
                ctx.fillText(player.name, 30, 70);
            else {
                ctx.fillStyle = "black";
                ctx.fillText("....", 30, 70);
            }
        }
        else if (player.no === 2) {
            ctx.fillStyle = "green";
            ctx.textAlign = "right";
            ctx.fillText(player.score.toString(), 600, 30);
            if (player.name)
                ctx.fillText(player.name, 600, 70);
            else {
                ctx.fillStyle = "black";
                ctx.fillText("....", 600, 70);
            }
        }
    }
}
function buildStadium() {
    new Wall(60, 80, 580, 80);
    new Wall(60, 460, 580, 460);
    new Wall(60, 80, 60, 180);
    new Wall(60, 460, 60, 360);
    new Wall(580, 80, 580, 180);
    new Wall(580, 460, 580, 360);
    new Wall(50, 360, 10, 360);
    new Wall(0, 360, 0, 180);
    new Wall(10, 180, 50, 180);
    new Wall(590, 360, 630, 360);
    new Wall(640, 360, 640, 180);
    new Wall(630, 180, 590, 180);
}
form.onsubmit = function (e) {
    e.preventDefault();
    form.style.display = 'none';
    gameAreaDiv.style.display = 'block';
    canvas.focus();
    clientBalls.get(selfID).name = document.getElementById('userName').value;
    socket.emit('clientName', clientBalls.get(selfID).name);
    return false;
};
//# sourceMappingURL=client.js.map