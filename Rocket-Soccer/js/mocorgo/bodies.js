"use strict";
//Parent class of the bodies (Ball, Capsule, Box, Star, Wall)
class Body {
    constructor(x, y) {
        this.comp = new Array();
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
        this.fill = true;
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
        this.images = Array();
        this.actionImage = new Image();
        BODIES.push(this);
    }
    render() {
        for (let i in this.comp) {
            this.comp[i].draw(this.color, this.fill, this.images[i], this.angle, this.up, this.actionImage);
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
        if (BODIES.indexOf(this) !== -1) {
            BODIES.splice(BODIES.indexOf(this), 1);
        }
    }
    setCollisions(value) {
        this.collides = value;
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
    setImages(urls) {
        for (let url of urls) {
            const image = new Image();
            image.src = url;
            this.images.push(image);
        }
    }
    setActionImage(url) {
        this.actionImage = new Image();
        this.actionImage.src = url;
    }
}
class Ball extends Body {
    constructor(x, y, r, m) {
        super(x, y);
        this.pos = new Vector(x, y);
        this.comp = [new Circle(x, y, r)];
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
class Capsule extends Body {
    constructor(x1, y1, x2, y2, r1, r2, m) {
        super(x1, y1);
        this.comp = [new Circle(x1, y1, r1), new Circle(x2, y2, r2)];
        let recV1 = this.comp[1].pos.add(this.comp[1].pos.subtr(this.comp[0].pos).unit().normal().mult(r1));
        let recV2 = this.comp[0].pos.add(this.comp[1].pos.subtr(this.comp[0].pos).unit().normal().mult(r1));
        this.comp.unshift(new Rectangle(recV1.x, recV1.y, recV2.x, recV2.y, 2 * r1));
        this.pos = this.comp[0].pos;
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
class Box extends Body {
    constructor(x1, y1, x2, y2, w, m) {
        super(x1, y1);
        this.comp = [new Rectangle(x1, y1, x2, y2, w)];
        this.pos = this.comp[0].pos;
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
class Star6 extends Body {
    constructor(x1, y1, r, m, color = "black") {
        super(x1, y1);
        this.comp = [];
        this.r = r;
        let center = new Vector(x1, y1);
        let upDir = new Vector(0, -1);
        let p1 = center.add(upDir.mult(r));
        let p2 = center.add(upDir.mult(-r / 2)).add(upDir.normal().mult(-r * Math.sqrt(3) / 2));
        let p3 = center.add(upDir.mult(-r / 2)).add(upDir.normal().mult(r * Math.sqrt(3) / 2));
        this.comp.push(new Triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y));
        p1 = center.add(upDir.mult(-r));
        p2 = center.add(upDir.mult(r / 2)).add(upDir.normal().mult(-r * Math.sqrt(3) / 2));
        p3 = center.add(upDir.mult(r / 2)).add(upDir.normal().mult(r * Math.sqrt(3) / 2));
        this.comp.push(new Triangle(p1.x, p1.y, p2.x, p2.y, p3.x, p3.y));
        this.pos = this.comp[0].pos;
        this.setMass(m);
        this.color = color;
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
    render() {
        if (this.images === undefined || this.images.length == 0)
            super.render();
        else {
            const image = this.images[0];
            if (this.angle == 0)
                ctx.drawImage(image, this.pos.x - this.r, this.pos.y - this.r, 2 * this.r, 2 * this.r);
            else
                drawRotatedImage(ctx, image, 2 * this.r, 2 * this.r, this.angle, this.pos.x, this.pos.y, this.r, this.r);
        }
    }
}
class Wall extends Body {
    constructor(x1, y1, x2, y2, color = "Black") {
        super((x1 + x2) / 2, (y1 + y2) / 2);
        this.comp = [new Line(x1, y1, x2, y2)];
        this.pos = new Vector((x1 + x2) / 2, (y1 + y2) / 2);
        this.color = color;
    }
}
class WallArc extends Body {
    constructor(x, y, r, a_start, a_end, color = "Black") {
        super(x, y);
        this.comp = [new Arc(x, y, r, a_start, a_end)];
        this.pos = new Vector(x, y);
        this.color = color;
        this.fill = false;
    }
}
class LineMark extends Body {
    constructor(x1, y1, x2, y2, color = "White") {
        super((x1 + x2) / 2, (y1 + y2) / 2);
        this.comp = [new Line(x1, y1, x2, y2)];
        this.pos = new Vector((x1 + x2) / 2, (y1 + y2) / 2);
        this.color = color;
        this.collides = false;
    }
}
class CircleMark extends Body {
    constructor(x, y, r, color = "White") {
        super(x, y);
        this.pos = new Vector(x, y);
        this.comp = [new Circle(x, y, r)];
        this.color = color;
        this.fill = false;
        this.collides = false;
    }
}
class ArcMark extends Body {
    constructor(x, y, r, a_start, a_end, color = "White") {
        super(x, y);
        this.pos = new Vector(x, y);
        this.comp = [new Arc(x, y, r, a_start, a_end)];
        this.color = color;
        this.fill = false;
        this.collides = false;
    }
}
var BALL_TYPE;
(function (BALL_TYPE) {
    BALL_TYPE[BALL_TYPE["BALL"] = 0] = "BALL";
    BALL_TYPE[BALL_TYPE["CAPSULE"] = 1] = "CAPSULE";
})(BALL_TYPE || (BALL_TYPE = {}));
;
var WALL_TYPE;
(function (WALL_TYPE) {
    WALL_TYPE[WALL_TYPE["WALL"] = 0] = "WALL";
    WALL_TYPE[WALL_TYPE["WALL_ARC"] = 1] = "WALL_ARC";
})(WALL_TYPE || (WALL_TYPE = {}));
;
//# sourceMappingURL=bodies.js.map