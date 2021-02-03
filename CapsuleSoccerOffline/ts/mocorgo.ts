const BODIES: Array<Body> = new Array<Body>();
const COLLISIONS: Array<CollData> = new Array<CollData>();;

class Vector
{
    x: number;
    y: number;

    constructor(x: number, y: number)
    {
        this.x = x;
        this.y = y;
    }  
   
    set(x: number, y: number)
    {
        this.x = x;
        this.y = y;
    }

    add(v: Vector): Vector
    {
        return new Vector(this.x+v.x, this.y+v.y);
    }

    subtr(v: Vector): Vector
    {
        return new Vector(this.x-v.x, this.y-v.y);
    }

    mag(): number
    {
        return Math.sqrt(this.x**2 + this.y**2);
    }

    mult(n: number): Vector
    {
        return new Vector(this.x*n, this.y*n);
    }

    normal(): Vector
    {
        return new Vector(-this.y, this.x).unit();
    }

    unit(): Vector
    {
        if(this.mag() === 0)
        {
            return new Vector(0,0);
        }
        else
        {
            return new Vector(this.x/this.mag(), this.y/this.mag());
        }
    }

    drawVec(start_x: number, start_y: number, n: number, color: string): void
    {
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x + this.x * n, start_y + this.y * n);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }
    
    static dot(v1: Vector, v2: Vector): number
    {
        return v1.x*v2.x + v1.y*v2.y;
    }

    static cross(v1: Vector, v2: Vector): number
    {
        return v1.x*v2.y - v1.y*v2.x;
    }
}

class Matrix
{
    rows: number;
    cols: number;
    data: Array<Array<number>>;

    constructor(rows: number, cols: number)
    {
        this.rows = rows;
        this.cols = cols;
        this.data = [];

        for (let i = 0; i<this.rows; i++)
        {
            this.data[i] = [];
            for (let j = 0; j < this.cols; j++)
            {
                this.data[i][j] = 0;
            }
        }
    }

    multiplyVec(vec: Vector): Vector
    {
        let result: Vector = new Vector(0,0);
        result.x = this.data[0][0]*vec.x + this.data[0][1]*vec.y;
        result.y = this.data[1][0]*vec.x + this.data[1][1]*vec.y;
        return result;
    }

    rotMx22(angle: number): void
    {
        this.data[0][0] = Math.cos(angle);
        this.data[0][1] = -Math.sin(angle);
        this.data[1][0] = Math.sin(angle);
        this.data[1][1] = Math.cos(angle);
    }
}

// classes storing the primitive shapes: Line, Circle, Rectangle, Triangle

abstract class Shape
{
    abstract vertex: Array<Vector>;
    abstract pos: Vector;

    constructor(){}; // dummy

    abstract draw(color: string): void;
}

class Line extends Shape
{
    vertex: Array<Vector>;
    pos: Vector;
    dir: Vector;
    mag: number;

    constructor(x0: number, y0: number, x1: number, y1: number)
    {
        super();
        this.vertex = new Array<Vector>();
        this.vertex[0] = new Vector(x0, y0);
        this.vertex[1] = new Vector(x1, y1);
        this.dir = this.vertex[1].subtr(this.vertex[0]).unit();
        this.mag = this.vertex[1].subtr(this.vertex[0]).mag();
        this.pos = new Vector((this.vertex[0].x+this.vertex[1].x)/2, (this.vertex[0].y+this.vertex[1].y)/2);
    }

    draw(color: string): void
    {
        ctx.beginPath();
        ctx.moveTo(this.vertex[0].x, this.vertex[0].y);
        ctx.lineTo(this.vertex[1].x, this.vertex[1].y);
        if (color === "")
        {
            ctx.strokeStyle = "black";
            ctx.stroke();
        }
        else
        {
            ctx.strokeStyle = color;
            ctx.stroke();
        }
        ctx.strokeStyle = "";
        ctx.closePath();
    }
}

class Circle extends Shape
{
    vertex: Array<Vector>;
    pos: Vector;
    r: number;
    
    constructor(x: number, y: number, r: number)
    {
        super();
        this.vertex = new Array<Vector>();
        this.pos = new Vector(x, y);
        this.r = r;
    }

    draw(color: string)
    {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
        if (color === "")
        {
            ctx.strokeStyle = "black";
            ctx.stroke();
        }
        else
        {
            ctx.fillStyle = color;
            ctx.fill();
        }
        ctx.fillStyle = "";
        ctx.closePath();
    }
}

