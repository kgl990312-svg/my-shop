// P04 확인: 네비게이션 바 → 페이지 제목 → 상품 카드 → 주문 제작 상품 안내 → 제작·배송 기간 → 하단 고정 바 → 푸터
import { Fragment, useEffect } from 'react';
import { useLayoutEffect } from 'react';
import { useNavigate, useRouter } from '../router';
import { useShop } from '../store/ShopContext';
import { useUI } from '../components/Dialogs';
import CaseView from '../components/CaseView';
import { BottomBar, Footer, NavBar, ShippingPeriod } from '../components/Layout';
import { IconExpand, IconInfo } from '../components/Icons';
import { SHIPPING_INFO, addOnLines, designPrice, fmtPrice, getCaseType } from '../data/catalog';
import { colorOf, decorationSummary, typeName } from '../utils/summary';
import { isMobile } from '../utils/device';
import './OrderFlow.css';

export default function ConfirmPage() {
  const navigate = useNavigate();
  const { goBack } = useRouter();
  const { design, cart, addToCart, replaceInCart, setCheckout } = useShop();
  const { showPreview } = useUI();

  useEffect(() => {
    if (!design) navigate('/', { replace: true });
  }, [design, navigate]);

  // 반응형(휴대폰): 꾸민 케이스 이미지(340px 고정)를 이미지 칸 폭에 맞춰 줄임 — 데스크탑 비율(이미지 칸 440px에 340px)을 그대로 유지.
  // 기존 JSX는 그대로 두고 비율만 CSS 변수(--cv-scale)로 넘김. 실제로 줄이는 건 OrderFlow.css 휴대폰 전용 블록.
  useLayoutEffect(() => {
    if (!isMobile()) return undefined;
    const box = document.querySelector('.confirm-media');
    if (!box) return undefined;
    const fit = () => box.style.setProperty('--cv-scale', String(Math.min(1, box.clientWidth / 440)));
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(box);
    return () => ro.disconnect();
  }, [design]);

  if (!design) return null;

  const type = getCaseType(design.type);
  const color = colorOf(design);

  // 67 수정하기로 연 디자인이면 "장바구니 담기"를 눌렀을 때 원래 카드 자리에 바꿔 넣음 (그 카드가 지워졌으면 새로 담음) — 버튼 이름은 그대로
  const editingInCart = !!design?.editingId && cart.some((it) => it.id === design.editingId);

  const putInCart = () => {
    if (editingInCart) replaceInCart(design.editingId, design);
    else addToCart(design);
    navigate('/cart');
  };

  const buyNow = () => {
    setCheckout({ from: 'direct' });
    navigate('/order');
  };

  return (
    <div className="page">
      <NavBar onBack={() => goBack('/customize')} guard />

      {/* P04-S02 페이지 제목 */}
      <section className="flow-head">
        <div className="container">
          <h1 className="page-title">확인</h1>
        </div>
      </section>

      {/* P04-S03 상품 카드 */}
      <section className="flow-section">
        <div className="container confirm-card">
          <div className="confirm-media-col">
            <button
              type="button"
              className="confirm-media"
              aria-label="꾸민 케이스 크게 보기"
              onClick={() => showPreview(design)}
            >
              <CaseView design={design} size={340} />
              <span className="confirm-expand" aria-hidden="true">
                <IconExpand size={18} />
              </span>
            </button>
            <p className="flow-caption">이미지를 누르면 꾸민 상품을 볼 수 있어요</p>
          </div>
          <div className="confirm-info">
            <h2 className="confirm-name">{typeName(design)}</h2>
            <dl className="confirm-dl">
              <dt>케이스 색</dt>
              <dd className="confirm-color">
                <span className="color-dot" style={{ background: color.value }} aria-hidden="true" />
                {color.name}
              </dd>
              <dt>스티커·큐빅·각인</dt>
              <dd>{decorationSummary(design)}</dd>
            </dl>
            <div className="divider" />
            {/* 추가 요금(스티커·큐빅 6개째부터 +500원, 각인 +1,500원)이 있을 때만 기본 가격과 나눠 보여줌 */}
            {addOnLines(design).length > 0 && (
              <dl className="confirm-dl confirm-extra">
                <dt>기본 가격</dt>
                <dd>{fmtPrice(type.price)}원</dd>
                {addOnLines(design).map((l) => (
                  <Fragment key={l.label}>
                    <dt>{l.label}</dt>
                    <dd>+{fmtPrice(l.price)}원</dd>
                  </Fragment>
                ))}
              </dl>
            )}
            <div className="confirm-price-row">
              <span>가격</span>
              <span className="confirm-price">{fmtPrice(designPrice(design))}원</span>
            </div>
          </div>
        </div>
      </section>

      {/* P04-S04 주문 제작 상품 안내 */}
      <section className="flow-section flow-section-tight">
        <div className="container notice-box">
          <IconInfo size={22} />
          <div className="notice-body">
            <strong>주문 제작 상품 안내</strong>
            <span>꾸민 디자인은 케이스에 인쇄되고, 큐빅은 실제로 붙여 드려요.</span>
            <span>{SHIPPING_INFO.refund}</span>
          </div>
        </div>
      </section>

      {/* P04-S05 제작·배송 기간 안내 */}
      <section className="flow-section flow-section-last">
        <div className="container box period-box">
          <strong className="period-title">제작·배송 기간</strong>
          {/* 받은 문구가 제작과 배송을 합친 한 문장이라 한 줄로 보여줌 */}
          <span className="label">제작·배송</span>
          <span className="period-value"><ShippingPeriod /></span>
          <span className="label">배송비</span>
          <span className="period-value">{SHIPPING_INFO.fee}</span>
        </div>
      </section>

      {/* P04-S06 하단 고정 바 */}
      <BottomBar>
        <div className="bottom-total">
          <span className="bottom-total-label">총 금액</span>
          <span className="bottom-total-value">{fmtPrice(designPrice(design))}원</span>
        </div>
        <div className="bottom-actions">
          <button type="button" className="btn btn-outline btn-lg confirm-cart-btn" onClick={putInCart}>
            장바구니 담기
          </button>
          <button type="button" className="btn btn-primary btn-lg confirm-buy-btn" onClick={buyNow}>
            바로 구매하기
          </button>
        </div>
      </BottomBar>

      <Footer />
    </div>
  );
}
