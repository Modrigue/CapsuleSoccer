"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var BODIES_S = new Array();
var COLLISIONS_S = new Array();
;
var Vector_S = /** @class */ (function () {
    function Vector_S(x, y) {
        this.x = x;
        this.y = y;
    }
    Vector_S.prototype.set = function (x, y) {
        this.x = x;
        this.y = y;
    };
    Vector_S.prototype.add = function (v) {
        return new Vector_S(this.x + v.x, this.y + v.y);
    };
    Vector_S.prototype.subtr = function (v) {
        return new Vector_S(this.x - v.x, this.y - v.y);
    };
    Vector_S.prototype.mag = function () {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    };
    Vector_S.prototype.mult = function (n) {
        return new Vector_S(this.x * n, this.y * n);
    };
    Vector_S.prototype.normal = function () {
        return new Vector_S(-this.y, this.x).unit();
    };
    Vector_S.prototype.unit = function () {
        if (this.mag() === 0) {
            return new Vector_S(0, 0);
        }
        else {
            return new Vector_S(this.x / this.mag(), this.y / this.mag());
        }
    };
    Vector_S.prototype.drawVec = function (start_x, start_y, n, color) {
        ctx.beginPath();
        ctx.moveTo(start_x, start_y);
        ctx.lineTo(start_x + this.x * n, start_y + this.y * n);
        ctx.strokeStyle = color;
        ctx.stroke();
        ctx.closePath();
    };
    Vector_S.dot = function (v1, v2) {
        return v1.x * v2.x + v1.y * v2.y;
    };
    Vector_S.cross = function (v1, v2) {
        return v1.x * v2.y - v1.y * v2.x;
    };
    return Vector_S;
}());
var Matrix_S = /** @class */ (function () {
    function Matrix_S(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = [];
        for (var i = 0; i < this.rows; i++) {
            this.data[i] = [];
            for (var j = 0; j < this.cols; j++) {
                this.data[i][j] = 0;
            }
        }
    }
    Matrix_S.prototype.multiplyVec = function (vec) {
        var result = new Vector_S(0, 0);
        result.x = this.data[0][0] * vec.x + this.data[0][1] * vec.y;
        result.y = this.data[1][0] * vec.x + this.data[1][1] * vec.y;
        return result;
    };
    Matrix_S.prototype.rotMx22 = function (angle) {
        this.data[0][0] = Math.cos(angle);
        this.data[0][1] = -Math.sin(angle);
        this.data[1][0] = Math.sin(angle);
        this.data[1][1] = Math.cos(angle);
    };
    return Matrix_S;
}());
// classes storing the primitive shapes: Line, Circle, Rectangle, Triangle
var Shape_S = /** @class */ (function () {
    function Shape_S() {
    }
    ; // dummy
    return Shape_S;
}());
var Line_S = /** @class */ (function (_super) {
    __extends(Line_S, _super);
    function Line_S(x0, y0, x1, y1) {
        var _this = _super.call(this) || this;
        _this.vertex = new Array();
        _this.vertex[0] = new Vector_S(x0, y0);
        _this.vertex[1] = new Vector_S(x1, y1);
        _this.dir = _this.vertex[1].subtr(_this.vertex[0]).unit();
        _this.mag = _this.vertex[1].subtr(_this.vertex[0]).mag();
        _this.pos = new Vector_S((_this.vertex[0].x + _this.vertex[1].x) / 2, (_this.vertex[0].y + _this.vertex[1].y) / 2);
        return _this;
    }
    Line_S.prototype.draw = function (color) {
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
    };
    return Line_S;
}(Shape_S));
var Circle_S = /** @class */ (function (_super) {
    __extends(Circle_S, _super);
    function Circle_S(x, y, r) {
        var _this = _super.call(this) || this;
        _this.vertex = new Array();
        _this.pos = new Vector_S(x, y);
        _this.r = r;
        return _this;
    }
    Circle_S.prototype.draw = function (color) {
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
    };
    return Circle_S;
}(Shape_S));
var Rectangle_S = /** @class */ (function (_super) {
    __extends(Rectangle_S, _super);
    function Rectangle_S(x1, y1, x2, y2, w) {
        var _this = _super.call(this) || this;
        _this.vertex = new Array();
        _this.vertex[0] = new Vector_S(x1, y1);
        _this.vertex[1] = new Vector_S(x2, y2);
        _this.dir = _this.vertex[1].subtr(_this.vertex[0]).unit();
        _this.refDir = _this.vertex[1].subtr(_this.vertex[0]).unit();
        _this.length = _this.vertex[1].subtr(_this.vertex[0]).mag();
        _this.width = w;
        _this.vertex[2] = _this.vertex[1].add(_this.dir.normal().mult(_this.width));
        _this.vertex[3] = _this.vertex[2].add(_this.dir.normal().mult(-_this.length));
        _this.pos = _this.vertex[0].add(_this.dir.mult(_this.length / 2)).add(_this.dir.normal().mult(_this.width / 2));
        _this.angle = 0;
        _this.rotMat = new Matrix_S(2, 2);
        return _this;
    }
    Rectangle_S.prototype.draw = function (color) {
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
    };
    Rectangle_S.prototype.getVertices = function (angle) {
        this.rotMat.rotMx22(angle);
        this.dir = this.rotMat.multiplyVec(this.refDir);
        this.vertex[0] = this.pos.add(this.dir.mult(-this.length / 2)).add(this.dir.normal().mult(this.width / 2));
        this.vertex[1] = this.pos.add(this.dir.mult(-this.length / 2)).add(this.dir.normal().mult(-this.width / 2));
        this.vertex[2] = this.pos.add(this.dir.mult(this.length / 2)).add(this.dir.normal().mult(-this.width / 2));
        this.vertex[3] = this.pos.add(this.dir.mult(this.length / 2)).add(this.dir.normal().mult(this.width / 2));
    };
    return Rectangle_S;
}(Shape_S));
var Triangle_S = /** @class */ (function (_super) {
    __extends(Triangle_S, _super);
    function Triangle_S(x1, y1, x2, y2, x3, y3) {
        var _this = _super.call(this) || this;
        _this.vertex = new Array();
        _this.vertex[0] = new Vector_S(x1, y1);
        _this.vertex[1] = new Vector_S(x2, y2);
        _this.vertex[2] = new Vector_S(x3, y3);
        _this.pos = new Vector_S((_this.vertex[0].x + _this.vertex[1].x + _this.vertex[2].x) / 3, (_this.vertex[0].y + _this.vertex[1].y + _this.vertex[2].y) / 3);
        _this.dir = _this.vertex[0].subtr(_this.pos).unit();
        _this.refDir = _this.dir;
        _this.refDiam = new Array();
        _this.refDiam[0] = _this.vertex[0].subtr(_this.pos);
        _this.refDiam[1] = _this.vertex[1].subtr(_this.pos);
        _this.refDiam[2] = _this.vertex[2].subtr(_this.pos);
        _this.angle = 0;
        _this.rotMat = new Matrix_S(2, 2);
        return _this;
    }
    Triangle_S.prototype.draw = function (color) {
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
    };
    Triangle_S.prototype.getVertices = function (angle) {
        this.rotMat.rotMx22(angle);
        this.dir = this.rotMat.multiplyVec(this.refDir);
        this.vertex[0] = this.pos.add(this.rotMat.multiplyVec(this.refDiam[0]));
        this.vertex[1] = this.pos.add(this.rotMat.multiplyVec(this.refDiam[1]));
        this.vertex[2] = this.pos.add(this.rotMat.multiplyVec(this.refDiam[2]));
    };
    return Triangle_S;
}(Shape_S));
//Parent class of the bodies (Ball, Capsule, Box, Star, Wall)
var Body_S = /** @class */ (function () {
    function Body_S(x, y) {
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
    Body_S.prototype.render = function () {
        for (var i in this.comp) {
            this.comp[i].draw(this.color);
        }
    };
    Body_S.prototype.reposition = function () {
        this.acc = this.acc.unit().mult(this.keyForce);
        this.vel = this.vel.add(this.acc);
        this.vel = this.vel.mult(1 - this.friction);
        if (this.vel.mag() > this.maxSpeed && this.maxSpeed !== 0) {
            this.vel = this.vel.unit().mult(this.maxSpeed);
        }
        //this.angVel *= (1-this.angFriction);
        this.angVel = this.angVel * (1 - this.angFriction);
    };
    Body_S.prototype.keyControl = function () { };
    Body_S.prototype.remove = function () {
        if (BODIES_S.indexOf(this) !== -1) {
            BODIES_S.splice(BODIES_S.indexOf(this), 1);
        }
    };
    return Body_S;
}());
var Ball_S = /** @class */ (function (_super) {
    __extends(Ball_S, _super);
    function Ball_S(x, y, r, m) {
        var _this = _super.call(this, x, y) || this;
        _this.pos = new Vector_S(x, y);
        _this.comp = [new Circle_S(x, y, r)];
        _this.m = m;
        if (_this.m === 0) {
            _this.inv_m = 0;
        }
        else {
            _this.inv_m = 1 / _this.m;
        }
        return _this;
    }
    Ball_S.prototype.setPosition = function (x, y, a) {
        if (a === void 0) { a = this.angle; }
        this.pos.set(x, y);
        this.comp[0].pos = this.pos;
    };
    Ball_S.prototype.reposition = function () {
        _super.prototype.reposition.call(this);
        this.setPosition(this.pos.add(this.vel).x, this.pos.add(this.vel).y);
    };
    Ball_S.prototype.keyControl = function () {
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
    };
    return Ball_S;
}(Body_S));
var Capsule_S = /** @class */ (function (_super) {
    __extends(Capsule_S, _super);
    function Capsule_S(x1, y1, x2, y2, r, m) {
        var _this = _super.call(this, x1, y1) || this;
        _this.comp = [new Circle_S(x1, y1, r), new Circle_S(x2, y2, r)];
        var recV1 = _this.comp[1].pos.add(_this.comp[1].pos.subtr(_this.comp[0].pos).unit().normal().mult(r));
        var recV2 = _this.comp[0].pos.add(_this.comp[1].pos.subtr(_this.comp[0].pos).unit().normal().mult(r));
        _this.comp.unshift(new Rectangle_S(recV1.x, recV1.y, recV2.x, recV2.y, 2 * r));
        _this.pos = _this.comp[0].pos;
        _this.m = m;
        if (_this.m === 0) {
            _this.inv_m = 0;
        }
        else {
            _this.inv_m = 1 / _this.m;
        }
        _this.inertia = _this.m * (Math.pow((2 * _this.comp[0].width), 2) + Math.pow((_this.comp[0].length + 2 * _this.comp[0].width), 2)) / 12;
        if (_this.m === 0) {
            _this.inv_inertia = 0;
        }
        else {
            _this.inv_inertia = 1 / _this.inertia;
        }
        return _this;
    }
    Capsule_S.prototype.keyControl = function () {
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
    };
    Capsule_S.prototype.setPosition = function (x, y, a) {
        if (a === void 0) { a = this.angle; }
        this.pos.set(x, y);
        this.angle = a;
        this.comp[0].pos = this.pos;
        this.comp[0].getVertices(this.angle + this.angVel);
        this.comp[1].pos = this.comp[0].pos.add(this.comp[0].dir.mult(-this.comp[0].length / 2));
        this.comp[2].pos = this.comp[0].pos.add(this.comp[0].dir.mult(this.comp[0].length / 2));
        this.angle += this.angVel;
    };
    Capsule_S.prototype.reposition = function () {
        _super.prototype.reposition.call(this);
        this.setPosition(this.pos.add(this.vel).x, this.pos.add(this.vel).y);
    };
    return Capsule_S;
}(Body_S));
var Box_S = /** @class */ (function (_super) {
    __extends(Box_S, _super);
    function Box_S(x1, y1, x2, y2, w, m) {
        var _this = _super.call(this, x1, y1) || this;
        _this.comp = [new Rectangle_S(x1, y1, x2, y2, w)];
        _this.pos = _this.comp[0].pos;
        _this.m = m;
        if (_this.m === 0) {
            _this.inv_m = 0;
        }
        else {
            _this.inv_m = 1 / _this.m;
        }
        _this.inertia = _this.m * (Math.pow(_this.comp[0].width, 2) + Math.pow(_this.comp[0].length, 2)) / 12;
        if (_this.m === 0) {
            _this.inv_inertia = 0;
        }
        else {
            _this.inv_inertia = 1 / _this.inertia;
        }
        return _this;
    }
    Box_S.prototype.keyControl = function () {
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
    };
    Box_S.prototype.setPosition = function (x, y, a) {
        if (a === void 0) { a = this.angle; }
        this.pos.set(x, y);
        this.angle = a;
        this.comp[0].pos = this.pos;
        this.comp[0].getVertices(this.angle + this.angVel);
        this.angle += this.angVel;
    };
    Box_S.prototype.reposition = function () {
        _super.prototype.reposition.call(this);
        this.setPosition(this.pos.add(this.vel).x, this.pos.add(this.vel).y);
    };
    return Box_S;
}(Body_S));
var Star_S = /** @class */ (function (_super) {
    __extends(Star_S, _super);
    function Star_S(x1, y1, r, m) {
        var _this = _super.call(this, x1, y1) || this;
        _this.comp = [];
        _this.r = r;
        var center = new Vector_S(x1, y1);
        var upDir = new Vector_S(0, -1);
        var p1 = center.add(upDir.mult(r));
        var p2 = center.add(upDir.mult(-r / 2)).add(upDir.normal().mult(-r * Math.sqrt(3) / 2));
        var p3 = center.add(upDir.mult(-r / 2)).add(upDir.normal().mult(r * Math.sqrt(3) / 2));
        _this.comp.push(new Triangle_S(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y));
        p1 = center.add(upDir.mult(-r));
        p2 = center.add(upDir.mult(r / 2)).add(upDir.normal().mult(-r * Math.sqrt(3) / 2));
        p3 = center.add(upDir.mult(r / 2)).add(upDir.normal().mult(r * Math.sqrt(3) / 2));
        _this.comp.push(new Triangle_S(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y));
        _this.pos = _this.comp[0].pos;
        _this.m = m;
        if (_this.m === 0) {
            _this.inv_m = 0;
        }
        else {
            _this.inv_m = 1 / _this.m;
        }
        _this.inertia = _this.m * (Math.pow((2 * _this.r), 2)) / 12;
        if (_this.m === 0) {
            _this.inv_inertia = 0;
        }
        else {
            _this.inv_inertia = 1 / _this.inertia;
        }
        return _this;
    }
    Star_S.prototype.keyControl = function () {
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
    };
    Star_S.prototype.setPosition = function (x, y, a) {
        if (a === void 0) { a = this.angle; }
        this.pos.set(x, y);
        this.angle = a;
        this.comp[0].pos = this.pos;
        this.comp[1].pos = this.pos;
        this.comp[0].getVertices(this.angle + this.angVel);
        this.comp[1].getVertices(this.angle + this.angVel);
        this.angle += this.angVel;
    };
    Star_S.prototype.reposition = function () {
        _super.prototype.reposition.call(this);
        this.setPosition(this.pos.add(this.vel).x, this.pos.add(this.vel).y);
    };
    return Star_S;
}(Body_S));
var Wall_S = /** @class */ (function (_super) {
    __extends(Wall_S, _super);
    function Wall_S(x1, y1, x2, y2) {
        var _this = _super.call(this, (x1 + x2) / 2, (y1 + y2) / 2) || this;
        _this.comp = [new Line_S(x1, y1, x2, y2)];
        _this.pos = new Vector_S((x1 + x2) / 2, (y1 + y2) / 2);
        return _this;
    }
    return Wall_S;
}(Body_S));
//Collision manifold, consisting the data for collision handling
//Manifolds are collected in an array for every frame
var CollData_S = /** @class */ (function () {
    function CollData_S(o1, o2, normal, pen, cp) {
        this.o1 = o1;
        this.o2 = o2;
        this.normal = normal;
        this.pen = pen;
        this.cp = cp;
    }
    CollData_S.prototype.penRes = function () {
        if (this.o1.inv_m + this.o2.inv_m == 0)
            return;
        var penResolution = this.normal.mult(this.pen / (this.o1.inv_m + this.o2.inv_m));
        this.o1.pos = this.o1.pos.add(penResolution.mult(this.o1.inv_m));
        this.o2.pos = this.o2.pos.add(penResolution.mult(-this.o2.inv_m));
    };
    CollData_S.prototype.collRes = function () {
        //1. Closing velocity
        var collArm1 = this.cp.subtr(this.o1.comp[0].pos);
        var rotVel1 = new Vector_S(-this.o1.angVel * collArm1.y, this.o1.angVel * collArm1.x);
        var closVel1 = this.o1.vel.add(rotVel1);
        var collArm2 = this.cp.subtr(this.o2.comp[0].pos);
        var rotVel2 = new Vector_S(-this.o2.angVel * collArm2.y, this.o2.angVel * collArm2.x);
        var closVel2 = this.o2.vel.add(rotVel2);
        //2. Impulse augmentation
        var impAug1 = Vector_S.cross(collArm1, this.normal);
        impAug1 = impAug1 * this.o1.inv_inertia * impAug1;
        var impAug2 = Vector_S.cross(collArm2, this.normal);
        impAug2 = impAug2 * this.o2.inv_inertia * impAug2;
        var relVel = closVel1.subtr(closVel2);
        var sepVel = Vector_S.dot(relVel, this.normal);
        var new_sepVel = -sepVel * Math.min(this.o1.elasticity, this.o2.elasticity);
        var vsep_diff = new_sepVel - sepVel;
        var impulseDenom = this.o1.inv_m + this.o2.inv_m + impAug1 + impAug2;
        var impulse = (impulseDenom > 0) ?
            vsep_diff / (this.o1.inv_m + this.o2.inv_m + impAug1 + impAug2) : 0;
        var impulseVec = this.normal.mult(impulse);
        //3. Changing the velocities
        this.o1.vel = this.o1.vel.add(impulseVec.mult(this.o1.inv_m));
        this.o2.vel = this.o2.vel.add(impulseVec.mult(-this.o2.inv_m));
        this.o1.angVel += this.o1.inv_inertia * Vector_S.cross(collArm1, impulseVec);
        this.o2.angVel -= this.o2.inv_inertia * Vector_S.cross(collArm2, impulseVec);
    };
    return CollData_S;
}());
var CollSat_S = /** @class */ (function () {
    function CollSat_S(pen, axis, vertex, overlaps) {
        if (overlaps === void 0) { overlaps = true; }
        this.pen = pen;
        this.axis = axis;
        this.vertex = vertex;
        this.overlaps = overlaps;
    }
    return CollSat_S;
}());
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
    var minOverlap = -Number.MAX_SAFE_INTEGER;
    var smallestAxis = new Vector_S(0, 0); // dummy
    var vertexObj = new Line_S(0, 0, 1, 1); // dummy
    var axes = findAxes_S(o1, o2);
    var proj1;
    var proj2;
    var firstShapeAxes = getShapeAxes_S(o1);
    for (var i = 0; i < axes.length; i++) {
        proj1 = projShapeOntoAxis_S(axes[i], o1);
        proj2 = projShapeOntoAxis_S(axes[i], o2);
        var overlap = Math.min(proj1.max, proj2.max) - Math.max(proj1.min, proj2.min);
        if (overlap < 0) {
            return new CollSat_S(-Number.MAX_SAFE_INTEGER, new Vector_S(0, 0), new Vector_S(0, 0), false);
        }
        if ((proj1.max > proj2.max && proj1.min < proj2.min) ||
            (proj1.max < proj2.max && proj1.min > proj2.min)) {
            var mins = Math.abs(proj1.min - proj2.min);
            var maxs = Math.abs(proj1.max - proj2.max);
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
    var contactVertex = projShapeOntoAxis_S(smallestAxis, vertexObj).collVertex;
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
    var min = Vector_S.dot(axis, obj.vertex[0]);
    var max = min;
    var collVertex = obj.vertex[0];
    for (var i = 0; i < obj.vertex.length; i++) {
        var p = Vector_S.dot(axis, obj.vertex[i]);
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
    var axes = new Array();
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
    var closestVertex = new Vector_S(0, 0);
    var minDist = -1;
    for (var i = 0; i < obj.vertex.length; i++) {
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
    var edge1 = new Wall_S(x1, y1, x2, y1);
    var edge2 = new Wall_S(x2, y1, x2, y2);
    var edge3 = new Wall_S(x2, y2, x1, y2);
    var edge4 = new Wall_S(x1, y2, x1, y1);
}
function collide_S(o1, o2) {
    //let bestSat = { pen: null, axis: null, vertex: null }
    var bestSat = new CollSat_S(-Number.MAX_SAFE_INTEGER, new Vector_S(0, 0), new Vector_S(0, 0), false);
    for (var o1comp = 0; o1comp < o1.comp.length; o1comp++) {
        for (var o2comp = 0; o2comp < o2.comp.length; o2comp++) {
            if ((sat_S(o1.comp[o1comp], o2.comp[o2comp]).pen > bestSat.pen) || bestSat.pen == -Number.MAX_SAFE_INTEGER) {
                bestSat = sat_S(o1.comp[o1comp], o2.comp[o2comp]);
            }
        }
    }
    return bestSat;
}
function userInteraction_S() {
    BODIES_S.forEach(function (b) {
        b.keyControl();
    });
}
function physicsLoop_S( /*timestamp*/) {
    COLLISIONS_S.length = 0;
    BODIES_S.forEach(function (b) {
        b.reposition();
    });
    BODIES_S.forEach(function (b, index) {
        for (var bodyPair = index + 1; bodyPair < BODIES_S.length; bodyPair++) {
            var bodyRef = BODIES_S[index];
            var bodyProbe = BODIES_S[bodyPair];
            if (bodyRef.layer === bodyProbe.layer ||
                bodyRef.layer === 0 || bodyProbe.layer === 0) {
                var bestSat = collide_S(bodyRef, bodyProbe);
                if (bestSat.overlaps)
                    COLLISIONS_S.push(new CollData_S(bodyRef, bodyProbe, bestSat.axis, bestSat.pen, bestSat.vertex));
            }
        }
    });
    COLLISIONS_S.forEach(function (c) {
        c.penRes();
        c.collRes();
    });
}
function renderLoop_S() {
    ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);
    BODIES.forEach(function (b) {
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
//************************* END OF PHYSICS ENGINE ***/
var DEPLOY = true;
var PORT = DEPLOY ? (process.env.PORT || 13000) : 5500;
var express = require('express');
var app = express();
var io;
//import * as MC from "./mocorgo.js";
//app.get('/', (req: any, res: any) => res.send('Hello World!'))*/
if (DEPLOY) {
    app.use(express.static('.'));
    var http = require('http').Server(app);
    io = require('socket.io')(http);
    app.get('/', function (req, res) { return res.sendFile(__dirname + '../index.html'); });
    http.listen(PORT, function () {
        console.log("listening on port " + PORT + "...");
    });
}
else {
    io = require('socket.io')(PORT);
    app.get('/', function (req, res) { return res.send('Hello World!'); });
}
buildStadium_S();
var Player_S = /** @class */ (function (_super) {
    __extends(Player_S, _super);
    function Player_S() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.score = 0;
        _this.no = 0;
        return _this;
    }
    return Player_S;
}(Capsule_S));
var serverBalls = new Map();
var football_S = new Map();
var footballPos;
var playerReg = new Map();
var clientNo = 0;
var roomNo;
io.on('connection', connected);
setInterval(serverLoop, 1000 / 60);
function connected(socket) {
    clientNo++;
    roomNo = Math.ceil(clientNo / 2);
    socket.join(roomNo);
    console.log("New client no.: " + clientNo + ", room no.: " + roomNo);
    if (clientNo % 2 === 1) {
        //creating player 1
        var newPlayer = new Player_S(80, 270, 150, 270, 25, 10);
        newPlayer.maxSpeed = 4;
        newPlayer.no = 1;
        newPlayer.layer = roomNo;
        serverBalls.set(socket.id, newPlayer);
        playerReg.set(socket.id, { x: 115, y: 270, no: 1, angle: 0, roomNo: roomNo });
    }
    else if (clientNo % 2 === 0) {
        //creating player 2
        var newPlayer = new Player_S(560, 270, 490, 270, 25, 10);
        newPlayer.maxSpeed = 4;
        newPlayer.no = 2;
        newPlayer.layer = roomNo;
        serverBalls.set(socket.id, newPlayer);
        playerReg.set(socket.id, { x: 525, y: 270, no: 2, angle: 0, roomNo: roomNo });
        // create football
        var newBall = new Ball_S(320, 270, 20, 6);
        newBall.layer = roomNo;
        football_S.set(roomNo, newBall);
        io.emit('updateFootball', { x: newBall.pos.x, y: newBall.pos.y });
    }
    for (var _i = 0, serverBalls_1 = serverBalls; _i < serverBalls_1.length; _i++) {
        var _a = serverBalls_1[_i], id = _a[0], player = _a[1];
        io.to(player.layer).emit('updateConnections', playerReg.get(id));
    }
    socket.on('disconnect', function () {
        var room = serverBalls.get(socket.id).layer;
        if (football_S.has(room)) {
            football_S.get(room).remove();
            football_S["delete"](room);
        }
        if (serverBalls.has(socket.id)) {
            serverBalls.get(socket.id).remove();
            io.to(room).emit('deletePlayer', playerReg.get(socket.id));
            serverBalls["delete"](socket.id);
        }
        if (playerReg.has(socket.id))
            playerReg["delete"](socket.id);
        console.log(playerReg);
        console.log("Number of players: " + playerReg.size);
        console.log("Number of balls: " + football_S.size);
        console.log("Number of BODIES: " + (BODIES.length - 12));
        console.log("Joined players ever: " + clientNo);
        io.emit('updateConnections', playerReg);
    });
    console.log(playerReg);
    console.log("Number of players: " + playerReg.size);
    console.log("Number of balls: " + football_S.size);
    console.log("Number of BODIES: " + (BODIES.length - 12));
    console.log("Joined players ever: " + clientNo);
    socket.on('userCommands', function (data) {
        serverBalls.get(socket.id).left = data.left;
        serverBalls.get(socket.id).up = data.up;
        serverBalls.get(socket.id).right = data.right;
        serverBalls.get(socket.id).down = data.down;
        serverBalls.get(socket.id).action = data.action;
    });
}
function serverLoop() {
    userInteraction();
    physicsLoop();
    for (var _i = 0, serverBalls_2 = serverBalls; _i < serverBalls_2.length; _i++) {
        var _a = serverBalls_2[_i], id = _a[0], player = _a[1];
        io.to(player.layer).emit('positionUpdate', {
            id: id,
            x: player.pos.x,
            y: player.pos.y,
            angle: player.angle
        });
    }
    for (var room = 1; room <= roomNo; room++) {
        if (!football_S.has(room)) {
            //console.log("waiting for 2 players...");
        }
        else {
            var footballCur = football_S.get(room);
            gameLogic_S(room);
            io.to(room).emit('updateFootball', {
                x: footballCur.pos.x,
                y: footballCur.pos.y
            });
        }
    }
}
function gameLogic_S(room) {
    var footballCur = football_S.get(room);
    if (footballCur.pos.x < 45 || footballCur.pos.x > 595)
        scoring(room);
    for (var _i = 0, serverBalls_3 = serverBalls; _i < serverBalls_3.length; _i++) {
        var _a = serverBalls_3[_i], id = _a[0], player = _a[1];
        if (player.score === 3 && player.layer === room)
            gameOver(room);
    }
}
function gameOver(room) {
    gameSetup(room);
    io.to(room).emit('updateScore', null);
    setTimeout(function () {
        for (var _i = 0, serverBalls_4 = serverBalls; _i < serverBalls_4.length; _i++) {
            var _a = serverBalls_4[_i], id = _a[0], player = _a[1];
            if (player.layer === room)
                player.score = 0;
        }
    }, 2000);
}
function scoring(room) {
    var scorerId = "";
    var footballCur = football_S.get(room);
    if (footballCur.pos.x < 45) {
        for (var _i = 0, serverBalls_5 = serverBalls; _i < serverBalls_5.length; _i++) {
            var _a = serverBalls_5[_i], id = _a[0], player = _a[1];
            if (player.no === 2 && player.layer === room) {
                player.score++;
                scorerId = id;
                console.log("score for player 2!");
            }
        }
    }
    if (footballCur.pos.x > 595) {
        for (var _b = 0, serverBalls_6 = serverBalls; _b < serverBalls_6.length; _b++) {
            var _c = serverBalls_6[_b], id = _c[0], player = _c[1];
            if (player.no === 1 && player.layer === room) {
                player.score++;
                scorerId = id;
                console.log("score for player 1!");
            }
        }
    }
    gameSetup(room);
    io.to(room).emit('updateScore', scorerId);
}
function gameSetup(room) {
    for (var _i = 0, serverBalls_7 = serverBalls; _i < serverBalls_7.length; _i++) {
        var _a = serverBalls_7[_i], id = _a[0], player = _a[1];
        if (player.no === 1 && player.layer === room) {
            player.vel.set(0, 0);
            player.angVel = 0;
            player.setPosition(115, 270, 0);
        }
        if (player.no === 2 && player.layer === room) {
            player.vel.set(0, 0);
            player.angVel = 0;
            player.setPosition(525, 270, 0);
        }
    }
    var footballCur = football_S.get(room);
    footballCur.pos.set(320, 270);
    footballCur.vel.set(0, 0);
}
function buildStadium_S() {
    new Wall_S(60, 80, 580, 80);
    new Wall_S(60, 460, 580, 460);
    new Wall_S(60, 80, 60, 180);
    new Wall_S(60, 460, 60, 360);
    new Wall_S(580, 80, 580, 180);
    new Wall_S(580, 460, 580, 360);
    new Wall_S(50, 360, 10, 360);
    new Wall_S(0, 360, 0, 180);
    new Wall_S(10, 180, 50, 180);
    new Wall_S(590, 360, 630, 360);
    new Wall_S(640, 360, 640, 180);
    new Wall_S(630, 180, 590, 180);
}
