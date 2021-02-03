const DEPLOY = true;
const PORT = DEPLOY ? (process.env.PORT || 13000) : 5500;

// game parameters
const NB_PLAYERS_IN_GAME = 2;
const NB_POINTS_MATCH = 10;

// pad paremeters
const PAD_ANGLE_FRICTION = 0.08;
const PAD_ANGLE_KEY_FORCE = 0.07;
const PAD_WIDTH = 25;
const PAD_LENGTH = 50;
const PAD_MASS = 10;

// ball paremeters
const BALL_TYPES = {
    BALL: 'ball',
    CAPSULE: 'capsule'
}
let BALL_RADIUS = newRandomBallRadius(BALL_TYPES.BALL);
let BALL_MASS = newRandomBallMass();
const BALL_CAPSULE_LENGTH = 60;

const WALL_TYPES = {
    WALL: 'wall',
    WALL_ARC: 'wall_arc'
}

const BODIES = [];
const COLLISIONS = [];

class Vector
{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }  
   
    set(x, y){
        this.x = x;
        this.y = y;
    }

    add(v){
        return new Vector(this.x+v.x, this.y+v.y);
    }

    subtr(v){
        return new Vector(this.x-v.x, this.y-v.y);
    }

    mag(){
        return Math.sqrt(this.x**2 + this.y**2);
    }

    mult(n){
        return new Vector(this.x*n, this.y*n);
    }

    normal(){
        return new Vector(-this.y, this.x).unit();
    }

    unit(){
        if(this.mag() === 0){
            return new Vector(0,0);
        } else {
            return new Vector(this.x/this.mag(), this.y/this.mag());
        }
    }

    drawVec(start_x, start_y, n, color){
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x + this.x * n, start_y + this.y * n);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }
    
    static dot(v1, v2){
        return v1.x*v2.x + v1.y*v2.y;
    }

    static cross(v1, v2){
        return v1.x*v2.y - v1.y*v2.x;
    }
}

class Matrix{
    constructor(rows, cols){
        this.rows = rows;
        this.cols = cols;
        this.data = [];

        for (let i = 0; i<this.rows; i++){
            this.data[i] = [];
            for (let j=0; j<this.cols; j++){
                this.data[i][j] = 0;
            }
        }
    }

    multiplyVec(vec){
        let result = new Vector(0,0);
        result.x = this.data[0][0]*vec.x + this.data[0][1]*vec.y;
        result.y = this.data[1][0]*vec.x + this.data[1][1]*vec.y;
        return result;
    }

    rotMx22(angle){
        this.data[0][0] = Math.cos(angle);
        this.data[0][1] = -Math.sin(angle);
        this.data[1][0] = Math.sin(angle);
        this.data[1][1] = Math.cos(angle);
    }
}

//classes storing the primitive shapes: Line, Circle, Rectangle, Triangle
class Line{
    constructor(x0, y0, x1, y1){
        this.vertex = [];
        this.vertex[0] = new Vector(x0, y0);
        this.vertex[1] = new Vector(x1, y1);
        this.dir = this.vertex[1].subtr(this.vertex[0]).unit();
        this.mag = this.vertex[1].subtr(this.vertex[0]).mag();
        this.pos = new Vector((this.vertex[0].x+this.vertex[1].x)/2, (this.vertex[0].y+this.vertex[1].y)/2);
    }

    draw(color){
        ctx.beginPath();
        ctx.moveTo(this.vertex[0].x, this.vertex[0].y);
        ctx.lineTo(this.vertex[1].x, this.vertex[1].y);
        if (color === ""){
            ctx.strokeStyle = "black";
            ctx.stroke();
        } else {
            ctx.strokeStyle = color;
            ctx.stroke();
        }
        ctx.strokeStyle = "";
        ctx.closePath();
    }
}

class Circle{
    constructor(x, y, r){
        this.vertex = [];
        this.pos = new Vector(x, y);
        this.r = r;
    }

    draw(color){
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2*Math.PI);
        if (color === ""){
            ctx.strokeStyle = "black";
            ctx.stroke();
        } else {
            ctx.fillStyle = color;
            ctx.fill();
        }
        ctx.fillStyle = "";
        ctx.closePath();
    }
}

class Arc{
    constructor(x, y, r, a_start, a_end){
        this.vertex = [];
        this.pos = new Vector(x, y);
        this.r = r;
        this.angle_start = a_start;
        this.angle_end = a_end;
    }

    draw(color, fill = true, image = null, angle = 0, action = false, actionImage = null)
    {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, this.angle_start, this.angle_end);
        const drawColor = (color === "") ? "black" : color;

        if (!fill)
        {
            ctx.strokeStyle = drawColor;
            ctx.stroke();
        }
        else
        {
            ctx.fillStyle = drawColor;
            ctx.fill();
        }

        ctx.fillStyle = "";
        ctx.closePath();
    }
}

