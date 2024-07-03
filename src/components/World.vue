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
      originEnergy: 500,
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
          value: 5,
          label: "Medium",
        },
        {
          value: 10,
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
      this.stepNum = 0;
      this.foodNum = 0;
      this.lifeNum = 0;
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
        let res = this.world.update();
        this.stepNum += 1;
        this.foodNum = res.food;
        this.lifeNum = res.life;
        if (res.food === 0 || res.life === 0) {
          // 生命为0或者食物为0则暂停演化，定格在当前网格状态
          this.start = false;
          this.pauseLife();
        }
      }, 1000 / speed);
    },
    pauseLife() {
      if (this.lifeGoingInterval) {
        clearInterval(this.lifeGoingInterval);
        this.lifeGoingInterval = null;
      }
    },
    setCellSize(num) {
      this.cellSize = num;
      this.world.resetWorld(this.cellSize);
    },
    handleMouseDown(e) {
      const clickX = e.clientX; // 点击的像素点位置x（横向）
      const clickY = e.clientY; // 点击的像素点位置y (纵向)
      if (this.isSetting) {
      }
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
