const DEPLOY_CLIENT: boolean = true;

let NB_PLAYERS_IN_GAME_CLIENT = 2;
let NB_POINTS_MATCH_CLIENT = 10;

let STADIUM_W_CLIENT = 640;
let STADIUM_H_CLIENT = 420;

const PAD_LENGTH_CLIENT = 50;
const BALL_CAPSULE_LENGTH_CLIENT = 60;

const BALL_IMG = "./img/blue-ball-128.png";
const BALL_CAPSULE_IMGS = ["./img/blue-pill-body-128.png", "./img/blue-pill-right-128.png", "./img/blue-pill-left-128.png"];
const OBSTACLE_IMG = "./img/flocon-64.png";

const COLORS_PLAYERS = ["Salmon", "LightGreen", "LightSalmon", "MediumSeaGreen", "Red", "Green"];
const COLOR_WALL = "DodgerBlue";
const COLOR_MARK = "MediumBlue";


let socket: any;
if (DEPLOY_CLIENT)
    socket = io.connect();
else
    socket = io.connect(`http://localhost:${PORT}`);

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
const ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d');

const form: HTMLDivElement = <HTMLDivElement>document.getElementById('userForm');
const gameAreaDiv: HTMLDivElement = <HTMLDivElement>document.getElementById('gameArea');

class Player extends Capsule
{
    score: number = 0;
    no: number = 0;
    name: string = "";
}

// init game field
let football: (Ball | Capsule);
let footballInitialized: boolean = false;
let marksInitialized: boolean = false;
let clientBalls: Map<string, Player> = new Map<string, Player>();
let selfID: string;
let stadium: Array<Body> = new Array<Body>();
let obstacles: Array<Body> = new Array<Body>();
let room = -1;
let nbPlayersReadyInRoom = 0;
let drawPlayerHint: boolean = true;

socket.on('connect', () => {
    selfID = socket.id;
});

socket.on('setNbPointsMatch', (nbPoints: number) => {
    NB_POINTS_MATCH_CLIENT = nbPoints;
});

socket.on('newConnection', (matchParams: any) => {
    nbPlayersReadyInRoom = matchParams.nbPlayersReady;
    NB_PLAYERS_IN_GAME_CLIENT = matchParams.nbPlayersInGame;
    NB_POINTS_MATCH_CLIENT = matchParams.nbPointsMatch;

    STADIUM_W_CLIENT = matchParams.stadiumW;
    STADIUM_H_CLIENT = matchParams.stadiumH;

    canvas.width = STADIUM_W_CLIENT;
    canvas.height = STADIUM_H_CLIENT + 60; // includes header top

    buildStadiumMarks();

    (<HTMLParagraphElement>document.getElementById('playerWelcome')).innerText =
    `Hi, enter your name and start to play`;

    updateWelcomeGUI();
    (<HTMLInputElement>document.getElementById('userName')).focus();
});

socket.on('updatePlayersReady', (nbPlayersReady: number) => {

    nbPlayersReadyInRoom = nbPlayersReady;
    updateWelcomeGUI();

    drawPlayerHint = true;
});

function updateWelcomeGUI()
{
    const teamNo = (nbPlayersReadyInRoom % 2) + 1;
    const teamColor = (teamNo == 1) ? "Red" : "Green";

    (<HTMLParagraphElement>document.getElementById('playerGameInfo')).innerText =
    `${nbPlayersReadyInRoom} / ${NB_PLAYERS_IN_GAME_CLIENT} players - Team ${teamColor} - Match in ${NB_POINTS_MATCH_CLIENT} points`;

    const hasMaxNbPlayers = (nbPlayersReadyInRoom >= NB_PLAYERS_IN_GAME_CLIENT);
    (<HTMLButtonElement>document.getElementById('buttonSubmit')).disabled = hasMaxNbPlayers;
}

socket.on('updateConnections', (player: any) => {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    if(!clientBalls.has(player.id))
    {
        let newPlayer: Player = new Player(player.x + PAD_LENGTH_CLIENT/2, player.y, player.x - PAD_LENGTH_CLIENT/2, player.y, 25, 0, 10);
        newPlayer.maxSpeed = 4;
        newPlayer.score = 0;
        newPlayer.no = player.no;
        newPlayer.color = getPlayerColor(player.no);

        // set images
        if (player.id !== undefined)
        {
            const side = (newPlayer.no % 2 == 0) ? "right" : "left";
            const color = newPlayer.color.toLowerCase();
            newPlayer.setImages(
                [`img/missile-${side}-${color}-body-128.png`,
                `img/missile-${side}-${color}-head-128.png`]
            );
            newPlayer.setActionImage(`img/missile-${side}-fire-128.png`);
        }

        newPlayer.setPosition(player.x, player.y, player.angle);

        if(player.id === selfID)
            userInput(newPlayer, canvas);

        clientBalls.set(player.id, newPlayer);
    }
})