class Rectangle extends Shape
{
    vertex: Array<Vector>;
    pos: Vector;
    dir: Vector;
    refDir: Vector;
    length: number;
    width: number;
    angle: number;
    rotMat: Matrix;

    constructor(x1: number, y1: number, x2: number, y2: number, w: number)
    {
        super();
        this.vertex = new Array<Vector>();
        this.vertex[0] = new Vector(x1, y1);
        this.vertex[1] = new Vector(x2, y2);
        this.dir = this.vertex[1].subtr(this.vertex[0]).unit();
        this.refDir = this.vertex[1].subtr(this.vertex[0]).unit();
        this.length = this.vertex[1].subtr(this.vertex[0]).mag();
        this.width = w;
        this.vertex[2] = this.vertex[1].add(this.dir.normal().mult(this.width));
        this.vertex[3] = this.vertex[2].add(this.dir.normal().mult(-this.length));
        this.pos = this.vertex[0].add(this.dir.mult(this.length/2)).add(this.dir.normal().mult(this.width/2));
        this.angle = 0;
        this.rotMat = new Matrix(2,2);
    }

    draw(color: string): void
    {
        ctx.beginPath();
        ctx.moveTo(this.vertex[0].x, this.vertex[0].y);
        ctx.lineTo(this.vertex[1].x, this.vertex[1].y);
        ctx.lineTo(this.vertex[2].x, this.vertex[2].y);
        ctx.lineTo(this.vertex[3].x, this.vertex[3].y);
        ctx.lineTo(this.vertex[0].x, this.vertex[0].y);
        if (color === "")
        {
            ctx.strokeStyle = "black";
            ctx.stroke();
        }
        else
        {
            ctx.fillStyle = color;
            ctx.fill();
        }
        ctx.fillStyle = "";
        ctx.closePath();
    }

    getVertices(angle: number): void
    {
        this.rotMat.rotMx22(angle);
        this.dir = this.rotMat.multiplyVec(this.refDir);
        this.vertex[0] = this.pos.add(this.dir.mult(-this.length/2)).add(this.dir.normal().mult(this.width/2));
        this.vertex[1] = this.pos.add(this.dir.mult(-this.length/2)).add(this.dir.normal().mult(-this.width/2));
        this.vertex[2] = this.pos.add(this.dir.mult(this.length/2)).add(this.dir.normal().mult(-this.width/2));
        this.vertex[3] = this.pos.add(this.dir.mult(this.length/2)).add(this.dir.normal().mult(this.width/2));
    }
}

class Triangle extends Shape
{
    vertex: Array<Vector>;
    pos: Vector;
    dir: Vector;
    refDir: Vector;
    refDiam: Array<Vector>;
    angle: number;
    rotMat: Matrix;

    constructor(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number)
    {
        super();
        this.vertex = new Array<Vector>();
        this.vertex[0] = new Vector(x1, y1);
        this.vertex[1] = new Vector(x2, y2);
        this.vertex[2] = new Vector(x3, y3);
        this.pos = new Vector((this.vertex[0].x+this.vertex[1].x+this.vertex[2].x)/3, (this.vertex[0].y+this.vertex[1].y+this.vertex[2].y)/3);
        this.dir = this.vertex[0].subtr(this.pos).unit();
        this.refDir = this.dir;
        this.refDiam = new Array<Vector>();
        this.refDiam[0] = this.vertex[0].subtr(this.pos);
        this.refDiam[1] = this.vertex[1].subtr(this.pos);
        this.refDiam[2] = this.vertex[2].subtr(this.pos);
        this.angle = 0;
        this.rotMat = new Matrix(2,2);
    }

    draw(color: string): void
    {
        ctx.beginPath();
        ctx.moveTo(this.vertex[0].x, this.vertex[0].y);
        ctx.lineTo(this.vertex[1].x, this.vertex[1].y);
        ctx.lineTo(this.vertex[2].x, this.vertex[2].y);
        ctx.lineTo(this.vertex[0].x, this.vertex[0].y);
        if (color === "")
        {
            ctx.strokeStyle = "black";
            ctx.stroke();
        }
        else
        {
            ctx.fillStyle = color;
            ctx.fill();
        }
        ctx.fillStyle = "";
        ctx.closePath();
    }

