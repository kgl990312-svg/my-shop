// 꾸민 케이스 그리기 (P03 캔버스, P04·P06·P07 이미지, M07 미리보기에서 공통으로 사용)
// 흰색 케이스 이미지 1장 위에 케이스 색을 곱하기(multiply)로 입히고, 그 위에 스티커·큐빅·각인을 올린다.
import { CUBIC_SHADOW, getCaseColor, getCaseType, getEngraveStyle, getSticker } from '../data/catalog';
import './CaseView.css';

export function CaseArt({ type, color, size }) {
  const t = getCaseType(type);
  const c = getCaseColor(color);
  return (
    <div className="case-art" style={{ width: size, height: size }}>
      <img src={t.top} alt="" draggable={false} />
      <div
        className="case-tint"
        style={{
          background: c.value,
          WebkitMaskImage: `url(${t.top})`,
          maskImage: `url(${t.top})`,
        }}
      />
    </div>
  );
}

export function ItemView({ item, size, placeholder = '각인 입력' }) {
  if (item.kind === 'engrave') {
    const s = getEngraveStyle(item.style);
    const empty = !(item.text || '').length;
    return (
      <span
        className={`case-engrave${empty ? ' is-empty' : ''}`}
        style={{
          fontFamily: s.family,
          fontWeight: s.weight,
          letterSpacing: s.spacing,
          color: s.color,
          fontSize: item.fs * size,
        }}
      >
        {empty ? placeholder : item.text}
      </span>
    );
  }
  const st = getSticker(item.ref);
  if (!st) return null; // 예전에 쓰던(지금은 없는) 스티커는 그리지 않음
  // 큐빅: 케이스에 붙어 있게 보이도록 얇은 접지 그림자 (케이스 크기에 비례, 저장 이미지 exportImage.js와 같은 값)
  // 그림자는 큐빅과 함께 회전하므로, 회전만큼 거꾸로 돌려 항상 화면 아래쪽으로 떨어지게 함
  let shadow;
  if (item.kind === 'cubic') {
    const r = ((item.rot || 0) * Math.PI) / 180;
    const d = size * CUBIC_SHADOW.y;
    const dx = (d * Math.sin(r)).toFixed(2);
    const dy = (d * Math.cos(r)).toFixed(2);
    shadow = `drop-shadow(${dx}px ${dy}px ${(size * CUBIC_SHADOW.blur).toFixed(2)}px ${CUBIC_SHADOW.color})`;
  }
  return (
    <img className="case-sticker" src={st.src} alt="" draggable={false} style={{ width: item.w * size, filter: shadow }} />
  );
}

export const itemStyle = (item, size) => ({
  left: item.x * size,
  top: item.y * size,
  transform: `translate(-50%, -50%) rotate(${item.rot || 0}deg)`,
});

export default function CaseView({ design, size = 300, className = '' }) {
  if (!design) return null;
  const items = design.items.filter((it) => it.kind !== 'engrave' || (it.text || '').trim());
  return (
    <div className={`case-view ${className}`} style={{ width: size, height: size }} role="img" aria-label="꾸민 케이스">
      <CaseArt type={design.type} color={design.color} size={size} />
      {items.map((it) => (
        <div key={it.id} className="case-item" style={itemStyle(it, size)}>
          <ItemView item={it} size={size} />
        </div>
      ))}
    </div>
  );
}
