// P01 메인: 네비게이션 바 → 소개 배너 → 케이스 종류 카드 → 직접 꾸민 후기 → 푸터
import { useEffect, useRef, useState } from 'react';
import { useLayoutEffect } from 'react';
import { Link } from '../router';
import { NavBar, Footer } from '../components/Layout';
import { IconChevronLeft, IconChevronRight, Sparkle, Star } from '../components/Icons';
import { CASE_TYPES, REVIEWS, bannerImage, fmtPrice, fmtSize, getCaseType } from '../data/catalog';
import { isMobile } from '../utils/device';
import { useUI } from '../components/Dialogs';
import './MainPage.css';

const PER_VIEW = 4;
// 메뉴 영역: 홈(맨 위) · CASE(케이스 종류) · REVIEW(직접 꾸민 후기)
const MENU = [
  { label: '홈', id: null },
  { label: 'CASE', id: 'types' },
  { label: 'REVIEW', id: 'reviews' },
];
const MARQUEE_SPEED = 45; // 후기 문구가 옆으로 흐르는 속도 (px/초)

// 후기 한 줄 문구: 평소에는 한 줄 + "…", 카드에 마우스를 올리면 옆으로 흐르며 끝까지 보여줌
function ReviewText({ text }) {
  const ref = useRef(null);
  const [shift, setShift] = useState(0);

  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (el) setShift(Math.max(0, el.scrollWidth - el.clientWidth));
    };
    measure();
    window.addEventListener('resize', measure);
    document.fonts?.ready.then(measure);
    return () => window.removeEventListener('resize', measure);
  }, [text]);

  // 흐르는 시간은 전체의 70%, 앞뒤 15%씩 멈춤
  const duration = shift / MARQUEE_SPEED / 0.7;
  return (
    <p
      ref={ref}
      className={`rv-text${shift > 0 ? ' is-long' : ''}`}
      style={{ '--rv-shift': `${-shift}px`, '--rv-dur': `${duration}s` }}
    >
      <span className="rv-text-inner">{text}</span>
    </p>
  );
}

export default function MainPage() {
  const pages = Math.ceil(REVIEWS.length / PER_VIEW);
  const [page, setPage] = useState(0);
  const { showReview } = useUI();

  // 64: 빈 장바구니의 "케이스 꾸미러 가기"로 들어오면(/#types) 케이스 종류 영역으로 바로 이동하고, 주소의 #types는 지움
  useEffect(() => {
    if (window.location.hash !== '#types') return;
    document.getElementById('types')?.scrollIntoView();
    window.history.replaceState(window.history.state, '', window.location.pathname + window.location.search);
  }, []);
  // 20(모바일): 후기를 화살표 대신 손가락으로 넘기므로 모든 카드를 키보드·화면 낭독기에서도 볼 수 있게
  // 기존 JSX(데스크탑 4개씩 숨김)는 그대로 두고, 모바일에서만 그린 뒤 숨김 속성을 풀어 줌
  useLayoutEffect(() => {
    if (!isMobile()) return;
    document.querySelectorAll('.review-track .rv-card').forEach((el) => {
      el.removeAttribute('aria-hidden');
      el.tabIndex = 0;
    });
  }, [page]);

  return (
    <div className="page">
      <NavBar menu={MENU} />

      {/* P01-S02 소개 배너 */}
      <section className="main-banner-wrap">
        <div className="main-banner">
          <Sparkle size={28} color="var(--deco-peach)" className="main-banner-spark1" />
          <Sparkle size={16} color="var(--deco-peach)" className="main-banner-spark2" />
          <div className="main-banner-copy">
            <span className="main-banner-script">Make it yours</span>
            <h1 className="main-banner-title">
              나만의 쿠션 케이스,
              <br />
              모아에서 완성해요
            </h1>
          </div>
          <div className="main-banner-image">
            <img src={bannerImage} alt="블러시 핑크 원형 쿠션 케이스에 큐빅, 리본, 각인으로 꾸민 예시 상품" />
            {/* 빛줄기: 터치 기기에서만 보임 (MainPage.css 터치 전용 블록) */}
            <span className="main-banner-shine" aria-hidden="true" />
          </div>
        </div>
      </section>

      {/* P01-S03 케이스 종류 카드 */}
      <section id="types" className="main-section main-types">
        <div className="container main-section-inner">
          <h2 className="main-h2">케이스 종류</h2>
          <div className="main-grid">
            {CASE_TYPES.map((t) => (
              <Link key={t.key} to={`/detail?type=${t.key}`} className="case-card">
                <div className="case-card-media">
                  <img src={t.card} alt={`꾸미지 않은 ${t.name} 케이스`} />
                  <div className="case-card-deco">
                    <span className="badge-on-image">꾸민 예시</span>
                    <img src={t.hover} alt="" />
                  </div>
                </div>
                <div className="case-card-info">
                  <span className="case-card-name">
                    {t.name} ({fmtSize(t.size)})
                  </span>
                  <span className="case-card-price">{fmtPrice(t.price)}원</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* P01-S04 직접 꾸민 후기 */}
      <section id="reviews" className="main-section main-reviews">
        <div className="container main-section-inner">
          <div className="main-reviews-head">
            <div className="main-reviews-title">
              <h2 className="main-h2">직접 꾸민 후기</h2>
              <p>나만의 케이스를 자랑해 보세요</p>
            </div>
            <div className="main-reviews-nav">
              <button
                type="button"
                className="round-btn"
                aria-label="이전 후기"
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                <IconChevronLeft size={20} />
              </button>
              <button
                type="button"
                className="round-btn"
                aria-label="다음 후기"
                disabled={page >= pages - 1}
                onClick={() => setPage((p) => Math.min(pages - 1, p + 1))}
              >
                <IconChevronRight size={20} />
              </button>
            </div>
          </div>
          <div className="review-viewport">
            <div className="review-track" style={{ transform: `translateX(calc(${-page} * (100% + 24px)))` }}>
              {REVIEWS.map((r, i) => {
                const hidden = Math.floor(i / PER_VIEW) !== page;
                return (
                  <article
                    key={r.id}
                    className="rv-card"
                    tabIndex={hidden ? -1 : 0}
                    aria-hidden={hidden}
                    role="button"
                    aria-label={`${getCaseType(r.type).name} 후기 자세히 보기`}
                    onClick={() => showReview(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        showReview(i);
                      }
                    }}
                  >
                    <div className="rv-media">
                      <img className="rv-img" src={r.img} alt={`${getCaseType(r.type).name} 케이스를 꾸민 후기 사진`} />
                      <span className="badge-on-image">예시 후기</span>
                    </div>
                    <div className="rv-body">
                      <div className="rv-stars" role="img" aria-label="별점 5점">
                        {[0, 1, 2, 3, 4].map((n) => (
                          <Star key={n} />
                        ))}
                      </div>
                      <span className="rv-meta">
                        {r.author} · {r.date}
                      </span>
                      <ReviewText text={r.text} />
                      <span className="tag">{getCaseType(r.type).name}</span>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