    getVertices(angle: number): void
    {
        this.rotMat.rotMx22(angle);
        this.dir = this.rotMat.multiplyVec(this.refDir);
        this.vertex[0] = this.pos.add(this.rotMat.multiplyVec(this.refDiam[0]));
        this.vertex[1] = this.pos.add(this.rotMat.multiplyVec(this.refDiam[1]));
        this.vertex[2] = this.pos.add(this.rotMat.multiplyVec(this.refDiam[2]));
    }
}

//Parent class of the bodies (Ball, Capsule, Box, Star, Wall)
class Body
{
    comp: Array<Shape>;
    pos: Vector;
    m: number; inv_m: number;
    inertia: number; inv_inertia: number;
    elasticity: number;
    friction: number; angFriction: number;
    maxSpeed: number;

    color: string;
    layer: number;

    up: boolean; down: boolean; left: boolean; right: boolean;
    action: boolean;
    vel: Vector; acc: Vector;

    keyForce: number; angKeyForce: number;
    angle: number; angVel: number;
    player: boolean;

    constructor(x: number, y: number)
    {
        this.comp = new Array<Shape>();
        this.pos = new Vector(x, y);
        this.m = 0;
        this.inv_m = 0;
        this.inertia = 0;
        this.inv_inertia = 0;
        this.elasticity = 1;

        this.friction = 0;
        this.angFriction = 0;
        this.maxSpeed = 0;
        this.color = "";
        this.layer = 0;

        this.up = false;
        this.down = false;
        this.left = false;
        this.right = false;
        this.action = false;

        this.vel = new Vector(0, 0);
        this.acc = new Vector(0, 0);
        this.keyForce = 1;
        this.angKeyForce = 0.1;
        this.angle = 0;
        this.angVel = 0;
        this.player = false;
        BODIES.push(this);
    }

    render(): void
    {
        for (let i in this.comp){
            this.comp[i].draw(this.color);
        }
    }

    reposition(): void
    {
        this.acc = this.acc.unit().mult(this.keyForce);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.mult(1-this.friction);
        if (this.vel.mag() > this.maxSpeed && this.maxSpeed !== 0){
            this.vel = this.vel.unit().mult(this.maxSpeed);
        }
        //this.angVel *= (1-this.angFriction);
        this.angVel = this.angVel*(1-this.angFriction);
    }

    keyControl(): void
    {}

    remove(): void
    {
        if (BODIES.indexOf(this) !== -1){
            BODIES.splice(BODIES.indexOf(this), 1);
        }
    }
}

class Ball extends Body
{
    constructor(x: number, y: number, r: number, m: number)
    {
        super(x, y);
        this.pos = new Vector(x, y);
        this.comp = [new Circle(x, y, r)];
        this.m = m;
        if (this.m === 0)
        {
            this.inv_m = 0;
        }
        else
        {
            this.inv_m = 1 / this.m;
        }
    }

    setPosition(x: number, y: number, a: number = this.angle): void
    {
        this.pos.set(x, y);
        this.comp[0].pos = this.pos;
    }

    reposition()
    {
        super.reposition();
        this.setPosition(this.pos.add(this.vel).x, this.pos.add(this.vel).y);
    }

    keyControl()
    {
        if(this.left){
            this.acc.x = -this.keyForce;
        }
        if(this.up){
            this.acc.y = -this.keyForce;
        }
        if(this.right){
            this.acc.x = this.keyForce;
        }
        if(this.down){
            this.acc.y = this.keyForce;
        }
        if(!this.left && !this.right){
            this.acc.x = 0;
        }
        if(!this.up && !this.down){
            this.acc.y = 0;
        }
    }
}

class Capsule extends Body
{
    constructor(x1: number, y1: number, x2: number, y2: number, r: number, m: number)
    {
        super(x1, y1);
        this.comp = [new Circle(x1, y1, r), new Circle(x2, y2, r)];
        let recV1 = this.comp[1].pos.add(this.comp[1].pos.subtr(this.comp[0].pos).unit().normal().mult(r));
        let recV2 = this.comp[0].pos.add(this.comp[1].pos.subtr(this.comp[0].pos).unit().normal().mult(r));
        this.comp.unshift(new Rectangle(recV1.x, recV1.y, recV2.x, recV2.y, 2*r));
        this.pos = this.comp[0].pos;
        this.m = m;
        if (this.m === 0)
        {
            this.inv_m = 0;
        }
        else
        {
            this.inv_m = 1 / this.m;
        }
        this.inertia = this.m * ((2*(<Rectangle>this.comp[0]).width)**2 +((<Rectangle>this.comp[0]).length+2*(<Rectangle>this.comp[0]).width)**2) / 12;
        if (this.m === 0)
        {
            this.inv_inertia = 0;
        }
        else
        {
            this.inv_inertia = 1 / this.inertia;
        }
    }

