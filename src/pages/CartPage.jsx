// P07 장바구니: 네비게이션 바 → 페이지 제목 → 담은 케이스 목록 → 하단 고정 바 → 푸터
import { useNavigate, useRouter } from '../router';
import { useShop } from '../store/ShopContext';
import { useUI } from '../components/Dialogs';
import CaseView from '../components/CaseView';
import { BottomBar, Footer, NavBar } from '../components/Layout';
import { IconClose, IconPalette } from '../components/Icons';
import { fmtPrice, getCaseType } from '../data/catalog';
import { colorOf, decorationSummary, sumPrice, typeName } from '../utils/summary';
import './OrderFlow.css';

export default function CartPage() {
  const navigate = useNavigate();
  const { goBack } = useRouter();
  const { cart, removeFromCart, restoreToCart, setCheckout, setDesign } = useShop();
  const { showPreview, showToast } = useUI();
  const total = sumPrice(cart);

  // 다시 꾸미기: 담은 디자인을 복사해 꾸미기 화면으로 (원래 담은 디자인은 장바구니에 그대로 남음)
  // 각인 이름만 바꿔 커플·선물용으로 하나 더 만들거나, 그대로 완료해 같은 디자인을 하나 더 담을 수 있음
  const redesign = (it) => {
    setDesign({ type: it.type, color: it.color, items: it.items.map((x) => ({ ...x })) });
    navigate('/customize');
  };

  // 63: 삭제는 바로 하고, 4초 동안 "되돌리기"로 원래 자리에 되돌릴 수 있게 (실수 방지)
  const remove = (it) => {
    const index = cart.findIndex((x) => x.id === it.id);
    removeFromCart(it.id);
    showToast('장바구니에서 뺐어요', {
      action: { label: '되돌리기', onClick: () => restoreToCart(it, index) },
      duration: 4000,
    });
  };

  const order = () => {
    if (!cart.length) return;
    setCheckout({ from: 'cart' });
    navigate('/order');
  };

  return (
    <div className="page">
      <NavBar onBack={() => goBack('/')} />

      <div className="cart-wrap">
        {/* P07-S02 페이지 제목 */}
        <h1 className="page-title">장바구니</h1>

        {/* P07-S03 담은 케이스 목록 */}
        {cart.length > 0 ? (
          <ul className="cart-list">
            {cart.map((it) => (
              <li key={it.id} className="cart-item">
                <button
                  type="button"
                  className="cart-media"
                  aria-label="꾸민 케이스 크게 보기"
                  onClick={() => showPreview(it)}
                >
                  <CaseView design={it} size={136} />
                </button>
                <div className="cart-info">
                  <strong className="cart-name">{typeName(it)}</strong>
                  <span className="muted cart-meta">케이스 색 {colorOf(it).name}</span>
                  <span className="muted cart-meta">{decorationSummary(it)}</span>
                  <strong className="price cart-price">{fmtPrice(getCaseType(it.type).price)}원</strong>
                  <button type="button" className="btn btn-small cart-redesign" onClick={() => redesign(it)}>
                    <IconPalette size={16} />
                    다시 꾸미기
                  </button>
                </div>
                <button
                  type="button"
                  className="icon-btn cart-remove"
                  aria-label="장바구니에서 삭제"
                  onClick={() => remove(it)}
                >
                  <IconClose size={20} />
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="cart-empty">
            장바구니가 비었어요
            {/* 64: 다음 할 일 — 메인의 케이스 종류 영역으로 바로 이동 */}
            <button type="button" className="btn btn-primary cart-empty-go" onClick={() => navigate('/#types')}>
              케이스 꾸미러 가기
            </button>
          </div>
        )}
      </div>

      {/* P07-S04 하단 고정 바 */}
      <BottomBar>
        <div className="bottom-total">
          <span className="bottom-total-label">총 금액</span>
          <span className="bottom-total-value">
            {cart.length === 0 ? '0' : total == null ? '[합계]' : fmtPrice(total)}원
          </span>
        </div>
        <button type="button" className="btn btn-primary btn-lg cart-order" onClick={order} disabled={!cart.length}>
          주문하기
        </button>
      </BottomBar>

      <Footer />
    </div>
  );
}
