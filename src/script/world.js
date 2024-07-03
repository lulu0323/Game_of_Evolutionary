import { Grid } from "./grid";
import DeepClone from "./DeepClone";
import {clone} from "node-notifier/lib/utils";
import {getRandomKey} from "./util";

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
    let startTime = Date.now();
    let lifeNextData = {};
    function setLifeData(col, row, lifeObject) {
      // 记录生命点的数据
      if (!lifeNextData[col]) {
        lifeNextData[col] = {};
        lifeNextData[col][row] = lifeObject;
      } else {
        if (!lifeNextData[col][row]) {
          lifeNextData[col][row] = lifeObject;
        } else {
          // 生命点竞争，只保留energy最小的
          if (lifeObject.energy < lifeNextData[col][row].energy) {
            lifeNextData[col][row] = lifeObject;
          }
        }
      }
    }

    // first step: 计算生命点行进的随机位置以及能量衰减
    let newGrid = [];
    for (let c = 0; c < this.num_cols; c++) {
      let newRow = [];
      for (let r = 0; r < this.num_rows; r++) {
        let cell = this.grid_map.grid[c][r];
        const cloneCell = {
          type: cell.type,
          energy: cell.energy,
          reproduce: cell.reproduce,
        };
        if (cell.type === 'life') {
          // 生命点独立逻辑
          const rdNum = Math.ceil(Math.random() * 8);
          const rdRes = getRandomKey(rdNum, c, r);
          let newR = rdRes.row;
          let newC = rdRes.col;
          if (newR < 0 || newC < 0 || newR >= this.num_rows || newC >= this.num_cols) {
            // 走到非法index，则视为撞到障碍物，即边缘视作障碍物
            cell.setEnergy(cloneCell.energy - 1);
            cloneCell.energy = cell.energy;
            setLifeData(c, r, cloneCell);
          } else {
            let nextCell = this.grid_map.grid[newC][newR];
            if (nextCell.type === 'wall') {
              cell.setEnergy(cloneCell.energy - 1);
              cloneCell.energy = cell.energy;
              setLifeData(c, r, cloneCell);
            } else {
              // 不撞障碍物则允许走向下一步，当前步置为空
              cell.setType("empty");
              cloneCell.energy = cell.energy - 1;
              setLifeData(newC, newR, cloneCell);
            }
          }
          newRow.push(cell);
        } else if (cell.type === 'food') {
          // 食物点独立逻辑
          newRow.push(cell);
        } else if (cell.type === 'wall') {
          // 障碍物点独立逻辑
          newRow.push(cell);
        } else if (cell.type === 'empty') {
          // 空白点独立逻辑
          newRow.push(cell);
        }
      }
      newGrid.push(newRow);
    }

    // second step: 合并变化后的数组
    for (let c = 0; c < this.num_cols; c++) {
      for (let r = 0; r < this.num_rows; r++) {
        let newCell = newGrid[c][r];
        let hadLife = lifeNextData[c] && lifeNextData[c][r] ? lifeNextData[c][r] : null;
        if (newCell.type === 'wall') {
          // 障碍物处不会出现生命点
        } else if (newCell.type === 'empty') {
          if (hadLife && hadLife.energy > 0) {
            // 空格可直接存放能量等级大于0的生命点，等于零就死掉
            newCell.setType('life');
            newCell.setEnergy(hadLife.energy);
            newCell.setReproduce(hadLife.reproduce);
          }
        } else if (newCell.type === 'food') {
          if (hadLife) {
            // 食物点可使生命的能量等级不减并+1，所以要用+2计算，减到0的点吃到食物也能变成2
            newCell.setType('life');
            newCell.setEnergy(hadLife.energy + 2);
            newCell.setReproduce(hadLife.reproduce);
          }
        }
        this.grid_map.grid[c][r] = newCell;
      }
    }

    // third step: 计算繁殖可能性 todo
    // for (let c = 0; c < this.num_cols; c++) {
    //   for (let r = 0; r < this.num_rows; r++) {
    //     // 计算繁殖
    //     let cell = this.grid_map.grid[c][r];
    //   }
    // }

    // forth step: 计算食物总数，生命总数，渲染网格
    let foodTotal = 0;
    let lifeTotal = 0;
    for (let c = 0; c < this.num_cols; c++) {
      for (let r = 0; r < this.num_rows; r++) {
        let cell = this.grid_map.grid[c][r];
        if (cell.type === 'life') {
          lifeTotal += 1;
        } else if (cell.type === 'food') {
          foodTotal += 1;
        }
        this.renderCell(cell);
      }
    }

    let endTime = Date.now() - startTime;
    // console.log('evolutionary_time:', endTime);

    return {
      food: foodTotal,
      life: lifeTotal
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
            const rdEny = Math.ceil(Math.random() * totalEnergy); // 总量固定的能量值，随机分配给生命点
            // 每个生命点的允许繁殖等级为2+自身初始等级的随机数，即保证
            const rdReproduce = 2 + Math.ceil(Math.random() * rdEny);
            totalEnergy -= rdEny;
            this.grid_map.grid[c][r].setType("life");
            this.grid_map.grid[c][r].setEnergy(rdEny);
            this.grid_map.grid[c][r].setReproduce(rdReproduce);
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
