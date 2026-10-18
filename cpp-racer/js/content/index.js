import { CATEGORY as DSA_CAT, TOPICS as DSA } from './dsa.js';
import { CATEGORY as STL_CAT, TOPICS as STL } from './stl.js';
import { CATEGORY as LANG_CAT, TOPICS as LANG } from './lang.js';
import { CATEGORY as OOP_CAT, TOPICS as OOP } from './oop.js';
import { CATEGORY as GEN_CAT, TOPICS as GEN } from './generic.js';
import { CATEGORY as MODERN_CAT, TOPICS as MODERN } from './modern.js';

export const CATEGORIES = [DSA_CAT, STL_CAT, LANG_CAT, OOP_CAT, GEN_CAT, MODERN_CAT];

export const TOPICS = [...DSA, ...STL, ...LANG, ...OOP, ...GEN, ...MODERN];

const BY_ID = new Map(TOPICS.map((t) => [t.id, t]));

export function getTopic(id) {
  return BY_ID.get(id) || TOPICS[0];
}

export function topicsOf(cat) {
  return TOPICS.filter((t) => t.cat === cat);
}

export function categoryOf(id) {
  return CATEGORIES.find((c) => c.id === id) || CATEGORIES[0];
}

export function topicCount() {
  return TOPICS.length;
}
