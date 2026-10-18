/**
 * save.js — 本地存档（最佳成绩 / 已收集知识点 / 已通关关卡）
 * 只写 localStorage，失败时静默降级（隐私模式）。
 */

const KEY = 'race_engine_save_v1';
const EMPTY = { best: {}, topics: [], cleared: [] };

function read() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { best: {}, topics: [], cleared: [] };
    const o = JSON.parse(raw);
    return {
      best: o && typeof o.best === 'object' ? o.best : {},
      topics: Array.isArray(o && o.topics) ? o.topics : [],
      cleared: Array.isArray(o && o.cleared) ? o.cleared : [],
    };
  } catch (e) {
    return { best: {}, topics: [], cleared: [] };
  }
}

let data = read();

function write() {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch (e) { /* 忽略：无痕模式或配额已满 */ }
}

export const Save = {
  best(levelId) {
    const v = data.best[levelId];
    return typeof v === 'number' ? v : 0;
  },

  /** 返回 true 表示刷新了纪录 */
  setBest(levelId, seconds) {
    const prev = this.best(levelId);
    if (!prev || seconds < prev) {
      data.best[levelId] = Number(seconds.toFixed(2));
      write();
      return true;
    }
    return false;
  },

  markTopic(id) {
    if (!data.topics.includes(id)) {
      data.topics.push(id);
      write();
      return true;
    }
    return false;
  },

  hasTopic(id) {
    return data.topics.includes(id);
  },

  topics() {
    return data.topics.slice();
  },

  topicCount() {
    return data.topics.length;
  },

  markCleared(levelId) {
    if (!data.cleared.includes(levelId)) {
      data.cleared.push(levelId);
      write();
    }
  },

  isCleared(levelId) {
    return data.cleared.includes(levelId);
  },

  reset() {
    data = { best: {}, topics: [], cleared: [] };
    write();
  },
};

export { EMPTY };
