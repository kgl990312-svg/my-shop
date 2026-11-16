// 안내창 M01~M07 + 화면 아래 알림(토스트)
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useLayoutEffect } from 'react';
import { IconAlert, IconClose, Sparkle } from './Icons';
import CaseView from './CaseView';
import { isMobile } from '../utils/device';
import './Dialogs.css';

const UIContext = createContext(null);

// 확인 안내창 문구 (M01, M02, M05)
const CONFIRM = {
  exit: { title: '꾸민 내용이 사라져요', ok: '나가기' },
  reset: { title: '꾸민 내용을 모두 지울까요?', ok: '지우기' },
  type: { title: '종류를 바꾸면 꾸민 내용이 사라져요', ok: '바꾸기' },
};

// 내용 안내창 (M03, M04)
const CONTENT = {
  terms: { title: '이용약관', body: '[이용약관 내용]' },
  privacy: { title: '개인정보처리방침', body: '[개인정보처리방침 내용]' },
};

// 안내창이 사라지는 시간 (Dialogs.css의 dlg-fade-out·dlg-pop-out과 맞춤)
const DIALOG_OUT_MS = 180;

const overlayClass = (base, closing) => (closing ? `${base} is-closing` : base);

function useDialogFocus(open, onClose) {
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const prev = document.activeElement;
    const el = ref.current;
    const first = el?.querySelector('button, a, [tabindex="0"]');
    first?.focus();
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab' && el) {
        const items = [...el.querySelectorAll('button, a, [tabindex="0"]')];
        if (!items.length) return;
        const firstEl = items[0];
        const lastEl = items[items.length - 1];
        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    // 터치 기기(특히 아이폰 Safari)는 body overflow: hidden을 무시하고 뒤 화면을 스크롤함.
    // 안내창이 열려 있는 동안 손가락 밀기를 막되, 안내창 안의 스크롤 영역(.dlg-scroll)은 그대로 스크롤되게 함.
    // 화면 배치를 바꾸지 않아서 닫은 뒤 위치가 튀지 않음. 두 손가락 확대(접근성)는 막지 않음.
    const touch = isMobile();
    const onTouchMove = (e) => {
      if (e.touches && e.touches.length > 1) return;
      const sc = e.target.closest?.('.dlg-scroll');
      if (sc && sc.scrollHeight > sc.clientHeight) return;
      e.preventDefault();
    };
    if (touch) document.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      if (touch) document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open, onClose]);
  return ref;
}

function ConfirmDialog({ kind, onCancel, onOk, closing }) {
  const ref = useDialogFocus(true, onCancel);
  const c = CONFIRM[kind];
  return (
    <div className={overlayClass('dlg-overlay', closing)} onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
      <div ref={ref} className="dlg dlg-confirm" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
        <div className="dlg-confirm-body">
          <span className="dlg-confirm-icon" aria-hidden="true">
            <IconAlert size={26} />
          </span>
          <h2 id="dlg-title" className="dlg-confirm-title">
            {c.title}
          </h2>
        </div>
        <div className="dlg-actions">
          <button type="button" className="btn btn-soft dlg-btn" onClick={onCancel}>
            취소
          </button>
          <button type="button" className="btn btn-primary dlg-btn dlg-btn-ok" onClick={onOk}>
            {c.ok}
          </button>
        </div>
      </div>
    </div>
  );
}

function ContentDialog({ title, children, onClose, sparkle, closing }) {
  const ref = useDialogFocus(true, onClose);
  return (
    <div className={overlayClass('dlg-overlay', closing)} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className="dlg dlg-content" role="dialog" aria-modal="true" aria-labelledby="dlg-title">
        <div className="dlg-content-head">
          {sparkle && <Sparkle size={20} />}
          <h2 id="dlg-title" className="dlg-content-title">
            {title}
          </h2>
        </div>
        {children}
        <button type="button" className="btn btn-dark dlg-btn" onClick={onClose}>
          닫기
        </button>
      </div>
    </div>
  );
}

// 28: 도움말 문구 — 마우스(데스크탑)와 손가락(휴대폰·태블릿)의 조작이 달라서 기기에 맞는 문구를 보여줌
const HELP_TEXT = {
  mouse: {
    add: '아래 목록에서 스티커를 눌러 가운데에 붙이거나, 원하는 자리로 끌어다 놓아요',
    edit: '스티커를 끌어서 옮기고, 모서리 점으로 크기를, 아래 동그라미로 방향을 바꿔요. 지우려면 X를 눌러요',
  },
  touch: {
    add: '아래 목록에서 스티커를 누르면 가운데에 붙어요. 목록은 옆으로 밀어서 더 볼 수 있어요',
    edit: '스티커를 끌어서 옮기고, 두 손가락으로 벌리면 크기, 돌리면 방향이 바뀌어요. 지우려면 X를 눌러요',
  },
};

function HelpDialog({ onClose, closing }) {
  const text = isMobile() ? HELP_TEXT.touch : HELP_TEXT.mouse;
  return (
    <ContentDialog title="사용 방법" onClose={onClose} closing={closing} sparkle>
      <div className="dlg-scroll dlg-help" tabIndex={0}>
        <div className="dlg-help-item">
          <strong>스티커 붙이기</strong>
          <span>{text.add}</span>
        </div>
        <div className="dlg-help-item">
          <strong>이동·크기·회전·삭제</strong>
          <span>{text.edit}</span>
        </div>
      </div>
    </ContentDialog>
  );
}

