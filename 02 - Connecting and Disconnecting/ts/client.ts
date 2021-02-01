const socket = io.connect('http://localhost:5500');

const canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById('canvas');
const ctx: CanvasRenderingContext2D = <CanvasRenderingContext2D>canvas.getContext('2d');

let clientBalls: Map<string, Ball> = new Map<string, Ball>();

//setting up the environment
putWallsAround(0, 0, canvas.clientWidth, canvas.clientHeight);
let startX: number = 40+Math.random()*560;
let startY: number = 40+Math.random()*400;
let playerBall : Ball = new Ball(startX, startY, 40, 5);
playerBall.player = true;
playerBall.maxSpeed = 5;

//sending the initial positions to the server
socket.emit('newPlayer', {x: startX, y: startY});

//reacting for new and disconnecting clients
socket.on('updatePlayers', (json: string) => {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    let playersFound: Map<string, Boolean> = new Map<string, Boolean>();

    console.log('json : ', json);
    let playersCoords:Map<string, {x: number, y: number}> = new Map<string, {x: number, y: number}>();
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
        console.log('clientBalls', clientBalls, id, socket.id);
        
        if(!clientBalls.has(id) && id !== socket.id)
            if (playerCoords !== undefined)
                clientBalls.set(id, new Ball(playerCoords.x, playerCoords.y, 40, 5));

        playersFound.set(id, true);
    }

    for(let id in clientBalls)
    {
        if(!playersFound.get(id))
        {
            (<Ball>clientBalls.get(id)).remove();
            clientBalls.delete(id);
        }
    }
})

function gameLogic()
{
    socket.emit('update', {x: playerBall.pos.x, y: playerBall.pos.y});
}

userInput(playerBall);
requestAnimationFrame(mainLoop);