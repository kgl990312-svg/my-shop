// 공통 요소: 로고, 네비게이션 바, 푸터, 하단 고정 바
import { useNavigate, withBase } from '../router';
import { hasDecoration, useShop } from '../store/ShopContext';
import { useUI } from './Dialogs';
import { IconBack, IconBag } from './Icons';
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
 * - guard: P04·P05처럼 꾸민 내용이 있으면 로고·장바구니를 눌렀을 때 M01을 띄움
 */
export function NavBar({ onBack, guard = false }) {
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
            회사명 [회사명] · 대표자 [대표자]
            <br />
            사업자등록번호 [사업자등록번호]
            <br />
            주소 [주소]
          </span>
        </div>
        <div className="footer-cs">
          <span className="footer-cs-title">고객센터</span>
          <span className="footer-cs-phone">[전화번호]</span>
          <span>운영 시간 [운영 시간]</span>
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