    keyControl()
    {
        if(this.up){
            this.acc = (<Rectangle>this.comp[0]).dir.mult(-this.keyForce);
        }
        if(this.down){
            this.acc = (<Rectangle>this.comp[0]).dir.mult(this.keyForce);
        }
        if(this.left){
            this.angVel = -this.angKeyForce;
        }
        if(this.right){
            this.angVel = this.angKeyForce;
        }
        if(!this.up && !this.down){
            this.acc.set(0, 0);
        }
    }

    setPosition(x: number, y: number, a: number = this.angle): void
    {
        this.pos.set(x, y);
        this.angle = a;
        this.comp[0].pos = this.pos;
        (<Rectangle>this.comp[0]).getVertices(this.angle + this.angVel);
        this.comp[1].pos = this.comp[0].pos.add((<Rectangle>this.comp[0]).dir.mult(-(<Rectangle>this.comp[0]).length/2));
        this.comp[2].pos = this.comp[0].pos.add((<Rectangle>this.comp[0]).dir.mult((<Rectangle>this.comp[0]).length/2));
        this.angle += this.angVel;
    }

    reposition(){
        super.reposition();
        this.setPosition(this.pos.add(this.vel).x, this.pos.add(this.vel).y);
    }
}

class Box extends Body
{
    constructor(x1: number, y1: number, x2: number, y2: number, w: number, m: number)
    {
        super(x1, y1);
        this.comp = [new Rectangle(x1, y1, x2, y2, w)];
        this.pos = this.comp[0].pos;
        this.m = m;
        if (this.m === 0)
        {
            this.inv_m = 0;
        }
        else
        {
            this.inv_m = 1 / this.m;
        }
        this.inertia = this.m * ((<Rectangle>this.comp[0]).width**2 +(<Rectangle>this.comp[0]).length**2) / 12;
        if (this.m === 0)
        {
            this.inv_inertia = 0;
        }
        else
        {
            this.inv_inertia = 1 / this.inertia;
        }
    }

    keyControl(): void
    {
        if(this.up){
            this.acc = (<Rectangle>this.comp[0]).dir.mult(-this.keyForce);;
        }
        if(this.down){
            this.acc = (<Rectangle>this.comp[0]).dir.mult(this.keyForce);;
        }
        if(this.left){
            this.angVel = -this.angKeyForce;
        }
        if(this.right){
            this.angVel = this.angKeyForce;
        }
        if(!this.up && !this.down){
            this.acc.set(0,0);
        }
    }

    setPosition(x: number, y: number, a: number = this.angle): void
    {
        this.pos.set(x, y);
        this.angle = a;
        this.comp[0].pos = this.pos;
        (<Rectangle>this.comp[0]).getVertices(this.angle + this.angVel);
        this.angle += this.angVel;
    }

    reposition(): void
    {
        super.reposition();
        this.setPosition(this.pos.add(this.vel).x, this.pos.add(this.vel).y);
    }
}

class Star extends Body
{
    r: number;

