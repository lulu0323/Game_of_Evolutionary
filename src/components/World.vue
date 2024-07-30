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
        :style="{background: showSetting ? '#EEA920' : '#00a4a7'}"
        @click="handleOpenSetting">
        {{ showSetting ? 'Close' : 'System' }}
      </div>
      <div
        class="status-init-btn translate-middle-y"
        style="left: 116px;"
        :style="{background: showEye ? '#EEA920' : '#00a4a7'}"
        @click="showEye = !showEye">
        {{ showEye ? 'Close' : 'Monitor' }}
      </div>
      <div
        class="status-init-btn translate-middle-y"
        style="left: 224px;"
        :style="{background: showEditGrid ? '#EEA920' : '#00a4a7'}"
        @click="handleGridCellSetting">
        {{ showEditGrid ? 'Finish' : 'Edit' }}
      </div>
      <div
        v-if="showEditGrid"
        class="status-init-btn translate-middle-y"
        style="left: 332px;">
        <select
          v-model="settingType"
          style="width: 100%; height: 100%"
        >
          <option
            v-for="item in settingTypeOptions"
            :key="item.value"
            :value="item.value"
          >
            {{ item.label }}
          </option>
        </select>
      </div>
      <div
        v-if="showEditGrid"
        class="status-init-btn translate-middle-y"
        style="left: 440px;width: 130px;"
      >
        <input v-model="useSetGridRate" style="width: 100px;height: 60%">
        <span> %</span>
      </div>
      <div
        v-if="showEditGrid"
        class="status-init-btn translate-middle-y"
        style="left: 586px;background: #fb5b17"
        @click="handleSetAllCellByType">
        {{ 'Setup %' }}
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
        <span style="padding-left: 12px">system setting</span>
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
        <span>Frequency of Food:  </span>
        <input v-model="foodRunMax" style="width: 100px;height: 60%">
      </div>
      <div class="setting-item-row border-top" style="text-align: center">
        <span>Style:  </span>
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
        <span>Move Rate:  </span>
        <input v-model="useMRate" style="width: 100px;height: 60%">
        <span> %</span>
      </div>
      <div v-if="rateType === 'bold'" class="setting-item-row border-top" style="text-align: center">
        <span>Reproduce Rate:  </span>
        <input v-model="useRRate" style="width: 100px;height: 60%">
        <span> %</span>
      </div>
      <div v-if="rateType === 'bold'" class="setting-item-row border-top" style="text-align: center">
        <span>Food Rate:  </span>
        <input v-model="useFRate" style="width: 100px;height: 60%">
        <span> %</span>
      </div>
    </div>

    <div v-if="toast" class="world-toast-wrapper">
      {{toastText}}
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
          label: "Random",
        },
        {
          value: "bold",
          label: "Fixed",
        },
      ],
      isSetting: false,
      settingType: "life",
      settingTypeOptions: [
        {
          value: "life",
          label: "Set Life",
        },
        {
          value: "food",
          label: "Set Food",
        },
        {
          value: "wall",
          label: "Set block",
        },
        {
          value: "empty",
          label: "Set Empty",
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
      toast: false,
      toastText: '',
      showEditGrid: false,
      useSetGridRate: 100,
      foodRunMax: 10,
    };
  },
  mounted() {
    this.world = new World(this.cellSize, this.foodRunMax);
  },
  beforeDestroy() {
    this.pauseLife();
  },
  methods: {
    handleOpenSetting() {
      this.pauseLife();
      this.showEditGrid = false;
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
      if (this.showSetting) {
        this.showToast('Please close setting board');
        return;
      }
      if (this.showEditGrid) {
        this.showToast('Please stop edit grid');
        return;
      }
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
        this.displayMr = Number(this.useMRate);
        this.displayRr = Number(this.useRRate);
        this.displayFr = Number(this.useFRate);
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
        if (res.life === 0) {
          // 生命为0或者食物为0则暂停演化，定格在当前网格状态
          this.start = false;
          this.pauseLife();
        }
        this.updateLoading = false;
        resolve();
      });
    },
    startLife() {
      let speed = this.speed;
      let numRes = this.world.getCurrentCheckNum();
      this.foodNum = numRes.food;
      this.lifeNum = numRes.life;
      let foodRunMax = !isNaN(this.foodRunMax) ? Number(this.foodRunMax) : 10;
      this.world.setWorldFoodStep(foodRunMax);
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
    handleGridCellSetting() {
      if (this.showSetting) {
        this.showToast('Please close setting board');
        return;
      }
      this.pauseLife();
      this.showEditGrid = !this.showEditGrid;
    },
    handleSetAllCellByType() {
      let gridRate = !isNaN(this.useSetGridRate) ? Number(this.useSetGridRate) : 100;
      const type = this.settingType;
      if (gridRate === 100) {
        this.world.resetWorld(this.cellSize, type);
      } else if (gridRate > 0) {
        this.world.resetWorldByNum(this.cellSize, type, gridRate);
      }
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
        // nothing
      } else if (this.showEditGrid) {
        this.world.resetCell(gotCell.col, gotCell.row, this.settingType);
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
    showToast(text) {
      if (this.toastTimeout) {
        clearTimeout(this.toastTimeout);
        this.toastTimeout = null;
      }
      this.toastText = text;
      this.toast = true;
      this.toastTimeout = setTimeout(() => {
        this.toast = false;
      }, 6000);
    }
  },
};
</script>

<style scoped></style>
