// 모아(MOA) 상품·꾸미기 데이터
// 출처: PROJECT_CONTEXT.md, docs/04-site-wireframe.md, docs/06-site-design.md
// 아직 정하지 않은 값(가격, 크기 등)은 null 로 두고 화면에는 [가격]처럼 대괄호로 보여 준다.

import cardRound from '../assets/site/card/round.jpg';
import cardSquare from '../assets/site/card/square.jpg';
import cardHeart from '../assets/site/card/heart.jpg';
import cardFlower from '../assets/site/card/flower.jpg';
import hoverRound from '../assets/site/hover/round.jpg';
import hoverSquare from '../assets/site/hover/square.jpg';
import hoverHeart from '../assets/site/hover/heart.jpg';
import hoverFlower from '../assets/site/hover/flower.jpg';
import mockRound from '../assets/site/mockup/round.jpg';
import mockSquare from '../assets/site/mockup/square.jpg';
import mockHeart from '../assets/site/mockup/heart.jpg';
import mockFlower from '../assets/site/mockup/flower.jpg';
import detailRound from '../assets/site/detail/round.jpg';
import detailSquare from '../assets/site/detail/square.jpg';
import detailHeart from '../assets/site/detail/heart.jpg';
import detailFlower from '../assets/site/detail/flower.jpg';
import topRound from '../assets/site/top/round.png';
import topSquare from '../assets/site/top/square.png';
import topHeart from '../assets/site/top/heart.png';
import topFlower from '../assets/site/top/flower.png';

import cubic1 from '../assets/site/sticker/cubic/cubic_1.png';
import cubic2 from '../assets/site/sticker/cubic/cubic_2.png';
import cubic3 from '../assets/site/sticker/cubic/cubic_3.png';
import cubic4 from '../assets/site/sticker/cubic/cubic_4.png';
import cubic5 from '../assets/site/sticker/cubic/cubic_5.png';
import cubic6 from '../assets/site/sticker/cubic/cubic_6.png';
import cubic7 from '../assets/site/sticker/cubic/cubic_7.png';
import cubic8 from '../assets/site/sticker/cubic/cubic_8.png';
import sticker1 from '../assets/site/sticker/sticker/sticker_1.png';
import sticker2 from '../assets/site/sticker/sticker/sticker_2.png';
import sticker3 from '../assets/site/sticker/sticker/sticker_3.png';
import sticker4 from '../assets/site/sticker/sticker/sticker_4.png';
import sticker5 from '../assets/site/sticker/sticker/sticker_5.png';
import sticker6 from '../assets/site/sticker/sticker/sticker_6.png';
import sticker7 from '../assets/site/sticker/sticker/sticker_7.png';
import sticker8 from '../assets/site/sticker/sticker/sticker_8.png';

import review1 from '../assets/site/review/review_1.jpg';
import review2 from '../assets/site/review/review_2.jpg';
import review3 from '../assets/site/review/review_3.jpg';
import review4 from '../assets/site/review/review_4.jpg';
import review5 from '../assets/site/review/review_5.jpg';
import review6 from '../assets/site/review/review_6.jpg';
import review7 from '../assets/site/review/review_7.jpg';
import review8 from '../assets/site/review/review_8.jpg';

import step1 from '../assets/site/icon/step_1.png';
import step2 from '../assets/site/icon/step_2.png';
import step3 from '../assets/site/icon/step_3.png';
import step4 from '../assets/site/icon/step_4.png';
import step5 from '../assets/site/icon/step_5.png';

export { default as bannerImage } from '../assets/site/banner/main.jpg';

/*
 * 케이스 종류 4가지 (원형, 둥근 정사각형, 하트, 꽃)
 * safe: 꾸밀 수 있는 범위(안쪽 점선). 케이스 상자(정사각형) 크기를 1로 본 비율
 *   - rect: 네모 범위 (inset = 바깥에서 들어온 거리, radius = 모서리)
 *   - circle: 원 범위 (cx, cy = 가운데, r = 반지름)
 */
export const CASE_TYPES = [
  {
    key: 'round',
    name: '원형',
    size: null,
    price: null,
    card: cardRound,
    hover: hoverRound,
    mockup: mockRound,
    detail: detailRound,
    top: topRound,
    safe: { shape: 'circle', cx: 0.5, cy: 0.5, r: 0.36 },
  },
  {
    key: 'square',
    name: '둥근 정사각형',
    size: null,
    price: null,
    card: cardSquare,
    hover: hoverSquare,
    mockup: mockSquare,
    detail: detailSquare,
    top: topSquare,
    safe: { shape: 'rect', inset: 0.13, radius: 0.08 },
  },
  {
    key: 'heart',
    name: '하트',
    size: null,
    price: null,
    card: cardHeart,
    hover: hoverHeart,
    mockup: mockHeart,
    detail: detailHeart,
    top: topHeart,
    safe: { shape: 'circle', cx: 0.5, cy: 0.44, r: 0.27 },
  },
  {
    key: 'flower',
    name: '꽃',
    size: null,
    price: null,
    card: cardFlower,
    hover: hoverFlower,
    mockup: mockFlower,
    detail: detailFlower,
    top: topFlower,
    safe: { shape: 'circle', cx: 0.5, cy: 0.5, r: 0.28 },
  },
];

