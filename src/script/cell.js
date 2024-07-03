export class Cell {
  constructor(type, col, row, x, y) {
    this.setType(type, col, row, x, y); // empty/life/food/wall
    this.col = col;
    this.row = row;
    this.x = x;
    this.y = y;
    this.energy = 0; // 能量等级
    this.reproduce = 0; // 繁殖所需要的能量等级
  }

  setType(type) {
    this.type = type;
  }

  setEnergy(energy) {
    this.energy = energy;
  }

  setReproduce(reproduce) {
    this.reproduce = reproduce;
  }
}
