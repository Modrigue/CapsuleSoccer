const DEPLOY = true;
const PORT = DEPLOY ? 13000 : 5500;

let NB_PLAYERS_IN_GAME = 2;
let NB_POINTS_MATCH = 5;

const PAD_LENGTH = 50;
const BALL_CAPSULE_LENGTH = 60;

const BALL_IMG = "./img/blue-ball-128.png";
const BALL_CAPSULE_IMGS = ["./img/blue-pill-body-128.png", "./img/blue-pill-right-128.png", "./img/blue-pill-left-128.png"];
const OBSTACLE_IMG = "./img/flocon-64.png";

const COLORS_PLAYERS = ["Salmon", "LightGreen", "LightSalmon", "MediumSeaGreen"];
const COLOR_WALL = "DodgerBlue";
const COLOR_MARK = "MediumBlue";


let socket;
if (DEPLOY)
    socket = io.connect();
else
    socket = io.connect(`http://localhost:${PORT}`);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const form = document.getElementById('userForm');
const gameAreaDiv = document.getElementById('gameArea');


// init game field
buildStadium();
let football;
let clientBalls = {};
let obstacles = [];
let selfID;

socket.on('connect', () => {
    selfID = socket.id;
})

socket.on('setNbPointsMatch', nbPoints => {
    NB_POINTS_MATCH = nbPoints;
})

socket.on('updateConnections', player => {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    if(clientBalls[player.id] === undefined)
    {
        clientBalls[player.id] = new Capsule(player.x + PAD_LENGTH/2, player.y, player.x - PAD_LENGTH/2, player.y, 25, 0, 10);
        clientBalls[player.id].maxSpeed = 4;
        clientBalls[player.id].score = 0;
        clientBalls[player.id].no = player.no;
        clientBalls[player.id].angle = Math.PI; // corrects render while waiting
        clientBalls[player.id].color = COLORS_PLAYERS[player.no - 1];

        if (player.id !== undefined)
        {
            const side = (clientBalls[player.id].no % 2 == 0) ? "right" : "left";
            const color = clientBalls[player.id].color.toLowerCase();
            clientBalls[player.id].setImages(
                [`img/missile-${side}-${color}-body-128.png`,
                `img/missile-${side}-${color}-head-128.png`]
            );
            clientBalls[player.id].setActionImage(`img/missile-${side}-fire-128.png`);
        }

        if(player.id === selfID)
        {
            document.getElementById('playerWelcome').innerText =
                `Hi, enter your name and start to play (Room ${player.roomNo})`
                document.getElementById('playerGameInfo').innerText =
                `${NB_PLAYERS_IN_GAME} players - Match in ${NB_POINTS_MATCH} points`
            
            document.getElementById('userName').focus();

            userInput(clientBalls[player.id]);
        }
    }
})

socket.on('deletePlayer', player => {
    if(clientBalls[player.id])
    {
        clientBalls[player.id].remove();
        delete clientBalls[player.id];
        football.remove();
        delete football;
    }
})

socket.on('playerName', data => {
    clientBalls[data.id].name = data.name;
})

socket.on('newFootball', footballParams => {
    if(football !== undefined)
        football.remove();

    football = createFootball(footballParams);
})

socket.on('newObstacles', obstacleParams => {
    if(obstacles !== undefined)
        for (let obstacle of obstacles)
            obstacle.remove();

    const r = obstacleParams.r;
    for (let pos of obstacleParams.positions)
    {
        const obstacle = new Star6(pos.x, pos.y, r, 0, COLOR_WALL);
        obstacle.setImages([OBSTACLE_IMG]);
        obstacle.color = COLOR_WALL;
        obstacles.push(obstacle); 
    }
})

socket.on('updateFootball', footballParams => {
    if(football === undefined)
    {
        football = new Ball(footballParams.x, footballParams.y, footballParams.r, footballParams.m);
        football.color = "blue";
        football.setImages([BALL_IMG]);
    }
    else
    {
        football.setPosition(footballParams.x, footballParams.y, footballParams.angle);
    }
})

socket.on('positionUpdate', playerPos => {
    for(let id in clientBalls)
    {
        if(clientBalls[id] !== undefined && id === playerPos.id){
            clientBalls[id].setPosition(playerPos.x, playerPos.y, playerPos.angle);
        }
    }
})