class Rectangle{
    constructor(x1, y1, x2, y2, w){
        this.vertex = [];
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

    draw(color){
        ctx.beginPath();
        ctx.moveTo(this.vertex[0].x, this.vertex[0].y);
        ctx.lineTo(this.vertex[1].x, this.vertex[1].y);
        ctx.lineTo(this.vertex[2].x, this.vertex[2].y);
        ctx.lineTo(this.vertex[3].x, this.vertex[3].y);
        ctx.lineTo(this.vertex[0].x, this.vertex[0].y);
        if (color === ""){
            ctx.strokeStyle = "black";
            ctx.stroke();
        } else {
            ctx.fillStyle = color;
            ctx.fill();
        }
        ctx.fillStyle = "";
        ctx.closePath();
    }

    getVertices(angle){
        this.rotMat.rotMx22(angle);
        this.dir = this.rotMat.multiplyVec(this.refDir);
        this.vertex[0] = this.pos.add(this.dir.mult(-this.length/2)).add(this.dir.normal().mult(this.width/2));
        this.vertex[1] = this.pos.add(this.dir.mult(-this.length/2)).add(this.dir.normal().mult(-this.width/2));
        this.vertex[2] = this.pos.add(this.dir.mult(this.length/2)).add(this.dir.normal().mult(-this.width/2));
        this.vertex[3] = this.pos.add(this.dir.mult(this.length/2)).add(this.dir.normal().mult(this.width/2));
    }
}

class Triangle{
    constructor(x1, y1, x2, y2, x3, y3){
        this.vertex = [];
        this.vertex[0] = new Vector(x1, y1);
        this.vertex[1] = new Vector(x2, y2);
        this.vertex[2] = new Vector(x3, y3);
        this.pos = new Vector((this.vertex[0].x+this.vertex[1].x+this.vertex[2].x)/3, (this.vertex[0].y+this.vertex[1].y+this.vertex[2].y)/3);
        this.dir = this.vertex[0].subtr(this.pos).unit();
        this.refDir = this.dir;
        this.refDiam = [];
        this.refDiam[0] = this.vertex[0].subtr(this.pos);
        this.refDiam[1] = this.vertex[1].subtr(this.pos);
        this.refDiam[2] = this.vertex[2].subtr(this.pos);
        this.angle = 0;
        this.rotMat = new Matrix(2,2);
    }

    draw(color){
        ctx.beginPath();
        ctx.moveTo(this.vertex[0].x, this.vertex[0].y);
        ctx.lineTo(this.vertex[1].x, this.vertex[1].y);
        ctx.lineTo(this.vertex[2].x, this.vertex[2].y);
        ctx.lineTo(this.vertex[0].x, this.vertex[0].y);
        if (color === ""){
            ctx.strokeStyle = "black";
            ctx.stroke();
        } else {
            ctx.fillStyle = color;
            ctx.fill();
        }
        ctx.fillStyle = "";
        ctx.closePath();
    }

    getVertices(angle){
        this.rotMat.rotMx22(angle);
        this.dir = this.rotMat.multiplyVec(this.refDir);
        this.vertex[0] = this.pos.add(this.rotMat.multiplyVec(this.refDiam[0]));
        this.vertex[1] = this.pos.add(this.rotMat.multiplyVec(this.refDiam[1]));
        this.vertex[2] = this.pos.add(this.rotMat.multiplyVec(this.refDiam[2]));
    }
}

//Parent class of the bodies (Ball, Capsule, Box, Star, Wall)
class Body{
    constructor(x, y){
        this.comp = [];
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
        this.collides = true;

        BODIES.push(this);
    }

    render(){
        for (let i in this.comp){
            this.comp[i].draw(this.color);
        }
    }
    reposition(){
        this.acc = this.acc.unit().mult(this.keyForce);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.mult(1-this.friction);
        if (this.vel.mag() > this.maxSpeed && this.maxSpeed !== 0){
            this.vel = this.vel.unit().mult(this.maxSpeed);
        }
        this.angVel *= (1-this.angFriction);
    }
    keyControl(){}
    remove(){
        if (BODIES.indexOf(this) !== -1){
            BODIES.splice(BODIES.indexOf(this), 1);
        }
    }

    setMass(m)
    {
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

    setCollide(value)
    {
        this.collides = value;
    }
}

class Ball extends Body{
    constructor(x, y, r, m){
        super();
        this.pos = new Vector(x, y);
        this.comp = [new Circle(x, y, r)];
        this.setMass(m);
    }

    setPosition(x, y, a = this.angle){
        this.pos.set(x, y);
        this.comp[0].pos = this.pos;
    }

    setRadius(r)
    {
        this.comp[0].r = r;
    }

    reposition(){
        super.reposition();
        this.setPosition(this.pos.add(this.vel).x, this.pos.add(this.vel).y);
    }

