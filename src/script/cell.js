export class Cell {
  constructor(type, col, row, x, y) {
    this.col = col;
    this.row = row;
    this.x = x;
    this.y = y;
    this.ex = 0; // 最大能量等级
    this.es = 0; // 每个time要消耗的ex值
    this.er = 0; // 繁殖给下一代的能量
    this.rr = 0; // 可繁殖的概率
    this.em = 0; // 移动需要的额外消耗的ex值
    this.mRate = 0; // 可移动概率
    this.fr = 0; // 空格改变为食物的概率
    this.energy = 0; // 当前能量
    this.resetCell(type); // empty/life/food/wall
  }

  resetCell(type) {
    // 初始化全随机
    this.setType(type);
    switch (type) {
      case "life":
        this.setEx();
        this.setEs();
        this.setEr();
        this.setRr();
        this.setEm();
        this.setMRate();
        this.setEnergy();
        break;
      case "food":
        break;
      case "wall":
        break;
      case "empty":
        this.setFr();
        break;
    }
  }

  setType(type) {
    this.type = type;
  }

  setEx(ex) {
    this.ex = ex !== undefined ? ex : Math.ceil(Math.random() * 100);
  }

  setEs(es) {
    this.es = es !== undefined ? es : Math.ceil(this.ex / 20);
  }

  setEr(er) {
    this.er = er !== undefined ? er : Math.ceil(this.ex / 3);
  }

  setRr(rr) {
    this.rr = rr !== undefined ? rr : Math.ceil(Math.random() * 100);
  }

  setEm(em) {
    this.em = em !== undefined ? em : Math.ceil(this.ex / 10);
  }

  setMRate(mRate) {
    this.mRate = mRate !== undefined ? mRate : Math.ceil(Math.random() * 100);
  }

  setFr(fr) {
    this.fr = fr !== undefined ? fr : Math.ceil(Math.random() * 100);
  }

  setEnergy(energy) {
    this.energy = energy !== undefined ? energy : this.ex;
  }
}
