// 공통 요소: 로고, 네비게이션 바, 푸터, 하단 고정 바
import { useEffect, useRef, useState } from 'react';
import { useNavigate, withBase } from '../router';
import { hasDecoration, useShop } from '../store/ShopContext';
import { useUI } from './Dialogs';
import { COMPANY, SHIPPING_PERIOD } from '../data/catalog';
import { IconBack, IconBag, IconClose, IconMenu } from './Icons';
import './Layout.css';

export function Logo({ small = false }) {
  return (
    <span className={`logo${small ? ' logo-small' : ''}`}>
      <span className="logo-en">MOA</span>
      <span className="logo-ko">모아</span>
    </span>
  );
}

/**
 * 네비게이션 바
 * - onBack: ← 뒤로 (P02·P04·P05·P07에만)
 * - menu: 메뉴 영역 [{ label, id }] (P01에만) — id 섹션으로 스크롤, id가 없으면 맨 위로
 * - guard: P04·P05처럼 꾸민 내용이 있으면 로고·장바구니를 눌렀을 때 M01을 띄움
 */
// 메뉴 영역 (P01 메인, P06 주문 완료): 홈(맨 위) · CASE(케이스 종류) · REVIEW(직접 꾸민 후기)
// 데스크탑은 왼쪽에 글자 메뉴, 휴대폰은 햄버거 안에
// P06 메뉴는 승인된 예외 (와이어프레임에는 P01에만 있음, docs/interaction-list.md)
export const MAIN_MENU = [
  { label: '홈', id: null },
  { label: 'CASE', id: 'types' },
  { label: 'REVIEW', id: 'reviews' },
];

function scrollToSection(id) {
  const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = id ? document.getElementById(id) : null;
  if (el) el.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto', block: 'start' });
  else window.scrollTo({ top: 0, behavior: smooth ? 'smooth' : 'auto' });
}

function NavMenu({ items }) {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // 바깥을 누르거나 Esc를 누르면 닫힘 (휴대폰 햄버거 메뉴)
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  // 메인에서는 그 섹션으로 스크롤, 다른 페이지(P06)에서는 메인으로 가서 그 섹션에서 시작
  const go = (id) => (e) => {
    e.preventDefault();
    setOpen(false);
    if (document.getElementById('types')) scrollToSection(id);
    else navigate(id ? `/#${id}` : '/');
  };

  const links = items.map((it) => (
    <a key={it.label} href={it.id ? `#${it.id}` : '#'} className="nav-menu-link" onClick={go(it.id)}>
      {it.label}
    </a>
  ));

  return (
    <div className="nav-menu-wrap" ref={wrapRef}>
      {/* 데스크탑: 글자 메뉴 */}
      <nav className="nav-menu" aria-label="메인 메뉴">
        {links}
      </nav>
      {/* 휴대폰: 햄버거 버튼 → 아래로 열리는 메뉴 */}
      <button
        type="button"
        className="icon-btn nav-burger"
        aria-label={open ? '메뉴 닫기' : '메뉴 열기'}
        aria-expanded={open}
        aria-controls="nav-drawer"
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <IconClose /> : <IconMenu />}
      </button>
      {open && (
        <nav id="nav-drawer" className="nav-drawer" aria-label="메인 메뉴">
          {links}
        </nav>
      )}
    </div>
  );
}

export function NavBar({ onBack, guard = false, menu }) {
  const navigate = useNavigate();
  const { design, clearDesign, cart } = useShop();
  const { confirm } = useUI();
  const count = cart.length;

  const go = (to) => (e) => {
    e.preventDefault();
    if (guard && hasDecoration(design)) {
      confirm('exit', () => {
        clearDesign();
        navigate(to);
      });
      return;
    }
    navigate(to);
  };

  return (
    <header className="nav">
      <div className="nav-inner">
        <div className="nav-left">
          {menu && <NavMenu items={menu} />}
          {onBack && (
            <button type="button" className="icon-btn" aria-label="뒤로" onClick={onBack}>
              <IconBack />
            </button>
          )}
        </div>
        <a href={withBase('/')} className="nav-logo" aria-label="모아 메인으로" onClick={go('/')}>
          <Logo />
        </a>
        <a
          href={withBase('/cart')}
          className="icon-btn nav-cart"
          aria-label={count ? `장바구니, ${count}개 담김` : '장바구니'}
          onClick={go('/cart')}
        >
          <IconBag />
          {count > 0 && <span className="nav-badge">{count}</span>}
        </a>
      </div>
    </header>
  );
}

export function Footer() {
  const { showContent } = useUI();
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-company">
          <Logo small />
          <span>
            회사명 {COMPANY.name} · 대표자 {COMPANY.ceo}
            <br />
            사업자등록번호 {COMPANY.bizNo}
            <br />
            주소 {COMPANY.address}
          </span>
        </div>
        <div className="footer-cs">
          <span className="footer-cs-title">고객센터</span>
          <span className="footer-cs-phone">{COMPANY.phone}</span>
          <span>운영 시간 {COMPANY.hours}</span>
        </div>
        <nav aria-label="약관" className="footer-links">
          <button type="button" onClick={() => showContent('terms')}>
            이용약관
          </button>
          <button type="button" className="is-strong" onClick={() => showContent('privacy')}>
            개인정보처리방침
          </button>
        </nav>
      </div>
    </footer>
  );
}

export function BottomBar({ children }) {
  return (
    <div className="bottom-bar">
      <div className="bottom-bar-inner">{children}</div>
    </div>
  );
}

// 제작·배송 기간 (P02 배송·교환 안내, P04 제작·배송 기간, P06 배송·문의 안내)
// "(주말 및 공휴일 제외)"는 다음 줄로, "5~7일 이내"는 좁은 화면에서도 중간에서 끊기지 않게
export function ShippingPeriod() {
  const { before, range, after, note } = SHIPPING_PERIOD;
  return (
    <>
      {before} <span style={{ whiteSpace: 'nowrap' }}>{range}</span> {after}
      <br />
      {note}
    </>
  );
}
