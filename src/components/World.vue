<template>
  <div class="world-container">
    <div
      id="screenBox"
      class="world-pixel-screen"
      @mousedown="handleMouseDown"
    ></div>
    <div class="world-cell-display-wrapper">
      <div v-if="displayCell" class="cell-display-container">
        <span style="padding: 0 5px">col: <span style="color: #109eff">{{displayCell.col}}</span></span>
        <span style="padding: 0 5px">row: <span style="color: #109eff">{{displayCell.row}}</span></span>
        <span style="padding: 0 5px">type: <span style="color: #109eff">{{displayCell.type}}</span></span>
        <span v-if="displayCell.type === 'life'" style="padding: 0 5px">energy: <span style="color: #109eff">{{displayCell.energy}}</span></span>
        <span v-if="displayCell.type === 'life'" style="padding: 0 5px">ex: <span style="color: #109eff">{{displayCell.ex}}</span></span>
        <span v-if="displayCell.type === 'life'" style="padding: 0 5px">es: <span style="color: #109eff">{{displayCell.es}}</span></span>
        <span v-if="displayCell.type === 'life'" style="padding: 0 5px">er: <span style="color: #109eff">{{displayCell.er}}</span></span>
        <span v-if="displayCell.type === 'life'" style="padding: 0 5px">rr: <span style="color: #109eff">{{displayCell.rr + '%'}}</span></span>
        <span v-if="displayCell.type === 'life'" style="padding: 0 5px">em: <span style="color: #109eff">{{displayCell.em}}</span></span>
        <span v-if="displayCell.type === 'life'" style="padding: 0 5px">mRate: <span style="color: #109eff">{{displayCell.mRate + '%'}}</span></span>
        <span v-if="displayCell.type === 'empty'" style="padding: 0 5px">fr: <span style="color: #109eff">{{displayCell.fr + '%'}}</span></span>
      </div>
    </div>
    <div class="control-btn">
      <div
        class="status-init-btn translate-middle-y"
        style="left: 8px;"
        @click="handleOpenSetting">
        setting
      </div>
      <div
        class="status-init-btn translate-middle-y"
        style="left: 116px;"
        @click="showEye = !showEye">
        {{ showEye ? '关闭监控' : '打开监控' }}
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

<!--    监控界面-->
    <div v-if="showEye" class="eye-wrapper">
      <div class="eye-item-row" style="text-align: center">
        <span style="color: #282828">Total of Step: </span
        ><span style="padding: 0 24px 0 12px">{{ stepNum }}</span>
      </div>
      <div class="eye-item-row">
        <div class="eye-num-container">
          <div class="eye-num-i">
            <span style="color: #00c638">Total of Creatures: </span
            ><span style="padding: 0 12px">{{ lifeNum }}</span>
          </div>
          <div class="eye-num-i">
            <span style="color: #199d9d">Total of Food: </span
            ><span style="padding: 0 12px">{{ foodNum }}</span>
          </div>
        </div>
      </div>
      <div class="eye-item-row border-top">
        <div class="eye-num-container">
          <div class="eye-num-i-3">
            <span style="color: #109eff">MR: </span
            ><span style="padding: 0 12px">{{ displayMr + '%' }}</span>
          </div>
          <div class="eye-num-i-3">
            <span style="color: #109eff">RR: </span
            ><span style="padding: 0 12px">{{ displayRr + '%' }}</span>
          </div>
          <div class="eye-num-i-3">
            <span style="color: #109eff">FR: </span
            ><span style="padding: 0 12px">{{ displayFr + '%' }}</span>
          </div>
        </div>
      </div>
      <div class="eye-item-row border-top">
        next
      </div>
    </div>

