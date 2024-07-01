export class Cell {
  constructor(type, col, row, x, y) {
    this.setType(type, col, row, x, y); // empty/life/food/wall
    this.col = col;
    this.row = row;
    this.x = x;
    this.y = y;
  }

  setType(type) {
    this.type = type;
  }
}