socket.on('deletePlayer', (player: any) => {
    if(clientBalls.has(player.id))
    {
        (<Player>clientBalls.get(player.id)).remove();
        clientBalls.delete(player.id);
    }
})

socket.on('playerName', (data: any) => {
    if (clientBalls.has(data.id))
        (<Player>clientBalls.get(data.id)).name = data.name;
})

socket.on('newFootball', (footballParams: any) => {
    if(football !== undefined)
        football.remove();

    football = createFootball(footballParams);
    //footballInitialized = true;
})

socket.on('newObstacles', (obstacleParams: any) => {
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

socket.on('newStadium', (stadiumParams: any) => {
    if(stadium !== undefined)
        for (let wall of stadium)
            wall.remove();

    for (let typePos of stadiumParams.walls)
    {
        const wallType = typePos[0];
        switch(wallType)
        {
            case WALL_TYPE.WALL:
                stadium.push(new Wall(typePos[1].x, typePos[1].y, typePos[2].x, typePos[2].y, COLOR_WALL));
                break;

            case WALL_TYPE.WALL_ARC:
                stadium.push(new WallArc(typePos[1].x, typePos[1].y, typePos[2], typePos[3], typePos[4], COLOR_WALL));
                break;
        }
    }

    drawPlayerHint = true;
})

socket.on('updateFootball', (footballParams: any) => {
    //if (footballPos == null)
    //    return;

    if(!footballInitialized)
    {
        football = new Ball(footballParams.x, footballParams.y, footballParams.r, footballParams.m);
        football.color = "blue";
        football.setImages([BALL_IMG]);
        footballInitialized = true;
    }
    else
    {
        football.setPosition(footballParams.x, footballParams.y, footballParams.angle);
    }
})

socket.on('updatePlayersPositions', (playerPos: any) => {

    for(let [id, player] of clientBalls)
    {
        if(player !== undefined && id === playerPos.id)
        {
            player.setPosition(playerPos.x, playerPos.y, playerPos.angle);
            player.up = playerPos.up; // for action image display
        }
    }
})

socket.on('scoring', (scorerId: (string | null)) => {
    if (scorerId === null)
    {
        for(let [id, player] of clientBalls)
            player.score = 0;
    }
    else
    {
        (<HTMLElement>document.getElementById('winning')).innerHTML = ``;
        for(let [id, player] of clientBalls)
        {
            if (id === scorerId)
            {
                player.score++;

                if(player.score === NB_POINTS_MATCH_CLIENT)
                {
                    let winnerText = "";
                    if (NB_PLAYERS_IN_GAME_CLIENT <= 2)
                        winnerText = `The winner is ${player.name}!!! <br>LET'S PLAY AGAIN!`;
                    else
                    {
                        let winningTeam = (player.no % 2);
                        if (winningTeam == 0)
                            winningTeam = 2;
                        
                        winnerText = `The winner is team ${winningTeam}!!! <br>LET'S PLAY AGAIN!`;
                    }

                    (<HTMLElement>document.getElementById('winning')).innerHTML = winnerText
                }
            }
        }
    }
})

socket.on('updateScore', (scoreParams: any) => {

    if (scoreParams === null)
    {
        for(let [id, player] of clientBalls)
        player.score = 0;
    }
    else
    {
        const id = scoreParams.id;
        if (clientBalls.has(id))
            (<Player>clientBalls.get(id)).score = scoreParams.score;
    }
    
});

function buildStadiumMarks()
{
    if (marksInitialized)
        return;

    new LineMark(STADIUM_W_CLIENT/2, 81, STADIUM_W_CLIENT/2, STADIUM_H_CLIENT+60 - 21, COLOR_MARK);
    new CircleMark(STADIUM_W_CLIENT/2, STADIUM_H_CLIENT/2 + 60, 60, COLOR_MARK);

    //new LineMark(60, STADIUM_H_CLIENT/2 + 60 - 90, 60, STADIUM_H_CLIENT/2 + 60 + 90, COLOR_MARK);
    //new ArcMark(60, STADIUM_H_CLIENT/2 + 60, 140, 1.5*Math.PI, 2.5*Math.PI, COLOR_MARK);

    //new LineMark(STADIUM_W_CLIENT - 60,  STADIUM_H_CLIENT/2 + 60 - 90, STADIUM_W_CLIENT - 60,  STADIUM_H_CLIENT/2 + 60 + 90, COLOR_MARK);
    //new ArcMark(STADIUM_W_CLIENT - 60, STADIUM_H_CLIENT/2 + 60, 140, 0.5*Math.PI, 1.5*Math.PI, COLOR_MARK);

    marksInitialized = true;
}

requestAnimationFrame(renderOnly);

function userInterface()
{    
    // display title
    ctx.font = "italic 28px Arial";
    ctx.textAlign = "center";
    ctx.fillStyle = "dodgerblue";
    ctx.fillText("Rocket Soccer", STADIUM_W_CLIENT/2, 30);

    // disabled: display room
    //ctx.font = "italic 20px Arial";
    //ctx.fillText(`Room ${room}`, STADIUM_W_CLIENT/2, 60);

    for(let [id, player] of clientBalls)
    {
        const fontSizeScore = "48px Arial";
        const fontSizeName  = (id === selfID) ? "bold 28px Arial" : "25px Arial";
        //const fontSizeScore = fontSizeName;

        ctx.textAlign = (player.no % 2 == 0) ? "right" : "left";

        // display team score
        if (player.no == 1
         || player.no == 2 * Math.floor(NB_PLAYERS_IN_GAME_CLIENT / 2)
        )
        {
            ctx.font = fontSizeScore;
            ctx.fillStyle = (player.no % 2 == 0) ? "green" : "red";
            const xPos = (player.no % 2 == 0) ? STADIUM_W_CLIENT - 10 : 10;
            const yPos = 40;
            ctx.fillText(player.score.toString(), xPos, yPos);
        }

        // display player name
        if(player.name)
            ctx.font = fontSizeName;
        ctx.fillStyle = getPlayerColor(player.no);
        const xPos = (player.no % 2 == 0) ? STADIUM_W_CLIENT - 60 : 60;
        const yPos = 25 + 25 * Math.floor((player.no - 1) / 2);
        const nameText = (player.name) ? player.name : ""
        ctx.fillText(nameText, xPos, yPos);

        // draw player hint
        if (id === selfID && drawPlayerHint)
        {
            ctx.font = "48px Arial";;
            ctx.fillStyle = getPlayerColor(player.no);
            
            let teamNo = player.no % 2;
            if (teamNo == 0)
                teamNo = 2;

            const xPos = (teamNo == 1) ?
                player.pos.x - PAD_LENGTH_CLIENT - 20 :
                player.pos.x + PAD_LENGTH_CLIENT + 20;
            const yPos = player.pos.y + 15;
            const hintText = (teamNo == 1) ? `▶` : `◀`;
            ctx.fillText(hintText, xPos, yPos);
            
            canvas.addEventListener('keydown', function(e)
            {
                switch(e.key)
                {
                    case 'ArrowUp':
                        drawPlayerHint = false;
                        break;

                    case ' ':
                        // re-enable player hint?
                        break;
                }

            });
        }
    }
}

function createFootball(footballParams: any): (Ball | Capsule)
{
    let ball;
    const ballType = <BALL_TYPE>footballParams.type;    
    switch(ballType)
    {
        case BALL_TYPE.BALL:
            ball = new Ball(STADIUM_W_CLIENT/2, STADIUM_H_CLIENT/2 + 60, footballParams.r, footballParams.m);
            ball.color = "blue";
            ball.setImages([BALL_IMG]);
            ball.pos.set(STADIUM_W_CLIENT/2, STADIUM_H_CLIENT/2 + 60);
            ball.vel.set(0, 0);
            return ball;
        
        case BALL_TYPE.CAPSULE:
            ball = new Capsule(
                STADIUM_W_CLIENT/2 - BALL_CAPSULE_LENGTH_CLIENT/2, STADIUM_H_CLIENT/2 + 60,
                STADIUM_W_CLIENT/2 + BALL_CAPSULE_LENGTH_CLIENT/2, STADIUM_H_CLIENT/2 + 60,
                footballParams.r, footballParams.r, footballParams.m
            );
            ball.color = "blue";
            ball.setImages(BALL_CAPSULE_IMGS);
            ball.pos.set(STADIUM_W_CLIENT/2, STADIUM_H_CLIENT/2 + 60);
            ball.vel.set(0, 0);
            return ball;
    }
}

function getPlayerColor(no: number)
{
    const nbColors = COLORS_PLAYERS.length;
    let colorIndex = no % nbColors;
    if (colorIndex == 0)
         colorIndex = nbColors;

    return COLORS_PLAYERS[colorIndex - 1];
}

form.onsubmit = function(e)
{
    e.preventDefault();

    const name = (<HTMLInputElement>document.getElementById('userName')).value;
    const roomCandidate = 1; //document.getElementById('userRoom').value;

    socket.emit('clientName', {name: name, room: roomCandidate}, (response: any) => {
        
        if (response.error)
        {
            alert(response.error);
            return true;
        }
        else
        {
            // ok, enter room
            room = roomCandidate;
            form.style.display = 'none';
            gameAreaDiv.style.display = 'block';
            document.body.style.backgroundColor = "Black";
            canvas.focus();
            
            return false;
        }
      });
}