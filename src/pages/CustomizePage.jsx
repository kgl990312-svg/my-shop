// P03 꾸미기: 상단 바 → 편집 영역(캔버스 + 오른쪽 도구 버튼 5개) → 아래 도구 패널. 헤더·푸터 없음
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useBlocker, useNavigate, useRouter } from '../router';
import { cleanDesign, hasDecoration, useShop } from '../store/ShopContext';
import { useUI } from '../components/Dialogs';
import { CaseArt, ItemView, itemStyle } from '../components/CaseView';
import {
  IconBack,
  IconCaseType,
  IconClose,
  IconGem,
  IconHand,
  IconHeart,
  IconHelp,
  IconMinus,
  IconPalette,
  IconPlus,
  IconRedo,
  IconReset,
  IconText,
  IconUndo,
  Sparkle,
} from '../components/Icons';
import {
  CASE_COLORS,
  CASE_TYPES,
  ENGRAVE_MAX,
  ENGRAVE_STYLES,
  STICKERS,
  fmtPrice,
  fmtSize,
  getCaseType,
} from '../data/catalog';
import '../components/CaseView.css';
import './CustomizePage.css';

const CASE_PX = 442; // 100%일 때 케이스 크기
const ZOOM_MIN = 0.6;
const ZOOM_MAX = 1.6;

const TOOLS = [
  { key: 'color', label: '케이스 색', Icon: IconPalette },
  { key: 'cubic', label: '큐빅', Icon: IconGem },
  { key: 'sticker', label: '스티커', Icon: IconHeart },
  { key: 'engrave', label: '각인', Icon: IconText },
];

// 처음 붙일 때 크기 (케이스 크기 대비 비율)
const DEFAULT_W = { cubic: 0.12, sticker: 0.2 };
const DEFAULT_FS = 0.075;
const MIN_W = 0.05;
const MAX_W = 0.7;
const MIN_FS = 0.03;
const MAX_FS = 0.2;

let idSeq = 0;
const newId = () => `i${Date.now().toString(36)}${(idSeq++).toString(36)}`;

const snapshot = (d) => ({ color: d.color, items: d.items });
const sameSnap = (a, b) => a.color === b.color && JSON.stringify(a.items) === JSON.stringify(b.items);

// 안쪽 점선(꾸밀 수 있는 범위) 안에 있는지
function insideSafe(safe, fx, fy) {
  if (safe.shape === 'rect') {
    return fx >= safe.inset && fx <= 1 - safe.inset && fy >= safe.inset && fy <= 1 - safe.inset;
  }
  return Math.hypot(fx - safe.cx, fy - safe.cy) <= safe.r;
}

// 스티커가 안쪽 점선 밖으로 나가지 않게 위치를 맞춤
function clampToSafe(safe, item, half) {
  const rad = ((item.rot || 0) * Math.PI) / 180;
  const ex = Math.abs(half.w * Math.cos(rad)) + Math.abs(half.h * Math.sin(rad));
  const ey = Math.abs(half.w * Math.sin(rad)) + Math.abs(half.h * Math.cos(rad));
  let { x, y } = item;
  if (safe.shape === 'rect') {
    const lo = safe.inset;
    const hi = 1 - safe.inset;
    x = lo + ex > hi - ex ? 0.5 : Math.min(Math.max(x, lo + ex), hi - ex);
    y = lo + ey > hi - ey ? 0.5 : Math.min(Math.max(y, lo + ey), hi - ey);
  } else {
    const reach = Math.max(ex, ey);
    const maxD = Math.max(0, safe.r - reach);
    const dx = x - safe.cx;
    const dy = y - safe.cy;
    const d = Math.hypot(dx, dy);
    if (d > maxD) {
      x = safe.cx + (d ? (dx / d) * maxD : 0);
      y = safe.cy + (d ? (dy / d) * maxD : 0);
    }
  }
  return { ...item, x, y };
}

