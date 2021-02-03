const BODIES: Array<Body> = new Array<Body>();
const COLLISIONS: Array<CollData> = new Array<CollData>();

function userInteraction(): void
{
    BODIES.forEach((b) => {
        b.keyControl();
    })
}

//function gameLogic(){}

function physicsLoop(/*timestamp*/): void
{
    COLLISIONS.length = 0;
    
    BODIES.forEach((b) => {
        b.reposition();
    })
    
    BODIES.forEach((b, index) => {
        for(let bodyPair = index+1; bodyPair < BODIES.length; bodyPair++)
        {
            const bodyRef: Body = BODIES[index];
            const bodyProbe: Body = BODIES[bodyPair];
        
            if(bodyRef.layer === bodyProbe.layer ||
               bodyRef.layer === 0 || bodyProbe.layer === 0)
            {
                let bestSat: CollSat = collide(bodyRef, bodyProbe);
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

function renderLoop(): void
{
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    BODIES.forEach((b) => {
        b.render();
    })
}

function mainLoop(): void
{
    userInteraction();
    physicsLoop();
    renderLoop();
    gameLogic();
    requestAnimationFrame(mainLoop);
}

function renderOnly(): void
{
    renderLoop();
    requestAnimationFrame(renderOnly);
}


// WIP: not functionnal for now
// node exports
try
{
    module.exports = {
        Vector,
        setBallVerticesAlongAxis: setBallVerticesAlongAxis,
        sat: sat
    };
}
catch (ex) {}