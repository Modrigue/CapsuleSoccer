"use strict";
//Event listeners for the arrow keys
function userInput(obj) {
    canvas.addEventListener('keydown', function (e) {
        switch (e.key) {
            case 'ArrowLeft':
                obj.left = true;
                break;
            case 'ArrowUp':
                obj.up = true;
                break;
            case "ArrowRight":
                obj.right = true;
                break;
            case "ArrowDown":
                obj.down = true;
                break;
            case ' ':
                obj.action = true;
                break;
        }
    });
    canvas.addEventListener('keyup', function (e) {
        switch (e.key) {
            case 'ArrowLeft':
                obj.left = false;
                break;
            case 'ArrowUp':
                obj.up = false;
                break;
            case "ArrowRight":
                obj.right = false;
                break;
            case "ArrowDown":
                obj.down = false;
                break;
            case ' ':
                obj.action = false;
                break;
        }
    });
}
//# sourceMappingURL=userInput.js.map