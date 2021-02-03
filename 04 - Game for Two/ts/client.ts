const DEPLOY_CLIENT: boolean = true;

let socket: any;
if (DEPLOY_CLIENT)
    socket = io.connect();
else
    socket = io.connect(`http://localhost:${PORT}`);

    const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
    const ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d');

buildStadium();

class Player extends Capsule
{
    score: number = 0;
    no: number = 0;
}

let football: Ball;
let footballInitialized: boolean = false;
let clientBalls: Map<string, Player> = new Map<string, Player>();
let selfID: string;

socket.on('connect', () => {
    selfID = socket.id;
})

socket.on('updateConnections', (json: string) => {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

    let playersFound: Map<string, Boolean> = new Map<string, Boolean>();

    let playersCoords:Map<string, {x: number, y: number, angle: number, no: number}>
        = new Map<string, {x: number, y: number, angle: number, no: number}>();
    try
    {
        playersCoords = new Map(JSON.parse(json));
    }
    catch (ex)
    {
        return; // nop
    }

    for(let [id, playerCoords] of playersCoords)
    {
        if(!clientBalls.has(id) /*&& id !== socket.id*/)
        {
            if (playerCoords !== undefined)
            {
                let newPlayer = new Player(playerCoords.x+35, playerCoords.y, playerCoords.x-35, playerCoords.y, 25, 10);                
                newPlayer.maxSpeed = 4;
                newPlayer.angle = playerCoords.angle;
                newPlayer.score = 0;
                newPlayer.no = playerCoords.no;

                if(newPlayer.no === 1)
                    newPlayer.color = "lightblue";
                else if(newPlayer.no === 2)
                    newPlayer.color = "lightgreen";

                if(id === selfID)
                    userInput(newPlayer);

                clientBalls.set(id, newPlayer);
            }
        }

        playersFound.set(id, true);
    }

    for(let [id, player] of clientBalls)
    {
        if(!playersFound.get(id))
        {
            player.remove();
            clientBalls.delete(id);
        }
    }
})

socket.on('updateFootball', (footballPos: any) => {

    if (footballPos == null)
        return;

    if(!footballInitialized)
    {
        football = new Ball(footballPos.x, footballPos.y, 20, 10);
        football.color = "red";
        footballInitialized = true;
    }
    else
    {
        football.setPosition(footballPos.x, footballPos.y);
    }
})

socket.on('positionUpdate', (json: any) => {
    let playersCoords:Map<string, {x: number, y: number, angle: number}>
        = new Map<string, {x: number, y: number, angle: number}>();
    try
    {
        playersCoords = new Map(JSON.parse(json));
    }
    catch (ex)
    {
        return; // nop
    }

    for(let [id, player] of playersCoords)
    {
        if(player !== undefined && clientBalls.has(id))
        {
            (<Capsule>clientBalls.get(id)).setPosition(player.x, player.y, player.angle);
        }
    }
})

socket.on('updateScore', (scorerId: (string | null)) => {
    if (scorerId === null)
    {
        for(let [id, player] of clientBalls)
            player.score = 0;
    }
    else
    {
        for(let [id, player] of clientBalls)
        {
            if (id === scorerId)
            {
                if(player.no === 1)
                    player.score++;
                else if(player.no === 2)
                    player.score++;
            }
        }
    }
})

requestAnimationFrame(renderOnly);

function userInterface()
{
    ctx.font = "30px Arial";
    ctx.fillStyle = "red";
    for(let [id, player] of clientBalls)
    {
        if(player.no === 1)
            ctx.fillText(player.score.toString(), 20, 30);
        else if(player.no === 2)
            ctx.fillText(player.score.toString(), 600, 30);
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

canvas.focus();