export default function CustomizePage() {
  const navigate = useNavigate();
  const { goBack } = useRouter();
  const { design, setDesign, clearDesign } = useShop();
  const { confirm, showHelp } = useUI();

  const [panel, setPanel] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [hist, setHist] = useState({ past: [], future: [] });
  const [hint, setHint] = useState('hidden'); // hidden | show | fade
  const [ghost, setGhost] = useState(null); // 패널에서 끌고 있는 스티커
  const hintShownRef = useRef(false);

  const designRef = useRef(design);
  designRef.current = design;
  const gestureBase = useRef(null);
  const caseRef = useRef(null);
  const itemEls = useRef({});
  const engraveInputRef = useRef(null);

  // 꾸미던 케이스가 없으면 메인으로
  useEffect(() => {
    if (!design) navigate('/', { replace: true });
  }, [design, navigate]);

  // 꾸민 내용이 있을 때 떠나려 하면 M01 (확인 화면으로 가는 건 제외)
  useBlocker((tx) => {
    if (tx.to.startsWith('/confirm')) return undefined;
    if (!hasDecoration(designRef.current)) return undefined;
    confirm('exit', () => {
      clearDesign();
      tx.proceed();
    });
    return 'block';
  });

  // ---------- 상태 변경 (되돌리기 기록) ----------
  const live = useCallback((next) => setDesign(next), [setDesign]);

  const commit = useCallback(
    (next) => {
      const cur = designRef.current;
      setHist((h) => ({ past: [...h.past, snapshot(cur)].slice(-60), future: [] }));
      setDesign(next);
    },
    [setDesign]
  );

  const beginGesture = useCallback(() => {
    if (!gestureBase.current) gestureBase.current = snapshot(designRef.current);
  }, []);

  const endGesture = useCallback(() => {
    const base = gestureBase.current;
    gestureBase.current = null;
    if (base && !sameSnap(base, snapshot(designRef.current))) {
      setHist((h) => ({ past: [...h.past, base].slice(-60), future: [] }));
    }
  }, []);

  const updateItem = useCallback(
    (id, patch) => {
      const d = designRef.current;
      live({ ...d, items: d.items.map((it) => (it.id === id ? { ...it, ...patch } : it)) });
    },
    [live]
  );

  // 선택을 풀 때 내용 없는 각인은 사라짐
  const deselect = useCallback(() => {
    const d = designRef.current;
    const sel = d?.items.find((it) => it.id === selectedId);
    if (sel && sel.kind === 'engrave' && !(sel.text || '').trim()) {
      live({ ...d, items: d.items.filter((it) => it.id !== sel.id) });
    }
    if (sel) endGesture();
    setSelectedId(null);
  }, [selectedId, live, endGesture]);

  const select = useCallback(
    (id) => {
      if (id === selectedId) return;
      const d = designRef.current;
      const sel = d.items.find((it) => it.id === selectedId);
      if (sel && sel.kind === 'engrave' && !(sel.text || '').trim()) {
        live({ ...d, items: d.items.filter((it) => it.id !== sel.id) });
        endGesture();
      }
      setSelectedId(id);
    },
    [selectedId, live, endGesture]
  );

  const undo = () => {
    if (!hist.past.length) return;
    deselectSilently();
    const prev = hist.past[hist.past.length - 1];
    setHist((h) => ({ past: h.past.slice(0, -1), future: [snapshot(designRef.current), ...h.future] }));
    setDesign({ ...designRef.current, ...prev });
  };

  const redo = () => {
    if (!hist.future.length) return;
    deselectSilently();
    const next = hist.future[0];
    setHist((h) => ({ past: [...h.past, snapshot(designRef.current)], future: h.future.slice(1) }));
    setDesign({ ...designRef.current, ...next });
  };

  // 되돌리기 전에 진행 중인 선택을 정리
  function deselectSilently() {
    gestureBase.current = null;
    setSelectedId(null);
  }

  // ---------- 크기 측정 · 범위 맞추기 ----------
  const halfOf = (id) => {
    const el = itemEls.current[id];
    if (!el) return { w: 0.05, h: 0.05 };
    return { w: el.offsetWidth / CASE_PX / 2, h: el.offsetHeight / CASE_PX / 2 };
  };

  const type = design ? getCaseType(design.type) : CASE_TYPES[0];
  const safe = type.safe;

  // 새로 붙인 스티커는 크기를 잰 뒤 범위 안으로 맞춤
  const pendingClamp = useRef(null);
  useLayoutEffect(() => {
    const id = pendingClamp.current;
    if (!id || !design) return;
    pendingClamp.current = null;
    const it = design.items.find((i) => i.id === id);
    if (!it) return;
    const fixed = clampToSafe(safe, it, halfOf(id));
    if (fixed.x !== it.x || fixed.y !== it.y) updateItem(id, { x: fixed.x, y: fixed.y });
  });

  // ---------- 붙이기 ----------
  const addSticker = (sticker, fx = 0.5, fy = 0.5) => {
    deselect();
    const d = designRef.current;
    const item = { id: newId(), kind: sticker.kind, ref: sticker.id, x: fx, y: fy, w: DEFAULT_W[sticker.kind], rot: 0 };
    commit({ ...d, items: [...d.items, item] });
    pendingClamp.current = item.id;
    setSelectedId(item.id);
    setHint((h) => (h === 'show' ? 'fade' : h));
  };

  const addEngrave = (style) => {
    const d = designRef.current;
    const sel = d.items.find((it) => it.id === selectedId);
    // 방금 넣은 빈 각인이 선택돼 있으면 스타일만 바꿈
    if (sel && sel.kind === 'engrave' && !(sel.text || '').trim()) {
      updateItem(sel.id, { style: style.id });
      engraveInputRef.current?.focus();
      return;
    }
    deselect();
    const after = designRef.current;
    beginGesture();
    const item = { id: newId(), kind: 'engrave', style: style.id, text: '', x: 0.5, y: 0.5, fs: DEFAULT_FS, rot: 0 };
    live({ ...after, items: [...after.items, item] });
    pendingClamp.current = item.id;
    setSelectedId(item.id);
    setHint((h) => (h === 'show' ? 'fade' : h));
    setTimeout(() => engraveInputRef.current?.focus(), 0);
  };

  const removeItem = (id) => {
    const d = designRef.current;
    gestureBase.current = null;
    const it = d.items.find((i) => i.id === id);
    const isEmptyEngrave = it?.kind === 'engrave' && !(it.text || '').trim();
    const next = { ...d, items: d.items.filter((i) => i.id !== id) };
    if (isEmptyEngrave) live(next);
    else commit(next);
    setSelectedId(null);
  };

  // ---------- 캔버스 조작 (이동 · 크기 · 회전) ----------
  const toCase = (e) => {
    const r = caseRef.current.getBoundingClientRect();
    return { fx: (e.clientX - r.left) / r.width, fy: (e.clientY - r.top) / r.height };
  };

  const startGesture = (e, id, mode) => {
    e.preventDefault();
    e.stopPropagation();
    if (mode === 'move') select(id);
    const it = designRef.current.items.find((i) => i.id === id);
    if (!it) return;
    beginGesture();
    const p0 = toCase(e);
    const d0 = Math.hypot(p0.fx - it.x, p0.fy - it.y) || 0.0001;
    const a0 = Math.atan2(p0.fy - it.y, p0.fx - it.x);
    const target = e.currentTarget;
    target.setPointerCapture?.(e.pointerId);

    const onMove = (ev) => {
      const p = toCase(ev);
      const cur = designRef.current.items.find((i) => i.id === id);
      if (!cur) return;
      let next = cur;
      if (mode === 'move') {
        next = { ...cur, x: it.x + (p.fx - p0.fx), y: it.y + (p.fy - p0.fy) };
      } else if (mode === 'resize') {
        const k = Math.hypot(p.fx - it.x, p.fy - it.y) / d0;
        next =
          it.kind === 'engrave'
            ? { ...cur, fs: Math.min(MAX_FS, Math.max(MIN_FS, it.fs * k)) }
            : { ...cur, w: Math.min(MAX_W, Math.max(MIN_W, it.w * k)) };
      } else if (mode === 'rotate') {
        const a = Math.atan2(p.fy - it.y, p.fx - it.x);
        let rot = (it.rot || 0) + ((a - a0) * 180) / Math.PI;
        rot = ((rot % 360) + 360) % 360;
        next = { ...cur, rot: Math.round(rot) };
      }
      // 크기가 바뀐 경우를 반영해 범위 계산
      let half = halfOf(id);
      if (mode === 'resize') {
        const ratio = it.kind === 'engrave' ? next.fs / cur.fs : next.w / cur.w;
        half = { w: half.w * ratio, h: half.h * ratio };
      }
      next = clampToSafe(safe, next, half);
      updateItem(id, { x: next.x, y: next.y, w: next.w, fs: next.fs, rot: next.rot });
    };
    const onUp = () => {
      target.removeEventListener('pointermove', onMove);
      target.removeEventListener('pointerup', onUp);
      target.removeEventListener('pointercancel', onUp);
      const cur = designRef.current.items.find((i) => i.id === id);
      // 각인은 선택이 풀릴 때 기록 (빈 각인 처리 때문)
      if (!(cur && cur.kind === 'engrave' && !(cur.text || '').trim())) endGesture();
    };
    target.addEventListener('pointermove', onMove);
    target.addEventListener('pointerup', onUp);
    target.addEventListener('pointercancel', onUp);
  };

  // 캔버스 빈 곳 클릭: 선택 해제 + 패널 닫기
  const onStageDown = (e) => {
    if (e.target.closest('.cz-item, .cz-select')) return;
    deselect();
    setPanel(null);
  };

  // ---------- 패널에서 스티커 끌어서 붙이기 ----------
  const onStickerPointerDown = (e, sticker) => {
    if (e.button !== 0) return;
    const sx = e.clientX;
    const sy = e.clientY;
    let dragging = false;
    const btn = e.currentTarget;
    btn.setPointerCapture?.(e.pointerId);
    const size = DEFAULT_W[sticker.kind] * CASE_PX * zoom;

    const onMove = (ev) => {
      if (!dragging && Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) dragging = true;
      if (dragging) setGhost({ src: sticker.src, x: ev.clientX, y: ev.clientY, size });
    };
    const onUp = (ev) => {
      btn.removeEventListener('pointermove', onMove);
      btn.removeEventListener('pointerup', onUp);
      btn.removeEventListener('pointercancel', onCancel);
      setGhost(null);
      if (!dragging) {
        addSticker(sticker);
        return;
      }
      const p = toCase(ev);
      if (insideSafe(safe, p.fx, p.fy)) addSticker(sticker, p.fx, p.fy); // 점선 밖이면 붙이지 않음
    };
    const onCancel = () => {
      btn.removeEventListener('pointermove', onMove);
      btn.removeEventListener('pointerup', onUp);
      btn.removeEventListener('pointercancel', onCancel);
      setGhost(null);
    };
    btn.addEventListener('pointermove', onMove);
    btn.addEventListener('pointerup', onUp);
    btn.addEventListener('pointercancel', onCancel);
  };

  // ---------- 도구 버튼 · 패널 ----------
  const toggleTool = (key) => {
    const opening = panel !== key;
    setPanel(opening ? key : null);
    // 스티커 패널을 처음 열면 "드래그해주세요" 안내를 잠깐 보여줌
    if (opening && ['cubic', 'sticker'].includes(key) && !hintShownRef.current) {
      hintShownRef.current = true;
      setHint('show');
    }
  };

  useEffect(() => {
    if (hint === 'show') {
      const t = setTimeout(() => setHint('fade'), 2200);
      return () => clearTimeout(t);
    }
    if (hint === 'fade') {
      const t = setTimeout(() => setHint('hidden'), 600);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [hint]);

  // 캔버스에서 각인을 고르면 각인 패널을 열어 바로 고칠 수 있게
  const selected = design?.items.find((it) => it.id === selectedId) || null;
  useEffect(() => {
    if (selected?.kind === 'engrave') setPanel('engrave');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

  const changeColor = (key) => {
    if (design.color === key) return;
    commit({ ...designRef.current, color: key });
  };

  const changeType = (key) => {
    if (key === design.type) return;
    const apply = () => {
      gestureBase.current = null;
      setSelectedId(null);
      setHist({ past: [], future: [] });
      setDesign({ type: key, color: designRef.current.color, items: [] });
    };
    if (hasDecoration(design)) confirm('type', apply);
    else apply();
  };

  const resetAll = () => {
    confirm('reset', () => {
      gestureBase.current = null;
      setSelectedId(null);
      commit({ ...designRef.current, items: [] });
    });
  };

  const complete = () => {
    if (!hasDecoration(design)) return;
    setSelectedId(null);
    gestureBase.current = null;
    setDesign(cleanDesign(designRef.current));
    navigate('/confirm');
  };

  const zoomBy = (delta) =>
    setZoom((z) => Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, Math.round((z + delta) * 10) / 10)));

  if (!design) return null;

  const canComplete = hasDecoration(design);
  const selHalf = selected ? halfOf(selected.id) : null;

  return (
    <div className="cz">
      {/* P03-S01 상단 바 */}
      <header className="cz-top">
        <div className="cz-top-left">
          <button type="button" className="icon-btn" aria-label="뒤로" onClick={() => goBack(`/detail?type=${design.type}`)}>
            <IconBack />
          </button>
          <button type="button" className="icon-btn" aria-label="도움말" onClick={showHelp}>
            <IconHelp size={22} />
          </button>
        </div>
        <div className="cz-top-right">
          <button type="button" className="btn btn-small" onClick={undo} disabled={!hist.past.length}>
            <IconUndo size={18} />
            되돌리기
          </button>
          <button type="button" className="btn btn-small" onClick={redo} disabled={!hist.future.length}>
            <IconRedo size={18} />
            다시 실행
          </button>
          <button type="button" className="btn btn-small" onClick={resetAll} disabled={!design.items.length}>
            <IconReset size={18} />
            전체 초기화
          </button>
          <button type="button" className="btn btn-primary cz-done" onClick={complete} disabled={!canComplete}>
            완료
          </button>
        </div>
      </header>

      {/* P03-S02 편집 영역 */}
      <main className="cz-main">
        {/* 배율 */}
        <div className="cz-zoom-ctrl">
          <button type="button" aria-label="축소" onClick={() => zoomBy(-0.1)} disabled={zoom <= ZOOM_MIN}>
            <IconMinus size={18} />
          </button>
          <span aria-live="polite">{Math.round(zoom * 100)}%</span>
          <button type="button" aria-label="확대" onClick={() => zoomBy(0.1)} disabled={zoom >= ZOOM_MAX}>
            <IconPlus size={18} />
          </button>
          <button type="button" className="cz-zoom-reset" onClick={() => setZoom(1)}>
            리셋
          </button>
        </div>

        {/* 캔버스 */}
        <div className="cz-stage" onPointerDown={onStageDown}>
          <div className="cz-zoom" style={{ transform: `scale(${zoom})` }}>
            <div className="cz-frame">
              <div className="cz-case" ref={caseRef} style={{ width: CASE_PX, height: CASE_PX }}>
                <CaseArt type={design.type} color={design.color} size={CASE_PX} />
                <div
                  className={`cz-safe cz-safe-${safe.shape}`}
                  style={
                    safe.shape === 'rect'
                      ? { inset: safe.inset * CASE_PX, borderRadius: safe.radius * CASE_PX }
                      : {
                          left: (safe.cx - safe.r) * CASE_PX,
                          top: (safe.cy - safe.r) * CASE_PX,
                          width: safe.r * 2 * CASE_PX,
                          height: safe.r * 2 * CASE_PX,
                        }
                  }
                  aria-hidden="true"
                />

                {design.items.map((it) => (
                  <div
                    key={it.id}
                    ref={(el) => {
                      if (el) itemEls.current[it.id] = el;
                      else delete itemEls.current[it.id];
                    }}
                    className="case-item cz-item"
                    style={itemStyle(it, CASE_PX)}
                    onPointerDown={(e) => startGesture(e, it.id, 'move')}
                  >
                    <ItemView item={it} size={CASE_PX} />
                  </div>
                ))}

                {/* 선택 상자 */}
                {selected && selHalf && (
                  <div
                    className="cz-select"
                    style={{
                      left: selected.x * CASE_PX,
                      top: selected.y * CASE_PX,
                      width: selHalf.w * 2 * CASE_PX + 16,
                      height: selHalf.h * 2 * CASE_PX + 16,
                      transform: `translate(-50%, -50%) rotate(${selected.rot || 0}deg)`,
                    }}
                    onPointerDown={(e) => startGesture(e, selected.id, 'move')}
                  >
                    {['tl', 'tr', 'bl', 'br'].map((pos) => (
                      <span
                        key={pos}
                        className={`cz-handle cz-handle-${pos}`}
                        onPointerDown={(e) => startGesture(e, selected.id, 'resize')}
                      />
                    ))}
                    <span className="cz-rotate-line" aria-hidden="true" />
                    <span className="cz-rotate" onPointerDown={(e) => startGesture(e, selected.id, 'rotate')} />
                    <button
                      type="button"
                      className="cz-delete"
                      aria-label="선택한 스티커 삭제"
                      onPointerDown={(e) => e.stopPropagation()}
                      onClick={() => removeItem(selected.id)}
                    >
                      <IconClose size={14} sw={2.6} />
                    </button>
                  </div>
                )}

                {hint !== 'hidden' && (
                  <div className={`cz-hint${hint === 'fade' ? ' is-fade' : ''}`}>
                    <IconHand size={18} />
                    드래그해주세요
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 오른쪽 세로 도구 버튼 5개 */}
        <nav className="cz-tools" aria-label="꾸미기 도구">
          {TOOLS.map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              className={`cz-tool${panel === key ? ' is-on' : ''}`}
              aria-pressed={panel === key}
              onClick={() => toggleTool(key)}
            >
              <Icon size={22} />
              <span>{label}</span>
            </button>
          ))}
          <div className="cz-tools-divider" />
          <button
            type="button"
            className={`cz-tool${panel === 'type' ? ' is-on' : ''}`}
            aria-pressed={panel === 'type'}
            onClick={() => toggleTool('type')}
          >
            <IconCaseType size={22} />
            <span>케이스 종류</span>
          </button>
        </nav>
      </main>

      {/* P03-S03 도구 패널 */}
      {panel && (
        <section className="cz-panel" aria-label={panelTitle(panel)}>
          <div className="cz-panel-head">
            <Sparkle size={18} />
            <h2>{panelTitle(panel)}</h2>
          </div>

          {panel === 'color' && (
            <div className="cz-panel-list" role="radiogroup" aria-label="케이스 색">
              {CASE_COLORS.map((c) => (
                <button
                  key={c.key}
                  type="button"
                  role="radio"
                  aria-checked={design.color === c.key}
                  className={`cz-color${design.color === c.key ? ' is-on' : ''}`}
                  onClick={() => changeColor(c.key)}
                >
                  <span className="cz-color-dot" style={{ background: c.value }} />
                  <span className="cz-cell-name">{c.name}</span>
                </button>
              ))}
            </div>
          )}

          {['cubic', 'sticker'].includes(panel) && (
            <div className="cz-panel-list">
              {STICKERS[panel].map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="cz-sticker-cell"
                  aria-label={`${panelTitle(panel)} ${s.n}`}
                  onPointerDown={(e) => onStickerPointerDown(e, s)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      addSticker(s);
                    }
                  }}
                >
                  <img src={s.src} alt="" draggable={false} />
                </button>
              ))}
            </div>
          )}

          {panel === 'engrave' && (
            <div className="cz-engrave">
              <div className="cz-panel-list">
                {ENGRAVE_STYLES.map((s) => (
                  <button key={s.id} type="button" className="cz-engrave-cell" onClick={() => addEngrave(s)}>
                    <span
                      className="cz-engrave-sample"
                      style={{ fontFamily: s.family, fontWeight: s.weight, letterSpacing: s.spacing, color: s.color }}
                    >
                      각인
                    </span>
                    <span className="cz-cell-name">{s.name}</span>
                  </button>
                ))}
              </div>
              {selected?.kind === 'engrave' && (
                <label className="cz-engrave-input">
                  <span className="cz-engrave-label">각인 문구</span>
                  <span className="cz-engrave-field">
                    <input
                      ref={engraveInputRef}
                      type="text"
                      value={selected.text}
                      maxLength={ENGRAVE_MAX}
                      placeholder="각인 입력"
                      onFocus={beginGesture}
                      onBlur={() => {
                        if ((selected.text || '').trim()) endGesture();
                      }}
                      onChange={(e) => updateItem(selected.id, { text: e.target.value.slice(0, ENGRAVE_MAX) })}
                    />
                    <span className="cz-engrave-count">
                      {selected.text.length}/{ENGRAVE_MAX}
                    </span>
                  </span>
                </label>
              )}
            </div>
          )}

          {panel === 'type' && (
            <div className="cz-panel-list">
              {CASE_TYPES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  className={`cz-type-cell${design.type === t.key ? ' is-on' : ''}`}
                  aria-pressed={design.type === t.key}
                  onClick={() => changeType(t.key)}
                >
                  <img src={t.top} alt="" />
                  <span className="cz-type-name">
                    {t.name} ({fmtSize(t.size)})
                  </span>
                  <span className="cz-type-price">{fmtPrice(t.price)}원</span>
                </button>
              ))}
            </div>
          )}
        </section>
      )}

      {/* 패널에서 끌고 있는 스티커 (반투명) */}
      {ghost && (
        <img
          className="cz-ghost"
          src={ghost.src}
          alt=""
          style={{ left: ghost.x, top: ghost.y, width: ghost.size }}
        />
      )}
    </div>
  );
}

function panelTitle(key) {
  if (key === 'type') return '케이스 종류';
  return TOOLS.find((t) => t.key === key)?.label || '';
}
