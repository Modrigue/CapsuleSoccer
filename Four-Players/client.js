const DEPLOY = false;

const PORT = DEPLOY ? 13000 : 5500;
const socket = io.connect(`http://localhost:${PORT}`);

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const form = document.getElementById('userForm');
const gameAreaDiv = document.getElementById('gameArea');

const PAD_LENGTH = 50;
let NB_POINTS_MATCH = 5;

buildStadium();
let football;
let clientBalls = {};
let selfID;

socket.on('connect', () => {
    selfID = socket.id;
})

socket.on('setNbPointsMatch', nb_points => {
    NB_POINTS_MATCH = nb_points;
})

socket.on('updateConnections', player => {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    if(clientBalls[player.id] === undefined)
    {
        clientBalls[player.id] = new Capsule(player.x + PAD_LENGTH/2, player.y, player.x - PAD_LENGTH/2, player.y, 25, 10);
        clientBalls[player.id].maxSpeed = 4;
        clientBalls[player.id].score = 0;
        clientBalls[player.id].no = player.no;

        switch(clientBalls[player.id].no)
        {
            case 1:
                clientBalls[player.id].color = "salmon";
                break;

            case 2:
                clientBalls[player.id].color = "lightgreen";
                break;
        }

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

socket.on('updateFootball', footballPos => {
    if(football === undefined)
    {
        football = new Ball(footballPos.x, footballPos.y, 20, 10);
        football.color = "blue";
    }
    else
    {
        football.setPosition(footballPos.x, footballPos.y);
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
    if (scorerId === null){
        for (let id in clientBalls){
            clientBalls[id].score = 0;
        } 
    } else {
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
    const fontSizeScore = "48px Arial";
    const fontSizeName  = "30px Arial";
    
    for (let id in clientBalls)
    {
        switch(clientBalls[id].no)
        {
            case 1:
                ctx.font = fontSizeScore;
                ctx.fillStyle = "red";
                ctx.textAlign = "left";
                ctx.fillText(clientBalls[id].score, 10, 40);
                if(clientBalls[id].name)
                {
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
                ctx.fillText(clientBalls[id].score, 630, 40);
                if(clientBalls[id].name)
                {
                    ctx.font = fontSizeName;
                    ctx.fillText(clientBalls[id].name, 580, 30);
                }
                else
                {
                    ctx.fillStyle = "black";
                    ctx.fillText("....", 580, 30);
                }
                break;
        }
    }
}

function buildStadium()
{
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

form.onsubmit = function(e) {
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