socket.on('updateScore', scorerId => {
    if (scorerId === null)
    {
        for (let id in clientBalls)
        {
            clientBalls[id].score = 0;
        } 
    }
    else
    {
        document.getElementById('winning').innerHTML = ``;
        for (let id in clientBalls)
        {
            if (id === scorerId)
            {
                if (isNumeric(clientBalls[id].no))
                    clientBalls[id].score++;

                if(clientBalls[id].score === NB_POINTS_MATCH)
                {
                    document.getElementById('winning').innerHTML = 
                    `The winner is ${clientBalls[id].name}!!!
                    <br>LET'S PLAY AGAIN!`
                }
            }
        }
    }
})

requestAnimationFrame(renderOnly);

function userInterface()
{    
    for (let id in clientBalls)
    {
        const fontSizeScore = "48px Arial";
        const fontSizeName  = (id === selfID) ? "bold 28px Arial" : "25px Arial";
        //const fontSizeScore = fontSizeName;

        ctx.textAlign = (clientBalls[id].no % 2 == 0) ? "right" : "left";

        // display team score
        if (clientBalls[id].no == 1
         || clientBalls[id].no == 2 * Math.floor(NB_PLAYERS_IN_GAME / 2)
        )
        {
            ctx.font = fontSizeScore;
            ctx.fillStyle = (clientBalls[id].no % 2 == 0) ? "green" : "red";
            const xPos = (clientBalls[id].no % 2 == 0) ? 630 : 10;
            const yPos = 40;
            ctx.fillText(clientBalls[id].score, xPos, yPos);
        }

        // display player name
        if(clientBalls[id].name)
            ctx.font = fontSizeName;
        ctx.fillStyle = COLORS_PLAYERS[clientBalls[id].no - 1];
        const xPos = (clientBalls[id].no % 2 == 0) ? 580 : 60;
        const yPos = 25 + 25 * Math.floor((clientBalls[id].no - 1) / 2);
        const nameText = (clientBalls[id].name) ? clientBalls[id].name : ""
        ctx.fillText(nameText, xPos, yPos);
    }
}

function buildStadium()
{
    // Marks
    new LineMark(60, 180, 60, 360, COLOR_MARK);
    new LineMark(320, 81, 320, 459, COLOR_MARK);
    new LineMark(580, 180, 580, 360, COLOR_MARK);
    new CircleMark(320, 270, 60, COLOR_MARK);
    new ArcMark(60, 270, 140, 1.5*Math.PI, 2.5*Math.PI, COLOR_MARK);
    new ArcMark(580, 270, 140, 0.5*Math.PI, 1.5*Math.PI, COLOR_MARK);

    // Top / bottom walls
    new Wall(60, 80, 580, 80, COLOR_WALL);
    new Wall(60, 460, 580, 460, COLOR_WALL);

    new Wall(60, 80, 60, 180, COLOR_WALL);
    new Wall(60, 460, 60, 360, COLOR_WALL);
    new Wall(580, 80, 580, 180, COLOR_WALL);
    new Wall(580, 460, 580, 360, COLOR_WALL);

    new Wall(50, 360, 10, 360, COLOR_WALL);
    new Wall(0, 360, 0, 180, COLOR_WALL);
    new Wall(10, 180, 50, 180, COLOR_WALL);
    new Wall(590, 360, 630, 360, COLOR_WALL);
    new Wall(640, 360, 640, 180, COLOR_WALL);
    new Wall(630, 180, 590, 180, COLOR_WALL);
}

function createFootball(footballParams)
{
    let ball;
    switch(footballParams.type)
    {
        case BALL_TYPES.ball:
            ball = new Ball(320, 270, footballParams.r, footballParams.m);
            ball.color = "blue";
            ball.setImages([BALL_IMG]);
            break;
        
        case BALL_TYPES.CAPSULE:
            ball = new Capsule(
                320 - BALL_CAPSULE_LENGTH/2, 270,
                320 + BALL_CAPSULE_LENGTH/2, 270,
                footballParams.r, footballParams.r, footballParams.m
            );
            ball.color = "blue";
            ball.setImages(BALL_CAPSULE_IMGS);
            break;
    }

    ball.pos.set(320, 270);
    ball.vel.set(0, 0);

    return ball;
}

form.onsubmit = function(e)
{
    e.preventDefault();
    form.style.display = 'none';
    gameAreaDiv.style.display = 'block';
    document.body.style.backgroundColor = "Black";
    canvas.focus();
    clientBalls[selfID].name = document.getElementById('userName').value;
    socket.emit('clientName', clientBalls[selfID].name);
    return false;
}

function isNumeric(value)
{
    return !isNaN(value)
}