    constructor(x1: number, y1: number, r: number, m: number)
    {
        super(x1, y1);
        this.comp = [];
        this.r = r;
        let center = new Vector(x1, y1);
        let upDir = new Vector(0, -1);
        let p1 = center.add(upDir.mult(r));
        let p2 = center.add(upDir.mult(-r/2)).add(upDir.normal().mult(-r*Math.sqrt(3)/2));
        let p3 = center.add(upDir.mult(-r/2)).add(upDir.normal().mult(r*Math.sqrt(3)/2));
        this.comp.push(new Triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y));
        p1 = center.add(upDir.mult(-r));
        p2 = center.add(upDir.mult(r/2)).add(upDir.normal().mult(-r*Math.sqrt(3)/2));
        p3 = center.add(upDir.mult(r/2)).add(upDir.normal().mult(r*Math.sqrt(3)/2));
        this.comp.push(new Triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y));
        this.pos = this.comp[0].pos;
        
        this.m = m;
        if (this.m === 0){
            this.inv_m = 0;
        } else {
            this.inv_m = 1 / this.m;
        }
        this.inertia = this.m * ((2*this.r)**2) / 12;
        if (this.m === 0){
            this.inv_inertia = 0;
        } else {
            this.inv_inertia = 1 / this.inertia;
        }
    }

    keyControl(): void
    {
        if(this.up){
            this.acc = (<Triangle>this.comp[0]).dir.mult(-this.keyForce);
        }
        if(this.down){
            this.acc = (<Triangle>this.comp[0]).dir.mult(this.keyForce);
        }
        if(this.left){
            this.angVel = -this.angKeyForce;
        }
        if(this.right){
            this.angVel = this.angKeyForce;
        }
        if(!this.up && !this.down){
            this.acc.set(0,0);
        }
    }

    setPosition(x: number, y: number, a: number = this.angle): void
    {
        this.pos.set(x, y);
        this.angle = a;
        this.comp[0].pos = this.pos;
        this.comp[1].pos = this.pos;
        (<Triangle>this.comp[0]).getVertices(this.angle + this.angVel);
        (<Triangle>this.comp[1]).getVertices(this.angle + this.angVel);
        this.angle += this.angVel;
    }

    reposition(): void
    {
        super.reposition();
        this.setPosition(this.pos.add(this.vel).x, this.pos.add(this.vel).y);
    }
}

class Wall extends Body
{
    constructor(x1: number, y1: number, x2: number, y2: number)
    {
        super((x1+x2)/2, (y1+y2)/2);
        this.comp = [new Line(x1, y1, x2, y2)];
        this.pos = new Vector((x1+x2)/2, (y1+y2)/2);
    }
}

//Collision manifold, consisting the data for collision handling
//Manifolds are collected in an array for every frame
class CollData
{
    o1: Body;
    o2: Body;
    normal: Vector;
    pen: number;
    cp: Vector;

    constructor(o1: Body, o2: Body, normal: Vector, pen: number, cp: Vector)
    {
        this.o1 = o1;
        this.o2 = o2;
        this.normal = normal;
        this.pen = pen;
        this.cp = cp;
    }

    penRes(): void
    {
        if (this.o1.inv_m + this.o2.inv_m == 0)
            return;

        let penResolution: Vector = this.normal.mult(this.pen / (this.o1.inv_m + this.o2.inv_m));
        
        this.o1.pos = this.o1.pos.add(penResolution.mult(this.o1.inv_m));
        this.o2.pos = this.o2.pos.add(penResolution.mult(-this.o2.inv_m));
    }

    collRes(): void
    {
        //1. Closing velocity
        let collArm1 = this.cp.subtr(this.o1.comp[0].pos);
        let rotVel1 = new Vector(-this.o1.angVel * collArm1.y, this.o1.angVel * collArm1.x);
        let closVel1 = this.o1.vel.add(rotVel1);
        let collArm2 = this.cp.subtr(this.o2.comp[0].pos);
        let rotVel2= new Vector(-this.o2.angVel * collArm2.y, this.o2.angVel * collArm2.x);
        let closVel2 = this.o2.vel.add(rotVel2);

        //2. Impulse augmentation
        let impAug1 = Vector.cross(collArm1, this.normal);
        impAug1 = impAug1 * this.o1.inv_inertia * impAug1;
        let impAug2 = Vector.cross(collArm2, this.normal);
        impAug2 = impAug2 * this.o2.inv_inertia * impAug2;

        let relVel = closVel1.subtr(closVel2);
        let sepVel = Vector.dot(relVel, this.normal);
        let new_sepVel = -sepVel * Math.min(this.o1.elasticity, this.o2.elasticity);
        let vsep_diff = new_sepVel - sepVel;

        let impulseDenom = this.o1.inv_m + this.o2.inv_m + impAug1 + impAug2;
        let impulse = (impulseDenom > 0) ?
            vsep_diff / (this.o1.inv_m + this.o2.inv_m + impAug1 + impAug2) : 0;
        let impulseVec = this.normal.mult(impulse);

        //3. Changing the velocities
        this.o1.vel = this.o1.vel.add(impulseVec.mult(this.o1.inv_m));
        this.o2.vel = this.o2.vel.add(impulseVec.mult(-this.o2.inv_m));

        this.o1.angVel += this.o1.inv_inertia * Vector.cross(collArm1, impulseVec);
        this.o2.angVel -= this.o2.inv_inertia * Vector.cross(collArm2, impulseVec); 
    }
}

