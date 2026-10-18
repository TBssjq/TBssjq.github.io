/**
 * levels.js — 关卡数据（纯数据，不依赖 three）
 * 赛道由 xz 平面的控制点经闭合 Catmull-Rom 插值生成；
 * nodes 是沿赛道分布的知识点节点（topic 对应 content 中的条目 id）。
 */

export const LEVELS = [
  {
    id: 1,
    code: 'nullptr_drift',
    file: 'level_01.cpp',
    title: 'NULLPTR DRIFT',
    brief: {
      zh: '平滑环道 · 熟悉油门、转向、氮气与第一次收集',
      en: 'Smooth ring · learn throttle, steering, nitro and your first pickups',
    },
    limit: 55,
    bonus: 13,
    nodeBonus: 3,
    width: 18,
    checkpoints: [0.34, 0.67],
    nodes: [
      { t: 0.10, topic: 'dsa-array' },
      { t: 0.40, topic: 'stl-container' },
      { t: 0.60, topic: 'lang-raii' },
      { t: 0.88, topic: 'modern-auto' },
    ],
    maxSpeed: 64,
    boostSpeed: 92,
    accel: 30,
    accent: 0x22e6ff,
    accent2: 0xff2f7d,
    fog: 0x04070c,
    points: [
      [0, -155], [95, -145], [155, -70], [165, 0],
      [140, 85], [75, 145], [0, 168], [-85, 148],
      [-150, 80], [-168, -5], [-140, -92], [-72, -150],
    ],
  },
  {
    id: 2,
    code: 'recursive_descent',
    file: 'level_02.cpp',
    title: 'RECURSIVE DESCENT',
    brief: {
      zh: '连续 S 弯 · 提前找内线，顺手收下哈希表与模板',
      en: 'Chained S-curves · find the inside line, grab hashing and templates',
    },
    limit: 72,
    bonus: 12,
    nodeBonus: 3,
    width: 15.5,
    checkpoints: [0.22, 0.46, 0.72],
    nodes: [
      { t: 0.10, topic: 'dsa-hash' },
      { t: 0.30, topic: 'stl-algorithm' },
      { t: 0.56, topic: 'oop-polymorphism' },
      { t: 0.66, topic: 'gen-template' },
      { t: 0.88, topic: 'modern-lambda' },
    ],
    maxSpeed: 70,
    boostSpeed: 100,
    accel: 32,
    accent: 0x9b6bff,
    accent2: 0x22e6ff,
    fog: 0x060610,
    points: [
      [0, -180], [110, -175], [180, -115], [200, -30],
      [160, 35], [95, 55], [75, 120], [120, 185],
      [55, 225], [-45, 215], [-100, 165], [-105, 100],
      [-170, 80], [-225, 25], [-215, -65], [-155, -105],
      [-140, -175], [-65, -195],
    ],
  },
  {
    id: 3,
    code: 'undefined_behavior',
    file: 'level_03.cpp',
    title: 'UNDEFINED BEHAVIOR',
    brief: {
      zh: '复合弯 + 窄路肩 · 极限走线，把泛型与现代 C++ 一并带走',
      en: 'Compound corners, narrow shoulders · extreme lines, plus generics and modern C++',
    },
    limit: 92,
    bonus: 11,
    nodeBonus: 3,
    width: 13,
    checkpoints: [0.17, 0.36, 0.56, 0.78],
    nodes: [
      { t: 0.07, topic: 'dsa-tree' },
      { t: 0.26, topic: 'stl-iterator' },
      { t: 0.46, topic: 'lang-copy-move' },
      { t: 0.66, topic: 'oop-slicing' },
      { t: 0.86, topic: 'gen-concepts' },
      { t: 0.95, topic: 'modern-smart-ptr' },
    ],
    maxSpeed: 76,
    boostSpeed: 108,
    accel: 34,
    accent: 0xff2f7d,
    accent2: 0xffcc66,
    fog: 0x0a0410,
    points: [
      [0, -205], [125, -220], [210, -155], [225, -65],
      [175, -5], [105, -25], [70, 35], [115, 95],
      [195, 110], [230, 180], [155, 245], [40, 255],
      [-65, 220], [-105, 150], [-190, 170], [-250, 105],
      [-255, 10], [-195, -55], [-220, -150], [-145, -200],
    ],
  },
];

export const KMH = 3.6;
