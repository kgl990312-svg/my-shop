// 모아(MOA) 상품·꾸미기 데이터
// 출처: PROJECT_CONTEXT.md, docs/04-site-wireframe.md, docs/06-site-design.md
// 아직 정하지 않은 값은 null 로 두고 화면에는 [가격]처럼 대괄호로 보여 준다.

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
 * 케이스 크기 (가정): 가상 사이트라 일반적인 쿠션 팩트 평균값으로 넣은 대략적인 크기. 실제 판매 시 측정값으로 교체.
 *   모든 종류가 같은 15g 쿠션 리필(지름 약 60mm)이 들어가는 크기. 하트·꽃은 안에 원형 리필이 들어가야 해서 겉이 조금 더 큼.
 *   size.short: 카드·꾸미기 패널처럼 짧게 / size.full: 상세처럼 항목 이름까지
 */
export const COMPAT_TAG = '15g 쿠션 리필 호환';
// 호환 규격 안내: 핵심 문장 + 확인 방법 팁 (휴대폰은 팁을 다음 줄에 보조 글자로, 데스크탑은 한 줄 그대로)
export const COMPAT_NOTE = '15g 쿠션 리필(지름 약 60mm)이 모두 들어가요.';
export const COMPAT_HINT = '리필 바닥 지름을 재 보면 확인할 수 있어요.';

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
    size: { short: '지름 약 85mm', full: '지름 약 85mm · 높이 약 28mm' },
    price: 19000,
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
    size: { short: '약 85 × 85mm', full: '가로·세로 약 85mm · 높이 약 28mm' },
    price: 20000,
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
    size: { short: '약 92 × 86mm', full: '가로 약 92mm · 세로 약 86mm · 높이 약 28mm' },
    price: 21000,
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
    size: { short: '약 92 × 92mm', full: '가로·세로 약 92mm · 높이 약 28mm' },
    price: 22000,
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

// 큐빅 접지 그림자 (케이스 크기 대비 비율): 아래로 살짝, 짧고 부드럽게 → 표면에 붙어 있는 느낌
export const CUBIC_SHADOW = { y: 0.0045, blur: 0.01, color: 'rgba(90, 50, 40, 0.35)' };

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

// 직접 꾸민 후기 (8개, 예시 후기). 날짜는 [미정]. 카드를 누르면 후기 안내창에서 전체 문구를 보여 줌
const REVIEW_TEXTS = [
  '내 취향대로 직접 디자인할 수 있다는 점이 정말 좋았어요! 하나하나 배치하면서 꾸미는 재미도 있고 완성된 모습도 너무 만족스러워요 ♡',
  '화면에서 미리 확인했던 디자인과 실제 제품이 거의 똑같아서 놀랐어요. 마감도 깔끔하고 퀄리티도 좋아요!',
  '평범한 제품이 아니라 나만의 디자인으로 만들 수 있어서 특별해요. 세상에 하나뿐인 제품이라는 느낌이 들어요 ♡',
  '처음에는 디자인하는 게 어려울까 봐 걱정했는데 사용 방법이 간단해서 금방 완성했어요. 다음에는 다른 분위기로도 만들어보고 싶어요!',
  '색상부터 장식 위치까지 직접 선택할 수 있어서 좋았어요. 제가 원하는 느낌 그대로 완성할 수 있어서 정말 만족합니다.',
  '나만의 취향이 담긴 제품이라 더 애착이 가요. 매일 사용하는 제품을 직접 꾸밀 수 있다는 아이디어가 너무 마음에 들어요!',
  '주문 전에 완성된 모습을 미리 볼 수 있어서 좋았어요. 실제로 받아보니 생각했던 것보다 예쁘고 정성스럽게 제작된 느낌이에요',
  '친구에게 선물하려고 주문했는데 정말 특별한 선물이 되었어요! 직접 디자인할 수 있다는 점이 가장 큰 매력인 것 같아요. 재구매 의사 있어요 ♡',
];

