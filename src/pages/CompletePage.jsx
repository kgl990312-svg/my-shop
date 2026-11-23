// P06 주문 완료: 네비게이션 바(뒤로 없음) → 완료 영역 → 주문 요약 → 배송·문의 안내 → 푸터
import { useEffect } from 'react';
import { useBlocker, useNavigate } from '../router';
import { useShop } from '../store/ShopContext';
import { useUI } from '../components/Dialogs';
import CaseView from '../components/CaseView';
import { Footer, MAIN_MENU, NavBar, ShippingPeriod } from '../components/Layout';
import { IconCheck, IconDownload, Sparkle } from '../components/Icons';
import { expectedDelivery, fmtPrice } from '../data/catalog';
import { downloadDesign } from '../utils/exportImage';
import { designToDataURL } from '../utils/exportImage';
import { isMobile } from '../utils/device';
import './OrderFlow.css';

export default function CompletePage() {
  const navigate = useNavigate();
  const { lastOrder } = useShop();
  const { showPreview, showSaveImage, showToast } = useUI();

  // 브라우저 뒤로가기는 메인으로 (다시 결제 방지)
  useBlocker((tx) => (tx.action === 'POP' ? { redirect: '/' } : undefined));

  useEffect(() => {
    if (!lastOrder) navigate('/', { replace: true });
  }, [lastOrder, navigate]);

  // 61: 아이폰·아이패드는 웹에서 사진첩에 바로 넣을 수 없음. 공유 창은 "이미지 저장"이 잘 안 보여서,
  //     완성 이미지를 크게 띄우고 길게 눌러 "사진 앱에 저장"으로 저장하게 함 (Safari 기본 메뉴).
  //     (이전: 공유 창의 "이미지 저장" — 사용자 확인 결과 공유 메뉴만 떠서 바꿈)
  //     안드로이드는 다운로드하면 바로 갤러리 Download 앨범에 들어감. 데스크탑은 다운로드 폴더.
  // 69(공유하기)는 제거: 아이폰은 저장 창의 길게 누르기 메뉴에 공유가 있고, 다른 기기는 저장한 이미지를 앱에서 보내면 됨.

  if (!lastOrder) return null;

  const first = lastOrder.items[0];
  const more = lastOrder.items.length - 1;

  const save = async () => {
    const touch = isMobile();
    const ios =
      touch &&
      (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
        (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1));
    // 아이폰·아이패드: 완성 이미지를 크게 띄움 → 길게 눌러 "사진 앱에 저장"
    if (ios) {
      try {
        showSaveImage(await designToDataURL(first));
      } catch {
        showToast('이미지를 저장하지 못했어요');
      }
      return;
    }
    try {
      await downloadDesign(first, `moa-${lastOrder.no}.png`);
      // 안드로이드(휴대폰·태블릿)는 갤러리에 들어간 곳을 알려줌
      showToast(touch ? '갤러리의 Download 앨범에 저장했어요' : '이미지를 저장했어요');
    } catch {
      showToast('이미지를 저장하지 못했어요');
    }
  };

  return (
    <div className="page">
      <NavBar menu={MAIN_MENU} />

      <div className="order-wrap complete-wrap">
        {/* P06-S02 완료 영역 */}
        <section className="complete-hero">
          <div className="complete-media-wrap">
            <Sparkle size={26} color="var(--deco-peach)" className="complete-spark complete-spark1" />
            <Sparkle size={16} className="complete-spark complete-spark2" />
            <Sparkle size={20} color="var(--deco-peach)" className="complete-spark complete-spark3" />
            <button
              type="button"
              className="complete-media"
              aria-label="완성 케이스 크게 보기"
              onClick={() => showPreview(first)}
            >
              <span className="complete-shine-clip" aria-hidden="true">
                <span className="complete-shine" />
              </span>
              <CaseView design={first} size={250} />
              {more > 0 && <span className="complete-more">외 {more}개</span>}
              <span className="complete-check" aria-hidden="true">
                <IconCheck size={22} />
              </span>
            </button>
          </div>
          <p className="flow-caption">이미지를 누르면 꾸민 상품을 볼 수 있어요</p>
          <div className="complete-copy">
            <h1 className="complete-title">주문이 완료되었어요!</h1>
            <p className="muted">세상에 하나뿐인 케이스가 곧 찾아갈게요</p>
          </div>
          <div className="box complete-info">
            <span className="muted">주문번호</span>
            <strong>{lastOrder.no}</strong>
            <span className="muted">주문일자</span>
            <span>{lastOrder.date}</span>
            <span className="muted">예상 배송일</span>
            <span>{expectedDelivery(lastOrder.date) ?? '주문 확인 후 약 5~7일 이내'}</span>
          </div>
          <button type="button" className="btn btn-outline complete-save" onClick={save}>
            <IconDownload size={18} />
            이미지 저장하기
          </button>
        </section>

        {/* P06-S03 주문 요약 */}
        <section className="order-card complete-summary">
          <h2 className="order-h2">주문 정보</h2>
          <div className="complete-grid">
            <span className="muted">배송지</span>
            <span>{lastOrder.address}</span>
            <span className="muted">결제 수단</span>
            <span>{lastOrder.payment}</span>
            <span className="muted">총 결제 금액</span>
            <strong className="price">{lastOrder.total == null ? '[총 결제 금액]' : fmtPrice(lastOrder.total)}원</strong>
          </div>
        </section>

        {/* P06-S04 배송·문의 안내 */}
        <section className="complete-notice">
          <h2>배송·문의 안내</h2>
          <span><ShippingPeriod /></span>
          <span>주문 내용은 입력한 연락처로 문자로 보내 드려요.</span>
          <span>주문번호 또는 이름과 연락처로 고객센터에 문의해 주세요.</span>
        </section>
      </div>

      <Footer />
    </div>
  );
}
