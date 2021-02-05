"use strict";
// classes storing the primitive shapes: Line, Circle, Rectangle, Triangle
class Shape {
    constructor() { }
    ; // dummy
}
class Line extends Shape {
    constructor(x0, y0, x1, y1) {
        super();
        this.vertex = new Array();
        this.vertex[0] = new Vector(x0, y0);
        this.vertex[1] = new Vector(x1, y1);
        this.dir = this.vertex[1].subtr(this.vertex[0]).unit();
        this.mag = this.vertex[1].subtr(this.vertex[0]).mag();
        this.pos = new Vector((this.vertex[0].x + this.vertex[1].x) / 2, (this.vertex[0].y + this.vertex[1].y) / 2);
    }
    draw(color, fill = true, image = null, angle = 0, action = false, actionImage = null) {
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
class Circle extends Shape {
    constructor(x, y, r) {
        super();
        this.vertex = new Array();
        this.pos = new Vector(x, y);
        this.r = r;
    }
    draw(color, fill = true, image = null, angle = 0, action = false, actionImage = null) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, 0, 2 * Math.PI);
        const drawColor = (color === "") ? "black" : color;
        if (image !== null) {
            if (angle == 0)
                ctx.drawImage(image, this.pos.x - this.r, this.pos.y - this.r, 2 * this.r, 2 * this.r);
            else
                drawRotatedImage(ctx, image, 2 * this.r, 2 * this.r, angle, this.pos.x, this.pos.y, this.r, this.r);
        }
        else if (!fill) {
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
class Arc extends Shape {
    constructor(x, y, r, a_start, a_end) {
        super();
        this.vertex = new Array();
        this.pos = new Vector(x, y);
        this.r = r;
        this.angle_start = a_start;
        this.angle_end = a_end;
    }
    draw(color, fill = true, image = null, angle = 0, action = false, actionImage = null) {
        ctx.beginPath();
        ctx.arc(this.pos.x, this.pos.y, this.r, this.angle_start, this.angle_end);
        const drawColor = (color === "") ? "black" : color;
        if (!fill) {
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
class Rectangle extends Shape {
    constructor(x1, y1, x2, y2, w) {
        super();
        this.vertex = new Array();
        this.vertex[0] = new Vector(x1, y1);
        this.vertex[1] = new Vector(x2, y2);
        this.dir = this.vertex[1].subtr(this.vertex[0]).unit();
        this.refDir = this.vertex[1].subtr(this.vertex[0]).unit();
        this.length = this.vertex[1].subtr(this.vertex[0]).mag();
        this.width = w;
        this.vertex[2] = this.vertex[1].add(this.dir.normal().mult(this.width));
        this.vertex[3] = this.vertex[2].add(this.dir.normal().mult(-this.length));
        this.pos = this.vertex[0].add(this.dir.mult(this.length / 2)).add(this.dir.normal().mult(this.width / 2));
        this.angle = 0;
        this.rotMat = new Matrix(2, 2);
        this.xy1 = new Vector(x1, y1);
        this.xy2 = new Vector(x2, y2 + w);
    }
    draw(color, fill = true, image = null, angle = 0, action = false, actionImage = null) {
        if (image !== null) {
            const xLength = this.xy2.x - this.xy1.x;
            const yLength = this.xy2.y - this.xy1.y;
            if (angle == 0)
                ctx.drawImage(image, this.pos.x - xLength / 2, this.pos.y - yLength / 2, xLength, yLength);
            else
                drawRotatedImage(ctx, image, xLength, yLength, angle, this.pos.x, this.pos.y, xLength / 2, yLength / 2);
        }
        else {
            ctx.beginPath();
            ctx.moveTo(this.vertex[0].x, this.vertex[0].y);
            ctx.lineTo(this.vertex[1].x, this.vertex[1].y);
            ctx.lineTo(this.vertex[2].x, this.vertex[2].y);
            ctx.lineTo(this.vertex[3].x, this.vertex[3].y);
            ctx.lineTo(this.vertex[0].x, this.vertex[0].y);
            const drawColor = (color === "") ? "black" : color;
            if (!fill) {
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
        if (action && actionImage !== null) {
            const xLength = 145; // specific
            const yLength = this.xy2.y - this.xy1.y;
            if (angle == 0)
                ctx.drawImage(actionImage, this.pos.x - xLength / 2, this.pos.y - yLength / 2, xLength, yLength);
            else
                drawRotatedImage(ctx, actionImage, xLength, yLength, angle, this.pos.x, this.pos.y, xLength / 2, yLength / 2);
        }
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
class Triangle extends Shape {
    constructor(x1, y1, x2, y2, x3, y3) {
        super();
        this.vertex = new Array();
        this.vertex[0] = new Vector(x1, y1);
        this.vertex[1] = new Vector(x2, y2);
        this.vertex[2] = new Vector(x3, y3);
        this.pos = new Vector((this.vertex[0].x + this.vertex[1].x + this.vertex[2].x) / 3, (this.vertex[0].y + this.vertex[1].y + this.vertex[2].y) / 3);
        this.dir = this.vertex[0].subtr(this.pos).unit();
        this.refDir = this.dir;
        this.refDiam = new Array();
        this.refDiam[0] = this.vertex[0].subtr(this.pos);
        this.refDiam[1] = this.vertex[1].subtr(this.pos);
        this.refDiam[2] = this.vertex[2].subtr(this.pos);
        this.angle = 0;
        this.rotMat = new Matrix(2, 2);
    }
    draw(color, fill = true, image = null, angle = 0, action = false, actionImage = null) {
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
// from https://stackoverflow.com/a/46921702
function drawRotatedImage(context, image, w, h, angleInRad, xCenter, yCenter, dx, dy) {
    context.save();
    context.translate(xCenter, yCenter);
    context.rotate(angleInRad);
    context.drawImage(image, -dx, -dy, w, h);
    context.restore();
}
//# sourceMappingURL=shapes.js.map