export const REVIEWS = [
  { id: 1, img: review1, type: 'square' },
  { id: 2, img: review2, type: 'heart' },
  { id: 3, img: review3, type: 'round' },
  { id: 4, img: review4, type: 'flower' },
  { id: 5, img: review5, type: 'square' },
  { id: 6, img: review6, type: 'heart' },
  { id: 7, img: review7, type: 'round' },
  { id: 8, img: review8, type: 'flower' },
].map((r, i) => ({
  ...r,
  author: '○*○',
  date: '[날짜]',
  text: REVIEW_TEXTS[i],
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

/*
 * 꾸미기 추가 요금
 * - 스티커·큐빅: 종류 상관없이 5개까지는 추가 요금 없음, 6개째부터 1개당 +500원
 * - 각인: 1개당 +1,500원 (무료 5개에 세지 않음, 빈 각인은 세지 않음)
 */
export const FREE_DECO = 5;
export const EXTRA_DECO_PRICE = 500;
export const ENGRAVE_PRICE = 1500;
export const DECO_NOTE = `스티커·큐빅은 종류 상관없이 ${FREE_DECO}개까지 추가 요금 없어요`;
export const DECO_NOTE_EXTRA = `${FREE_DECO + 1}개째부터 1개당 +${EXTRA_DECO_PRICE}원 · 각인 1개당 +${ENGRAVE_PRICE.toLocaleString('ko-KR')}원`;

const items = (design) => design?.items || [];
export const countDeco = (design) => items(design).filter((it) => it.kind !== 'engrave').length;
export const countEngrave = (design) =>
  items(design).filter((it) => it.kind === 'engrave' && (it.text || '').trim()).length;
export const extraDecoCount = (design) => Math.max(0, countDeco(design) - FREE_DECO);
export const extraDecoPrice = (design) => extraDecoCount(design) * EXTRA_DECO_PRICE;
export const engravePrice = (design) => countEngrave(design) * ENGRAVE_PRICE;
// 추가 요금 합계 (스티커·큐빅 초과분 + 각인)
export const addOnPrice = (design) => extraDecoPrice(design) + engravePrice(design);
// 꾸민 케이스 하나의 가격 = 종류 가격 + 추가 요금
export const designPrice = (design) => {
  const base = getCaseType(design?.type).price;
  return base == null ? null : base + addOnPrice(design);
};
// 추가 요금 내역 (예: ["추가 스티커·큐빅 2개 +1,000원", "각인 1개 +1,500원"])
export const addOnLines = (design) => {
  const lines = [];
  const extra = extraDecoCount(design);
  const eng = countEngrave(design);
  if (extra) lines.push({ label: `추가 스티커·큐빅 ${extra}개`, price: extraDecoPrice(design) });
  if (eng) lines.push({ label: `각인 ${eng}개`, price: engravePrice(design) });
  return lines;
};

// 배송비: 기본 3,000원, 15,000원 이상 주문하면 무료 (케이스가 모두 15,000원 이상이라 현재는 항상 무료)
export const FREE_SHIPPING_MIN = 15000;
export const SHIPPING_FEE = 3000;
export const shippingFor = (subtotal) => (subtotal == null ? null : subtotal >= FREE_SHIPPING_MIN ? 0 : SHIPPING_FEE);

// 배송·교환 안내 문구
export const SHIPPING_INFO = {
  period: '주문 확인 후 약 5~7일 이내 배송됩니다. (주말 및 공휴일 제외)',
  fee: `${SHIPPING_FEE.toLocaleString('ko-KR')}원 (${FREE_SHIPPING_MIN.toLocaleString('ko-KR')}원 이상 주문 시 무료배송)`,
  refund: '본 상품은 주문 제작 상품으로, 고객님의 단순 변심에 의한 교환 및 환불이 제한될 수 있습니다.',
};

// 예상 배송일: 주문일에서 주말을 빼고 5~7일 뒤 (공휴일은 계산하지 않음) — 예: "11.24(화) ~ 11.26(목)"
const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];
const addBusinessDays = (from, n) => {
  const d = new Date(from);
  while (n > 0) {
    d.setDate(d.getDate() + 1);
    if (d.getDay() !== 0 && d.getDay() !== 6) n -= 1;
  }
  return d;
};
const fmtDay = (d) => `${d.getMonth() + 1}.${d.getDate()}(${WEEKDAY[d.getDay()]})`;
export const SHIPPING_DAYS = { min: 5, max: 7 };
export function expectedDelivery(orderDate) {
  // orderDate: "2026.11.17" 형식
  const [y, m, d] = String(orderDate).split('.').map(Number);
  if (!y || !m || !d) return null;
  const base = new Date(y, m - 1, d);
  return `${fmtDay(addBusinessDays(base, SHIPPING_DAYS.min))} ~ ${fmtDay(addBusinessDays(base, SHIPPING_DAYS.max))}`;
}

// 푸터 회사 정보·고객센터 (가상 사이트용 예시 정보)
export const COMPANY = {
  name: '모아(MOA)',
  ceo: '김모아',
  bizNo: '000-00-00000',
  address: '서울특별시 성동구 모아로 00, 2층',
  phone: '02-000-0000',
  hours: '평일 10:00 ~ 17:00 (점심 12:00 ~ 13:00, 주말·공휴일 휴무)',
};

// 정하지 않은 값 표시
export const fmtPrice = (price) => (price == null ? '[가격]' : price.toLocaleString('ko-KR'));
export const fmtSize = (size, full = false) => (size == null ? '[크기]' : full ? size.full : size.short);
