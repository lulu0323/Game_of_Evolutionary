<template>
  <div class="world-container">
    <div
      id="screenBox"
      class="world-pixel-screen"
      @mousedown="handleMouseDown"
    ></div>
    <div class="control-btn">
      <div class="status-init-btn translate-middle-y" @click="initRandomLife">
        Generate Grids Randomly
      </div>
      <div class="status-init-select translate-middle-y">
        <select
          v-model="speed"
          style="width: 100%; height: 100%"
          @change="handleSpeedChanged"
        >
          <option
            v-for="item in speedOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>
      </div>
      <div class="dis-data-container translate-middle-y">
        <span style="color: #199d9d">Total of Food: </span
        ><span style="padding: 0 24px 0 12px">{{ foodNum }}</span>
        <span style="color: #00c638">Total of Creatures: </span
        ><span style="padding: 0 24px 0 12px">{{ lifeNum }}</span>
        <span style="color: #282828">Total of Step: </span
        ><span style="padding: 0 24px 0 12px">{{ stepNum }}</span>
      </div>
      <div class="status-btn-clear translate-middle-y" @click="handleReset">
        Clear
      </div>
      <div
        class="status-btn translate-middle-y"
        :class="{ 'color-pause': start }"
        @click="handleStatusChanged"
      >
        {{ start ? "Pause" : "Start" }}
      </div>
    </div>
  </div>
</template>

<script>
import { World } from "../script/world";

