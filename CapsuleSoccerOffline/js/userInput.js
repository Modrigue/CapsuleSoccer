"use strict";
//Event listeners for the arrow keys
function userInput1(obj) {
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
function userInput2(obj) {
    canvas.addEventListener('keydown', function (e) {
        switch (e.key) {
            case 'q':
            case 'a':
                obj.left = true;
                break;
            case 'w':
            case 'z':
                obj.up = true;
                break;
            case "d":
                obj.right = true;
                break;
            case "s":
                obj.down = true;
                break;
            case 'Tab':
                obj.action = true;
                break;
        }
    });
    canvas.addEventListener('keyup', function (e) {
        switch (e.key) {
            case 'q':
            case 'a':
                obj.left = false;
                break;
            case 'w':
            case 'z':
                obj.up = false;
                break;
            case "d":
                obj.right = false;
                break;
            case "s":
                obj.down = false;
                break;
            case 'Tab':
                obj.action = false;
                break;
        }
    });
}
//# sourceMappingURL=userInput.js.map