// P06 주문 완료: 네비게이션 바(뒤로 없음) → 완료 영역 → 주문 요약 → 배송·문의 안내 → 푸터
import { useEffect } from 'react';
import { useRef } from 'react';
import { useBlocker, useNavigate } from '../router';
import { useShop } from '../store/ShopContext';
import { useUI } from '../components/Dialogs';
import CaseView from '../components/CaseView';
import { Footer, NavBar } from '../components/Layout';
import { IconCheck, IconDownload, Sparkle } from '../components/Icons';
import { fmtPrice } from '../data/catalog';
import { downloadDesign } from '../utils/exportImage';
import { designToFile } from '../utils/exportImage';
import { isMobile } from '../utils/device';
import './OrderFlow.css';

export default function CompletePage() {
  const navigate = useNavigate();
  const { lastOrder } = useShop();
  const { showPreview, showToast } = useUI();

  // 브라우저 뒤로가기는 메인으로 (다시 결제 방지)
  useBlocker((tx) => (tx.action === 'POP' ? { redirect: '/' } : undefined));

  useEffect(() => {
    if (!lastOrder) navigate('/', { replace: true });
  }, [lastOrder, navigate]);

  // 61: 아이폰·아이패드는 공유 창의 "이미지 저장"으로 사진첩에 저장.
  // 버튼을 누르자마자 공유 창을 열어야 해서, 화면에 들어올 때 이미지 파일을 미리 만들어 둔다.
  // (안드로이드·데스크탑은 지금처럼 다운로드 — 안드로이드는 갤러리 Download 앨범에 저장됨)
  const shareFileRef = useRef(null);
  useEffect(() => {
    const touch = isMobile();
    const ios =
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    if (!lastOrder || !touch || !ios || !navigator.canShare) return;
    let alive = true;
    designToFile(lastOrder.items[0], `moa-${lastOrder.no}.png`)
      .then((file) => {
        if (alive && navigator.canShare({ files: [file] })) shareFileRef.current = file;
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [lastOrder]);

  if (!lastOrder) return null;

  const first = lastOrder.items[0];
  const more = lastOrder.items.length - 1;

  const save = async () => {
    // 아이폰·아이패드: 공유 창 열기 (사용자가 "이미지 저장"을 고르면 사진첩에 저장)
    if (shareFileRef.current) {
      try {
        await navigator.share({ files: [shareFileRef.current] });
      } catch (err) {
        if (err?.name !== 'AbortError') showToast('이미지를 저장하지 못했어요'); // 공유 창을 닫은 경우는 알림 없음
      }
      return;
    }
    try {
      await downloadDesign(first, `moa-${lastOrder.no}.png`);
      showToast('이미지를 저장했어요');
    } catch {
      showToast('이미지를 저장하지 못했어요');
    }
  };

  return (
    <div className="page">
      <NavBar />

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
            <p className="muted">[짧은 부가 문구]</p>
          </div>
          <div className="box complete-info">
            <span className="muted">주문번호</span>
            <strong>{lastOrder.no}</strong>
            <span className="muted">주문일자</span>
            <span>{lastOrder.date}</span>
            <span className="muted">예상 배송일</span>
            <span>[예상 배송일]</span>
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
          <span>제작·배송 기간: [제작·배송 기간]</span>
          <span>주문 내용은 입력한 연락처로 문자로 보내드려요</span>
          <span>주문번호 또는 이름과 연락처로 고객센터에 문의해 주세요</span>
        </section>
      </div>

      <Footer />
    </div>
  );
}
