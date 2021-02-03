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