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

    color: string; fill: boolean;
    layer: number;

    up: boolean; down: boolean; left: boolean; right: boolean;
    action: boolean;
    vel: Vector; acc: Vector;

    keyForce: number; angKeyForce: number;
    angle: number; angVel: number;
    player: boolean;
    collides: boolean;

    images: Array<HTMLImageElement>;
    actionImage: HTMLImageElement;

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

        this.images = Array<HTMLImageElement>();
        this.actionImage = new Image();

        BODIES.push(this);
    }

    render(): void
    {
        for (let i in this.comp)
        {
            this.comp[i].draw(this.color, this.fill, this.images[i], this.angle,
                this.up, this.actionImage);
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

    setCollisions(value: boolean)
    {
        this.collides = value;
    }

    setMass(m: number)
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

    setImages(urls: Array<string>)
    {
        for (let url of urls)
        {
            const image:HTMLImageElement = new Image();
            image.src = url;
            this.images.push(image);
        }
    }

    setActionImage(url: string)
    {
        this.actionImage = new Image();
        this.actionImage.src = url;
    }
}

class Ball extends Body
{
    constructor(x: number, y: number, r: number, m: number)
    {
        super(x, y);
        this.pos = new Vector(x, y);
        this.comp = [new Circle(x, y, r)];
        this.setMass(m);
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

    setRadius(r: number)
    {
        (<Circle_S>this.comp[0]).r = r;
    }
}

class Capsule extends Body
{
    constructor(x1: number, y1: number, x2: number, y2: number, r1: number, r2: number, m: number)
    {
        super(x1, y1);
        this.comp = [new Circle(x1, y1, r1), new Circle(x2, y2, r2)];
        let recV1 = this.comp[1].pos.add(this.comp[1].pos.subtr(this.comp[0].pos).unit().normal().mult(r1));
        let recV2 = this.comp[0].pos.add(this.comp[1].pos.subtr(this.comp[0].pos).unit().normal().mult(r1));
        this.comp.unshift(new Rectangle(recV1.x, recV1.y, recV2.x, recV2.y, 2*r1));
        this.pos = this.comp[0].pos;
        this.setMass(m);
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

    setRadius(r: number)
    {
        for (let comp of this.comp)
        {
            if (comp instanceof Circle)
                comp.r = r;
            else if (comp instanceof Rectangle)
                comp.width = 2*r;
        }
    }

    setMass(m: number)
    {
        super.setMass(m);

        let baseRectangle: Rectangle_S = <Rectangle_S>(this.comp[0]);
        this.inertia = this.m * ((2*baseRectangle.width)**2 +(baseRectangle.length+2*baseRectangle.width)**2) / 12;
        if (this.m === 0)
            this.inv_inertia = 0;
        else
            this.inv_inertia = 1 / this.inertia;
    }
}

class Box extends Body
{
    constructor(x1: number, y1: number, x2: number, y2: number, w: number, m: number)
    {
        super(x1, y1);
        this.comp = [new Rectangle(x1, y1, x2, y2, w)];
        this.pos = this.comp[0].pos;
        this.setMass(m);
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

    setMass(m: number)
    {
        super.setMass(m);

        let baseRectangle: Rectangle_S = <Rectangle_S>(this.comp[0]);
        this.inertia = this.m * (baseRectangle.width**2 + baseRectangle.length**2) / 12;
        if (this.m === 0){
            this.inv_inertia = 0;
        } else {
            this.inv_inertia = 1 / this.inertia;
        }
    }
}

class Star6 extends Body
{
    r: number;

    constructor(x1: number, y1: number, r: number, m: number, color: string = "black")
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
        
        this.setMass(m);
        this.color = color;
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

    setRadius(r: number)
    {
        // TODO
    }

    setMass(m: number)
    {
        super.setMass(m);
        this.inertia = this.m * ((2*this.r)**2) / 12;
        if (this.m === 0){
            this.inv_inertia = 0;
        } else {
            this.inv_inertia = 1 / this.inertia;
        }
    }

    render()
    {
        if (this.images === undefined || this.images.length == 0)
            super.render();
        else
        {
            const image: HTMLImageElement = this.images[0];
            if (this.angle == 0)
                ctx.drawImage(image, this.pos.x - this.r, this.pos.y - this.r, 2*this.r, 2*this.r);
            else
                drawRotatedImage(ctx, image, 2*this.r, 2*this.r, this.angle,
                    this.pos.x, this.pos.y, this.r, this.r);
        }
    }
}

class Wall extends Body
{
    constructor(x1: number, y1: number, x2: number, y2: number, color: string = "Black")
    {
        super((x1+x2)/2, (y1+y2)/2);
        this.comp = [new Line(x1, y1, x2, y2)];
        this.pos = new Vector((x1+x2)/2, (y1+y2)/2);

        this.color = color;
    }
}

class WallArc extends Body
{
    constructor(x: number, y: number, r: number, a_start: number, a_end: number, color: string = "Black")
    {
        super(x, y);
        this.comp = [new Arc(x, y, r, a_start, a_end)];
        this.pos = new Vector(x, y);

        this.color = color;
        this.fill = false;
    }
}

class LineMark extends Body
{
    constructor(x1: number, y1: number, x2: number, y2: number, color: string = "White")
    {
        super((x1+x2)/2, (y1+y2)/2);
        this.comp = [new Line(x1, y1, x2, y2)];
        this.pos = new Vector((x1+x2)/2, (y1+y2)/2);

        this.color = color;
        this.collides = false;
    }
}

class CircleMark extends Body
{
    constructor(x: number, y: number, r: number, color: string = "White")
    {
        super(x, y);
        this.pos = new Vector(x, y);
        this.comp = [new Circle(x, y, r)];

        this.color = color;
        this.fill = false;
        this.collides = false;
    }
}

class ArcMark extends Body
{
    constructor(x: number, y: number, r: number, a_start: number, a_end: number, color: string = "White")
    {
        super(x, y);
        this.pos = new Vector(x, y);
        this.comp = [new Arc(x, y, r, a_start, a_end)];

        this.color = color;
        this.fill = false;
        this.collides = false;
    }
}

enum BALL_TYPE { BALL, CAPSULE };

enum WALL_TYPE { WALL, WALL_ARC };