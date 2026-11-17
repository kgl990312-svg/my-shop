import { KIND_LABEL, designPrice, getCaseColor, getCaseType } from '../data/catalog';

// 붙인 스티커·큐빅·각인 요약 (예: 큐빅 2개 · 스티커 1개 · 각인 "Yuna")
export function decorationSummary(design) {
  const counts = { cubic: 0, sticker: 0 };
  const engraves = [];
  design.items.forEach((it) => {
    if (it.kind === 'engrave') {
      if ((it.text || '').trim()) engraves.push(`"${it.text.trim()}"`);
    } else if (it.kind in counts) counts[it.kind] += 1;
  });
  const parts = Object.entries(counts)
    .filter(([, n]) => n > 0)
    .map(([k, n]) => `${KIND_LABEL[k]} ${n}개`);
  if (engraves.length) parts.push(`각인 ${engraves.join(', ')}`);
  return parts.join(' · ') || '없음';
}

export const typeName = (design) => getCaseType(design.type).name;
export const colorOf = (design) => getCaseColor(design.color);

// 가격 합계 (꾸미기 추가 요금 포함) — 가격이 정해지지 않은 상품이 있으면 null
export function sumPrice(designs) {
  let total = 0;
  for (const d of designs) {
    const p = designPrice(d);
    if (p == null) return null;
    total += p;
  }
  return total;
}