    keyControl(){
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

class Capsule extends Body{
    constructor(x1, y1, x2, y2, r1, r2, m){
        super();
        this.comp = [new Circle(x1, y1, r1), new Circle(x2, y2, r2)];
        let recV1 = this.comp[1].pos.add(this.comp[1].pos.subtr(this.comp[0].pos).unit().normal().mult(r1));
        let recV2 = this.comp[0].pos.add(this.comp[1].pos.subtr(this.comp[0].pos).unit().normal().mult(r1));
        this.comp.unshift(new Rectangle(recV1.x, recV1.y, recV2.x, recV2.y, 2*r1));
        this.pos = this.comp[0].pos;
        this.setMass(m);
    }

    keyControl(){
        if(this.up){
            this.acc = this.comp[0].dir.mult(-this.keyForce);
        }
        if(this.down){
            this.acc = this.comp[0].dir.mult(this.keyForce);
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

    setPosition(x, y, a = this.angle){
        this.pos.set(x, y);
        this.angle = a;
        this.comp[0].pos = this.pos;
        this.comp[0].getVertices(this.angle + this.angVel);
        this.comp[1].pos = this.comp[0].pos.add(this.comp[0].dir.mult(-this.comp[0].length/2));
        this.comp[2].pos = this.comp[0].pos.add(this.comp[0].dir.mult(this.comp[0].length/2));
        this.angle += this.angVel;
    }

    setRadius(r)
    {
        for (let comp of this.comp)
        {
            if (comp instanceof Circle)
                comp.r = r;
            else if (comp instanceof Rectangle)
                comp.width = 2*r;
        }
    }

    setMass(m)
    {
        super.setMass(m);
        this.inertia = this.m * ((2*this.comp[0].width)**2 +(this.comp[0].length+2*this.comp[0].width)**2) / 12;
        if (this.m === 0){
            this.inv_inertia = 0;
        } else {
            this.inv_inertia = 1 / this.inertia;
        }
    }

    reposition(){
        super.reposition();
        this.setPosition(this.pos.add(this.vel).x, this.pos.add(this.vel).y);
    }
}

class Box extends Body{
    constructor(x1, y1, x2, y2, w, m){
        super();
        this.comp = [new Rectangle(x1, y1, x2, y2, w)];
        this.pos = this.comp[0].pos;
        this.setMass(m);
    }

    keyControl(){
        if(this.up){
            this.acc = this.comp[0].dir.mult(-this.keyForce);;
        }
        if(this.down){
            this.acc = this.comp[0].dir.mult(this.keyForce);;
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

    setPosition(x, y, a = this.angle){
        this.pos.set(x, y);
        this.angle = a;
        this.comp[0].pos = this.pos;
        this.comp[0].getVertices(this.angle + this.angVel);
        this.angle += this.angVel;
    }

    setMass(m)
    {
        super.setMass(m);
        this.inertia = this.m * (this.comp[0].width**2 +this.comp[0].length**2) / 12;
        if (this.m === 0){
            this.inv_inertia = 0;
        } else {
            this.inv_inertia = 1 / this.inertia;
        }
    }

    reposition(){
        super.reposition();
        this.setPosition(this.pos.add(this.vel).x, this.pos.add(this.vel).y);
    }
}

class Star6 extends Body{
    constructor(x1, y1, r, m){
        super();
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
        
        this.setMass(m);
    }

    keyControl(){
        if(this.up){
            this.acc = this.comp[0].dir.mult(-this.keyForce);
        }
        if(this.down){
            this.acc = this.comp[0].dir.mult(this.keyForce);
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

    setPosition(x, y, a = this.angle){
        this.pos.set(x, y);
        this.angle = a;
        this.comp[0].pos = this.pos;
        this.comp[1].pos = this.pos;
        this.comp[0].getVertices(this.angle + this.angVel);
        this.comp[1].getVertices(this.angle + this.angVel);
        this.angle += this.angVel;
    }

    setRadius(r)
    {
        // TODO
    }

    setMass(m)
    {
        super.setMass(m);
        this.inertia = this.m * ((2*this.r)**2) / 12;
        if (this.m === 0){
            this.inv_inertia = 0;
        } else {
            this.inv_inertia = 1 / this.inertia;
        }
    }

    reposition(){
        super.reposition();
        this.setPosition(this.pos.add(this.vel).x, this.pos.add(this.vel).y);
   }
}

class Wall extends Body{
    constructor(x1, y1, x2, y2){
        super();
        this.comp = [new Line(x1, y1, x2, y2)];
        this.pos = new Vector((x1+x2)/2, (y1+y2)/2);
    }
}

class WallArc extends Body
{
    constructor(x, y, r, a_start, a_end)
    {
        super();
        //this.comp = [new Arc(x, y, r, a_start, a_end)]; // causes error for collisions
        this.comp = [new Circle(x, y, r)];
        this.pos = new Vector(x, y);

        this.a_start = a_start;
        this.a_end = a_end;
    }
}

class LineMark extends Body{
    constructor(x1, y1, x2, y2, color = "White"){
        super();
        this.comp = [new Line(x1, y1, x2, y2)];
        this.pos = new Vector((x1+x2)/2, (y1+y2)/2);

        this.color = color;
        this.collides = false;
    }
}

//Collision manifold, consisting the data for collision handling
//Manifolds are collected in an array for every frame
class CollData{
    constructor(o1, o2, normal, pen, cp){
        this.o1 = o1;
        this.o2 = o2;
        this.normal = normal;
        this.pen = pen;
        this.cp = cp;
    }

    penRes(){
        let penResolution = this.normal.mult(this.pen / (this.o1.inv_m + this.o2.inv_m));
        this.o1.pos = this.o1.pos.add(penResolution.mult(this.o1.inv_m));
        this.o2.pos = this.o2.pos.add(penResolution.mult(-this.o2.inv_m));
    }

    collRes(){
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

        let impulse = vsep_diff / (this.o1.inv_m + this.o2.inv_m + impAug1 + impAug2);
        let impulseVec = this.normal.mult(impulse);

        //3. Changing the velocities
        this.o1.vel = this.o1.vel.add(impulseVec.mult(this.o1.inv_m));
        this.o2.vel = this.o2.vel.add(impulseVec.mult(-this.o2.inv_m));

        this.o1.angVel += this.o1.inv_inertia * Vector.cross(collArm1, impulseVec);
        this.o2.angVel -= this.o2.inv_inertia * Vector.cross(collArm2, impulseVec); 
    }
}

function round(number, precision){
    let factor = 10**precision;
    return Math.round(number * factor) / factor;
}

function randInt(min, max){
    return Math.floor(Math.random() * (max-min+1)) + min;
}

function testCircle(x, y, color="black"){
    ctx.beginPath();
    ctx.arc(x, y, 10, 0, 2*Math.PI);
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.closePath();
}

function closestPointOnLS(p, w1){
    let ballToWallStart = w1.start.subtr(p);
    if(Vector.dot(w1.dir, ballToWallStart) > 0){
        return w1.start;
    }

    let wallEndToBall = p.subtr(w1.end);
    if(Vector.dot(w1.dir, wallEndToBall) > 0){
        return w1.end;
    }

    let closestDist = Vector.dot(w1.dir, ballToWallStart);
    let closestVect = w1.dir.mult(closestDist);
    return w1.start.subtr(closestVect);
}

//Separating axis theorem on two objects
//Returns with the details of the Minimum Translation Vector (or false if no collision)
function sat(o1, o2){
    let minOverlap = null;
    let smallestAxis;
    let vertexObj;

    let axes = findAxes(o1, o2);
    let proj1, proj2 = 0;
    let firstShapeAxes = getShapeAxes(o1);

    for(let i=0; i<axes.length; i++){
        proj1 = projShapeOntoAxis(axes[i], o1);
        proj2 = projShapeOntoAxis(axes[i], o2);
        let overlap = Math.min(proj1.max, proj2.max) - Math.max(proj1.min, proj2.min);
        if (overlap < 0){
            return false;
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

        if (overlap < minOverlap || minOverlap === null){
            minOverlap = overlap;
            smallestAxis = axes[i];
            if (i<firstShapeAxes){
                vertexObj = o2;
                if(proj1.max > proj2.max){
                    smallestAxis = axes[i].mult(-1);
                }
            } else {
                vertexObj = o1;
                if(proj1.max < proj2.max){
                    smallestAxis = axes[i].mult(-1);
                }
            }
        }  
    };

    let contactVertex = projShapeOntoAxis(smallestAxis, vertexObj).collVertex;
    //smallestAxis.drawVec(contactVertex.x, contactVertex.y, minOverlap, "blue");

    if(vertexObj === o2){
        smallestAxis = smallestAxis.mult(-1);
    }

    return {
        pen: minOverlap,
        axis: smallestAxis,
        vertex: contactVertex
    }
}

//Helping functions for the SAT below
//returns the min and max projection values of a shape onto an axis
function projShapeOntoAxis(axis, obj){
    setBallVerticesAlongAxis(obj, axis);
    let min = Vector.dot(axis, obj.vertex[0]);
    let max = min;
    let collVertex = obj.vertex[0];
    for(let i=0; i<obj.vertex.length; i++){
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
function findAxes(o1, o2){
    let axes = [];
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
function closestVertexToPoint(obj, p){
    let closestVertex;
    let minDist = null;
    for(let i=0; i<obj.vertex.length; i++){
        if(p.subtr(obj.vertex[i]).mag() < minDist || minDist === null){
            closestVertex = obj.vertex[i];
            minDist = p.subtr(obj.vertex[i]).mag();
        }
    }
    return closestVertex;
}

//returns the number of the axes that belong to an object
function getShapeAxes(obj){
    if(obj instanceof Circle || obj instanceof Line){
        return 1;
    }
    if(obj instanceof Rectangle){
        return 2;
    }
    if(obj instanceof Triangle){
        return 3;
    }
}

//the ball vertices always need to be recalculated based on the current projection axis direction
function setBallVerticesAlongAxis(obj, axis){
    if(obj instanceof Circle){
        obj.vertex[0] = obj.pos.add(axis.unit().mult(-obj.r));
        obj.vertex[1] = obj.pos.add(axis.unit().mult(obj.r));
    }
}
//Thats it for the SAT and its support functions

//Prevents objects to float away from the canvas
function putWallsAround(x1, y1, x2, y2){
    let edge1 = new Wall(x1, y1, x2, y1);
    let edge2 = new Wall(x2, y1, x2, y2);
    let edge3 = new Wall(x2, y2, x1, y2);
    let edge4 = new Wall(x1, y2, x1, y1);
}

function collide(o1, o2)
{
    if (!o1.collides || !o2.collides)
        return false;

    let bestSat = {
        pen: null,
        axis: null,
        vertex: null
    }
    for(let o1comp=0; o1comp<o1.comp.length; o1comp++){
        for(let o2comp=0; o2comp<o2.comp.length; o2comp++){
            if(sat(o1.comp[o1comp], o2.comp[o2comp]).pen > bestSat.pen){
                bestSat = sat(o1.comp[o1comp], o2.comp[o2comp]);
            }
        }
    }
    if (bestSat.pen !== null){
        return bestSat;
    } else {
        return false;
    }
}

function userInteraction(){
    BODIES.forEach((b) => {
        b.keyControl();
    })
}

function gameLogic(){}

function physicsLoop(timestamp) {
    COLLISIONS.length = 0;
    
    BODIES.forEach((b) => {
        b.reposition();
    })
    
    BODIES.forEach((b, index) => {
        for(let bodyPair = index+1; bodyPair < BODIES.length; bodyPair++){
           if((BODIES[index].layer === BODIES[bodyPair].layer ||
               BODIES[index].layer === 0 || BODIES[bodyPair].layer === 0) && 
               collide(BODIES[index], BODIES[bodyPair])){
                    let bestSat = collide(BODIES[index], BODIES[bodyPair]);
                    COLLISIONS.push(new CollData(BODIES[index], BODIES[bodyPair], bestSat.axis, bestSat.pen, bestSat.vertex));
           }
        }
    });

    COLLISIONS.forEach((c) => {
        c.penRes();
        c.collRes();
    });
}

function renderLoop(){
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    BODIES.forEach((b) => {
        b.render();
    })
}

function mainLoop(){
    userInteraction();
    physicsLoop();
    renderLoop();
    gameLogic();
    requestAnimationFrame(mainLoop);
}

function renderOnly(){
    renderLoop();
    requestAnimationFrame(renderOnly);
}

//************************* END OF PHYSICS ENGINE ***/

const express = require('express');
const app = express();
let io;
if (DEPLOY)
{
    app.use(express.static('.'));
    http = require('http').Server(app);
    io = require('socket.io')(http);
    
    app.get('/', (req, res) => res.sendFile(__dirname + '../index.html'));
    
    http.listen(PORT, function(){
        console.log(`listening on port ${PORT}...`);
    })
}
else
{
    io = require('socket.io')(PORT)
    app.get('/', (req, res) => res.send('Hello World!'))
}

let stadium = {};
let playerReg = {};
let serverBalls = {};
let football = {};
let obstacles = {};
let clientNo = 0;
let gameIsOn = {};
let rooms = {};

io.on('connection', connected);
setInterval(serverLoop, 1000/60);

function connected(socket)
{
    const room = 1;
    const nbPlayersReady = getNbPlayersReadyInRoom(room)   
    io.emit('newConnection', {nbPlayersReady: nbPlayersReady,
        nbPlayersInGame : NB_PLAYERS_IN_GAME, nbPointsMatch: NB_POINTS_MATCH});

    // disconnection
    socket.on('disconnect', function(){
        if(serverBalls[socket.id] !== undefined)
        {
            const room = serverBalls[socket.id].layer;

            serverBalls[socket.id].remove();
            io.to(serverBalls[socket.id].layer).emit('deletePlayer', playerReg[socket.id]);
            delete serverBalls[socket.id];
            delete playerReg[socket.id];

            let nbPlayersReadyInRoom = 0;
            if (rooms.hasOwnProperty(room))
            {
                // delete player in room
                deletePlayerInRoom(room, socket.id);
                nbPlayersReadyInRoom = getNbPlayersReadyInRoom(room);                

                // if no players left, delete complete room data
                if (nbPlayersReadyInRoom == 0)
                {                                 
                    delete rooms[room];

                    if (football[room])
                    {
                        football[room].remove();
                        delete football[room];
                    }

                    if (stadium[room])
                    {
                        for (let wall of stadium[room])
                            wall.remove();
                        delete stadium[room];
                    }

                    if (obstacles[room])
                    {
                        for (let obstacle of obstacles[room])
                            obstacle.remove();
                        delete obstacles[room];
                    }

                    if (gameIsOn.hasOwnProperty(room))
                        delete gameIsOn[room];
                }
            }

            // update nb. players ready
            io.emit('updatePlayersReady', nbPlayersReadyInRoom);
        }
        console.log(playerReg);
        console.log(`Number of players: ${Object.keys(playerReg).length}`)
        console.log(`Number of balls: ${Object.keys(football).length}`)
        //console.log(`Number of BODIES: ${BODIES.length-12}`);
        console.log(`Joined players ever: ${clientNo}`)
        io.emit('updateConnections', playerReg);
    })

    // user inputs
    socket.on('userCommands', data => {
        if (!serverBalls.hasOwnProperty(socket.id))
            return;

        serverBalls[socket.id].left = data.left;
        serverBalls[socket.id].up = data.up;
        serverBalls[socket.id].right = data.right;
        serverBalls[socket.id].down = data.down;
        serverBalls[socket.id].action = data.action;
    })

    // player enters
    socket.on('clientName', (data, response) => {

        // disabled: reqires to handle bodies / collisions per room
        //const room = parseInt(data.room);
        const room = 1;
        const clientNoInRoom = createNextPlayerInRoom(room, socket.id);
        if (clientNoInRoom < 0)
        {
            response({
                error: "Maximum number of players reached, please wait..."
              });
            return;
        }

        //rooms[room].push(socket.id);
        //console.log(rooms);
        
        clientNo++;
        socket.join(room);
        console.log(`New player no.: ${clientNo}, room no.: ${room}`);

        const yPadDiff = (NB_PLAYERS_IN_GAME > 2) ? 80 : 0;

        // initialize player pad
        serverBalls[socket.id] = new Capsule(320 + PAD_LENGTH/2, 270 - yPadDiff/2, 320 - PAD_LENGTH/2, 270 - yPadDiff/2, PAD_WIDTH, 0, PAD_MASS);
        serverBalls[socket.id].no = clientNoInRoom;
        serverBalls[socket.id].layer = room;
        initPlayerPosition(socket.id);
        playerReg[socket.id] = {id: socket.id, x: serverBalls[socket.id].pos.x, y: serverBalls[socket.id].pos.y, room: room, no: clientNoInRoom};

        // initialize game if all players present
        if (clientNoInRoom == NB_PLAYERS_IN_GAME)
        {
            // stadium
            if (!stadium.hasOwnProperty(room))
            {
                newRandomStadium(room);
                stadium[room].layer = room;
            }

            // ball
            if (!football.hasOwnProperty(room))
            {
                football[room] = new Ball(320, 270, BALL_RADIUS, BALL_MASS);
                football[room].layer = room;
                io.to(room).emit('updateFootball', {x: football[room].pos.x, y: football[room].pos.y,
                    r: BALL_RADIUS, m: BALL_MASS, angle: football[room].angle});
            }
            
            // obstacles: set dummy positions
            if (!obstacles.hasOwnProperty(room))
            {
                obstacles[room] = [];
                for (let i = 0; i < 4; i++)
                    obstacles[room].push(new Star6(-100, -100, 15, 0));
                obstacles[room].layer = room;
            }
        }

        // send current nb. of players ready
        io.emit('updatePlayersReady', clientNoInRoom);

        for (let id in serverBalls)
        {
            io.to(serverBalls[id].layer).emit('updateConnections', playerReg[id]);
        }

        // if game was already on, re-sent scores, stadium and obstacles data
        if (gameIsOn.hasOwnProperty(room) && gameIsOn[room] === true)
        {
            // TODO: refactor scores as own entry
            // reset all scores
            for(let id in serverBalls){
                if(serverBalls[id].layer == room)
                    io.to(room).emit('updateScore', {id: id, score: 0});
            }

            sendStadium(room);
            sendObstacles(room);
        }

        serverBalls[socket.id].name = data.name;
        //console.log(`${data} is in room no.${serverBalls[socket.id].layer}`);
        console.log(`${data.name} is in room no. ${room}`);
        if (playersReadyInRoom(serverBalls[socket.id].layer) === NB_PLAYERS_IN_GAME)
        {
            for (let id in serverBalls){
                if(serverBalls[id].layer === serverBalls[socket.id].layer){
                    io.to(serverBalls[id].layer).emit('playerName', {id: id, name: serverBalls[id].name});
                }
            }
            gameIsOn[serverBalls[socket.id].layer] = true;
        } else {
            gameIsOn[serverBalls[socket.id].layer] = false;
        }

        response({status: "ok"});
    })
}

function createNextPlayerInRoom(room, socketID)
{
    if (!rooms.hasOwnProperty(room))
    {
        // create new room
        rooms[room] = {};
        for (let i = 1; i <= NB_PLAYERS_IN_GAME; i++)
            rooms[room][i] = "";
    }
    else if (getNbPlayersReadyInRoom(room) >= NB_PLAYERS_IN_GAME)
    {
        // room full
        return -1;
    }

    let playerNoNext = 0;
    for (const [playerNo, playersID] of Object.entries(rooms[room]))
    {
        playerNoNext++;
        if (playersID == "")
        {
            rooms[room][playerNo] = socketID;
            break;
        }
    }

    return playerNoNext;
}

function deletePlayerInRoom(room, socketID)
{
    if (!rooms.hasOwnProperty(room))
        return;

    for (const [playerNo, playerID] of Object.entries(rooms[room]))
        if (playerID == socketID)
            rooms[room][playerNo] = "";
}

function getNbPlayersReadyInRoom(room)
{
    if (!rooms.hasOwnProperty(room))
        return 0;
    
    return (Object.values(rooms[room]).filter((playersID) => (playersID != ""))).length;
}

function serverLoop(){
    userInteraction();
    physicsLoop();
    for (const room of Object.keys(rooms))
    {
        if (gameIsOn[room] === true)
        {
            gameLogic(room);
            for (const [playerNo, id] of Object.entries(rooms[room]))
            {
                if (id != "" && serverBalls[id] && serverBalls[id].layer == room)
                {
                    io.to(room).emit('updatePlayersPositions', {
                        id: id,
                        x: serverBalls[id].pos.x,
                        y: serverBalls[id].pos.y,
                        angle: serverBalls[id].angle,
                        up: serverBalls[id].up
                    });
                }
            }

            io.to(room).emit('updateFootball', {
                x: football[room].pos.x,
                y: football[room].pos.y,
                r: BALL_RADIUS,
                angle: football[room].angle
            });
        } else {
            //console.log("waiting for n players...");
        }
    }
}

function gameLogic(room){
    if(football[room].pos.x < 45 || football[room].pos.x > 595){
        scoring(room);
    }
    for(let id in serverBalls){
        if(serverBalls[id].score === NB_POINTS_MATCH && serverBalls[id].layer == room){
            gameOver(room);
        }
    }
}

function gameOver(room){
    roundSetup(room);
    io.to(room).emit('scoring', null);
    setTimeout(() => {
        for(let id in serverBalls){
            if(serverBalls[id].layer == room){
                serverBalls[id].score = 0;
            }
        }
    }, 2000);
}

function scoring(room){
    let scorerId;
    console.log('Score in room', room);
    
    if(football[room].pos.x < 45)
    {
        for(let id in serverBalls)
        {
            const rightTeamPlayerNo = 2 * Math.floor(NB_PLAYERS_IN_GAME / 2);
            if (serverBalls[id].no == rightTeamPlayerNo && serverBalls[id].layer == room)
            {
                serverBalls[id].score++;
                scorerId = id;
                console.log("score for team 2!");
            }
        }
    }
    if(football[room].pos.x > 595)
    {
        for(let id in serverBalls){
            if (serverBalls[id].no === 1 && serverBalls[id].layer == room)
            {
                serverBalls[id].score++;
                scorerId = id;
                console.log("score for team 1!");
            }
        }
    }
    roundSetup(room);
    io.to(room).emit('scoring', scorerId);
}

function roundSetup(room)
{
    // reset players position
    for(let id in serverBalls)      
        if (serverBalls[id].layer == room && isNumeric(serverBalls[id].no))
            initPlayerPosition(id);

    // generate new random ball
    football[room].remove();
    football[room] = newRandomBall();
    io.to(room).emit('newFootball', {
        type: (football[room] instanceof Capsule) ? BALL_TYPES.CAPSULE : BALL_TYPES.ball,
        x: football[room].pos.x,
        y: football[room].pos.y,
        r: BALL_RADIUS,
        m: BALL_MASS
    });

    // generate new stadium
    for (let wall of stadium[room])
        wall.remove();
    newRandomStadium(room);

    // generate new obstacles

    for (let obstacle of obstacles[room])
        obstacle.remove();
    obstacles[room] = newRandomObstacles();

    sendObstacles(room);
}

function sendObstacles(room)
{
    if (!obstacles.hasOwnProperty(room))
        return;

    let obstaclesPos = [];
    for (const obstacle of obstacles[room])
        obstaclesPos.push(new Vector(obstacle.pos.x, obstacle.pos.y));

    io.to(room).emit('newObstacles', {positions : obstaclesPos, r: obstacles[room][0].r});
}

function initPlayerPosition(id)
{
    const yPadDiff = 80;

    serverBalls[id].vel.set(0, 0);
    serverBalls[id].angVel = 0;
    serverBalls[id].angFriction = PAD_ANGLE_FRICTION;
    serverBalls[id].angKeyForce = PAD_ANGLE_KEY_FORCE;
    serverBalls[id].maxSpeed = 4;

    const teamNo = (serverBalls[id].no % 2 == 0) ? 2 : 1;
    const nbPlayersInTeam = (teamNo == 1) ?
        Math.ceil(NB_PLAYERS_IN_GAME / 2) :
        Math.floor(NB_PLAYERS_IN_GAME / 2);
    const noPlayerInTeam = Math.floor((serverBalls[id].no - 1) / 2) + 1;

    const xStart = (teamNo == 1) ? 115 : 525;
    let yMin = (nbPlayersInTeam % 2 == 0) ?
        270 - (Math.floor(nbPlayersInTeam/2) - 0.5)*yPadDiff :
        270 - Math.floor(nbPlayersInTeam/2)*yPadDiff;
    const yStart = yMin + (noPlayerInTeam - 1)*yPadDiff;
    //console.log('PLAYER ', serverBalls[id].no, noPlayerInTeam, yMin, xStart, yStart);

    const orientation = (teamNo == 1) ? Math.PI : 0;
    
    serverBalls[id].setPosition(xStart, yStart, orientation);
}

function newRandomStadium(room)
{
    stadium[room] = [];

    // WARNING: WALLS MUST NOT INTERSECT WITH EACH OTHERS!!

    const stadiumTypeNumber = 1 + Math.floor(4*Math.random());
    switch(stadiumTypeNumber)
    {
        case 2:
            // Top walls
            stadium[room].push(new Wall(60, 80, 280, 80));
            stadium[room].push(new Wall(360, 80, 580, 80));
            stadium[room].push(new WallArc(320, 80, 40, 0, Math.PI));
            stadium[room].push(new Wall(60, 80, 60, 140));
            stadium[room].push(new Wall(580, 80, 580, 140));

            // bottom walls
            stadium[room].push(new Wall(60, 460, 280, 460));
            stadium[room].push(new Wall(360, 460, 580, 460));
            stadium[room].push(new WallArc(320, 460, 40, Math.PI, 2*Math.PI));
            stadium[room].push(new Wall(60, 460, 60, 400));
            stadium[room].push(new Wall(580, 460, 580, 400));

            // left goal
            stadium[room].push(new WallArc(0, 140, 60, 0, Math.PI/2));
            stadium[room].push(new WallArc(0, 400, 60, 3/2*Math.PI, 2*Math.PI));

            // right goal
            stadium[room].push(new WallArc(640, 140, 60, Math.PI/2, Math.PI));
            stadium[room].push(new WallArc(640, 400, 60, Math.PI, 3/2*Math.PI));

            // goals borders
            stadium[room].push(new Wall(0, 340, 0, 200));
            stadium[room].push(new Wall(640, 340, 640, 200));
            break;

        case 3:
            // Top walls
            stadium[room].push(new Wall(0, 80, 100, 80));
            stadium[room].push(new Wall(100, 80, 140, 120));
            stadium[room].push(new Wall(140, 120, 240, 120));
            stadium[room].push(new Wall(240, 120, 280, 80));
            stadium[room].push(new Wall(280, 80, 360, 80));
            stadium[room].push(new Wall(360, 80, 400, 120));
            stadium[room].push(new Wall(400, 120, 500, 120));
            stadium[room].push(new Wall(500, 120, 540, 80));
            stadium[room].push(new Wall(540, 80, 640, 80));

            // Bottom walls
            stadium[room].push(new Wall(0, 460, 100, 460));
            stadium[room].push(new Wall(100, 460, 140, 420));
            stadium[room].push(new Wall(140, 420, 240, 420));
            stadium[room].push(new Wall(240, 420, 280, 460));
            stadium[room].push(new Wall(280, 460, 360, 460));
            stadium[room].push(new Wall(360, 460, 400, 420));
            stadium[room].push(new Wall(400, 420, 500, 420));
            stadium[room].push(new Wall(500, 420, 540, 460));
            stadium[room].push(new Wall(540, 460, 640, 460));

            // left walls
            stadium[room].push(new Wall(0, 200, 70, 260));
            stadium[room].push(new Wall(70, 260, 70, 280));
            stadium[room].push(new Wall(0, 340, 70, 280));

            // right walls
            stadium[room].push(new Wall(640, 200, 570, 260));
            stadium[room].push(new Wall(570, 260, 570, 280));
            stadium[room].push(new Wall(640, 340, 570, 280));

            // goals borders
            stadium[room].push(new Wall(0, 80, 0, 200));
            stadium[room].push(new Wall(0, 460, 0, 340));
            stadium[room].push(new Wall(640, 80, 640, 200));
            stadium[room].push(new Wall(640, 460, 640, 340));
            break;

        case 4:
            // Top walls
            stadium[room].push(new Wall(0, 80, 100, 80));
            stadium[room].push(new WallArc(140, 80, 40, Math.PI/2, Math.PI));
            stadium[room].push(new Wall(140, 120, 240, 120));
            stadium[room].push(new WallArc(240, 80, 40, 0, Math.PI/2));
            stadium[room].push(new Wall(280, 80, 360, 80));
            stadium[room].push(new WallArc(400, 80, 40, Math.PI/2, Math.PI));
            stadium[room].push(new Wall(400, 120, 500, 120));
            stadium[room].push(new WallArc(500, 80, 40, 0, Math.PI/2));
            stadium[room].push(new Wall(540, 80, 640, 80));

            // Bottom walls
            stadium[room].push(new Wall(0, 460, 100, 460));
            stadium[room].push(new WallArc(140, 460, 40, Math.PI, 3/2*Math.PI));
            stadium[room].push(new Wall(140, 420, 240, 420));
            stadium[room].push(new WallArc(240, 460, 40, 3/2*Math.PI, 2*Math.PI));
            stadium[room].push(new Wall(280, 460, 360, 460));
            stadium[room].push(new WallArc(400, 460, 40, Math.PI, 3/2*Math.PI));
            stadium[room].push(new Wall(400, 420, 500, 420));
            stadium[room].push(new WallArc(500, 460, 40, 3/2*Math.PI, 2*Math.PI));
            stadium[room].push(new Wall(540, 460, 640, 460));

            // left wall
            stadium[room].push(new WallArc(0, 270, 70, 3/2*Math.PI, 5/2*Math.PI));

            // right wall
            stadium[room].push(new WallArc(640, 270, 70, Math.PI/2, 3/2*Math.PI));

            // goals borders
            stadium[room].push(new Wall(0, 80, 0, 200));
            stadium[room].push(new Wall(0, 460, 0, 340));
            stadium[room].push(new Wall(640, 80, 640, 200));
            stadium[room].push(new Wall(640, 460, 640, 340));
            break;

        default:
            // Top / bottom walls
            stadium[room].push(new Wall(60, 80, 580, 80));
            stadium[room].push(new Wall(60, 460, 580, 460));

            stadium[room].push(new Wall(60, 80, 60, 180));
            stadium[room].push(new Wall(60, 460, 60, 360));
            stadium[room].push(new Wall(580, 80, 580, 180));
            stadium[room].push(new Wall(580, 460, 580, 360));

            stadium[room].push(new Wall(50, 360, 10, 360));
            stadium[room].push(new Wall(10, 180, 50, 180));
            stadium[room].push(new Wall(590, 360, 630, 360));
            stadium[room].push(new Wall(630, 180, 590, 180));

            // goals borders
            stadium[room].push(new Wall(0, 360, 0, 180));
            stadium[room].push(new Wall(640, 360, 640, 180));
            break;
    }

    sendStadium(room);
}

function sendStadium(room)
{
    if (!stadium.hasOwnProperty(room))
        return;

    // compute positions and emit to clients
    let stadiumParams = [];
    for (const wall of stadium[room])
    {
        const wallType = (wall instanceof Wall) ? WALL_TYPES.WALL : WALL_TYPES.WALL_ARC;
        switch(wallType)
        {
            case WALL_TYPES.WALL:
                stadiumParams.push([wallType, wall.comp[0].vertex[0], wall.comp[0].vertex[1]]);
                break;
            
            case WALL_TYPES.WALL_ARC:
                stadiumParams.push([wallType, wall.pos, wall.comp[0].r, wall.a_start, wall.a_end]);
                break;
        }
    }

    io.to(room).emit('newStadium', {walls : stadiumParams});
}

function playersReadyInRoom(room)
{
    let pno = 0;
    for (let id in serverBalls)
    {
        if(serverBalls[id].layer == room && serverBalls[id].name){
            pno++;
        }
    }

    // send game parameters
    io.to(room).emit('setNbPointsMatch', NB_POINTS_MATCH);
    io.to(room).emit('setBallRadius', BALL_RADIUS);

    return pno;
}

function newRandomBall()
{
    const ballTypeNumber = Math.floor(3*Math.random());
    const ballType = (ballTypeNumber == 2) ? BALL_TYPES.CAPSULE : BALL_TYPES.BALL;

    BALL_RADIUS = newRandomBallRadius(ballType)
    BALL_MASS = newRandomBallMass();

    let ball;
    switch(ballType)
    {
        case BALL_TYPES.BALL:
            ball = new Ball(320, 270, BALL_RADIUS, BALL_MASS);
            break;
        
        case BALL_TYPES.CAPSULE:
            ball = new Capsule(
                320 - BALL_CAPSULE_LENGTH/2, 270,
                320 + BALL_CAPSULE_LENGTH/2, 270,
                BALL_RADIUS, BALL_RADIUS, BALL_MASS
            );
            break;
    }

    ball.pos.set(320, 270);
    ball.vel.set(0, 0);

    return ball;
}

function newRandomBallRadius(ballType)
{
    let BALL_RADIUS_MIN = 10;
    let BALL_RADIUS_MAX = 40;
    if (ballType == BALL_TYPES.CAPSULE)
    {
        BALL_RADIUS_MIN = 5;
        BALL_RADIUS_MAX = 20; 
    }

    return Math.floor(BALL_RADIUS_MIN + (BALL_RADIUS_MAX - BALL_RADIUS_MIN)*Math.random());
}

function newRandomBallMass()
{
    const BALL_MASS_ARRAY = [1, 5, 10, 20, 100];

    return BALL_MASS_ARRAY[Math.floor(BALL_MASS_ARRAY.length*Math.random())];;
}

function newRandomObstacles()
{
    let newObstacles = [];

    // parameters
    const r = 15;
    const dxMax = 180;
    const dyMax = 100;

    // choose nb. of obstacles
    nbObstaclesPercent = Math.floor(100*Math.random());
    let obstaclesAppear = [false, false]; // no obstacles
    if (nbObstaclesPercent > 66)
        obstaclesAppear = [true, true]; // 2 obstacles pairs
    else if (nbObstaclesPercent > 33)
        obstaclesAppear = [true, false]; // 1 obstacles pair

    for (let appear of obstaclesAppear)
    {
        const dx = Math.round(2*dxMax*Math.random() - dxMax);
        const dy = Math.round(2*dyMax*Math.random() - dyMax);
        const distToCenter = distance(dx, 0, dy, 0);

        let x1 = (appear && distToCenter >= 50) ? 320 + dx : -100;
        let y1 = (appear && distToCenter >= 50) ? 270 + dy : -100;
        let x2 = (appear && distToCenter >= 50) ? 320 - dx : -100;
        let y2 = (appear && distToCenter >= 50) ? 270 - dy : -100;

        // add new obstacles pair
        newObstacles.push(new Star6(x1, y1, r, 0), new Star6(x2, y2, r, 0));
    }

    return newObstacles;
}

function isNumeric(value)
{
    return !isNaN(value)
}

function distance(x1, x2, y1, y2)
{
    return Math.sqrt((x2-x1)*(x2-x1) + (y2-y1)*(y2-y1));
}