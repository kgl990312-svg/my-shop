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

function ConfirmDialog({ kind, onCancel, onOk }) {
  const ref = useDialogFocus(true, onCancel);
  const c = CONFIRM[kind];
  return (
    <div className="dlg-overlay" onMouseDown={(e) => e.target === e.currentTarget && onCancel()}>
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

function ContentDialog({ title, children, onClose, sparkle }) {
  const ref = useDialogFocus(true, onClose);
  return (
    <div className="dlg-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
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

function HelpDialog({ onClose }) {
  return (
    <ContentDialog title="사용 방법" onClose={onClose} sparkle>
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

function PreviewDialog({ design, onClose }) {
  const ref = useDialogFocus(true, onClose);
  const size = Math.min(680, window.innerHeight - 160, window.innerWidth - 160);
  return (
    <div
      className="dlg-overlay dlg-overlay-dark"
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

  const close = useCallback(() => setDialog(null), []);

  const confirm = useCallback((kind, onOk) => setDialog({ type: 'confirm', kind, onOk }), []);
  const showContent = useCallback((kind) => setDialog({ type: 'content', kind }), []);
  const showHelp = useCallback(() => setDialog({ type: 'help' }), []);
  const showPreview = useCallback((design) => setDialog({ type: 'preview', design }), []);
  const showToast = useCallback((message) => {
    clearTimeout(toastTimer.current);
    setToast(message);
    toastTimer.current = setTimeout(() => setToast(null), 2200);
  }, []);

  const value = useMemo(
    () => ({ confirm, showContent, showHelp, showPreview, showToast, closeDialog: close, dialogOpen: !!dialog }),
    [confirm, showContent, showHelp, showPreview, showToast, close, dialog]
  );

  return (
    <UIContext.Provider value={value}>
      {children}
      {dialog?.type === 'confirm' && (
        <ConfirmDialog
          kind={dialog.kind}
          onCancel={close}
          onOk={() => {
            close();
            dialog.onOk?.();
          }}
        />
      )}
      {dialog?.type === 'content' && (
        <ContentDialog title={CONTENT[dialog.kind].title} onClose={close}>
          <div className="dlg-scroll dlg-text" tabIndex={0}>
            {CONTENT[dialog.kind].body}
          </div>
        </ContentDialog>
      )}
      {dialog?.type === 'help' && <HelpDialog onClose={close} />}
      {dialog?.type === 'preview' && <PreviewDialog design={dialog.design} onClose={close} />}
      <div className="toast-wrap" aria-live="polite">
        {toast && <div className="toast">{toast}</div>}
      </div>
    </UIContext.Provider>
  );
}

export const useUI = () => useContext(UIContext);
