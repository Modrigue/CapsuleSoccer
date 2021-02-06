"use strict";
const DEPLOY = true;
const PORT = DEPLOY ? (process.env.PORT || 13000) : 5500;
// game parameters
const NB_PLAYERS_IN_GAME = 2;
const NB_POINTS_MATCH = 10;
const STADIUM_W = 800; // min: 440
const STADIUM_H = 480; // min: 300
// pad paremeters
const PAD_ANGLE_FRICTION = 0.08;
const PAD_ANGLE_KEY_FORCE = 0.07;
const PAD_WIDTH = 25;
const PAD_LENGTH = 50;
const PAD_MASS = 10;
// ball paremeters
var BALL_TYPE_S;
(function (BALL_TYPE_S) {
    BALL_TYPE_S[BALL_TYPE_S["BALL"] = 0] = "BALL";
    BALL_TYPE_S[BALL_TYPE_S["CAPSULE"] = 1] = "CAPSULE";
})(BALL_TYPE_S || (BALL_TYPE_S = {}));
;
let BALL_RADIUS = newRandomBallRadius(BALL_TYPE_S.BALL);
let BALL_MASS = newRandomBallMass();
const BALL_CAPSULE_LENGTH = 60;
var WALL_TYPE_S;
(function (WALL_TYPE_S) {
    WALL_TYPE_S[WALL_TYPE_S["WALL"] = 0] = "WALL";
    WALL_TYPE_S[WALL_TYPE_S["WALL_ARC"] = 1] = "WALL_ARC";
})(WALL_TYPE_S || (WALL_TYPE_S = {}));
;
const BODIES_S = new Array();
const COLLISIONS_S = new Array();
class Vector_S {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
    set(x, y) {
        this.x = x;
        this.y = y;
    }
    add(v) {
        return new Vector_S(this.x + v.x, this.y + v.y);
    }
    subtr(v) {
        return new Vector_S(this.x - v.x, this.y - v.y);
    }
    mag() {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }
    mult(n) {
        return new Vector_S(this.x * n, this.y * n);
    }
    normal() {
        return new Vector_S(-this.y, this.x).unit();
    }
    unit() {
        if (this.mag() === 0) {
            return new Vector_S(0, 0);
        }
        else {
            return new Vector_S(this.x / this.mag(), this.y / this.mag());
        }
    }
    drawVec(start_x, start_y, n, color) {
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x + this.x * n, start_y + this.y * n);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    }
    static dot(v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    }
    static cross(v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    }
}
class Matrix_S {
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = [];
        for (let i = 0; i < this.rows; i++) {
            this.data[i] = [];
            for (let j = 0; j < this.cols; j++) {
                this.data[i][j] = 0;
            }
        }
    }
    multiplyVec(vec) {
        let result = new Vector_S(0, 0);
        result.x = this.data[0][0] * vec.x + this.data[0][1] * vec.y;
        result.y = this.data[1][0] * vec.x + this.data[1][1] * vec.y;
        return result;
    }
    rotMx22(angle) {
        this.data[0][0] = Math.cos(angle);
        this.data[0][1] = -Math.sin(angle);
        this.data[1][0] = Math.sin(angle);
        this.data[1][1] = Math.cos(angle);
    }
}
//classes storing the primitive shapes: Line, Circle, Rectangle, Triangle
class Shape_S {
    constructor() { }
    ; // dummy
}
class Line_S extends Shape_S {
    constructor(x0, y0, x1, y1) {
        super();
        this.vertex = new Array();
        this.vertex[0] = new Vector_S(x0, y0);
        this.vertex[1] = new Vector_S(x1, y1);
        this.dir = this.vertex[1].subtr(this.vertex[0]).unit();
        this.mag = this.vertex[1].subtr(this.vertex[0]).mag();
        this.pos = new Vector_S((this.vertex[0].x + this.vertex[1].x) / 2, (this.vertex[0].y + this.vertex[1].y) / 2);
    }
    draw(color) {
        ctx.beginPath();
        ctx.moveTo(this.vertex[0].x, this.vertex[0].y);
        ctx.lineTo(this.vertex[1].x, this.vertex[1].y);
        if (color === "") {
            ctx.strokeStyle = "black";
            ctx.stroke();
        }
        else {
            ctx.strokeStyle = color;
            ctx.stroke();
        }
        ctx.strokeStyle = "";
        ctx.closePath();
    }
}
class Circle_S extends Shape_S {
    constructor(x, y, r) {
        super();
        this.vertex = new Array();
        this.pos = new Vector_S(x, y);
        this.r = r;
    }
    draw(color) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
        if (color === "") {
            ctx.strokeStyle = "black";
            ctx.stroke();
        }
        else {
            ctx.fillStyle = color;
            ctx.fill();
        }
        ctx.fillStyle = "";
        ctx.closePath();
    }
}
class Arc_S extends Shape_S {
    constructor(x, y, r, a_start, a_end) {
        super();
        this.vertex = new Array();
        this.pos = new Vector_S(x, y);
        this.r = r;
        this.angle_start = a_start;
        this.angle_end = a_end;
    }
    draw(color) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, this.angle_start, this.angle_end);
        const drawColor = (color === "") ? "black" : color;
        if (color === "") {
            ctx.strokeStyle = drawColor;
            ctx.stroke();
        }
        else {
            ctx.fillStyle = drawColor;
            ctx.fill();
        }
        ctx.fillStyle = "";
        ctx.closePath();
    }
}
class Rectangle_S extends Shape_S {
    constructor(x1, y1, x2, y2, w) {
        super();
        this.vertex = new Array();
        this.vertex[0] = new Vector_S(x1, y1);
        this.vertex[1] = new Vector_S(x2, y2);
        this.dir = this.vertex[1].subtr(this.vertex[0]).unit();
        this.refDir = this.vertex[1].subtr(this.vertex[0]).unit();
        this.length = this.vertex[1].subtr(this.vertex[0]).mag();
        this.width = w;
        this.vertex[2] = this.vertex[1].add(this.dir.normal().mult(this.width));
        this.vertex[3] = this.vertex[2].add(this.dir.normal().mult(-this.length));
        this.pos = this.vertex[0].add(this.dir.mult(this.length / 2)).add(this.dir.normal().mult(this.width / 2));
        this.angle = 0;
        this.rotMat = new Matrix_S(2, 2);
    }
    draw(color) {
        ctx.beginPath();
        ctx.moveTo(this.vertex[0].x, this.vertex[0].y);
        ctx.lineTo(this.vertex[1].x, this.vertex[1].y);
        ctx.lineTo(this.vertex[2].x, this.vertex[2].y);
        ctx.lineTo(this.vertex[3].x, this.vertex[3].y);
        ctx.lineTo(this.vertex[0].x, this.vertex[0].y);
        if (color === "") {
            ctx.strokeStyle = "black";
            ctx.stroke();
        }
        else {
            ctx.fillStyle = color;
            ctx.fill();
        }
        ctx.fillStyle = "";
        ctx.closePath();
    }
    getVertices(angle) {
        this.rotMat.rotMx22(angle);
        this.dir = this.rotMat.multiplyVec(this.refDir);
        this.vertex[0] = this.pos.add(this.dir.mult(-this.length / 2)).add(this.dir.normal().mult(this.width / 2));
        this.vertex[1] = this.pos.add(this.dir.mult(-this.length / 2)).add(this.dir.normal().mult(-this.width / 2));
        this.vertex[2] = this.pos.add(this.dir.mult(this.length / 2)).add(this.dir.normal().mult(-this.width / 2));
        this.vertex[3] = this.pos.add(this.dir.mult(this.length / 2)).add(this.dir.normal().mult(this.width / 2));
    }
}
class Triangle_S extends Shape_S {
    constructor(x1, y1, x2, y2, x3, y3) {
        super();
        this.vertex = new Array();
        this.vertex[0] = new Vector_S(x1, y1);
        this.vertex[1] = new Vector_S(x2, y2);
        this.vertex[2] = new Vector_S(x3, y3);
        this.pos = new Vector_S((this.vertex[0].x + this.vertex[1].x + this.vertex[2].x) / 3, (this.vertex[0].y + this.vertex[1].y + this.vertex[2].y) / 3);
        this.dir = this.vertex[0].subtr(this.pos).unit();
        this.refDir = this.dir;
        this.refDiam = new Array();
        this.refDiam[0] = this.vertex[0].subtr(this.pos);
        this.refDiam[1] = this.vertex[1].subtr(this.pos);
        this.refDiam[2] = this.vertex[2].subtr(this.pos);
        this.angle = 0;
        this.rotMat = new Matrix_S(2, 2);
    }
    draw(color) {
        ctx.beginPath();
        ctx.moveTo(this.vertex[0].x, this.vertex[0].y);
        ctx.lineTo(this.vertex[1].x, this.vertex[1].y);
        ctx.lineTo(this.vertex[2].x, this.vertex[2].y);
        ctx.lineTo(this.vertex[0].x, this.vertex[0].y);
        if (color === "") {
            ctx.strokeStyle = "black";
            ctx.stroke();
        }
        else {
            ctx.fillStyle = color;
            ctx.fill();
        }
        ctx.fillStyle = "";
        ctx.closePath();
    }
    getVertices(angle) {
        this.rotMat.rotMx22(angle);
        this.dir = this.rotMat.multiplyVec(this.refDir);
        this.vertex[0] = this.pos.add(this.rotMat.multiplyVec(this.refDiam[0]));
        this.vertex[1] = this.pos.add(this.rotMat.multiplyVec(this.refDiam[1]));
        this.vertex[2] = this.pos.add(this.rotMat.multiplyVec(this.refDiam[2]));
    }
}
//Parent class of the bodies (Ball, Capsule, Box, Star, Wall)
class Body_S {
    constructor(x, y) {
        this.comp = new Array();
        this.pos = new Vector_S(x, y);
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
        this.vel = new Vector_S(0, 0);
        this.acc = new Vector_S(0, 0);
        this.keyForce = 1;
        this.angKeyForce = 0.1;
        this.angle = 0;
        this.angVel = 0;
        this.player = false;
        this.collides = true;
        BODIES_S.push(this);
    }
    render() {
        for (let i in this.comp) {
            this.comp[i].draw(this.color);
        }
    }
    reposition() {
        this.acc = this.acc.unit().mult(this.keyForce);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.mult(1 - this.friction);
        if (this.vel.mag() > this.maxSpeed && this.maxSpeed !== 0) {
            this.vel = this.vel.unit().mult(this.maxSpeed);
        }
        //this.angVel *= (1-this.angFriction);
        this.angVel = this.angVel * (1 - this.angFriction);
    }
    keyControl() { }
    remove() {
        if (BODIES_S.indexOf(this) !== -1) {
            BODIES_S.splice(BODIES_S.indexOf(this), 1);
        }
    }
    setMass(m) {
        this.m = m;
        if (this.m === 0) {
            this.inv_m = 0;
        }
        else {
            this.inv_m = 1 / this.m;
        }
    }
    setCollide(value) {
        this.collides = value;
    }
}
class Ball_S extends Body_S {
    constructor(x, y, r, m) {
        super(x, y);
        this.pos = new Vector_S(x, y);
        this.comp = [new Circle_S(x, y, r)];
        this.m = m;
        this.setMass(m);
    }
    setPosition(x, y, a = this.angle) {
        this.pos.set(x, y);
        this.comp[0].pos = this.pos;
    }
    reposition() {
        super.reposition();
        this.setPosition(this.pos.add(this.vel).x, this.pos.add(this.vel).y);
    }
    keyControl() {
        if (this.left) {
            this.acc.x = -this.keyForce;
        }
        if (this.up) {
            this.acc.y = -this.keyForce;
        }
        if (this.right) {
            this.acc.x = this.keyForce;
        }
        if (this.down) {
            this.acc.y = this.keyForce;
        }
        if (!this.left && !this.right) {
            this.acc.x = 0;
        }
        if (!this.up && !this.down) {
            this.acc.y = 0;
        }
    }
    setRadius(r) {
        this.comp[0].r = r;
    }
}
class Capsule_S extends Body_S {
    constructor(x1, y1, x2, y2, r1, r2, m) {
        super(x1, y1);
        this.comp = [new Circle_S(x1, y1, r1), new Circle_S(x2, y2, r2)];
        let recV1 = this.comp[1].pos.add(this.comp[1].pos.subtr(this.comp[0].pos).unit().normal().mult(r1));
        let recV2 = this.comp[0].pos.add(this.comp[1].pos.subtr(this.comp[0].pos).unit().normal().mult(r1));
        this.comp.unshift(new Rectangle_S(recV1.x, recV1.y, recV2.x, recV2.y, 2 * r1));
        this.pos = this.comp[0].pos;
        this.m = m;
        this.setMass(m);
    }
    keyControl() {
        if (this.up) {
            this.acc = this.comp[0].dir.mult(-this.keyForce);
        }
        if (this.down) {
            this.acc = this.comp[0].dir.mult(this.keyForce);
        }
        if (this.left) {
            this.angVel = -this.angKeyForce;
        }
        if (this.right) {
            this.angVel = this.angKeyForce;
        }
        if (!this.up && !this.down) {
            this.acc.set(0, 0);
        }
    }
    setPosition(x, y, a = this.angle) {
        this.pos.set(x, y);
        this.angle = a;
        this.comp[0].pos = this.pos;
        this.comp[0].getVertices(this.angle + this.angVel);
        this.comp[1].pos = this.comp[0].pos.add(this.comp[0].dir.mult(-this.comp[0].length / 2));
        this.comp[2].pos = this.comp[0].pos.add(this.comp[0].dir.mult(this.comp[0].length / 2));
        this.angle += this.angVel;
    }
    reposition() {
        super.reposition();
        this.setPosition(this.pos.add(this.vel).x, this.pos.add(this.vel).y);
    }
    setRadius(r) {
        for (let comp of this.comp) {
            if (comp instanceof Circle)
                comp.r = r;
            else if (comp instanceof Rectangle)
                comp.width = 2 * r;
        }
    }
    setMass(m) {
        super.setMass(m);
        let baseRectangle = (this.comp[0]);
        this.inertia = this.m * (Math.pow((2 * baseRectangle.width), 2) + Math.pow((baseRectangle.length + 2 * baseRectangle.width), 2)) / 12;
        if (this.m === 0)
            this.inv_inertia = 0;
        else
            this.inv_inertia = 1 / this.inertia;
    }
}
class Box_S extends Body_S {
    constructor(x1, y1, x2, y2, w, m) {
        super(x1, y1);
        this.comp = [new Rectangle_S(x1, y1, x2, y2, w)];
        this.pos = this.comp[0].pos;
        this.m = m;
        this.setMass(m);
    }
    keyControl() {
        if (this.up) {
            this.acc = this.comp[0].dir.mult(-this.keyForce);
            ;
        }
        if (this.down) {
            this.acc = this.comp[0].dir.mult(this.keyForce);
            ;
        }
        if (this.left) {
            this.angVel = -this.angKeyForce;
        }
        if (this.right) {
            this.angVel = this.angKeyForce;
        }
        if (!this.up && !this.down) {
            this.acc.set(0, 0);
        }
    }
    setPosition(x, y, a = this.angle) {
        this.pos.set(x, y);
        this.angle = a;
        this.comp[0].pos = this.pos;
        this.comp[0].getVertices(this.angle + this.angVel);
        this.angle += this.angVel;
    }
    reposition() {
        super.reposition();
        this.setPosition(this.pos.add(this.vel).x, this.pos.add(this.vel).y);
    }
    setMass(m) {
        super.setMass(m);
        let baseRectangle = (this.comp[0]);
        this.inertia = this.m * (Math.pow(baseRectangle.width, 2) + Math.pow(baseRectangle.length, 2)) / 12;
        if (this.m === 0) {
            this.inv_inertia = 0;
        }
        else {
            this.inv_inertia = 1 / this.inertia;
        }
    }
}
class Star6_S extends Body_S {
    constructor(x1, y1, r, m) {
        super(x1, y1);
        this.comp = [];
        this.r = r;
        let center = new Vector_S(x1, y1);
        let upDir = new Vector_S(0, -1);
        let p1 = center.add(upDir.mult(r));
        let p2 = center.add(upDir.mult(-r / 2)).add(upDir.normal().mult(-r * Math.sqrt(3) / 2));
        let p3 = center.add(upDir.mult(-r / 2)).add(upDir.normal().mult(r * Math.sqrt(3) / 2));
        this.comp.push(new Triangle_S(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y));
        p1 = center.add(upDir.mult(-r));
        p2 = center.add(upDir.mult(r / 2)).add(upDir.normal().mult(-r * Math.sqrt(3) / 2));
        p3 = center.add(upDir.mult(r / 2)).add(upDir.normal().mult(r * Math.sqrt(3) / 2));
        this.comp.push(new Triangle_S(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y));
        this.pos = this.comp[0].pos;
        this.m = m;
        this.setMass(m);
    }
    keyControl() {
        if (this.up) {
            this.acc = this.comp[0].dir.mult(-this.keyForce);
        }
        if (this.down) {
            this.acc = this.comp[0].dir.mult(this.keyForce);
        }
        if (this.left) {
            this.angVel = -this.angKeyForce;
        }
        if (this.right) {
            this.angVel = this.angKeyForce;
        }
        if (!this.up && !this.down) {
            this.acc.set(0, 0);
        }
    }
    setPosition(x, y, a = this.angle) {
        this.pos.set(x, y);
        this.angle = a;
        this.comp[0].pos = this.pos;
        this.comp[1].pos = this.pos;
        this.comp[0].getVertices(this.angle + this.angVel);
        this.comp[1].getVertices(this.angle + this.angVel);
        this.angle += this.angVel;
    }
    reposition() {
        super.reposition();
        this.setPosition(this.pos.add(this.vel).x, this.pos.add(this.vel).y);
    }
    setRadius(r) {
        // TODO
    }
    setMass(m) {
        super.setMass(m);
        this.inertia = this.m * (Math.pow((2 * this.r), 2)) / 12;
        if (this.m === 0) {
            this.inv_inertia = 0;
        }
        else {
            this.inv_inertia = 1 / this.inertia;
        }
    }
}
class Wall_S extends Body_S {
    constructor(x1, y1, x2, y2) {
        super((x1 + x2) / 2, (y1 + y2) / 2);
        this.comp = [new Line_S(x1, y1, x2, y2)];
        this.pos = new Vector_S((x1 + x2) / 2, (y1 + y2) / 2);
    }
}
class WallArc_S extends Body_S {
    constructor(x, y, r, a_start, a_end) {
        super(x, y);
        //this.comp = [new Arc_S(x, y, r, a_start, a_end)]; // causes error for collisions
        this.comp = [new Circle_S(x, y, r)];
        this.pos = new Vector_S(x, y);
        this.a_start = a_start;
        this.a_end = a_end;
    }
}
//Collision manifold, consisting the data for collision handling
//Manifolds are collected in an array for every frame
class CollData_S {
    constructor(o1, o2, normal, pen, cp) {
        this.o1 = o1;
        this.o2 = o2;
        this.normal = normal;
        this.pen = pen;
        this.cp = cp;
    }
    penRes() {
        if (this.o1.inv_m + this.o2.inv_m == 0)
            return;
        let penResolution = this.normal.mult(this.pen / (this.o1.inv_m + this.o2.inv_m));
        this.o1.pos = this.o1.pos.add(penResolution.mult(this.o1.inv_m));
        this.o2.pos = this.o2.pos.add(penResolution.mult(-this.o2.inv_m));
    }
    collRes() {
        //1. Closing velocity
        let collArm1 = this.cp.subtr(this.o1.comp[0].pos);
        let rotVel1 = new Vector_S(-this.o1.angVel * collArm1.y, this.o1.angVel * collArm1.x);
        let closVel1 = this.o1.vel.add(rotVel1);
        let collArm2 = this.cp.subtr(this.o2.comp[0].pos);
        let rotVel2 = new Vector_S(-this.o2.angVel * collArm2.y, this.o2.angVel * collArm2.x);
        let closVel2 = this.o2.vel.add(rotVel2);
        //2. Impulse augmentation
        let impAug1 = Vector_S.cross(collArm1, this.normal);
        impAug1 = impAug1 * this.o1.inv_inertia * impAug1;
        let impAug2 = Vector_S.cross(collArm2, this.normal);
        impAug2 = impAug2 * this.o2.inv_inertia * impAug2;
        let relVel = closVel1.subtr(closVel2);
        let sepVel = Vector_S.dot(relVel, this.normal);
        let new_sepVel = -sepVel * Math.min(this.o1.elasticity, this.o2.elasticity);
        let vsep_diff = new_sepVel - sepVel;
        let impulseDenom = this.o1.inv_m + this.o2.inv_m + impAug1 + impAug2;
        let impulse = (impulseDenom > 0) ?
            vsep_diff / (this.o1.inv_m + this.o2.inv_m + impAug1 + impAug2) : 0;
        let impulseVec = this.normal.mult(impulse);
        //3. Changing the velocities
        this.o1.vel = this.o1.vel.add(impulseVec.mult(this.o1.inv_m));
        this.o2.vel = this.o2.vel.add(impulseVec.mult(-this.o2.inv_m));
        this.o1.angVel += this.o1.inv_inertia * Vector_S.cross(collArm1, impulseVec);
        this.o2.angVel -= this.o2.inv_inertia * Vector_S.cross(collArm2, impulseVec);
    }
}
class CollSat_S {
    constructor(pen, axis, vertex, overlaps = true) {
        this.pen = pen;
        this.axis = axis;
        this.vertex = vertex;
        this.overlaps = overlaps;
    }
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
function sat_S(o1, o2) {
    let minOverlap = -Number.MAX_SAFE_INTEGER;
    let smallestAxis = new Vector_S(0, 0); // dummy
    let vertexObj = new Line_S(0, 0, 1, 1); // dummy
    let axes = findAxes_S(o1, o2);
    let proj1;
    let proj2;
    let firstShapeAxes = getShapeAxes_S(o1);
    for (let i = 0; i < axes.length; i++) {
        proj1 = projShapeOntoAxis_S(axes[i], o1);
        proj2 = projShapeOntoAxis_S(axes[i], o2);
        let overlap = Math.min(proj1.max, proj2.max) - Math.max(proj1.min, proj2.min);
        if (overlap < 0) {
            return new CollSat_S(-Number.MAX_SAFE_INTEGER, new Vector_S(0, 0), new Vector_S(0, 0), false);
        }
        if ((proj1.max > proj2.max && proj1.min < proj2.min) ||
            (proj1.max < proj2.max && proj1.min > proj2.min)) {
            let mins = Math.abs(proj1.min - proj2.min);
            let maxs = Math.abs(proj1.max - proj2.max);
            if (mins < maxs) {
                overlap += mins;
            }
            else {
                overlap += maxs;
                axes[i] = axes[i].mult(-1);
            }
        }
        if (overlap < minOverlap || minOverlap == -Number.MAX_SAFE_INTEGER) {
            minOverlap = overlap;
            smallestAxis = axes[i];
            if (i < firstShapeAxes) {
                vertexObj = o2;
                if (proj1.max > proj2.max) {
                    smallestAxis = axes[i].mult(-1);
                }
            }
            else {
                vertexObj = o1;
                if (proj1.max < proj2.max) {
                    smallestAxis = axes[i].mult(-1);
                }
            }
        }
    }
    ;
    let contactVertex = projShapeOntoAxis_S(smallestAxis, vertexObj).collVertex;
    //smallestAxis.drawVec(contactVertex.x, contactVertex.y, minOverlap, "blue");
    if (vertexObj === o2) {
        smallestAxis = smallestAxis.mult(-1);
    }
    return new CollSat_S(minOverlap, smallestAxis, contactVertex);
}
//Helping functions for the SAT below
//returns the min and max projection values of a shape onto an axis
function projShapeOntoAxis_S(axis, obj) {
    setBallVerticesAlongAxis_S(obj, axis);
    let min = Vector_S.dot(axis, obj.vertex[0]);
    let max = min;
    let collVertex = obj.vertex[0];
    for (let i = 0; i < obj.vertex.length; i++) {
        let p = Vector_S.dot(axis, obj.vertex[i]);
        if (p < min) {
            min = p;
            collVertex = obj.vertex[i];
        }
        if (p > max) {
            max = p;
        }
    }
    return {
        min: min,
        max: max,
        collVertex: collVertex
    };
}
//finds the projection axes for the two objects
function findAxes_S(o1, o2) {
    let axes = new Array();
    if (o1 instanceof Circle_S && o2 instanceof Circle_S) {
        if (o2.pos.subtr(o1.pos).mag() > 0) {
            axes.push(o2.pos.subtr(o1.pos).unit());
        }
        else {
            axes.push(new Vector_S(Math.random(), Math.random()).unit());
        }
        return axes;
    }
    if (o1 instanceof Circle_S) {
        axes.push(closestVertexToPoint_S(o2, o1.pos).subtr(o1.pos).unit());
    }
    if (o1 instanceof Line_S) {
        axes.push(o1.dir.normal());
    }
    if (o1 instanceof Rectangle_S) {
        axes.push(o1.dir.normal());
        axes.push(o1.dir);
    }
    if (o1 instanceof Triangle_S) {
        axes.push(o1.vertex[1].subtr(o1.vertex[0]).normal());
        axes.push(o1.vertex[2].subtr(o1.vertex[1]).normal());
        axes.push(o1.vertex[0].subtr(o1.vertex[2]).normal());
    }
    if (o2 instanceof Circle_S) {
        axes.push(closestVertexToPoint_S(o1, o2.pos).subtr(o2.pos).unit());
    }
    if (o2 instanceof Line_S) {
        axes.push(o2.dir.normal());
    }
    if (o2 instanceof Rectangle_S) {
        axes.push(o2.dir.normal());
        axes.push(o2.dir);
    }
    if (o2 instanceof Triangle_S) {
        axes.push(o2.vertex[1].subtr(o2.vertex[0]).normal());
        axes.push(o2.vertex[2].subtr(o2.vertex[1]).normal());
        axes.push(o2.vertex[0].subtr(o2.vertex[2]).normal());
    }
    return axes;
}
//iterates through an objects vertices and returns the one that is the closest to the given point
function closestVertexToPoint_S(obj, p) {
    let closestVertex = new Vector_S(0, 0);
    let minDist = -1;
    for (let i = 0; i < obj.vertex.length; i++) {
        if (p.subtr(obj.vertex[i]).mag() < minDist || minDist == -1) {
            closestVertex = obj.vertex[i];
            minDist = p.subtr(obj.vertex[i]).mag();
        }
    }
    return closestVertex;
}
//returns the number of the axes that belong to an object
function getShapeAxes_S(obj) {
    if (obj instanceof Circle_S || obj instanceof Line_S) {
        return 1;
    }
    if (obj instanceof Rectangle_S) {
        return 2;
    }
    if (obj instanceof Triangle_S) {
        return 3;
    }
    return 0;
}
//the ball vertices always need to be recalculated based on the current projection axis direction
function setBallVerticesAlongAxis_S(obj, axis) {
    if (obj instanceof Circle_S) {
        obj.vertex[0] = obj.pos.add(axis.unit().mult(-obj.r));
        obj.vertex[1] = obj.pos.add(axis.unit().mult(obj.r));
    }
}
//Thats it for the SAT and its support functions
//Prevents objects to float away from the canvas
function putWallsAround_S(x1, y1, x2, y2) {
    let edge1 = new Wall_S(x1, y1, x2, y1);
    let edge2 = new Wall_S(x2, y1, x2, y2);
    let edge3 = new Wall_S(x2, y2, x1, y2);
    let edge4 = new Wall_S(x1, y2, x1, y1);
}
function collide_S(o1, o2) {
    let bestSat = new CollSat_S(-Number.MAX_SAFE_INTEGER, new Vector_S(0, 0), new Vector_S(0, 0), false);
    if (!o1.collides || !o2.collides)
        return bestSat;
    for (let o1comp = 0; o1comp < o1.comp.length; o1comp++) {
        for (let o2comp = 0; o2comp < o2.comp.length; o2comp++) {
            if ((sat_S(o1.comp[o1comp], o2.comp[o2comp]).pen > bestSat.pen) || bestSat.pen == -Number.MAX_SAFE_INTEGER) {
                bestSat = sat_S(o1.comp[o1comp], o2.comp[o2comp]);
            }
        }
    }
    return bestSat;
}
function userInteraction_S() {
    BODIES_S.forEach((b) => {
        b.keyControl();
    });
}
function physicsLoop_S( /*timestamp*/) {
    COLLISIONS_S.length = 0;
    BODIES_S.forEach((b) => {
        b.reposition();
    });
    BODIES_S.forEach((b, index) => {
        for (let bodyPair = index + 1; bodyPair < BODIES_S.length; bodyPair++) {
            const bodyRef = BODIES_S[index];
            const bodyProbe = BODIES_S[bodyPair];
            if (bodyRef.layer === bodyProbe.layer ||
                bodyRef.layer === 0 || bodyProbe.layer === 0) {
                let bestSat = collide_S(bodyRef, bodyProbe);
                if (bestSat.overlaps)
                    COLLISIONS_S.push(new CollData_S(bodyRef, bodyProbe, bestSat.axis, bestSat.pen, bestSat.vertex));
            }
        }
    });
    COLLISIONS_S.forEach((c) => {
        c.penRes();
        c.collRes();
    });
}
function renderLoop_S() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    BODIES.forEach((b) => {
        b.render();
    });
}
function mainLoop_S() {
    userInteraction_S();
    physicsLoop_S();
    renderLoop_S();
    gameLogic_S(0 /* dummy */);
    requestAnimationFrame(mainLoop_S);
}
function renderOnly_S() {
    renderLoop_S();
    requestAnimationFrame(renderOnly_S);
}
/**************************** END OF PHYSICS ENGINE **************************/
const express = require('express');
const app = express();
let io;
if (DEPLOY) {
    app.use(express.static('.'));
    const http = require('http').Server(app);
    io = require('socket.io')(http);
    app.get('/', (req, res) => res.sendFile(__dirname + '../index.html'));
    http.listen(PORT, function () {
        console.log(`listening on port ${PORT}...`);
    });
}
else {
    io = require('socket.io')(PORT);
    app.get('/', (req, res) => res.send('Hello World!'));
}
class Player_S extends Capsule_S {
    constructor() {
        super(...arguments);
        this.score = 0;
        this.no = 0;
        this.name = "";
    }
}
let serverBalls = new Map();
let football_S = new Map();
let footballPos;
let playerReg = new Map();
let clientNo = 0;
let gameIsOn = new Map();
let stadium_S = new Map();
let obstacles_S = new Map();
let rooms = new Map();
io.on('connection', connected);
setInterval(serverLoop, 1000 / 60);
function connected(socket) {
    const room = 1;
    const nbPlayersReady = getNbPlayersReadyInRoom(room);
    io.emit('newConnection', { nbPlayersReady: nbPlayersReady,
        nbPlayersInGame: NB_PLAYERS_IN_GAME, nbPointsMatch: NB_POINTS_MATCH,
        stadiumW: STADIUM_W, stadiumH: STADIUM_H });
    // disconnection
    socket.on('disconnect', function () {
        if (serverBalls.has(socket.id)) {
            const room = serverBalls.get(socket.id).layer;
            serverBalls.get(socket.id).remove();
            io.to(room).emit('deletePlayer', playerReg.get(socket.id));
            serverBalls.delete(socket.id);
            if (playerReg.has(socket.id))
                playerReg.delete(socket.id);
            let nbPlayersReadyInRoom = 0;
            if (rooms.has(room)) {
                // delete player in room
                deletePlayerInRoom(room, socket.id);
                nbPlayersReadyInRoom = getNbPlayersReadyInRoom(room);
                // if no players left, delete complete room data
                if (nbPlayersReadyInRoom == 0) {
                    if (rooms.has(room))
                        rooms.delete(room);
                    if (football_S.has(room)) {
                        football_S.get(room).remove();
                        football_S.delete(room);
                    }
                    if (stadium_S.has(room)) {
                        for (let wall of stadium_S.get(room))
                            wall.remove();
                        stadium_S.delete(room);
                    }
                    if (obstacles_S.has(room)) {
                        for (let obstacle of obstacles_S.get(room))
                            obstacle.remove();
                        obstacles_S.delete(room);
                    }
                    if (gameIsOn.has(room))
                        gameIsOn.delete(room);
                }
            }
            // update nb. players ready
            io.emit('updatePlayersReady', nbPlayersReadyInRoom);
        }
        console.log(playerReg);
        console.log(`Number of players: ${playerReg.size}`);
        console.log(`Number of balls: ${football_S.size}`);
        //console.log(`Number of BODIES: ${BODIES_S.length-12}`);
        console.log(`Joined players ever: ${clientNo}`);
        io.emit('updateConnections', playerReg);
    });
    // user inputs
    socket.on('userCommands', (data) => {
        if (serverBalls.has(socket.id)) {
            serverBalls.get(socket.id).left = data.left;
            serverBalls.get(socket.id).up = data.up;
            serverBalls.get(socket.id).right = data.right;
            serverBalls.get(socket.id).down = data.down;
            serverBalls.get(socket.id).action = data.action;
        }
    });
    // player enters
    socket.on('clientName', (data, response) => {
        // disabled: reqires to handle bodies / collisions per room
        //const room = parseInt(data.room);
        const room = 1;
        const clientNoInRoom = createNextPlayerInRoom(room, socket.id);
        if (clientNoInRoom < 0) {
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
        let newPlayer = new Player_S(STADIUM_W / 2 + PAD_LENGTH / 2, STADIUM_H / 2 + 60 - yPadDiff / 2, STADIUM_W / 2 - PAD_LENGTH / 2, STADIUM_H / 2 + 60 - yPadDiff / 2, PAD_WIDTH, 0, PAD_MASS);
        newPlayer.no = clientNoInRoom;
        newPlayer.layer = room;
        newPlayer.name = data.name;
        serverBalls.set(socket.id, newPlayer);
        initPlayerPosition(socket.id);
        playerReg.set(socket.id, { id: socket.id, x: newPlayer.pos.x, y: newPlayer.pos.y, roomNo: room, no: clientNoInRoom });
        // initialize game if all players present
        if (clientNoInRoom == NB_PLAYERS_IN_GAME) {
            // stadium
            if (!stadium_S.has(room))
                newRandomStadium(room);
            // ball
            if (!football_S.has(room)) {
                let newBall = new Ball_S(STADIUM_W / 2, STADIUM_H / 2 + 60, BALL_RADIUS, BALL_MASS);
                newBall.layer = room;
                football_S.set(room, newBall);
                io.to(room).emit('updateFootball', { x: newBall.pos.x, y: newBall.pos.y,
                    r: BALL_RADIUS, m: BALL_MASS, angle: newBall.angle });
            }
            // obstacles: set dummy positions
            if (!obstacles_S.has(room)) {
                let newObstacles = new Array();
                for (let i = 0; i < 4; i++)
                    newObstacles.push(new Star6_S(-100, -100, 15, 0));
                obstacles_S.set(room, newObstacles);
            }
        }
        // send current nb. of players ready
        io.emit('updatePlayersReady', clientNoInRoom);
        for (const [id, player] of serverBalls)
            io.to(player.layer).emit('updateConnections', playerReg.get(id));
        // if game was already on, re-sent scores, stadium and obstacles data
        if (gameIsOn.has(room) && gameIsOn.get(room)) {
            // TODO: refactor scores as own entry
            // reset all scores
            for (const [id, player] of serverBalls)
                if (player.layer == room)
                    io.to(room).emit('updateScore', { id: id, score: 0 });
            sendStadium(room);
            sendObstacles(room);
        }
        //console.log(`${data} is in room no.${serverBalls[socket.id].layer}`);
        console.log(`${data.name} is in room no. ${room}`);
        if (playersReadyInRoom(room) == NB_PLAYERS_IN_GAME) {
            for (let [id, player] of serverBalls)
                if (player.layer === room)
                    io.to(room).emit('playerName', { id: id, name: player.name });
            gameIsOn.set(room, true);
        }
        else {
            gameIsOn.set(room, false);
        }
        response({ status: "ok" });
    });
}
function createNextPlayerInRoom(room, socketID) {
    if (!rooms.has(room)) {
        // create new room
        let newRoom = new Map();
        for (let i = 1; i <= NB_PLAYERS_IN_GAME; i++)
            newRoom.set(i, "");
        rooms.set(room, newRoom);
    }
    else if (getNbPlayersReadyInRoom(room) >= NB_PLAYERS_IN_GAME) {
        // room full
        return -1;
    }
    let playerNoNext = 0;
    let roomCur = (rooms.get(room));
    for (const [playerNo, playersID] of roomCur) {
        playerNoNext++;
        if (playersID == "") {
            roomCur.set(playerNo, socketID);
            break;
        }
    }
    return playerNoNext;
}
function deletePlayerInRoom(room, socketID) {
    if (!rooms.has(room))
        return;
    let roomCur = (rooms.get(room));
    for (const [playerNo, playerID] of roomCur)
        if (playerID == socketID)
            roomCur.set(playerNo, "");
}
function getNbPlayersReadyInRoom(room) {
    if (!rooms.has(room))
        return 0;
    let roomCur = (rooms.get(room));
    return Array.from((roomCur).values()).filter((playersID) => (playersID != "")).length;
}
function serverLoop() {
    userInteraction_S();
    physicsLoop_S();
    for (const room of rooms.keys()) {
        if (gameIsOn.get(room)) {
            gameLogic_S(room);
            for (let [id, player] of serverBalls) {
                io.to(player.layer).emit('updatePlayersPositions', {
                    id: id,
                    x: player.pos.x,
                    y: player.pos.y,
                    angle: player.angle,
                    up: player.up
                });
            }
            let footballCur = (football_S.get(room));
            io.to(room).emit('updateFootball', {
                x: footballCur.pos.x,
                y: footballCur.pos.y,
                r: BALL_RADIUS,
                angle: footballCur.angle
            });
        }
        else {
            //console.log("waiting for 2 players...");
        }
    }
}
function gameLogic_S(room) {
    let footballCur = football_S.get(room);
    if (footballCur.pos.x < 45 || footballCur.pos.x > STADIUM_W - 45)
        scoring(room);
    for (let [id, player] of serverBalls)
        if (player.score === NB_POINTS_MATCH && player.layer === room)
            gameOver(room);
}
function gameOver(room) {
    roundSetup(room);
    io.to(room).emit('updateScore', null);
    setTimeout(() => {
        for (let [id, player] of serverBalls)
            if (player.layer === room)
                player.score = 0;
    }, 2000);
}
function scoring(room) {
    let scorerId = "";
    let footballCur = football_S.get(room);
    console.log('Score in room', room);
    if (footballCur.pos.x < 45) {
        for (let [id, player] of serverBalls) {
            const rightTeamPlayerNo = 2 * Math.floor(NB_PLAYERS_IN_GAME / 2);
            if (player.no == rightTeamPlayerNo && player.layer == room) {
                player.score++;
                scorerId = id;
                console.log("score for team 2!");
            }
        }
    }
    if (footballCur.pos.x > STADIUM_W - 45) {
        for (let [id, player] of serverBalls) {
            if (player.no === 1 && player.layer == room) {
                player.score++;
                scorerId = id;
                console.log("score for team 1!");
            }
        }
    }
    roundSetup(room);
    io.to(room).emit('scoring', scorerId);
}
function roundSetup(room) {
    // reset players position
    for (let [id, player] of serverBalls)
        if (player.layer == room)
            initPlayerPosition(id);
    // generate new random ball
    if (football_S.has(room)) {
        let footballCur = football_S.get(room);
        footballCur.remove();
        football_S.delete(room);
    }
    football_S.set(room, newRandomBall());
    let footballNew = football_S.get(room);
    io.to(room).emit('newFootball', {
        type: (footballNew instanceof Capsule_S) ? BALL_TYPE_S.CAPSULE : BALL_TYPE_S.BALL,
        x: footballNew.pos.x,
        y: footballNew.pos.y,
        r: BALL_RADIUS,
        m: BALL_MASS
    });
    // generate new stadium
    let stadiumRoom = stadium_S.get(room);
    for (let wall of stadiumRoom)
        wall.remove();
    newRandomStadium(room);
    // generate new obstacles
    let obstaclesInRoom = obstacles_S.get(room);
    for (let obstacle of obstaclesInRoom)
        obstacle.remove();
    obstacles_S.set(room, newRandomObstacles());
    sendObstacles(room);
}
function sendObstacles(room) {
    if (!obstacles_S.has(room))
        return;
    let obstaclesInRoom = obstacles_S.get(room);
    let obstaclesPos = [];
    for (const obstacle of obstaclesInRoom)
        obstaclesPos.push(new Vector_S(obstacle.pos.x, obstacle.pos.y));
    io.to(room).emit('newObstacles', { positions: obstaclesPos, r: obstaclesInRoom[0].r });
}
function initPlayerPosition(id) {
    const yPadDiff = 80;
    serverBalls.get(id).vel.set(0, 0);
    serverBalls.get(id).angVel = 0;
    serverBalls.get(id).angFriction = PAD_ANGLE_FRICTION;
    serverBalls.get(id).angKeyForce = PAD_ANGLE_KEY_FORCE;
    serverBalls.get(id).maxSpeed = 4;
    const teamNo = (serverBalls.get(id).no % 2 == 0) ? 2 : 1;
    const nbPlayersInTeam = (teamNo == 1) ?
        Math.ceil(NB_PLAYERS_IN_GAME / 2) :
        Math.floor(NB_PLAYERS_IN_GAME / 2);
    const noPlayerInTeam = Math.floor((serverBalls.get(id).no - 1) / 2) + 1;
    const xStart = (teamNo == 1) ? 115 : STADIUM_W - 115;
    let yMin = (nbPlayersInTeam % 2 == 0) ?
        STADIUM_H / 2 + 60 - (Math.floor(nbPlayersInTeam / 2) - 0.5) * yPadDiff :
        STADIUM_H / 2 + 60 - Math.floor(nbPlayersInTeam / 2) * yPadDiff;
    const yStart = yMin + (noPlayerInTeam - 1) * yPadDiff;
    //console.log('PLAYER ', (<Player_S>serverBalls.get(id)).no, noPlayerInTeam, yMin, xStart, yStart);
    const orientation = (teamNo == 1) ? Math.PI : 0;
    serverBalls.get(id).setPosition(xStart, yStart, orientation);
}
function newRandomStadium(room) {
    let newStadium = new Array();
    // WARNING: WALLS MUST NOT SHARE COMMON PIXELS WITH EACH OTHERS!!
    const stadiumTypeNumber = 1 + Math.floor(4 * Math.random());
    switch (stadiumTypeNumber) {
        case 2:
            // Top walls
            newStadium.push(new Wall_S(60, 80, STADIUM_W / 2 - 39, 80));
            newStadium.push(new Wall_S(STADIUM_W / 2 + 41, 80, STADIUM_W - 60, 80));
            newStadium.push(new WallArc_S(STADIUM_W / 2, 80, 40, 0, Math.PI));
            newStadium.push(new Wall_S(60, 80, 60, STADIUM_H / 2 + 60 - 131));
            newStadium.push(new Wall_S(STADIUM_W - 60, 80, STADIUM_W - 60, STADIUM_H / 2 + 60 - 131));
            // bottom walls
            newStadium.push(new Wall_S(60, STADIUM_H + 60 - 20, STADIUM_W / 2 - 39, STADIUM_H + 60 - 20));
            newStadium.push(new Wall_S(STADIUM_W / 2 + 41, STADIUM_H + 60 - 20, STADIUM_W - 60, STADIUM_H + 60 - 20));
            newStadium.push(new WallArc_S(STADIUM_W / 2, STADIUM_H + 60 - 20, 40, Math.PI, 2 * Math.PI));
            newStadium.push(new Wall_S(60, STADIUM_H + 60 - 20, 60, STADIUM_H / 2 + 60 + 131));
            newStadium.push(new Wall_S(STADIUM_W - 60, STADIUM_H + 60 - 20, STADIUM_W - 60, STADIUM_H / 2 + 60 + 131));
            // left goal
            newStadium.push(new WallArc_S(0, STADIUM_H / 2 + 60 - 130, 60, 0, Math.PI / 2));
            newStadium.push(new WallArc_S(0, STADIUM_H / 2 + 60 + 130, 60, 3 / 2 * Math.PI, 2 * Math.PI));
            // right goal
            newStadium.push(new WallArc_S(STADIUM_W, STADIUM_H / 2 + 60 - 130, 60, Math.PI / 2, Math.PI));
            newStadium.push(new WallArc_S(STADIUM_W, STADIUM_H / 2 + 60 + 130, 60, Math.PI, 3 / 2 * Math.PI));
            // goals borders
            newStadium.push(new Wall_S(0, STADIUM_H / 2 + 60 - 70, 0, STADIUM_H / 2 + 60 + 70));
            newStadium.push(new Wall_S(STADIUM_W, STADIUM_H / 2 + 60 - 70, STADIUM_W, STADIUM_H / 2 + 60 + 70));
            break;
        case 3:
            // Top walls
            newStadium.push(new Wall_S(0, 80, 100, 80));
            newStadium.push(new Wall_S(100, 80, 140, 120));
            newStadium.push(new Wall_S(140, 120, STADIUM_W / 2 - 80, 120));
            newStadium.push(new Wall_S(STADIUM_W / 2 - 80, 120, STADIUM_W / 2 - 40, 80));
            newStadium.push(new Wall_S(STADIUM_W / 2 - 40, 80, STADIUM_W / 2 + 40, 80));
            newStadium.push(new Wall_S(STADIUM_W / 2 + 40, 80, STADIUM_W / 2 + 80, 120));
            newStadium.push(new Wall_S(STADIUM_W / 2 + 80, 120, STADIUM_W - 140, 120));
            newStadium.push(new Wall_S(STADIUM_W - 140, 120, STADIUM_W - 100, 80));
            newStadium.push(new Wall_S(STADIUM_W - 100, 80, STADIUM_W, 80));
            // Bottom walls
            newStadium.push(new Wall_S(0, STADIUM_H + 60 - 20, 100, STADIUM_H + 60 - 20));
            newStadium.push(new Wall_S(100, STADIUM_H + 60 - 20, 140, STADIUM_H + 60 - 60));
            newStadium.push(new Wall_S(140, STADIUM_H + 60 - 60, STADIUM_W / 2 - 80, STADIUM_H + 60 - 60));
            newStadium.push(new Wall_S(STADIUM_W / 2 - 80, STADIUM_H + 60 - 60, STADIUM_W / 2 - 40, STADIUM_H + 60 - 20));
            newStadium.push(new Wall_S(STADIUM_W / 2 - 40, STADIUM_H + 60 - 20, STADIUM_W / 2 + 40, STADIUM_H + 60 - 20));
            newStadium.push(new Wall_S(STADIUM_W / 2 + 40, STADIUM_H + 60 - 20, STADIUM_W / 2 + 80, STADIUM_H + 60 - 60));
            newStadium.push(new Wall_S(STADIUM_W / 2 + 80, STADIUM_H + 60 - 60, STADIUM_W - 140, STADIUM_H + 60 - 60));
            newStadium.push(new Wall_S(STADIUM_W - 140, STADIUM_H + 60 - 60, STADIUM_W - 100, STADIUM_H + 60 - 20));
            newStadium.push(new Wall_S(STADIUM_W - 100, STADIUM_H + 60 - 20, STADIUM_W, STADIUM_H + 60 - 20));
            // left walls
            newStadium.push(new Wall_S(0, 200, 70, 260));
            newStadium.push(new Wall_S(70, 260, 70, STADIUM_H + 60 - 190));
            newStadium.push(new Wall_S(0, STADIUM_H + 60 - 120, 70, STADIUM_H + 60 - 190));
            // right walls
            newStadium.push(new Wall_S(STADIUM_W, 200, STADIUM_W - 70, 260));
            newStadium.push(new Wall_S(STADIUM_W - 70, 260, STADIUM_W - 70, STADIUM_H + 60 - 190));
            newStadium.push(new Wall_S(STADIUM_W, STADIUM_H + 60 - 120, STADIUM_W - 70, STADIUM_H + 60 - 190));
            // goals borders
            newStadium.push(new Wall_S(0, 80, 0, 200));
            newStadium.push(new Wall_S(0, STADIUM_H + 60 - 20, 0, STADIUM_H + 60 - 120));
            newStadium.push(new Wall_S(STADIUM_W, 80, STADIUM_W, 200));
            newStadium.push(new Wall_S(STADIUM_W, STADIUM_H + 60 - 20, STADIUM_W, STADIUM_H + 60 - 120));
            break;
        case 4:
            // Top walls
            newStadium.push(new Wall_S(0, 80, 99, 80));
            newStadium.push(new WallArc_S(140, 80, 40, Math.PI / 2, Math.PI));
            newStadium.push(new Wall_S(141, 120, STADIUM_W / 2 - 81, 120));
            newStadium.push(new WallArc_S(STADIUM_W / 2 - 80, 80, 40, 0, Math.PI / 2));
            newStadium.push(new Wall_S(STADIUM_W / 2 - 39, 80, STADIUM_W / 2 + 39, 80));
            newStadium.push(new WallArc_S(STADIUM_W / 2 + 80, 80, 40, Math.PI / 2, Math.PI));
            newStadium.push(new Wall_S(STADIUM_W / 2 + 81, 120, STADIUM_W - 141, 120));
            newStadium.push(new WallArc_S(STADIUM_W - 140, 80, 40, 0, Math.PI / 2));
            newStadium.push(new Wall_S(STADIUM_W - 99, 80, STADIUM_W, 80));
            // Bottom walls
            newStadium.push(new Wall_S(0, STADIUM_H + 60 - 20, 99, STADIUM_H + 60 - 20));
            newStadium.push(new WallArc_S(140, STADIUM_H + 60 - 20, 40, Math.PI, 3 / 2 * Math.PI));
            newStadium.push(new Wall_S(141, STADIUM_H + 60 - 60, STADIUM_W / 2 - 79, STADIUM_H + 60 - 60));
            newStadium.push(new WallArc_S(STADIUM_W / 2 - 80, STADIUM_H + 60 - 20, 40, 3 / 2 * Math.PI, 2 * Math.PI));
            newStadium.push(new Wall_S(STADIUM_W / 2 - 39, STADIUM_H + 60 - 20, STADIUM_W / 2 + 39, STADIUM_H + 60 - 20));
            newStadium.push(new WallArc_S(STADIUM_W / 2 + 80, STADIUM_H + 60 - 20, 40, Math.PI, 3 / 2 * Math.PI));
            newStadium.push(new Wall_S(STADIUM_W / 2 + 81, STADIUM_H + 60 - 60, STADIUM_W - 141, STADIUM_H + 60 - 60));
            newStadium.push(new WallArc_S(STADIUM_W - 140, STADIUM_H + 60 - 20, 40, 3 / 2 * Math.PI, 2 * Math.PI));
            newStadium.push(new Wall_S(STADIUM_W - 99, STADIUM_H + 60 - 20, STADIUM_W, STADIUM_H + 60 - 20));
            // left wall
            newStadium.push(new WallArc_S(0, STADIUM_H / 2 + 60, STADIUM_H / 2 - 140, 3 / 2 * Math.PI, 5 / 2 * Math.PI));
            // right wall
            newStadium.push(new WallArc_S(STADIUM_W, STADIUM_H / 2 + 60, STADIUM_H / 2 - 140, 1 / 2 * Math.PI, 3 / 2 * Math.PI));
            //newStadium.push(new WallArc_S(STADIUM_W, 270, 70, Math.PI, 3/2*Math.PI));
            //newStadium.push(new Wall_S(STADIUM_W - 70, 270, STADIUM_W - 70, STADIUM_H+60 - 210));
            //newStadium.push(new WallArc_S(STADIUM_W, STADIUM_H+60 - 210, 70, 1/2*Math.PI, Math.PI));
            // goals borders
            newStadium.push(new Wall_S(0, 80, 0, 200));
            newStadium.push(new Wall_S(0, STADIUM_H + 60 - 20, 0, STADIUM_H + 60 - 140));
            newStadium.push(new Wall_S(STADIUM_W, 80, STADIUM_W, 200));
            newStadium.push(new Wall_S(STADIUM_W, STADIUM_H + 60 - 20, STADIUM_W, STADIUM_H + 60 - 140));
            break;
        default:
            // Top walls
            newStadium.push(new Wall_S(60, 80, STADIUM_W - 60, 80));
            newStadium.push(new Wall_S(60, 80, 60, STADIUM_H / 2 + 60 - 90));
            newStadium.push(new Wall_S(STADIUM_W - 60, 80, STADIUM_W - 60, STADIUM_H / 2 + 60 - 90));
            // Bottom walls
            newStadium.push(new Wall_S(60, STADIUM_H + 60 - 20, STADIUM_W - 60, STADIUM_H + 60 - 20));
            newStadium.push(new Wall_S(60, STADIUM_H + 60 - 20, 60, STADIUM_H / 2 + 60 + 90));
            newStadium.push(new Wall_S(STADIUM_W - 60, STADIUM_H + 60 - 20, STADIUM_W - 60, STADIUM_H / 2 + 60 + 90));
            // goals borders
            newStadium.push(new Wall_S(50, STADIUM_H / 2 + 60 + 90, 10, STADIUM_H / 2 + 60 + 90));
            newStadium.push(new Wall_S(10, STADIUM_H / 2 + 60 - 90, 50, STADIUM_H / 2 + 60 - 90));
            newStadium.push(new Wall_S(STADIUM_W - 50, STADIUM_H / 2 + 60 + 90, STADIUM_W - 10, STADIUM_H / 2 + 60 + 90));
            newStadium.push(new Wall_S(STADIUM_W - 50, STADIUM_H / 2 + 60 - 90, STADIUM_W - 10, STADIUM_H / 2 + 60 - 90));
            newStadium.push(new Wall_S(0, STADIUM_H / 2 + 60 + 90, 0, STADIUM_H / 2 + 60 - 90));
            newStadium.push(new Wall_S(STADIUM_W, STADIUM_H / 2 + 60 + 90, STADIUM_W, STADIUM_H / 2 + 60 - 90));
            break;
    }
    stadium_S.set(room, newStadium);
    sendStadium(room);
}
function sendStadium(room) {
    if (!stadium_S.has(room))
        return;
    // compute positions and emit to clients
    let stadiumParams = [];
    let stadiumRoom = stadium_S.get(room);
    for (const wall of stadiumRoom) {
        const wallType = (wall instanceof Wall_S) ? WALL_TYPE_S.WALL : WALL_TYPE_S.WALL_ARC;
        switch (wallType) {
            case WALL_TYPE_S.WALL:
                stadiumParams.push([wallType, wall.comp[0].vertex[0], wall.comp[0].vertex[1]]);
                break;
            case WALL_TYPE_S.WALL_ARC:
                const wallArc = wall;
                stadiumParams.push([wallType, wallArc.pos, wallArc.comp[0].r, wallArc.a_start, wallArc.a_end]);
                break;
        }
    }
    io.to(room).emit('newStadium', { walls: stadiumParams });
}
function playersReadyInRoom(room) {
    let pno = 0;
    for (const [id, player] of serverBalls) {
        if (player.layer === room && player.name)
            pno++;
    }
    // send game parameters
    io.to(room).emit('setNbPointsMatch', NB_POINTS_MATCH);
    io.to(room).emit('setBallRadius', BALL_RADIUS);
    return pno;
}
function newRandomBall() {
    const ballTypeNumber = Math.floor(3 * Math.random());
    const ballType = (ballTypeNumber == 2) ? BALL_TYPE_S.CAPSULE : BALL_TYPE_S.BALL;
    BALL_RADIUS = newRandomBallRadius(ballType);
    BALL_MASS = newRandomBallMass();
    let ball;
    switch (ballType) {
        case BALL_TYPE_S.BALL:
            ball = new Ball_S(STADIUM_W / 2, STADIUM_H / 2 + 60, BALL_RADIUS, BALL_MASS);
            return ball;
        case BALL_TYPE_S.CAPSULE:
            ball = new Capsule_S(STADIUM_W / 2 - BALL_CAPSULE_LENGTH / 2, STADIUM_H / 2 + 60, STADIUM_W / 2 + BALL_CAPSULE_LENGTH / 2, STADIUM_H / 2 + 60, BALL_RADIUS, BALL_RADIUS, BALL_MASS);
            return ball;
    }
}
function newRandomBallRadius(ballType) {
    let BALL_RADIUS_MIN = 10;
    let BALL_RADIUS_MAX = 40;
    if (ballType == BALL_TYPE_S.CAPSULE) {
        BALL_RADIUS_MIN = 5;
        BALL_RADIUS_MAX = 20;
    }
    return Math.floor(BALL_RADIUS_MIN + (BALL_RADIUS_MAX - BALL_RADIUS_MIN) * Math.random());
}
function newRandomBallMass() {
    const BALL_MASS_ARRAY = [1, 5, 10, 20, 100];
    return BALL_MASS_ARRAY[Math.floor(BALL_MASS_ARRAY.length * Math.random())];
    ;
}
function newRandomObstacles() {
    let newObstacles = [];
    // parameters
    const r = 15;
    const dxMax = 0.28 * STADIUM_W;
    const dyMax = 0.23 * STADIUM_H;
    // choose nb. of obstacles
    const nbObstaclesPercent = Math.floor(100 * Math.random());
    let obstaclesAppear = [false, false]; // no obstacles
    if (nbObstaclesPercent > 66)
        obstaclesAppear = [true, true]; // 2 obstacles pairs
    else if (nbObstaclesPercent > 33)
        obstaclesAppear = [true, false]; // 1 obstacles pair
    for (let appear of obstaclesAppear) {
        const dx = Math.round(2 * dxMax * Math.random() - dxMax);
        const dy = Math.round(2 * dyMax * Math.random() - dyMax);
        const distToCenter = distance(dx, 0, dy, 0);
        let x1 = (appear && distToCenter >= 50) ? STADIUM_W / 2 + dx : -100;
        let y1 = (appear && distToCenter >= 50) ? STADIUM_H / 2 + 60 + dy : -100;
        let x2 = (appear && distToCenter >= 50) ? STADIUM_W / 2 - dx : -100;
        let y2 = (appear && distToCenter >= 50) ? STADIUM_H / 2 + 60 - dy : -100;
        // add new obstacles pair
        newObstacles.push(new Star6_S(x1, y1, r, 0), new Star6_S(x2, y2, r, 0));
    }
    return newObstacles;
}
function isNumeric(value) {
    return !isNaN(value);
}
function distance(x1, x2, y1, y2) {
    return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
}
//# sourceMappingURL=server.js.map