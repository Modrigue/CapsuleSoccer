//Establishing a connection with the server on port 5500
const socket = io('http://localhost:5500');

//Grabbing the button element by the ID
const HelloBtn: HTMLButtonElement = <HTMLButtonElement>document.getElementById('helloButton');

//Callback function fires on the event called 'serverToClient'
socket.on('serverToClient', (data: any) => {
    alert(data);
})

//Client sends a message at the moment it got connected with the server
socket.emit('clientToServer', "Hello, server!");

//Event listener on the button element: sends a message to the server when clicked
HelloBtn.addEventListener('click', () => {
    socket.emit('clientToClient', "Hello to the fellow clients!");
})