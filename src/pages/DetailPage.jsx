// P02 상품 상세: 네비게이션 바 → 상품 요약 → 제작 안내(5단계) → 탭 → 상품정보 → 사이즈 → 배송·교환 안내 → 하단 고정 바 → 푸터
import { useEffect, useRef, useState } from 'react';
import { useNavigate, useQuery, useRouter } from '../router';
import { newDesign, useShop } from '../store/ShopContext';
import { BottomBar, Footer, NavBar, ShippingPeriod } from '../components/Layout';
import { IconChevronRight, Sparkle } from '../components/Icons';
import {
  COMPAT_HINT,
  COMPAT_NOTE,
  COMPAT_TAG,
  DECO_NOTE,
  DECO_NOTE_EXTRA,
  SHIPPING_INFO,
  STEPS,
  fmtPrice,
  fmtSize,
  getCaseType,
  MATERIAL,
  PRODUCT_DESC,
} from '../data/catalog';
import './DetailPage.css';

const TABS = [
  { id: 'info', label: '상품정보' },
  { id: 'size', label: '사이즈' },
  { id: 'shipping', label: '배송·교환 안내' },
];

export default function DetailPage() {
  const query = useQuery();
  const navigate = useNavigate();
  const { goBack } = useRouter();
  const { setDesign } = useShop();
  const type = getCaseType(query.get('type'));
  const [active, setActive] = useState('info');
  const tabsRef = useRef(null);

  // 스크롤할 때 지금 보고 있는 내용의 탭을 자동으로 선택
  useEffect(() => {
    const onScroll = () => {
      const offset = (tabsRef.current?.offsetHeight || 0) + 24;
      let current = TABS[0].id;
      TABS.forEach((t) => {
        const el = document.getElementById(t.id);
        if (el && el.getBoundingClientRect().top - offset <= 0) current = t.id;
      });
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToTab = (id) => (e) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (!el) return;
    const offset = tabsRef.current?.offsetHeight || 0;
    const top = el.getBoundingClientRect().top + window.scrollY - offset;
    const smooth = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    window.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
  };

  const startCustomize = () => {
    setDesign(newDesign(type.key));
    navigate('/customize');
  };

  return (
    <div className="page">
      <NavBar onBack={() => goBack('/')} />

      {/* P02-S02 상품 요약 */}
      <section className="detail-summary-wrap">
        <div className="container detail-summary">
          <div className="detail-mockup">
            <img src={type.mockup} alt={`${type.name} 쿠션 케이스 목업`} />
          </div>
          <div className="detail-summary-info">
            <h1 className="page-title">{type.name}</h1>
            <div className="detail-tags">
              <span className="tag tag-lg">크기 {fmtSize(type.size, true)}</span>
              {/* 모든 종류 공통 호환 규격 — 자세한 설명은 아래 "사이즈 > 호환 규격 안내" */}
              <span className="tag tag-lg">{COMPAT_TAG}</span>
            </div>
            <span className="detail-price">{fmtPrice(type.price)}원</span>
            {/* 꾸미기 추가 요금 안내: 핵심 문장 + 추가 요금은 보조 글자로 */}
            <p className="detail-deco-note">
              {DECO_NOTE} <span className="detail-deco-extra">({DECO_NOTE_EXTRA})</span>
            </p>
            <div className="divider" />
            <dl className="detail-dl">
              <dt>소재</dt>
              <dd>{MATERIAL}</dd>
            </dl>
            <p className="detail-note">
              <Sparkle size={18} />
              꾸민 디자인은 케이스에 인쇄되고, 큐빅은 실제로 붙여 드려요
            </p>
          </div>
        </div>
      </section>

      {/* P02-S03 제작 안내 */}
      <section className="detail-steps-wrap">
        <div className="container detail-steps">
          <h2 className="detail-h2">제작 안내</h2>
          <ol className="detail-steps-list">
            {STEPS.map((s) => (
              <li key={s.n}>
                <img src={s.icon} alt="" className="detail-step-icon" />
                <span className="detail-step-n">STEP {s.n}</span>
                <span className="detail-step-label">{s.label}</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* P02-S04 탭 */}
      <nav className="detail-tabs" aria-label="상품 상세 탭" ref={tabsRef}>
        <div className="container detail-tabs-inner">
          {TABS.map((t) => (
            <a
              key={t.id}
              href={`#${t.id}`}
              className={`detail-tab${active === t.id ? ' is-active' : ''}`}
              aria-current={active === t.id ? 'true' : undefined}
              onClick={scrollToTab(t.id)}
            >
              {t.label}
            </a>
          ))}
        </div>
      </nav>

      {/* P02-S05 상품정보 */}
      <section id="info" className="detail-section detail-info">
        <div className="container detail-section-inner">
          <h2 className="detail-h2">상품정보</h2>
          <div className="detail-image">
            <img src={type.detail} alt={`${type.name} 쿠션 케이스를 열고 닫은 모습`} />
          </div>
          <p className="detail-desc">{PRODUCT_DESC}</p>
          <p className="detail-desc detail-desc-type">{type.desc}</p>
        </div>
      </section>

      {/* P02-S06 사이즈 */}
      <section id="size" className="detail-section">
        <div className="container detail-section-inner">
          <h2 className="detail-h2">사이즈</h2>
          <div className="box info-grid detail-box">
            <span className="label">크기</span>
            <span>{fmtSize(type.size, true)}</span>
            <span className="label">호환 규격 안내</span>
            <span>
              {COMPAT_NOTE} <span className="detail-compat-hint">{COMPAT_HINT}</span>
            </span>
          </div>
        </div>
      </section>

      {/* P02-S07 배송·교환 안내 */}
      <section id="shipping" className="detail-section detail-last">
        <div className="container detail-section-inner">
          <h2 className="detail-h2">배송·교환 안내</h2>
          <div className="box info-grid detail-box">
            <span className="label">제작 및 배송 안내</span>
            <span><ShippingPeriod /></span>
            <span className="label">배송비</span>
            <span>{SHIPPING_INFO.fee}</span>
            <span className="label">교환 및 환불 안내</span>
            <span>{SHIPPING_INFO.refund}</span>
            <span className="label">유의사항</span>
            <span>{SHIPPING_INFO.caution}</span>
          </div>
        </div>
      </section>

      {/* P02-S08 하단 고정 바 */}
      <BottomBar>
        <div className="detail-bar-info">
          <span className="detail-bar-name">{type.name}</span>
          <span className="detail-bar-price">{fmtPrice(type.price)}원</span>
        </div>
        <button type="button" className="btn btn-primary btn-lg detail-start" onClick={startCustomize}>
          꾸미기 시작
          <IconChevronRight size={18} sw={2.2} />
        </button>
      </BottomBar>

      <Footer />
    </div>
  );
}
