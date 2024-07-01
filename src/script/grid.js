import { Cell } from "./cell";

export class Grid {
  constructor(cols, rows, spaceX, spaceY, cell_size, stroke_width) {
    this.resize(cols, rows, spaceX, spaceY, cell_size, stroke_width);
  }

  resize(cols, rows, spaceX, spaceY, cell_size, stroke_width) {
    this.grid = [];
    this.cols = cols;
    this.rows = rows;
    for (let c = 0; c < cols; c++) {
      const x = spaceX + cell_size * c + stroke_width * c;
      let row = [];
      for (let r = 0; r < rows; r++) {
        const y = spaceY + cell_size * r + stroke_width * r;
        const cell = new Cell("empty", c, r, x, y);
        row.push(cell);
      }
      this.grid.push(row);
    }
  }

  cellAt(col, row) {
    if (!this.isValidLoc(col, row)) {
      return null;
    }
    return this.grid[col][row];
  }

  isValidLoc(col, row) {
    return col < this.cols && row < this.rows && col >= 0 && row >= 0;
  }
}
