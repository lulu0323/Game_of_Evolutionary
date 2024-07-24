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

  getCell(col, row) {
    return this.grid_map.cellAt(col, row);
  }

  update(options) {
    let mr = options.mr; // 移动概率
    let rr = options.rr; // 繁殖概率
    let fr = options.fr; // 生成食物概率
    let startTime = Date.now(); // 计时起点
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

    let newFoodData = {};
    function setNewFoodData(col, row, foodObject) {
      // 记录空格生成食物的点
      if (!newFoodData[col]) {
        newFoodData[col] = {};
      }
      newFoodData[col][row] = foodObject;
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
          ex: cell.ex,
          es: cell.es,
          er: cell.er,
          rr: cell.rr,
          em: cell.em,
          mRate: cell.mRate,
          fr: cell.fr,
        };
        if (cell.type === 'life') {
          // 生命点独立逻辑
          cell.setEnergy(cloneCell.energy - cell.es); // 每一步骤固定消耗能量
          cloneCell.energy = cell.energy;
          if (cell.energy <= 0) {
            // 能量消耗完就消失，不继续做判断
            cell.resetCell("empty");
          } else if (cell.mRate >= mr) {
            // 可移动
            const rdNum = Math.ceil(Math.random() * 8); // 随机8个方向
            const rdRes = getRandomKey(rdNum, c, r); // 方向值
            let newR = rdRes.row;
            let newC = rdRes.col;
            if (newR < 0 || newC < 0 || newR >= this.num_rows || newC >= this.num_cols) {
              // 走到非法index，则视为撞到障碍物，即边缘视作障碍物
              // todo 撞墙要不要消耗移动能量？
              // cell.setEnergy(cloneCell.energy - cell.em); // 移动需要额外消耗
              // cloneCell.energy = cell.energy;
              setLifeData(c, r, cloneCell);
            } else {
              let nextCell = this.grid_map.grid[newC][newR];
              if (nextCell.type === 'wall') {
                // 撞障碍物
                // todo 撞墙要不要消耗移动能量？
                // cell.setEnergy(cloneCell.energy - cell.em); // 移动需要额外消耗
                // cloneCell.energy = cell.energy;
                setLifeData(c, r, cloneCell);
              } else {
                // 不撞障碍物则允许走向下一步，当前步置为空
                cell.setEnergy(cloneCell.energy - cell.em); // 移动需要额外消耗
                cloneCell.energy = cell.energy;
                cell.resetCell("empty");
                setLifeData(newC, newR, cloneCell);
              }
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
          if (cell.fr >= fr) {
            setNewFoodData(c, r, {
              type: 'food'
            });
          }
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
        let hadFood = newFoodData[c] && newFoodData[c][r] ? newFoodData[c][r] : null;
        if (newCell.type === 'wall') {
          // 障碍物处不会出现生命点
        } else if (newCell.type === 'empty') {
          if (hadLife && hadLife.energy > 0) {
            // 空格可直接存放能量等级大于0的生命点，小于等于零就死掉
            newCell.setType('life');
            newCell.setEx(hadLife.ex);
            newCell.setEs(hadLife.es);
            newCell.setEr(hadLife.er);
            newCell.setRr(hadLife.rr);
            newCell.setEm(hadLife.em);
            newCell.setMRate(hadLife.mRate);
            newCell.setEnergy(hadLife.energy);
          } else if (hadFood) {
            // 没有被生命占领且会生成食物的空格
            newCell.resetCell('food');
          }
        } else if (newCell.type === 'food') {
          if (hadLife) {
            // 食物点可使生命的能量等级+1
            newCell.setType('life');
            newCell.setEx(hadLife.ex);
            newCell.setEs(hadLife.es);
            newCell.setEr(hadLife.er);
            newCell.setRr(hadLife.rr);
            newCell.setEm(hadLife.em);
            newCell.setMRate(hadLife.mRate);
            newCell.setEnergy(hadLife.energy + 1);
          }
        }
        this.grid_map.grid[c][r] = newCell;
      }
    }

    // third step: 计算繁殖可能性
    for (let c = 0; c < this.num_cols; c++) {
      for (let r = 0; r < this.num_rows; r++) {
        // 计算繁殖
        let cell = this.grid_map.grid[c][r];
        if (cell.type === 'life' && cell.rr >= rr && cell.energy > cell.er) {
          // 允许繁殖
          cell.setEnergy(cell.energy - cell.er);
          const rdNum = Math.ceil(Math.random() * 8); // 随机8个方向
          const rdRes = getRandomKey(rdNum, c, r); // 方向值
          let newR = rdRes.row;
          let newC = rdRes.col;
          if (newR < 0 || newC < 0 || newR >= this.num_rows || newC >= this.num_cols) {
            // 走到非法index，则视为撞到障碍物，即边缘视作障碍物
            // todo 繁殖在障碍物上则直接消失，还是繁殖失败？
          } else {
            let nextCell = this.grid_map.grid[newC][newR];
            if (nextCell.type === 'life') {
              if (cell.er < nextCell.energy) {
                // 繁殖后的谁饿杀死谁
                nextCell.setEx(cell.er);
                nextCell.setEs();
                nextCell.setEr();
                nextCell.setRr();
                nextCell.setEm();
                nextCell.setMRate();
                nextCell.setEnergy();
              }
            } else if (nextCell.type === 'food') {
              nextCell.setType('life');
              nextCell.setEx(cell.er + 1);
              nextCell.setEs();
              nextCell.setEr();
              nextCell.setRr();
              nextCell.setEm();
              nextCell.setMRate();
              nextCell.setEnergy();
            } else if (nextCell.type === 'wall') {
              // todo
            } else if (nextCell.type === 'empty') {
              nextCell.setType('life');
              nextCell.setEx(cell.er);
              nextCell.setEs();
              nextCell.setEr();
              nextCell.setRr();
              nextCell.setEm();
              nextCell.setMRate();
              nextCell.setEnergy();
            }
          }
        }
      }
    }

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
    console.log('evolutionary_time:', endTime);

    return {
      food: foodTotal,
      life: lifeTotal
    }
  }

  renderRandomWorld() {
    let foodTotal = 0;
    let lifeTotal = 0;
    for (let c = 0; c < this.num_cols; c++) {
      for (let r = 0; r < this.num_rows; r++) {
        const randomNumber = Math.ceil(Math.random() * 10); // 1-10 random
        if (randomNumber > 0 && randomNumber < 3) {
          // 20% empty
          this.grid_map.grid[c][r].resetCell("empty");
        } else if (randomNumber > 2 && randomNumber < 5) {
          // 20% wall
          this.grid_map.grid[c][r].resetCell("wall");
        } else if (randomNumber > 4 && randomNumber < 8) {
          // 30% food
          this.grid_map.grid[c][r].resetCell("food");
          foodTotal += 1;
        } else {
          // 30% life
          this.grid_map.grid[c][r].resetCell("life");
          lifeTotal += 1;
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
    const context = this.worldCanvas.getContext("2d");
    context.clearRect(0, 0, this.worldCanvas.width, this.worldCanvas.height);
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
    if (cell.type === 'life') {
      context.fillStyle = "#000000";
      const textX = cell.x + this.cellSize / 2;
      const textY = cell.y + this.cellSize / 2;
      context.fillText(cell.energy, textX, textY);
    }
    context.lineWidth = this.strokeWidth;
    context.strokeStyle = this.gridBorderColor;
    context.strokeRect(cell.x, cell.y, this.cellSize, this.cellSize);
  }

  getCellByPoint(point) {
    let resCell = null;
    for (let col of this.grid_map.grid) {
      for (let cell of col) {
        let gotCell = this.calcPointInCell(point, cell);
        if (gotCell) {
          resCell = gotCell;
        }
      }
    }
    return resCell;
  }

  calcPointInCell(point, cell) {
    let xInCell = point.x > cell.x && point.x < cell.x + this.cellSize;
    let yInCell = point.y > cell.y && point.y < cell.y + this.cellSize;
    let isPointInCell = xInCell && yInCell;
    return isPointInCell ? cell : null;
  }
}
