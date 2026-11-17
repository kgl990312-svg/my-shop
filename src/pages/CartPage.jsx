// P07 장바구니: 네비게이션 바 → 페이지 제목 → 담은 케이스 목록 → 하단 고정 바 → 푸터
import { useNavigate, useRouter } from '../router';
import { useShop } from '../store/ShopContext';
import { useUI } from '../components/Dialogs';
import CaseView from '../components/CaseView';
import { BottomBar, Footer, NavBar } from '../components/Layout';
import { IconClose, IconEdit } from '../components/Icons';
import { addOnLines, designPrice, fmtPrice } from '../data/catalog';
import { colorOf, decorationSummary, sumPrice, typeName } from '../utils/summary';
import './OrderFlow.css';

export default function CartPage() {
  const navigate = useNavigate();
  const { goBack } = useRouter();
  const { cart, removeFromCart, restoreToCart, setCheckout, setDesign } = useShop();
  const { showPreview, showToast } = useUI();
  const total = sumPrice(cart);

  // 67 수정하기: 이 디자인을 꾸미기 화면에서 고침 → 확인 화면에서 "장바구니 담기"를 누르면 원래 카드 자리에 바꿔 들어감 (editingId)
  // (복사해서 하나 더 만드는 버튼은 주요 방문자(본인용 구매)에게 쓰임새가 적어 넣지 않음 — docs/interaction-list.md)
  const openInCustomize = (it) => {
    setDesign({
      type: it.type,
      color: it.color,
      items: it.items.map((x) => ({ ...x })),
      editingId: it.id,
    });
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
                  <strong className="price cart-price">{fmtPrice(designPrice(it))}원</strong>
                  {addOnLines(it).length > 0 && (
                    <span className="muted cart-meta">
                      {addOnLines(it)
                        .map((l) => `${l.label} +${fmtPrice(l.price)}원`)
                        .join(' · ')}{' '}
                      포함
                    </span>
                  )}
                  <div className="cart-redesign-row">
                    <button type="button" className="btn btn-small cart-redesign" onClick={() => openInCustomize(it)}>
                      <IconEdit size={16} />
                      수정하기
                    </button>
                  </div>
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
