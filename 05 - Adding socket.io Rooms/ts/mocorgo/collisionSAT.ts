class CollSat
{
    pen: number;
    axis: Vector;
    vertex: Vector;
    overlaps: boolean;

    constructor(pen: number, axis: Vector, vertex: Vector, overlaps = true)
    {
        this.pen = pen;
        this.axis = axis;
        this.vertex = vertex;
        this.overlaps = overlaps;
    }
}