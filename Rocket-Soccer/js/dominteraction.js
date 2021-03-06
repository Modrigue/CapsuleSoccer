"use strict";
window.onload = function () {
    window.addEventListener("resize", onResize);
    onResize();
};
function updateWelcomeGUI() {
    const teamNo = (nbPlayersReadyInRoom % 2) + 1;
    const teamColor = (teamNo == 1) ? "Red" : "Green";
    document.getElementById('playerGameInfo').innerText =
        `${nbPlayersReadyInRoom} / ${NB_PLAYERS_IN_GAME_CLIENT} players - Team ${teamColor} - Match in ${NB_POINTS_MATCH_CLIENT} points`;
    const hasMaxNbPlayers = (nbPlayersReadyInRoom >= NB_PLAYERS_IN_GAME_CLIENT);
    document.getElementById('buttonSubmit').disabled = hasMaxNbPlayers;
}
const form = document.getElementById('userForm');
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
// keep ratio at resize
function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const ratioStadium = STADIUM_W_CLIENT / (STADIUM_H_CLIENT + 60);
    const ratioWindow = w / h;
    if (w * (STADIUM_H_CLIENT + 60) == h * STADIUM_W_CLIENT) // equal ratios
     {
        canvas.style.left = "0";
        canvas.style.top = "0";
        canvas.style.width = `${window.innerWidth.toString()}px`;
        canvas.style.height = `${window.innerHeight.toString()}px`;
    }
    else if (ratioWindow > ratioStadium) // width too big
     {
        const wNew = Math.round(h * ratioStadium);
        const leftNew = Math.round(w / 2 - wNew / 2);
        canvas.style.left = `${leftNew}px`;
        canvas.style.top = "0";
        canvas.style.height = `${h}px`;
        canvas.style.width = `${wNew}px`;
    }
    else if (ratioWindow < ratioStadium) // height too big
     {
        const hNew = Math.round(w / ratioStadium);
        const topNew = Math.round(h / 2 - hNew / 2);
        canvas.style.left = "0";
        canvas.style.top = `${topNew}px`;
        canvas.style.width = `${w}px`;
        canvas.style.height = `${hNew}px`;
    }
}
//# sourceMappingURL=dominteraction.js.map