class CollSat
{
    pen: number;
    axis: Vector;
    vertex: Vector;
    overlaps: boolean

    constructor(pen: number, axis: Vector, vertex: Vector, overlaps = true)
    {
        this.pen = pen;
        this.axis = axis;
        this.vertex = vertex;
        this.overlaps = overlaps;
    }
}

function round(number: number, precision: number): number
{
    let factor = 10**precision;
    return Math.round(number * factor) / factor;
}

function randInt(min: number, max: number): number
{
    return Math.floor(Math.random() * (max-min+1)) + min;
}

function testCircle(x: number, y: number, color="black"): void
{
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2*Math.PI);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.closePath();
}

// function closestPointOnLS(p: Vector, w1)
// {
//     let ballToWallStart = w1.start.subtr(p);
//     if(Vector.dot(w1.dir, ballToWallStart) > 0)
//     {
//         return w1.start;
//     }

//     let wallEndToBall = p.subtr(w1.end);
//     if(Vector.dot(w1.dir, wallEndToBall) > 0)
//     {
//         return w1.end;
//     }

//     let closestDist = Vector.dot(w1.dir, ballToWallStart);
//     let closestVect = w1.dir.mult(closestDist);
//     return w1.start.subtr(closestVect);
// }

//Separating axis theorem on two objects
//Returns with the details of the Minimum Translation Vector (or false if no collision)
function sat(o1: Shape, o2: Shape): CollSat
{
    let minOverlap: number = -Number.MAX_SAFE_INTEGER;
    let smallestAxis: Vector = new Vector(0, 0);    // dummy
    let vertexObj: Shape = new Line(0, 0, 1, 1);    // dummy

    let axes: Array<Vector> = findAxes(o1, o2);
    let proj1;
    let proj2;
    let firstShapeAxes: number = getShapeAxes(o1);

    for(let i=0; i<axes.length; i++)
    {
        proj1 = projShapeOntoAxis(axes[i], o1);
        proj2 = projShapeOntoAxis(axes[i], o2);
        let overlap = Math.min(proj1.max, proj2.max) - Math.max(proj1.min, proj2.min);
        if (overlap < 0)
        {
            return new CollSat(-Number.MAX_SAFE_INTEGER, new Vector(0, 0), new Vector(0, 0), false);
        }

        if((proj1.max > proj2.max && proj1.min < proj2.min) ||
          (proj1.max < proj2.max && proj1.min > proj2.min)){
              let mins = Math.abs(proj1.min - proj2.min);
              let maxs = Math.abs(proj1.max - proj2.max);
              if (mins < maxs){
                  overlap += mins;
              } else {
                  overlap += maxs;
                  axes[i] = axes[i].mult(-1);
              }
          }

        if (overlap < minOverlap || minOverlap == -Number.MAX_SAFE_INTEGER)
        {
            minOverlap = overlap;
            smallestAxis = axes[i];
            if (i<firstShapeAxes)
            {
                vertexObj = o2;
                if(proj1.max > proj2.max)
                {
                    smallestAxis = axes[i].mult(-1);
                }
            }
            else
            {
                vertexObj = o1;
                if(proj1.max < proj2.max)
                {
                    smallestAxis = axes[i].mult(-1);
                }
            }
        }  
    };

    let contactVertex = projShapeOntoAxis(smallestAxis, vertexObj).collVertex;
    //smallestAxis.drawVec(contactVertex.x, contactVertex.y, minOverlap, "blue");

    if(vertexObj === o2)
    {
        smallestAxis = smallestAxis.mult(-1);
    }

    return new CollSat(minOverlap, smallestAxis, contactVertex);
}

//Helping functions for the SAT below
//returns the min and max projection values of a shape onto an axis
function projShapeOntoAxis(axis: Vector, obj: Shape)
{
    setBallVerticesAlongAxis(obj, axis);
    let min = Vector.dot(axis, obj.vertex[0]);
    let max = min;
    let collVertex = obj.vertex[0];
    for(let i=0; i<obj.vertex.length; i++)
    {
        let p = Vector.dot(axis, obj.vertex[i]);
        if(p<min){
            min = p;
            collVertex = obj.vertex[i];
        } 
        if(p>max){
            max = p;
        }
    }
    return {
        min: min,
        max: max, 
        collVertex: collVertex
    }
}

