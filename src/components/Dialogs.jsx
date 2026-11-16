// 안내창 M01~M07 + 화면 아래 알림(토스트)
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { IconAlert, IconClose, Sparkle } from './Icons';
import CaseView from './CaseView';
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
    return () => {
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

function HelpDialog({ onClose, closing }) {
  return (
    <ContentDialog title="사용 방법" onClose={onClose} closing={closing} sparkle>
      <div className="dlg-scroll dlg-help" tabIndex={0}>
        <div className="dlg-help-item">
          <strong>스티커 붙이기</strong>
          <span>[스티커 붙이기 설명]</span>
        </div>
        <div className="dlg-help-item">
          <strong>이동·크기·회전·삭제</strong>
          <span>[이동·크기·회전·삭제 설명]</span>
        </div>
      </div>
    </ContentDialog>
  );
}

function PreviewDialog({ design, onClose, closing }) {
  const ref = useDialogFocus(true, onClose);
  const size = Math.min(680, window.innerHeight - 160, window.innerWidth - 160);
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
  const showToast = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

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
        {toast && <div className="toast">{toast}</div>}
      </div>
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