<!--    设置界面-->
    <div v-if="showSetting" class="setting-wrapper">
      <div class="setting-item-row">
        <span style="padding-left: 12px">系统设置</span>
        <div class="setting-close-x" @click="showSetting = false">
          <span>X</span>
        </div>
      </div>
      <div class="setting-item-row border-top">
        <div class="setting-btn-only" @click="initRandomLife">
          Generate Grids Randomly
        </div>
      </div>
      <div class="setting-item-row border-top" style="text-align: center">
        <span>Grid Size:  </span>
        <select
          v-model="cellSize"
          style="width: 100px; height: 70%"
          @change="handleCellSizeChanged"
        >
          <option
            v-for="item in cellSizeOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>
      </div>
      <div class="setting-item-row border-top" style="text-align: center">
        <span>标准牌刷新方式:  </span>
        <select
          v-model="rateType"
          style="width: 100px; height: 70%"
        >
          <option
            v-for="item in rateTypeOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>
      </div>
      <div v-if="rateType === 'bold'" class="setting-item-row border-top" style="text-align: center">
        <span>移动概率:  </span>
        <input v-model="useMRate" style="width: 100px;height: 60%">
        <span> %</span>
      </div>
      <div v-if="rateType === 'bold'" class="setting-item-row border-top" style="text-align: center">
        <span>繁殖概率:  </span>
        <input v-model="useRRate" style="width: 100px;height: 60%">
        <span> %</span>
      </div>
      <div v-if="rateType === 'bold'" class="setting-item-row border-top" style="text-align: center">
        <span>食物生成概率:  </span>
        <input v-model="useFRate" style="width: 100px;height: 60%">
        <span> %</span>
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
      foodNum: 0,
      lifeNum: 0,
      stepNum: 0,
      cellSize: 64,
      cellSizeOptions: [
        {
          value: 32,
          label: "Small",
        },
        {
          value: 64,
          label: "Medium",
        },
        {
          value: 96,
          label: "Big",
        },
      ],
      speed: 1,
      speedOptions: [
        {
          value: 1,
          label: "Low Speed",
        },
        {
          value: 2,
          label: "Medium Speed",
        },
        {
          value: 4,
          label: "Fast Speed",
        },
      ],
      rateType: 'randomly',
      rateTypeOptions: [
        {
          value: "randomly",
          label: "自动随机",
        },
        {
          value: "bold",
          label: "固定",
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
      showSetting: false,
      showEye: false,
      displayCell: null,
      useMRate: 50,
      useRRate: 50,
      useFRate: 50,
      displayMr: 50,
      displayRr: 50,
      displayFr: 50,
      updateLoading: false,
    };
  },
  mounted() {
    this.world = new World(this.cellSize);
  },
  beforeDestroy() {
    this.pauseLife();
  },
  methods: {
    handleOpenSetting() {
      this.pauseLife();
      this.showSetting = !this.showSetting;
    },
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
    updateLife() {
      return new Promise((resolve) => {
        this.displayMr = this.useMRate;
        this.displayRr = this.useRRate;
        this.displayFr = this.useFRate;
        if (this.rateType === 'randomly') {
          this.displayMr = Math.ceil(Math.random() * 100);
          this.displayRr = Math.ceil(Math.random() * 100);
          this.displayFr = Math.ceil(Math.random() * 100);
        }
        let options = {
          mr: this.displayMr,
          rr: this.displayRr,
          fr: this.displayFr,
        };
        let res = this.world.update(options);
        if (this.displayCell) {
          let gotCell = this.world.getCell(this.displayCell.col, this.displayCell.row);
          this.setDisplayCell(gotCell);
        }
        this.stepNum += 1;
        this.foodNum = res.food;
        this.lifeNum = res.life;
        if (res.food === 0 || res.life === 0) {
          // 生命为0或者食物为0则暂停演化，定格在当前网格状态
          this.start = false;
          this.pauseLife();
        }
        this.updateLoading = false;
        resolve();
      });
    },
    startLife() {
      if (this.showSetting) {
        return;
      }
      let speed = this.speed;
      this.lifeGoingInterval = setInterval(() => {
        if (!this.updateLoading) {
          this.updateLoading = true;
          this.updateLife();
        } else {
          console.warn('kale: ', this.stepNum);
        }
      }, 1000 / speed);
    },
    pauseLife() {
      if (this.lifeGoingInterval) {
        clearInterval(this.lifeGoingInterval);
        this.lifeGoingInterval = null;
      }
    },
    handleCellSizeChanged() {
      this.handleReset();
    },
    handleMouseDown(e) {
      const clickX = e.clientX; // 点击的像素点位置x（横向）
      const clickY = e.clientY; // 点击的像素点位置y (纵向)
      let point = {
        x: clickX,
        y: clickY,
      };
      const gotCell = this.world.getCellByPoint(point);
      console.warn('ccccc', gotCell);
      if (this.isSetting) {

      } else {
        this.setDisplayCell(gotCell);
      }
    },
    setDisplayCell(gotCell) {
      if (gotCell) {
        this.displayCell = {
          col: gotCell.col,
          row: gotCell.row,
          type: gotCell.type,
          energy: gotCell.energy,
          ex: gotCell.ex,
          es: gotCell.es,
          er: gotCell.er,
          rr: gotCell.rr,
          em: gotCell.em,
          mRate: gotCell.mRate,
          fr: gotCell.fr
        };
      } else {
        this.displayCell = null;
      }
    },
    initRandomLife() {
      this.handleReset();
      const res = this.world.renderRandomWorld();
      this.foodNum = res.food;
      this.lifeNum = res.life;
    },
  },
};
</script>

<style scoped></style>