//finds the projection axes for the two objects
function findAxes(o1: Shape, o2: Shape): Array<Vector>
{
    let axes: Array<Vector> = new Array<Vector>();
    if(o1 instanceof Circle && o2 instanceof Circle){
        if(o2.pos.subtr(o1.pos).mag() > 0){
            axes.push(o2.pos.subtr(o1.pos).unit());
        } else {
            axes.push(new Vector(Math.random(), Math.random()).unit());
        }        
        return axes;
    }
    if(o1 instanceof Circle){
        axes.push(closestVertexToPoint(o2, o1.pos).subtr(o1.pos).unit());
    }
    if(o1 instanceof Line){
        axes.push(o1.dir.normal());
    }   
    if (o1 instanceof Rectangle){
        axes.push(o1.dir.normal());
        axes.push(o1.dir);
    }
    if (o1 instanceof Triangle){
        axes.push(o1.vertex[1].subtr(o1.vertex[0]).normal());
        axes.push(o1.vertex[2].subtr(o1.vertex[1]).normal());
        axes.push(o1.vertex[0].subtr(o1.vertex[2]).normal());
    }
    if (o2 instanceof Circle){
        axes.push(closestVertexToPoint(o1, o2.pos).subtr(o2.pos).unit());
    }
    if (o2 instanceof Line){
        axes.push(o2.dir.normal());
    }   
    if (o2 instanceof Rectangle){
        axes.push(o2.dir.normal());
        axes.push(o2.dir);
    }
    if (o2 instanceof Triangle){
        axes.push(o2.vertex[1].subtr(o2.vertex[0]).normal());
        axes.push(o2.vertex[2].subtr(o2.vertex[1]).normal());
        axes.push(o2.vertex[0].subtr(o2.vertex[2]).normal());
    }
    return axes;
}

//iterates through an objects vertices and returns the one that is the closest to the given point
function closestVertexToPoint(obj: Shape, p: Vector): Vector
{
    let closestVertex: Vector = new Vector(0, 0);
    let minDist: number = -1;
    for(let i=0; i<obj.vertex.length; i++)
    {
        if(p.subtr(obj.vertex[i]).mag() < minDist || minDist == -1)
        {
            closestVertex = obj.vertex[i];
            minDist = p.subtr(obj.vertex[i]).mag();
        }
    }
    return closestVertex;
}

//returns the number of the axes that belong to an object
function getShapeAxes(obj: Shape): number
{
    if(obj instanceof Circle || obj instanceof Line){
        return 1;
    }
    if(obj instanceof Rectangle){
        return 2;
    }
    if(obj instanceof Triangle){
        return 3;
    }

    return 0;
}

//the ball vertices always need to be recalculated based on the current projection axis direction
function setBallVerticesAlongAxis(obj: Shape, axis: Vector): void
{
    if(obj instanceof Circle)
    {
        obj.vertex[0] = obj.pos.add(axis.unit().mult(-obj.r));
        obj.vertex[1] = obj.pos.add(axis.unit().mult(obj.r));
    }
}
//Thats it for the SAT and its support functions

//Prevents objects to float away from the canvas
function putWallsAround(x1: number, y1: number, x2: number, y2: number): void
{
    let edge1 = new Wall(x1, y1, x2, y1);
    let edge2 = new Wall(x2, y1, x2, y2);
    let edge3 = new Wall(x2, y2, x1, y2);
    let edge4 = new Wall(x1, y2, x1, y1);
}

function collide(o1: Body, o2: Body): CollSat
{
    //let bestSat = { pen: null, axis: null, vertex: null }
    let bestSat = new CollSat(-Number.MAX_SAFE_INTEGER, new Vector(0, 0), new Vector(0, 0), false);

    for(let o1comp=0; o1comp<o1.comp.length; o1comp++)
    {
        for(let o2comp=0; o2comp<o2.comp.length; o2comp++)
        {
            if((sat(o1.comp[o1comp], o2.comp[o2comp]).pen > bestSat.pen) || bestSat.pen == -Number.MAX_SAFE_INTEGER)
            {
                bestSat = sat(o1.comp[o1comp], o2.comp[o2comp]);
            }
        }
    }

    return bestSat;
}

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