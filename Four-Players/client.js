const DEPLOY = false;

const PORT = DEPLOY ? 13000 : 5500;
let socket;
if (DEPLOY)
    socket = io.connect();
else
    socket = io.connect(`http://localhost:${PORT}`);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const form = document.getElementById('userForm');
const gameAreaDiv = document.getElementById('gameArea');

let NB_PLAYERS_IN_GAME = 4;
let NB_POINTS_MATCH = 5;

const PAD_LENGTH = 50;

let BALL_RADIUS = 20;
let BALL_MASS = 10;

const PLAYERS_COLORS = ["Salmon", "LightGreen", "LightSalmon", "MediumSeaGreen"];
const MARK_COLOR = "LightSkyBlue";

buildStadium();
let football;
let clientBalls = {};
let selfID;

socket.on('connect', () => {
    selfID = socket.id;
})

socket.on('setNbPointsMatch', nbPoints => {
    NB_POINTS_MATCH = nbPoints;
})

socket.on('updateBallRadius', ballRadius => {
    BALL_RADIUS = ballRadius;
    
    if (football !== undefined)
        football.setRadius(BALL_RADIUS);
})

socket.on('updateBallMass', ballMass => {
    BALL_MASS = ballMass;

    if (football !== undefined)
        football.setMass(BALL_MASS);
})

socket.on('updateConnections', player => {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    if(clientBalls[player.id] === undefined)
    {
        clientBalls[player.id] = new Capsule(player.x + PAD_LENGTH/2, player.y, player.x - PAD_LENGTH/2, player.y, 25, 10);
        clientBalls[player.id].maxSpeed = 4;
        clientBalls[player.id].score = 0;
        clientBalls[player.id].no = player.no;

        clientBalls[player.id].color = PLAYERS_COLORS[player.no - 1];

        if(player.id === selfID)
        {
            document.getElementById('playerWelcome').innerHTML =
                `Hi, enter your nickname and start to play (in room no.${player.roomNo})`
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

socket.on('newRound', () => {
    //
})

socket.on('updateFootball', footballParams => {
    if(football === undefined)
    {
        football = new Ball(footballParams.x, footballParams.y, BALL_RADIUS, BALL_MASS);
        football.color = "blue";
    }
    else
    {
        football.setPosition(footballParams.x, footballParams.y);
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
                //if(clientBalls[id].no >= 1 && clientBalls[id].no <= 2)
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
        const fontSizeName  = (id === selfID) ? "bold 32px Arial" : "30px Arial";
        //const fontSizeScore = fontSizeName;

        switch(clientBalls[id].no)
        {
            case 1:
                ctx.font = fontSizeScore;
                ctx.fillStyle = "red";
                ctx.textAlign = "left";
                ctx.fillText(clientBalls[id].score, 10, 40);
                if(clientBalls[id].name)
                {
                    ctx.fillStyle = PLAYERS_COLORS[clientBalls[id].no - 1];
                    ctx.font = fontSizeName;
                    ctx.fillText(clientBalls[id].name, 60, 30);
                }
                else
                {
                    ctx.fillStyle = "black";
                    ctx.fillText("....", 60, 30);
                }
                break;

            case 2:
                ctx.font = fontSizeScore;
                ctx.fillStyle = "green";
                ctx.textAlign = "right";
                if (NB_PLAYERS_IN_GAME == 2)
                    ctx.fillText(clientBalls[id].score, 630, 40);
                if(clientBalls[id].name)
                {
                    ctx.fillStyle = PLAYERS_COLORS[clientBalls[id].no - 1];
                    ctx.font = fontSizeName;
                    ctx.fillText(clientBalls[id].name, 580, 30);
                }
                else
                {
                    ctx.fillStyle = "black";
                    ctx.fillText("....", 580, 30);
                }
                break;

                case 3:
                    ctx.font = fontSizeScore;
                    ctx.fillStyle = "red";
                    ctx.textAlign = "left";
                    //ctx.fillText(clientBalls[id].score, 10, 60);
                    if(clientBalls[id].name)
                    {
                        ctx.fillStyle = PLAYERS_COLORS[clientBalls[id].no - 1];
                        ctx.font = fontSizeName;
                        ctx.fillText(clientBalls[id].name, 60, 60);
                    }
                    else
                    {
                        ctx.fillStyle = "black";
                        ctx.fillText("....", 60, 60);
                    }
                    break;
    
                case 4:
                    ctx.font = fontSizeScore;
                    ctx.fillStyle = "green";
                    ctx.textAlign = "right";
                    if (NB_PLAYERS_IN_GAME == 4)
                        ctx.fillText(clientBalls[id].score, 630, 40);
                    if(clientBalls[id].name)
                    {
                        ctx.fillStyle = PLAYERS_COLORS[clientBalls[id].no - 1];
                        ctx.font = fontSizeName;
                        ctx.fillText(clientBalls[id].name, 580, 60);
                    }
                    else
                    {
                        ctx.fillStyle = "black";
                        ctx.fillText("....", 580, 60);
                    }
                    break;
        }
    }
}

function buildStadium()
{
    // Marks
    new LineMark(60, 180, 60, 360, MARK_COLOR);
    new LineMark(320, 81, 320, 459, MARK_COLOR);
    new LineMark(580, 180, 580, 360, MARK_COLOR);
    new CircleMark(320, 270, 60, MARK_COLOR);
    new ArcMark(60, 270, 140, 1.5*Math.PI, 2.5*Math.PI, MARK_COLOR);
    new ArcMark(580, 270, 140, 0.5*Math.PI, 1.5*Math.PI, MARK_COLOR);

    // Top / bottom walls
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

form.onsubmit = function(e)
{
    e.preventDefault();
    form.style.display = 'none';
    gameAreaDiv.style.display = 'block';
    canvas.focus();
    clientBalls[selfID].name = document.getElementById('userName').value;
    socket.emit('clientName', clientBalls[selfID].name);
    return false;
}

function isNumeric(value)
{
    return !isNaN(value)
}