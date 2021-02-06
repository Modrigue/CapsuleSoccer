"use strict";
const DEPLOY_CLIENT = true;
let NB_PLAYERS_IN_GAME_CLIENT = 2;
let NB_POINTS_MATCH_CLIENT = 10;
let STADIUM_W_CLIENT = 640;
const PAD_LENGTH_CLIENT = 50;
const BALL_CAPSULE_LENGTH_CLIENT = 60;
const BALL_IMG = "./img/blue-ball-128.png";
const BALL_CAPSULE_IMGS = ["./img/blue-pill-body-128.png", "./img/blue-pill-right-128.png", "./img/blue-pill-left-128.png"];
const OBSTACLE_IMG = "./img/flocon-64.png";
const COLORS_PLAYERS = ["Salmon", "LightGreen", "LightSalmon", "MediumSeaGreen", "Red", "Green"];
const COLOR_WALL = "DodgerBlue";
const COLOR_MARK = "MediumBlue";
let socket;
if (DEPLOY_CLIENT)
    socket = io.connect();
else
    socket = io.connect(`http://localhost:${PORT}`);
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const form = document.getElementById('userForm');
const gameAreaDiv = document.getElementById('gameArea');
class Player extends Capsule {
    constructor() {
        super(...arguments);
        this.score = 0;
        this.no = 0;
        this.name = "";
    }
}
// init game field
let football;
let footballInitialized = false;
let clientBalls = new Map();
let selfID;
let stadium = new Array();
let obstacles = new Array();
let room = -1;
let nbPlayersReadyInRoom = 0;
socket.on('connect', () => {
    selfID = socket.id;
});
socket.on('setNbPointsMatch', (nbPoints) => {
    NB_POINTS_MATCH_CLIENT = nbPoints;
});
socket.on('newConnection', (matchParams) => {
    nbPlayersReadyInRoom = matchParams.nbPlayersReady;
    NB_PLAYERS_IN_GAME_CLIENT = matchParams.nbPlayersInGame;
    NB_POINTS_MATCH_CLIENT = matchParams.nbPointsMatch;
    STADIUM_W_CLIENT = matchParams.stadiumW;
    canvas.width = STADIUM_W_CLIENT;
    buildStadiumMarks();
    document.getElementById('playerWelcome').innerText =
        `Hi, enter your name and start to play`;
    updateWelcomeGUI();
    document.getElementById('userName').focus();
});
socket.on('updatePlayersReady', (nbPlayersReady) => {
    nbPlayersReadyInRoom = nbPlayersReady;
    updateWelcomeGUI();
});
function updateWelcomeGUI() {
    const teamNo = (nbPlayersReadyInRoom % 2) + 1;
    const teamColor = (teamNo == 1) ? "Red" : "Green";
    document.getElementById('playerGameInfo').innerText =
        `${nbPlayersReadyInRoom} / ${NB_PLAYERS_IN_GAME_CLIENT} players - Team ${teamColor} - Match in ${NB_POINTS_MATCH_CLIENT} points`;
    const hasMaxNbPlayers = (nbPlayersReadyInRoom >= NB_PLAYERS_IN_GAME_CLIENT);
    document.getElementById('buttonSubmit').disabled = hasMaxNbPlayers;
}
socket.on('updateConnections', (player) => {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    if (!clientBalls.has(player.id)) {
        let newPlayer = new Player(player.x + PAD_LENGTH_CLIENT / 2, player.y, player.x - PAD_LENGTH_CLIENT / 2, player.y, 25, 0, 10);
        newPlayer.maxSpeed = 4;
        newPlayer.score = 0;
        newPlayer.no = player.no;
        newPlayer.angle = Math.PI; // corrects render while waiting
        newPlayer.color = getPlayerColor(player.no);
        if (player.id !== undefined) {
            const side = (newPlayer.no % 2 == 0) ? "right" : "left";
            const color = newPlayer.color.toLowerCase();
            newPlayer.setImages([`img/missile-${side}-${color}-body-128.png`,
                `img/missile-${side}-${color}-head-128.png`]);
            newPlayer.setActionImage(`img/missile-${side}-fire-128.png`);
        }
        if (player.id === selfID)
            userInput(newPlayer, canvas);
        clientBalls.set(player.id, newPlayer);
    }
});
socket.on('deletePlayer', (player) => {
    if (clientBalls.has(player.id)) {
        clientBalls.get(player.id).remove();
        clientBalls.delete(player.id);
    }
});
socket.on('playerName', (data) => {
    if (clientBalls.has(data.id))
        clientBalls.get(data.id).name = data.name;
});
socket.on('newFootball', (footballParams) => {
    if (football !== undefined)
        football.remove();
    football = createFootball(footballParams);
    //footballInitialized = true;
});
socket.on('newObstacles', (obstacleParams) => {
    if (obstacles !== undefined)
        for (let obstacle of obstacles)
            obstacle.remove();
    const r = obstacleParams.r;
    for (let pos of obstacleParams.positions) {
        const obstacle = new Star6(pos.x, pos.y, r, 0, COLOR_WALL);
        obstacle.setImages([OBSTACLE_IMG]);
        obstacle.color = COLOR_WALL;
        obstacles.push(obstacle);
    }
});
socket.on('newStadium', (stadiumParams) => {
    if (stadium !== undefined)
        for (let wall of stadium)
            wall.remove();
    for (let typePos of stadiumParams.walls) {
        const wallType = typePos[0];
        switch (wallType) {
            case WALL_TYPE.WALL:
                stadium.push(new Wall(typePos[1].x, typePos[1].y, typePos[2].x, typePos[2].y, COLOR_WALL));
                break;
            case WALL_TYPE.WALL_ARC:
                stadium.push(new WallArc(typePos[1].x, typePos[1].y, typePos[2], typePos[3], typePos[4], COLOR_WALL));
                break;
        }
    }
});
socket.on('updateFootball', (footballParams) => {
    //if (footballPos == null)
    //    return;
    if (!footballInitialized) {
        football = new Ball(footballParams.x, footballParams.y, footballParams.r, footballParams.m);
        football.color = "blue";
        football.setImages([BALL_IMG]);
        footballInitialized = true;
    }
    else {
        football.setPosition(footballParams.x, footballParams.y, footballParams.angle);
    }
});
socket.on('updatePlayersPositions', (playerPos) => {
    for (let [id, player] of clientBalls) {
        if (player !== undefined && id === playerPos.id) {
            player.setPosition(playerPos.x, playerPos.y, playerPos.angle);
            player.up = playerPos.up; // for action image display
        }
    }
});
socket.on('scoring', (scorerId) => {
    if (scorerId === null) {
        for (let [id, player] of clientBalls)
            player.score = 0;
    }
    else {
        document.getElementById('winning').innerHTML = ``;
        for (let [id, player] of clientBalls) {
            if (id === scorerId) {
                player.score++;
                if (player.score === NB_POINTS_MATCH_CLIENT) {
                    let winnerText = "";
                    if (NB_PLAYERS_IN_GAME_CLIENT <= 2)
                        winnerText = `The winner is ${player.name}!!! <br>LET'S PLAY AGAIN!`;
                    else {
                        let winningTeam = (player.no % 2);
                        if (winningTeam == 0)
                            winningTeam = 2;
                        winnerText = `The winner is team ${winningTeam}!!! <br>LET'S PLAY AGAIN!`;
                    }
                    document.getElementById('winning').innerHTML = winnerText;
                }
            }
        }
    }
});
socket.on('updateScore', (scoreParams) => {
    if (scoreParams === null) {
        for (let [id, player] of clientBalls)
            player.score = 0;
    }
    else {
        const id = scoreParams.id;
        if (clientBalls.has(id))
            clientBalls.get(id).score = scoreParams.score;
    }
});
function buildStadiumMarks() {
    new LineMark(STADIUM_W_CLIENT / 2, 81, STADIUM_W_CLIENT / 2, 459, COLOR_MARK);
    new CircleMark(STADIUM_W_CLIENT / 2, 270, 60, COLOR_MARK);
    //new LineMark(60, 180, 60, 360, COLOR_MARK);
    //new ArcMark(60, 270, 140, 1.5*Math.PI, 2.5*Math.PI, COLOR_MARK);
    //new LineMark(580, 180, 580, 360, COLOR_MARK);
    //new ArcMark(580, 270, 140, 0.5*Math.PI, 1.5*Math.PI, COLOR_MARK);
}
requestAnimationFrame(renderOnly);
function userInterface() {
    // display title
    ctx.font = "italic 28px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "dodgerblue";
    ctx.fillText("Rocket Soccer", STADIUM_W_CLIENT / 2, 30);
    // disabled: display room
    //ctx.font = "italic 20px Arial";
    //ctx.fillText(`Room ${room}`, STADIUM_W_CLIENT/2, 60);
    for (let [id, player] of clientBalls) {
        const fontSizeScore = "48px Arial";
        const fontSizeName = (id === selfID) ? "bold 28px Arial" : "25px Arial";
        //const fontSizeScore = fontSizeName;
        ctx.textAlign = (player.no % 2 == 0) ? "right" : "left";
        // display team score
        if (player.no == 1
            || player.no == 2 * Math.floor(NB_PLAYERS_IN_GAME_CLIENT / 2)) {
            ctx.font = fontSizeScore;
            ctx.fillStyle = (player.no % 2 == 0) ? "green" : "red";
            const xPos = (player.no % 2 == 0) ? STADIUM_W_CLIENT - 10 : 10;
            const yPos = 40;
            ctx.fillText(player.score.toString(), xPos, yPos);
        }
        // display player name
        if (player.name)
            ctx.font = fontSizeName;
        ctx.fillStyle = getPlayerColor(player.no);
        const xPos = (player.no % 2 == 0) ? STADIUM_W_CLIENT - 60 : 60;
        const yPos = 25 + 25 * Math.floor((player.no - 1) / 2);
        const nameText = (player.name) ? player.name : "";
        ctx.fillText(nameText, xPos, yPos);
    }
}
function createFootball(footballParams) {
    let ball;
    const ballType = footballParams.type;
    switch (ballType) {
        case BALL_TYPE.BALL:
            ball = new Ball(STADIUM_W_CLIENT / 2, 270, footballParams.r, footballParams.m);
            ball.color = "blue";
            ball.setImages([BALL_IMG]);
            ball.pos.set(STADIUM_W_CLIENT / 2, 270);
            ball.vel.set(0, 0);
            return ball;
        case BALL_TYPE.CAPSULE:
            ball = new Capsule(STADIUM_W_CLIENT / 2 - BALL_CAPSULE_LENGTH_CLIENT / 2, 270, STADIUM_W_CLIENT / 2 + BALL_CAPSULE_LENGTH_CLIENT / 2, 270, footballParams.r, footballParams.r, footballParams.m);
            ball.color = "blue";
            ball.setImages(BALL_CAPSULE_IMGS);
            ball.pos.set(STADIUM_W_CLIENT / 2, 270);
            ball.vel.set(0, 0);
            return ball;
    }
}
function getPlayerColor(no) {
    const nbColors = COLORS_PLAYERS.length;
    let colorIndex = no % nbColors;
    if (colorIndex == 0)
        colorIndex = nbColors;
    return COLORS_PLAYERS[colorIndex - 1];
}
form.onsubmit = function (e) {
    e.preventDefault();
    const name = document.getElementById('userName').value;
    const roomCandidate = 1; //document.getElementById('userRoom').value;
    socket.emit('clientName', { name: name, room: roomCandidate }, (response) => {
        if (response.error) {
            alert(response.error);
            return true;
        }
        else {
            // ok, enter room
            room = roomCandidate;
            form.style.display = 'none';
            gameAreaDiv.style.display = 'block';
            document.body.style.backgroundColor = "Black";
            canvas.focus();
            return false;
        }
    });
};
//# sourceMappingURL=client.js.map