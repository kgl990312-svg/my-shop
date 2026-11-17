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
  IconMore,
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
  ENGRAVE_PRICE,
  EXTRA_DECO_PRICE,
  FREE_DECO,
  STICKERS,
  countDeco,
  countEngrave,
  extraDecoCount,
  extraDecoPrice,
  fmtPrice,
  fmtSize,
  getCaseType,
} from '../data/catalog';
import { isMobile } from '../utils/device';
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
const DEFAULT_W = { cubic: 0.09, sticker: 0.2 }; // 큐빅은 혼자 커 보이지 않게 9%
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
  const { confirm, showHelp, showToast } = useUI();

  const [panel, setPanel] = useState(null);
  const [panelSwitched, setPanelSwitched] = useState(false); // 열린 패널에서 다른 도구로 바꿨는지
  const [moreOpen, setMoreOpen] = useState(false); // 터치 기기 상단 바 더보기 메뉴
  const moreRef = useRef(null);

  // 꾸미기가 5개를 넘는 순간(5 → 6) 추가 요금을 한 번 알려줌
  const decoNow = countDeco(design);
  const decoPrev = useRef(decoNow);
  useEffect(() => {
    if (decoPrev.current <= FREE_DECO && decoNow > FREE_DECO) {
      showToast(`${FREE_DECO + 1}개째부터 1개당 ${EXTRA_DECO_PRICE}원이 추가돼요`);
    }
    decoPrev.current = decoNow;
  }, [decoNow, showToast]);

  // 더보기 메뉴: 바깥을 누르거나 Esc를 누르면 닫힘
  useEffect(() => {
    if (!moreOpen) return undefined;
    const onDown = (e) => {
      if (!moreRef.current?.contains(e.target)) setMoreOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setMoreOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [moreOpen]);
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

  // ---------- 터치 기기: 두 손가락 확대·회전 (32·45·46) ----------
  // 스티커 위에서 시작하면 그 스티커의 크기·회전, 빈 곳에서 시작하면 화면 배율.
  // 마우스에는 반응하지 않음 (pointerType === 'touch'만 처리). 기존 한 손가락 조작은 그대로.
  const touchesRef = useRef(new Map()); // 화면에 닿아 있는 손가락
  const pinchRef = useRef(null); // 진행 중인 두 손가락 조작
  const firstOnItemRef = useRef(false); // 첫 손가락이 스티커 위에서 시작했는지
  const selectedIdRef = useRef(selectedId);
  selectedIdRef.current = selectedId;
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const [pinching, setPinching] = useState(false);
  // 33(모바일): 두 손가락으로 배율을 바꾸는 동안 배율 영역에 is-pinching (CSS에서 전환 효과 끔). 기존 JSX는 고치지 않고 요소에 직접 붙임
  useLayoutEffect(() => {
    caseRef.current?.closest('.cz-zoom')?.classList.toggle('is-pinching', pinching);
  }, [pinching]);

  const pinchGeom = (a, b) => ({
    dist: Math.hypot(b.x - a.x, b.y - a.y) || 1,
    angle: Math.atan2(b.y - a.y, b.x - a.x),
  });

  const pinchHandlers = useRef({});
  pinchHandlers.current = {
    down(e) {
      if (e.pointerType !== 'touch' || !isMobile()) return;
      const touches = touchesRef.current;
      touches.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (touches.size === 1) {
        firstOnItemRef.current = !!e.target.closest?.('.cz-item, .cz-select');
        return;
      }
      // 두 번째 손가락부터는 스티커·빈 곳 동작으로 넘기지 않음
      e.stopPropagation();
      e.preventDefault();
      if (pinchRef.current || touches.size !== 2) return;
      const ids = [...touches.keys()];
      const { dist, angle } = pinchGeom(touches.get(ids[0]), touches.get(ids[1]));
      const selId = selectedIdRef.current;
      const it0 = firstOnItemRef.current && designRef.current?.items.find((i) => i.id === selId);
      if (it0) {
        beginGesture();
        pinchRef.current = { ids, mode: 'item', id: it0.id, it0, dist, angle };
      } else {
        pinchRef.current = { ids, mode: 'zoom', zoom0: zoomRef.current, dist, angle };
        setPinching(true);
      }
    },
    move(e) {
      if (e.pointerType !== 'touch' || !touchesRef.current.has(e.pointerId)) return;
      touchesRef.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const pinch = pinchRef.current;
      if (!pinch) return;
      e.stopPropagation(); // 두 손가락 중에는 한 손가락 이동을 멈춤
      if (pinch.ended) return;
      const a = touchesRef.current.get(pinch.ids[0]);
      const b = touchesRef.current.get(pinch.ids[1]);
      if (!a || !b) return;
      const g = pinchGeom(a, b);
      const k = g.dist / pinch.dist;
      if (pinch.mode === 'zoom') {
        setZoom(Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, pinch.zoom0 * k)));
        return;
      }
      const { it0, id } = pinch;
      const cur = designRef.current.items.find((i) => i.id === id);
      if (!cur) return;
      let rot = (it0.rot || 0) + ((g.angle - pinch.angle) * 180) / Math.PI;
      rot = Math.round(((rot % 360) + 360) % 360);
      let next =
        it0.kind === 'engrave'
          ? { ...cur, fs: Math.min(MAX_FS, Math.max(MIN_FS, it0.fs * k)), rot }
          : { ...cur, w: Math.min(MAX_W, Math.max(MIN_W, it0.w * k)), rot };
      const ratio = it0.kind === 'engrave' ? next.fs / cur.fs : next.w / cur.w;
      const half = halfOf(id);
      next = clampToSafe(safe, next, { w: half.w * ratio, h: half.h * ratio });
      updateItem(id, { x: next.x, y: next.y, w: next.w, fs: next.fs, rot: next.rot });
    },
    up(e) {
      if (e.pointerType !== 'touch') return;
      const touches = touchesRef.current;
      touches.delete(e.pointerId);
      const pinch = pinchRef.current;
      if (pinch && !pinch.ended && pinch.ids.includes(e.pointerId)) {
        pinch.ended = true;
        if (pinch.mode === 'item') {
          const cur = designRef.current.items.find((i) => i.id === pinch.id);
          // 각인은 선택이 풀릴 때 기록 (빈 각인 처리 때문) — 한 손가락 조작과 같은 규칙
          if (!(cur && cur.kind === 'engrave' && !(cur.text || '').trim())) endGesture();
        }
      }
      // 모든 손가락을 뗄 때까지 남은 손가락으로 스티커가 튀지 않게 잠가 둠
      if (touches.size === 0) {
        pinchRef.current = null;
        setPinching(false);
      }
    },
  };

  useEffect(() => {
    const el = caseRef.current?.closest('.cz-stage');
    if (!el) return undefined;
    const down = (e) => pinchHandlers.current.down(e);
    const move = (e) => pinchHandlers.current.move(e);
    const up = (e) => pinchHandlers.current.up(e);
    // capture 단계: 스티커·빈 곳의 기존 동작보다 먼저 받음
    el.addEventListener('pointerdown', down, true);
    el.addEventListener('pointermove', move, true);
    el.addEventListener('pointerup', up, true);
    el.addEventListener('pointercancel', up, true);
    return () => {
      el.removeEventListener('pointerdown', down, true);
      el.removeEventListener('pointermove', move, true);
      el.removeEventListener('pointerup', up, true);
      el.removeEventListener('pointercancel', up, true);
    };
  }, [!!design]); // eslint-disable-line react-hooks/exhaustive-deps

  // 반응형(모바일): 케이스 틀(470px)을 편집 영역에 맞게 비율로 줄임 — 좌표는 그대로(442px 기준)라 스티커 위치는 변하지 않음.
  // 기존 JSX는 그대로 두고 비율만 CSS 변수(--cz-fit)로 넘김. 실제로 줄이는 건 CustomizePage.css 모바일 전용 블록.
  // 패널을 열고 닫거나 화면을 돌려 편집 영역 크기가 바뀌면 다시 맞춤.
  useLayoutEffect(() => {
    if (!isMobile()) return undefined;
    const stage = caseRef.current?.closest('.cz-stage');
    if (!stage) return undefined;
    const fit = () => {
      const cs = getComputedStyle(stage);
      const w = stage.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - 16;
      const h = stage.clientHeight - 24;
      stage.style.setProperty('--cz-fit', String(Math.max(0.3, Math.min(1, w / 470, h / 470))));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [!!design]); // eslint-disable-line react-hooks/exhaustive-deps

  // 캔버스 빈 곳 클릭: 선택 해제 + 패널 닫기
  const onStageDown = (e) => {
    if (e.target.closest('.cz-item, .cz-select')) return;
    deselect();
    setPanel(null);
  };

  // ---------- 패널에서 스티커 끌어서 붙이기 ----------
  // 터치는 끌어다 놓기 없이 탭하면 가운데에 붙임 (손가락으로 끌면 목록이 옆으로 넘어감)
  const onStickerTouchDown = (e, sticker) => {
    const sx = e.clientX;
    const sy = e.clientY;
    const btn = e.currentTarget;
    let moved = false;

    const cleanup = () => {
      btn.removeEventListener('pointermove', onMove);
      btn.removeEventListener('pointerup', onUp);
      btn.removeEventListener('pointercancel', cleanup);
    };
    const onMove = (ev) => {
      if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) moved = true;
    };
    const onUp = () => {
      cleanup();
      if (!moved) addSticker(sticker);
    };
    btn.addEventListener('pointermove', onMove);
    btn.addEventListener('pointerup', onUp);
    btn.addEventListener('pointercancel', cleanup); // 목록을 넘기기 시작하면 붙이지 않음
  };

  const onStickerPointerDown = (e, sticker) => {
    if (e.pointerType === 'touch' && isMobile()) {
      onStickerTouchDown(e, sticker);
      return;
    }
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
    setPanelSwitched(opening && panel !== null); // 터치 기기: 도구를 바꿀 때는 패널을 다시 올리지 않음 (CSS .is-switch)
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

  // 36(모바일): 도구를 바꿔 새 패널이 그려지면, 화면에 보이기 전에 is-switch를 붙임 (CSS에서 올라오는 애니메이션 끔)
  useLayoutEffect(() => {
    document.querySelector('.cz-panel')?.classList.toggle('is-switch', panelSwitched);
  }, [panel, panelSwitched]);

  // 36(모바일): 다른 패널이 열려 있을 때 각인을 골라 각인 패널로 바뀌면 "도구를 바꾼 것"으로 기록
  useEffect(() => {
    if (selected?.kind === 'engrave' && panel !== 'engrave') setPanelSwitched(panel !== null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId]);

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
  const decoCount = countDeco(design);
  const decoExtra = extraDecoCount(design);
  const engraveCount = countEngrave(design);
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
          {/* 더보기: 터치 기기에서만 보임 (30). 데스크탑에서는 CSS로 숨김 */}
          <div className="cz-more" ref={moreRef}>
            <button
              type="button"
              className="icon-btn cz-more-btn"
              aria-label="더보기"
              aria-haspopup="menu"
              aria-expanded={moreOpen}
              onClick={() => setMoreOpen((o) => !o)}
            >
              <IconMore size={22} />
            </button>
            {moreOpen && (
              <div className="cz-more-menu" role="menu">
                <button
                  type="button"
                  role="menuitem"
                  className="cz-more-item"
                  disabled={!design.items.length}
                  onClick={() => {
                    setMoreOpen(false);
                    resetAll();
                  }}
                >
                  <IconReset size={18} />
                  전체 초기화
                </button>
              </div>
            )}
          </div>
          <button type="button" className="btn btn-primary cz-done" onClick={complete} disabled={!canComplete}>
            {/* 67: 장바구니 "수정하기"로 연 디자인이면 "수정완료" (모든 기기, 승인된 예외) */}
            {design.editingId ? '수정완료' : '완료'}
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
                    <span className="cz-hint-touch">눌러서 붙이고, 끌어서 옮겨요</span>
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
        <section key={panel} className="cz-panel" aria-label={panelTitle(panel)}>
          <div className="cz-panel-head">
            <Sparkle size={18} />
            <h2>{panelTitle(panel)}</h2>
            {/* 스티커·큐빅 개수: 5개까지 추가 요금 없음, 6개째부터 1개당 +500원 */}
            {(panel === 'sticker' || panel === 'cubic') && (
              <span className={`cz-deco-count${decoExtra > 0 ? ' is-extra' : ''}`} aria-live="polite">
                {decoExtra > 0
                  ? `스티커·큐빅 ${decoCount}개 · 추가 +${fmtPrice(extraDecoPrice(design))}원`
                  : `스티커·큐빅 ${decoCount}/${FREE_DECO} · 추가 요금 없음`}
              </span>
            )}
            {/* 각인: 1개당 +1,500원 */}
            {panel === 'engrave' && (
              <span className={`cz-deco-count${engraveCount > 0 ? ' is-extra' : ''}`} aria-live="polite">
                {engraveCount > 0
                  ? `각인 ${engraveCount}개 · 추가 +${fmtPrice(engraveCount * ENGRAVE_PRICE)}원`
                  : `각인 1개당 +${fmtPrice(ENGRAVE_PRICE)}원 (최대 ${ENGRAVE_MAX}글자)`}
              </span>
            )}
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
