const express = require('express');
const app = express();
const server = app.listen(5500);
const io = require('socket.io')(server);

app.get('/', (req: any, res: any) => res.send('Hello World!'))

let players: Map<string, {x: number, y: number}> = new Map<string, {x: number, y: number}>();

io.on('connection', connected);

//listening to events after the connection is estalished
function connected(socket: any)
{
    socket.on('newPlayer', (playerCoords: any) => {
 
        console.log("New client connected, with id: " + socket.id);
        players.set(socket.id, playerCoords);
        console.log("Starting position: "+ playerCoords.x + " - " + playerCoords.y);
        console.log("Current number of players: " + Object.keys(players).length);
        console.log("players dictionary: ", players);

        const json: string = JSON.stringify(Array.from(players)); // only works with 1D map
        io.emit('updatePlayers', json);
    })

    socket.on('disconnect', function()
    {
        if (players.has(socket.id))
            players.delete(socket.id);
        console.log("Goodbye client with id " + socket.id);
        console.log("Current number of players: " + Object.keys(players).length);
        io.emit('updatePlayers', players);
    })

    socket.on('ClientClientHello', (data: any) => {
        socket.broadcast.emit('ServerClientHello', data);
    })
}