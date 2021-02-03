"use strict";
const BODIES = new Array();
const COLLISIONS = new Array();
function userInteraction() {
    BODIES.forEach((b) => {
        b.keyControl();
    });
}
function gameLogic() { }
function physicsLoop( /*timestamp*/) {
    COLLISIONS.length = 0;
    BODIES.forEach((b) => {
        b.reposition();
    });
    BODIES.forEach((b, index) => {
        for (let bodyPair = index + 1; bodyPair < BODIES.length; bodyPair++) {
            const bodyRef = BODIES[index];
            const bodyProbe = BODIES[bodyPair];
            if (bodyRef.layer === bodyProbe.layer ||
                bodyRef.layer === 0 || bodyProbe.layer === 0) {
                let bestSat = collide(bodyRef, bodyProbe);
                if (bestSat.overlaps)
                    COLLISIONS.push(new CollData(bodyRef, bodyProbe, bestSat.axis, bestSat.pen, bestSat.vertex));
            }
        }
    });
    COLLISIONS.forEach((c) => {
        c.penRes();
        c.collRes();
    });
}
function renderLoop() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    BODIES.forEach((b) => {
        b.render();
    });
    userInterface();
}
function mainLoop() {
    userInteraction();
    physicsLoop();
    renderLoop();
    gameLogic();
    requestAnimationFrame(mainLoop);
}
function renderOnly() {
    renderLoop();
    requestAnimationFrame(renderOnly);
}
// WIP: not functionnal for now
// node exports
try {
    module.exports = {
        Vector,
        setBallVerticesAlongAxis: setBallVerticesAlongAxis,
        sat: sat
    };
}
catch (ex) { }
//# sourceMappingURL=mocorgo.js.map