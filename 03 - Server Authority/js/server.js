"use strict";
const MC = require('../js/mocorgo');
const BODIES_S = new Array();
const COLLISIONS_S = new Array();
;
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
// classes storing the primitive shapes: Line, Circle, Rectangle, Triangle
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
}
class Ball_S extends Body_S {
    constructor(x, y, r, m) {
        super(x, y);
        this.pos = new Vector_S(x, y);
        this.comp = [new Circle_S(x, y, r)];
        this.m = m;
        if (this.m === 0) {
            this.inv_m = 0;
        }
        else {
            this.inv_m = 1 / this.m;
        }
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
}
class Capsule_S extends Body_S {
    constructor(x1, y1, x2, y2, r, m) {
        super(x1, y1);
        this.comp = [new Circle_S(x1, y1, r), new Circle_S(x2, y2, r)];
        let recV1 = this.comp[1].pos.add(this.comp[1].pos.subtr(this.comp[0].pos).unit().normal().mult(r));
        let recV2 = this.comp[0].pos.add(this.comp[1].pos.subtr(this.comp[0].pos).unit().normal().mult(r));
        this.comp.unshift(new Rectangle_S(recV1.x, recV1.y, recV2.x, recV2.y, 2 * r));
        this.pos = this.comp[0].pos;
        this.m = m;
        if (this.m === 0) {
            this.inv_m = 0;
        }
        else {
            this.inv_m = 1 / this.m;
        }
        this.inertia = this.m * (Math.pow((2 * this.comp[0].width), 2) + Math.pow((this.comp[0].length + 2 * this.comp[0].width), 2)) / 12;
        if (this.m === 0) {
            this.inv_inertia = 0;
        }
        else {
            this.inv_inertia = 1 / this.inertia;
        }
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
}
class Box_S extends Body_S {
    constructor(x1, y1, x2, y2, w, m) {
        super(x1, y1);
        this.comp = [new Rectangle_S(x1, y1, x2, y2, w)];
        this.pos = this.comp[0].pos;
        this.m = m;
        if (this.m === 0) {
            this.inv_m = 0;
        }
        else {
            this.inv_m = 1 / this.m;
        }
        this.inertia = this.m * (Math.pow(this.comp[0].width, 2) + Math.pow(this.comp[0].length, 2)) / 12;
        if (this.m === 0) {
            this.inv_inertia = 0;
        }
        else {
            this.inv_inertia = 1 / this.inertia;
        }
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
}
class Star_S extends Body_S {
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
        if (this.m === 0) {
            this.inv_m = 0;
        }
        else {
            this.inv_m = 1 / this.m;
        }
        this.inertia = this.m * (Math.pow((2 * this.r), 2)) / 12;
        if (this.m === 0) {
            this.inv_inertia = 0;
        }
        else {
            this.inv_inertia = 1 / this.inertia;
        }
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
}
class Wall_S extends Body_S {
    constructor(x1, y1, x2, y2) {
        super((x1 + x2) / 2, (y1 + y2) / 2);
        this.comp = [new Line_S(x1, y1, x2, y2)];
        this.pos = new Vector_S((x1 + x2) / 2, (y1 + y2) / 2);
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
    //let bestSat = { pen: null, axis: null, vertex: null }
    let bestSat = new CollSat_S(-Number.MAX_SAFE_INTEGER, new Vector_S(0, 0), new Vector_S(0, 0), false);
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
function gameLogic() { }
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
    gameLogic();
    requestAnimationFrame(mainLoop_S);
}
function renderOnly_S() {
    renderLoop_S();
    requestAnimationFrame(renderOnly_S);
}
//************************* END OF PHYSICS ENGINE ***/
const DEPLOY = true;
const PORT = DEPLOY ? (process.env.PORT || 13000) : 5500;
const express = require('express');
const app = express();
let io;
//import * as MC from "./mocorgo.js";
//app.get('/', (req: any, res: any) => res.send('Hello World!'))*/
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
let playerPos = new Map();
let serverBalls = new Map();
putWallsAround_S(0, 0, 640, 480);
io.on('connection', connected);
setInterval(serverLoop_S, 1000 / 60);
function connected(socket) {
    socket.on('newPlayer', (playerCoords) => {
        console.log("New client connected, with id: " + socket.id);
        serverBalls.set(socket.id, new Capsule_S(playerCoords.x, playerCoords.y, playerCoords.x + 40, playerCoords.y, 40, 5));
        serverBalls.get(socket.id).maxSpeed = 5;
        serverBalls.get(socket.id).angle = 0;
        playerPos.set(socket.id, playerCoords);
        console.log("Starting position: " + playerCoords.x + " - " + playerCoords.y);
        console.log("Current number of players: " + playerPos.size /*Object.keys(playerPos).length*/);
        console.log("players dictionary: ", playerPos);
        const json = JSON.stringify(Array.from(playerPos)); // only works with 1D map
        io.emit('updatePlayers', json);
    });
    socket.on('disconnect', function () {
        if (serverBalls.has(socket.id)) {
            serverBalls.get(socket.id).remove();
            serverBalls.delete(socket.id);
        }
        if (playerPos.has(socket.id))
            playerPos.delete(socket.id);
        console.log("Goodbye client with id " + socket.id);
        console.log("Current number of players: " + Object.keys(playerPos).length);
        const json = JSON.stringify(Array.from(playerPos)); // only works with 1D map
        io.emit('updatePlayers', json);
    });
    socket.on('userCommands', (data) => {
        serverBalls.get(socket.id).left = data.left;
        serverBalls.get(socket.id).up = data.up;
        serverBalls.get(socket.id).right = data.right;
        serverBalls.get(socket.id).down = data.down;
        serverBalls.get(socket.id).action = data.action;
    });
}
function serverLoop_S() {
    userInteraction_S();
    physicsLoop_S();
    for (let [id, serverBall] of serverBalls) {
        let playerPosCur = playerPos.get(id);
        playerPosCur.x = serverBall.pos.x;
        playerPosCur.y = serverBall.pos.y;
        playerPosCur.angle = serverBall.angle;
    }
    //console.log(playerPos);
    const json = JSON.stringify(Array.from(playerPos)); // only works with 1D map
    io.emit('positionUpdate', json);
}
//# sourceMappingURL=server.js.map