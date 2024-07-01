export class Cell {
  constructor(type, col, row, x, y) {
    this.setType(type, col, row, x, y); // empty/life/food/wall
    this.col = col;
    this.row = row;
    this.x = x;
    this.y = y;
    this.energy = 0;
  }

  setType(type) {
    this.type = type;
  }

  setEnergy(energy) {
    this.energy = energy;
  }
}