// 52: 터치 기기 미리보기 크기 (데스크탑은 "폭 − 160" 그대로)
// 휴대폰에서 "폭 − 160"이면 375px 폭에서 215px밖에 안 돼서, 화면 여백(.dlg-overlay padding 24px)까지 쓰게 함.
// 세로 화면: 미리보기를 가운데 두므로 오른쪽 위 닫기 버튼(top 32 + 높이 52 + 간격 12 = 96px)과 겹치지 않게 위아래 96px씩 남김.
// 가로 화면: 닫기 버튼이 미리보기 옆에 있어 겹치지 않으므로 높이 여백(24px)만 남김.
function touchPreviewSize() {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const maxH = h > w ? h - 96 * 2 : h - 24 * 2;
  return Math.max(160, Math.min(680, w - 24 * 2, maxH));
}

function PreviewDialog({ design, onClose, closing }) {
  const ref = useDialogFocus(true, onClose);
  const size = Math.min(680, window.innerHeight - 160, window.innerWidth - 160);
  // 52(모바일): 기존 크기 계산은 그대로 두고, 모바일에서만 그린 뒤(화면에 보이기 전) 틀을 키우고 케이스를 같은 비율로 확대
  useLayoutEffect(() => {
    if (!isMobile()) return;
    const frame = ref.current?.querySelector('.dlg-preview-frame');
    const view = frame?.querySelector('.case-view');
    if (!frame || !view) return;
    const next = touchPreviewSize();
    frame.style.width = `${next}px`;
    frame.style.height = `${next}px`;
    view.style.transform = `scale(${next / size})`;
  }, [size]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div
      className={overlayClass('dlg-overlay dlg-overlay-dark', closing)}
      role="dialog"
      aria-modal="true"
      aria-label="꾸민 케이스 미리보기"
      ref={ref}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <button type="button" className="dlg-preview-close" aria-label="닫기" onClick={onClose}>
        <IconClose size={24} sw={2.2} />
      </button>
      <div className="dlg-preview-frame" style={{ width: size, height: size }}>
        <CaseView design={design} size={size * 0.86} />
      </div>
    </div>
  );
}

export function UIProvider({ children }) {
  const [dialog, setDialog] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  // 닫힐 때 사라지는 움직임이 끝난 뒤에 안내창을 없앰
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef(null);

  const open = useCallback((next) => {
    clearTimeout(closeTimer.current);
    setClosing(false);
    setDialog(next);
  }, []);

  const close = useCallback(() => {
    clearTimeout(closeTimer.current);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      setDialog(null);
      return;
    }
    setClosing(true);
    closeTimer.current = setTimeout(() => {
      setDialog(null);
      setClosing(false);
    }, DIALOG_OUT_MS);
  }, []);

  useEffect(() => () => clearTimeout(closeTimer.current), []);

  const confirm = useCallback((kind, onOk) => open({ type: 'confirm', kind, onOk }), [open]);
  const showContent = useCallback((kind) => open({ type: 'content', kind }), [open]);
  const showHelp = useCallback(() => open({ type: 'help' }), [open]);
  const showPreview = useCallback((design) => open({ type: 'preview', design }), [open]);
  // 알림: showToast('문구') 또는 showToast('문구', { action: { label, onClick }, duration })
  // action이 있으면 알림 안에 버튼을 보여줌 (예: 장바구니 삭제 → 되돌리기)
  const showToast = useCallback((message, opts = {}) => {
    clearTimeout(toastTimer.current);
    setToast({ message, action: opts.action });
    toastTimer.current = setTimeout(() => setToast(null), opts.duration ?? 2200);
  }, []);
  const hideToast = useCallback(() => {
    clearTimeout(toastTimer.current);
    setToast(null);
  }, []);
  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const value = useMemo(
    () => ({ confirm, showContent, showHelp, showPreview, showToast, closeDialog: close, dialogOpen: !!dialog && !closing }),
    [confirm, showContent, showHelp, showPreview, showToast, close, dialog, closing]
  );

  return (
    <UIContext.Provider value={value}>
      {children}
      {dialog?.type === 'confirm' && (
        <ConfirmDialog
          kind={dialog.kind}
          closing={closing}
          onCancel={close}
          onOk={() => {
            close();
            dialog.onOk?.();
          }}
        />
      )}
      {dialog?.type === 'content' && (
        <ContentDialog title={CONTENT[dialog.kind].title} onClose={close} closing={closing}>
          <div className="dlg-scroll dlg-text" tabIndex={0}>
            {CONTENT[dialog.kind].body}
          </div>
        </ContentDialog>
      )}
      {dialog?.type === 'help' && <HelpDialog onClose={close} closing={closing} />}
      {dialog?.type === 'preview' && <PreviewDialog design={dialog.design} onClose={close} closing={closing} />}
      <div className="toast-wrap" aria-live="polite">
        {toast && (
          <div className={`toast${toast.action ? ' has-action' : ''}`}>
            {toast.message}
            {toast.action && (
              <button
                type="button"
                className="toast-action"
                onClick={() => {
                  hideToast();
                  toast.action.onClick();
                }}
              >
                {toast.action.label}
              </button>
            )}
          </div>
        )}
      </div>
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