export const getCaseType = (key) => CASE_TYPES.find((t) => t.key === key) || CASE_TYPES[0];

// 케이스 색 5가지 (순서대로, 첫 번째가 기본)
export const CASE_COLORS = [
  { key: 'milk-white', name: '밀크 화이트', value: '#FAF7F2' },
  { key: 'blush-pink', name: '블러시 핑크', value: '#F3DCD3' },
  { key: 'lavender', name: '라벤더', value: '#E4DAF0' },
  { key: 'sky-blue', name: '스카이 블루', value: '#D9E6F2' },
  { key: 'cocoa-beige', name: '코코아 베이지', value: '#D6C2AE' },
];

export const getCaseColor = (key) => CASE_COLORS.find((c) => c.key === key) || CASE_COLORS[0];

// 큐빅 · 스티커 (패널마다 8개) — 스티커: 곰돌이, 곰돌이 얼굴, 리본, 하트 풍선, 케이크, 체리, 꽃다발, 구름
const makeList = (kind, srcs) => srcs.map((src, i) => ({ id: `${kind}-${i + 1}`, kind, src, n: i + 1 }));

export const STICKERS = {
  cubic: makeList('cubic', [cubic1, cubic2, cubic3, cubic4, cubic5, cubic6, cubic7, cubic8]),
  sticker: makeList('sticker', [sticker1, sticker2, sticker3, sticker4, sticker5, sticker6, sticker7, sticker8]),
};

export const getSticker = (id) => {
  const kind = id.split('-')[0];
  return (STICKERS[kind] || []).find((s) => s.id === id);
};

export const KIND_LABEL = {
  cubic: '큐빅',
  sticker: '스티커',
  engrave: '각인',
};

/*
 * 각인 스타일: 글꼴 2개 × 각인 색 3개 (샴페인 골드, 로즈 골드, 실버)
 * 각인 글꼴은 [미정]이라 임시로 세리프(Cormorant Garamond + 고운바탕)와 Pretendard를 쓴다.
 */
const ENGRAVE_FONTS = [
  { key: 'serif', name: '세리프', family: "'Cormorant Garamond', 'Gowun Batang', serif", weight: 600, spacing: '0.02em' },
  { key: 'sans', name: '모던', family: "Pretendard, 'Apple SD Gothic Neo', sans-serif", weight: 600, spacing: '0.08em' },
];
const ENGRAVE_COLORS = [
  { key: 'gold', name: '샴페인 골드', value: '#A9824F' },
  { key: 'rose', name: '로즈 골드', value: '#B7705F' },
  { key: 'silver', name: '실버', value: '#8B9198' },
];

export const ENGRAVE_STYLES = ENGRAVE_FONTS.flatMap((font) =>
  ENGRAVE_COLORS.map((color) => ({
    id: `${font.key}-${color.key}`,
    name: `${font.name} · ${color.name}`,
    family: font.family,
    weight: font.weight,
    spacing: font.spacing,
    color: color.value,
  }))
);

export const getEngraveStyle = (id) => ENGRAVE_STYLES.find((s) => s.id === id) || ENGRAVE_STYLES[0];

export const ENGRAVE_MAX = 10;

// 직접 꾸민 후기 (8개, 예시 후기). 문구·날짜는 [미정]
export const REVIEWS = [
  { id: 1, img: review1, type: 'square' },
  { id: 2, img: review2, type: 'heart' },
  { id: 3, img: review3, type: 'round' },
  { id: 4, img: review4, type: 'flower' },
  { id: 5, img: review5, type: 'square' },
  { id: 6, img: review6, type: 'heart' },
  { id: 7, img: review7, type: 'round' },
  { id: 8, img: review8, type: 'flower' },
].map((r) => ({
  ...r,
  author: '○*○',
  date: '[날짜]',
  text: '[예시 후기 문구 — 평소에는 한 줄까지만 보이고 넘치면 …으로 줄여요. 마우스를 올리면 문구가 옆으로 흐르며 끝까지 보여요.]',
}));

// 제작 안내 5단계 (문구: docs/04-site-wireframe.md)
export const STEPS = [
  { n: 1, label: '케이스 색 고르기', icon: step1 },
  { n: 2, label: '스티커·큐빅·각인으로 꾸미기', icon: step2 },
  { n: 3, label: '확인하고 주문하기', icon: step3 },
  { n: 4, label: '인쇄·각인하고 큐빅 붙이기', icon: step4 },
  { n: 5, label: '배송', icon: step5 },
];

export const PAYMENT_METHODS = ['카드', '간편결제', '무통장 입금'];

// 정하지 않은 값 표시
export const fmtPrice = (price) => (price == null ? '[가격]' : price.toLocaleString('ko-KR'));
export const fmtSize = (size) => (size == null ? '[크기]' : size);
