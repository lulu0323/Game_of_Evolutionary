import { Grid } from "./grid";

export class World {
  /**
   * @param cell_size 网格分区像素大小
   */
  constructor(cell_size) {
    this.cellSize = cell_size;
    this.lessEnergy = 2;
    this.strokeWidth = 1;
    this.lifeColor = "#00c638";
    this.foodColor = "#199d9d";
    this.wallColor = "#600064";
    this.gridBorderColor = "#282828";
    this.emptyGridColor = "#a9a9a9";
    this.worldCanvas = this.initWorldCanvas();
    this.num_cols = 0;
    this.num_rows = 0;
    this.spaceX = 0;
    this.spaceY = 0;
    this.grid_map = undefined;
    this.resetWorld(cell_size);
  }

  update() {
    let newGrid = [];
    for (let c = 0; c < this.num_cols; c++) {
      let newRow = [];
      for (let r = 0; r < this.num_rows; r++) {
        let cell = this.grid_map.grid[c][r];
        if (cell.type === 'life') {
          const rdNum = Math.ceil(Math.random() * 10);
          const rdNum2 = Math.ceil(Math.random() * 10);
          let newR = rdNum > 5 ? r + 1 : r - 1;
          let newC = rdNum2 > 5 ?  c + 1 : c -1;
          newR = newR > -1 ? newR : r;
          newC = newC > -1 ? newC : c;
          let nextCell = this.grid_map.grid[newC][newR];
        }
      }
    }
  }

  renderRandomWorld(total_energy) {
    let foodTotal = 0;
    let lifeTotal = 0;
    let totalEnergy = total_energy || 100;
    for (let c = 0; c < this.num_cols; c++) {
      for (let r = 0; r < this.num_rows; r++) {
        const randomNumber = Math.ceil(Math.random() * 10); // 1-10 random
        if (totalEnergy > 0) {
          if (randomNumber > 0 && randomNumber < 3) {
            // 20% empty
            this.grid_map.grid[c][r].setType("empty");
          } else if (randomNumber > 2 && randomNumber < 5) {
            // 20% wall
            this.grid_map.grid[c][r].setType("wall");
          } else if (randomNumber > 4 && randomNumber < 8) {
            // 30% food
            this.grid_map.grid[c][r].setType("food");
            foodTotal += 1;
          } else {
            // 30% life
            const rdEny = Math.ceil(Math.random() * totalEnergy);
            totalEnergy -= rdEny;
            this.grid_map.grid[c][r].setType("life");
            this.grid_map.grid[c][r].setEnergy(rdEny);
            lifeTotal += 1;
          }
        } else {
          if (randomNumber > 0 && randomNumber < 3) {
            // 20% empty
            this.grid_map.grid[c][r].setType("empty");
          } else if (randomNumber > 2 && randomNumber < 5) {
            // 20% wall
            this.grid_map.grid[c][r].setType("wall");
          } else {
            // 60% food
            this.grid_map.grid[c][r].setType("food");
            foodTotal += 1;
          }
        }
        this.renderCell(this.grid_map.grid[c][r]);
      }
    }
    return {
      food: foodTotal,
      life: lifeTotal
    }
  }

  resetWorld(cell_size) {
    this.cellSize = cell_size;
    this.num_cols = Math.floor(
      this.worldCanvas.width / (this.cellSize + this.strokeWidth)
    );
    this.num_rows = Math.floor(
      this.worldCanvas.height / (this.cellSize + this.strokeWidth)
    );
    const widthWithoutStroke =
      this.worldCanvas.width - this.strokeWidth * (this.num_cols + 1);
    this.spaceX = (widthWithoutStroke % this.cellSize) / 2;
    const heightWithoutStroke =
      this.worldCanvas.height - this.strokeWidth * (this.num_rows + 1);
    this.spaceY = (heightWithoutStroke % this.cellSize) / 2;

    if (!this.grid_map) {
      this.grid_map = new Grid(
        this.num_cols,
        this.num_rows,
        this.spaceX,
        this.spaceY,
        this.cellSize,
        this.strokeWidth
      );
    } else {
      this.grid_map.resize(
        this.num_cols,
        this.num_rows,
        this.spaceX,
        this.spaceY,
        this.cellSize,
        this.strokeWidth
      );
    }
    this.initWorldGrid(this.grid_map.grid);
  }

  initWorldCanvas() {
    const containerBox = document.getElementById("screenBox");
    const xPixel = containerBox.clientWidth;
    const yPixel = containerBox.clientHeight;
    const canvas = document.createElement("canvas");
    canvas.id = "luzhijian0323";
    canvas.width = xPixel;
    canvas.height = yPixel;
    containerBox.appendChild(canvas);
    return canvas;
  }

  initWorldGrid(grid) {
    for (let col of grid) {
      for (let cell of col) {
        this.renderCell(cell);
      }
    }
  }

  renderCell(cell) {
    let color = this.emptyGridColor;
    if (cell.type === "life") {
      color = this.lifeColor;
    } else if (cell.type === "food") {
      color = this.foodColor;
    } else if (cell.type === "wall") {
      color = this.wallColor;
    }
    const context = this.worldCanvas.getContext("2d");
    context.save();
    context.fillStyle = color;
    context.fillRect(cell.x, cell.y, this.cellSize, this.cellSize);
    context.lineWidth = this.strokeWidth;
    context.strokeStyle = this.gridBorderColor;
    context.strokeRect(cell.x, cell.y, this.cellSize, this.cellSize);
  }
}