export default {
  name: "World",
  data() {
    return {
      start: false,
      originEnergy: 100,
      foodNum: 0,
      lifeNum: 0,
      stepNum: 0,
      cellSize: 64,
      speed: 2,
      speedOptions: [
        {
          value: 2,
          label: "Low",
        },
        {
          value: 20,
          label: "Medium",
        },
        {
          value: 50,
          label: "Fast",
        },
      ],
      isSetting: false,
      settingType: "life",
      settingTypeOptions: [
        {
          value: "life",
          label: "Life",
        },
        {
          value: "food",
          label: "Food",
        },
        {
          value: "wall",
          label: "Wall",
        },
      ],
    };
  },
  mounted() {
    this.world = new World(this.cellSize);
  },
  beforeDestroy() {
    this.pauseLife();
  },
  methods: {
    handleReset() {
      // 清空世界
      this.start = false;
      this.pauseLife();
      this.world.resetWorld(this.cellSize);
    },
    handleStatusChanged() {
      this.start = !this.start;
      if (this.start) {
        this.startLife();
      } else {
        this.pauseLife();
      }
    },
    handleSpeedChanged() {
      if (this.start) {
        this.pauseLife();
        this.startLife();
      }
    },
    startLife() {
      let speed = this.speed;
      this.lifeGoingInterval = setInterval(() => {
        this.world.update();
        // this.initLifeGo();
      }, 1000 / speed);
    },
    pauseLife() {
      if (this.lifeGoingInterval) {
        clearInterval(this.lifeGoingInterval);
        this.lifeGoingInterval = null;
      }
    },
    setGridSize(num) {
      this.gridSize = num;
      this.world.resetWorld(this.cellSize);
    },
    handleMouseDown(e) {
      const clickX = e.clientX; // 点击的像素点位置x（横向）
      const clickY = e.clientY; // 点击的像素点位置y (纵向)
      if (this.isSetting) {
      }
    },
    initLifeGo() {
      if (this.lifeNum === 0) {
        this.pauseLife();
        return;
      }
      let lifeChangeData = {};
      for (let key in this.gridsData) {
        const grid = this.gridsData[key];
        if (grid.type === "life") {
          const xNum = grid.xNum;
          const yNum = grid.yNum;
          const randomNext = Math.ceil(Math.random() * 8); // 生成1-8的随机整数作为位置代号
          let nextKey = this.getRandomKey(randomNext, xNum, yNum);
          grid.energy -= 1;
          if (nextKey) {
            let nextXNum = Number(nextKey.split(",")[0]);
            let nextYNum = Number(nextKey.split(",")[1]);
            const nextStep = this.gridsData[nextKey];
            const usedStep = lifeChangeData[nextKey];
            if (!usedStep && nextStep.type === "food") {
              grid.energy += 2;
              lifeChangeData[nextKey] = Object.assign(
                {
                  xNum: nextStep.xNum,
                  yNum: nextStep.yNum,
                  x1: nextStep.x1,
                  x2: nextStep.x2,
                  y1: nextStep.y1,
                  y2: nextStep.y2,
                  gridSize: nextStep.gridSize,
                },
                {
                  type: "life",
                  energy: grid.energy,
                  originEnergy: grid.originEnergy,
                }
              );
              this.foodNum -= 1;

              const enyRg = grid.energy - grid.originEnergy;
              if (enyRg > 0 && enyRg / grid.originEnergy > 0.33) {
                // 繁殖
                let reproductionRandom = Math.ceil(Math.random() * 8);
                let reproductionKey = this.getRandomKey(
                  reproductionRandom,
                  nextXNum,
                  nextYNum
                );
                if (reproductionKey) {
                  const nextRpStep = this.gridsData[reproductionKey];
                  nextRpStep.energy = grid.originEnergy;
                  const usedRpStep = lifeChangeData[reproductionKey];
                  if (!usedRpStep && nextRpStep.type === "food") {
                    nextRpStep.energy += 2;
                    lifeChangeData[reproductionKey] = Object.assign(
                      {},
                      nextRpStep
                    );
                    lifeChangeData[reproductionKey].type = "life";
                    this.foodNum -= 1;
                    this.lifeNum += 1;
                  } else if (usedRpStep && usedRpStep.type === "life") {
                    if (nextRpStep.energy <= usedRpStep.energy) {
                      // 谁饿谁杀对方
                      lifeChangeData[reproductionKey] = Object.assign(
                        {},
                        nextRpStep
                      );
                      lifeChangeData[reproductionKey].type = "life";
                    }
                  }
                }
              }
            } else if (usedStep && usedStep.type === "life") {
              if (grid.energy <= usedStep.energy) {
                // 谁饿谁杀对方
                lifeChangeData[nextKey] = Object.assign(
                  {
                    xNum: nextStep.xNum,
                    yNum: nextStep.yNum,
                    x1: nextStep.x1,
                    x2: nextStep.x2,
                    y1: nextStep.y1,
                    y2: nextStep.y2,
                    gridSize: nextStep.gridSize,
                  },
                  {
                    type: "life",
                    energy: grid.energy,
                    originEnergy: grid.originEnergy,
                  }
                );
                this.lifeNum -= 1;
              }
            } else {
              lifeChangeData[nextKey] = Object.assign(
                {
                  xNum: nextStep.xNum,
                  yNum: nextStep.yNum,
                  x1: nextStep.x1,
                  x2: nextStep.x2,
                  y1: nextStep.y1,
                  y2: nextStep.y2,
                  gridSize: nextStep.gridSize,
                },
                {
                  type: "life",
                  energy: grid.energy,
                  originEnergy: grid.originEnergy,
                }
              );
            }

            lifeChangeData[key] = Object.assign(
              {
                xNum: grid.xNum,
                yNum: grid.yNum,
                x1: grid.x1,
                x2: grid.x2,
                y1: grid.y1,
                y2: grid.y2,
                gridSize: grid.gridSize,
              },
              {
                type: "empty",
                energy: nextStep.energy,
                originEnergy: nextStep.originEnergy,
              }
            );
          }
        }
      }

      Object.assign(this.gridsData, lifeChangeData);

      for (let key in this.gridsData) {
        const grid = this.gridsData[key];
        this.renderGrid(grid);
      }
    },
    getRandomKey(randomNext, xNum, yNum) {
      let nextKey = "";
      switch (randomNext) {
        case 1:
          if (xNum - 1 >= 0 && yNum - 1 > 0) {
            nextKey = `${xNum - 1},${yNum - 1}`;
          }
          break;
        case 2:
          if (yNum - 1 > 0) {
            nextKey = `${xNum},${yNum - 1}`;
          }
          break;
        case 3:
          if (xNum + 1 <= this.xNumberLong && yNum - 1 > 0) {
            nextKey = `${xNum + 1},${yNum - 1}`;
          }
          break;
        case 4:
          if (xNum - 1 >= 0) {
            nextKey = `${xNum - 1},${yNum}`;
          }
          break;
        case 5:
          if (xNum + 1 <= this.xNumberLong) {
            nextKey = `${xNum + 1},${yNum}`;
          }
          break;
        case 6:
          if (xNum - 1 >= 0 && yNum + 1 <= this.yNumberLong) {
            nextKey = `${xNum - 1},${yNum + 1}`;
          }
          break;
        case 7:
          if (yNum + 1 <= this.yNumberLong) {
            nextKey = `${xNum},${yNum + 1}`;
          }
          break;
        case 8:
          if (xNum + 1 <= this.xNumberLong && yNum + 1 <= this.yNumberLong) {
            nextKey = `${xNum + 1},${yNum + 1}`;
          }
          break;
      }
      return nextKey;
    },
    initRandomLife() {
      this.handleReset();
      const res = this.world.renderRandomWorld(this.originEnergy);
      this.foodNum = res.food;
      this.lifeNum = res.life;
    },
  },
};
</script>

<style scoped>
.world-container {
  width: 100%;
  height: 100%;
  position: relative;
}
.world-pixel-screen {
  width: 100%;
  height: calc(100% - 56px);
  background: rgba(5, 5, 18, 0.62);
  color: #ffffff;
}
.control-btn {
  width: 100%;
  height: 56px;
  line-height: 56px;
  background: #ffffff;
  position: relative;
  font-size: 16px;
  color: #ffffff;
}
.status-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  width: 100px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 4px;
  background: #29b973;
}
.color-pause {
  background: #b49303;
}
.status-btn-clear {
  position: absolute;
  right: 116px;
  top: 50%;
  width: 100px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 4px;
  background: #a7000c;
}
.status-init-btn {
  position: absolute;
  left: 8px;
  top: 50%;
  width: 200px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 4px;
  background: #00a4a7;
}
.status-init-select {
  position: absolute;
  left: 228px;
  top: 50%;
  width: 120px;
  height: 40px;
  line-height: 40px;
  text-align: center;
  border-radius: 4px;
  background: #95ff8d;
}
.dis-data-container {
  position: absolute;
  left: 376px;
  top: 50%;
  height: 40px;
  line-height: 40px;
  color: #000000;
}
</style>
