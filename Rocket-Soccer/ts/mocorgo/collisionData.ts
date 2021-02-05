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

    // penetration resolution
    penRes(): void
    {
        if (this.o1.inv_m + this.o2.inv_m == 0)
            return;

        let penResolution: Vector = this.normal.mult(this.pen / (this.o1.inv_m + this.o2.inv_m));
        
        this.o1.pos = this.o1.pos.add(penResolution.mult(this.o1.inv_m));
        this.o2.pos = this.o2.pos.add(penResolution.mult(-this.o2.inv_m));
    }

    // collision response
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