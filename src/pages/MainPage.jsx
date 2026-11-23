// P01 메인: 네비게이션 바 → 소개 배너 → 케이스 종류 카드 → 직접 꾸민 후기 → 푸터
import { useEffect, useRef, useState } from 'react';
import { useLayoutEffect } from 'react';
import { Link } from '../router';
import { NavBar, Footer, MAIN_MENU } from '../components/Layout';
import { IconChevronLeft, IconChevronRight, Sparkle, Star } from '../components/Icons';
import { CASE_TYPES, REVIEWS, bannerImage, fmtPrice, fmtSize, getCaseType } from '../data/catalog';
import { isMobile } from '../utils/device';
import { useUI } from '../components/Dialogs';
import './MainPage.css';

const PER_VIEW = 4;
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
    // 글꼴을 첫 화면 뒤에 받으므로(R-24) 글꼴이 바뀌면 글자 폭을 다시 잼
    document.fonts?.addEventListener?.('loadingdone', measure);
    return () => {
      window.removeEventListener('resize', measure);
      document.fonts?.removeEventListener?.('loadingdone', measure);
    };
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
  const [touch] = useState(isMobile); // 휴대폰·태블릿(터치 기기)인지 — 카드 "꾸민 예시" 사진을 받을지 정함
  // 로딩 시간(R-24): 후기 사진은 후기 영역이 화면에 200px 이내로 가까워지면 받음 (사진 자리는 1:1로 고정이라 화면이 밀리지 않음)
  const reviewsRef = useRef(null);
  const [reviewsNear, setReviewsNear] = useState(() => typeof IntersectionObserver === 'undefined');
  useEffect(() => {
    if (reviewsNear || !reviewsRef.current) return undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) setReviewsNear(true);
      },
      { rootMargin: '200px 0px' },
    );
    io.observe(reviewsRef.current);
    return () => io.disconnect();
  }, [reviewsNear]);

  // 64: 빈 장바구니의 "케이스 꾸미러 가기"(/#types)나 P06 메뉴의 CASE·REVIEW(/#types, /#reviews)로 들어오면
  // 그 영역으로 바로 이동하고, 주소의 #은 지움
  useEffect(() => {
    const id = window.location.hash.slice(1);
    if (id !== 'types' && id !== 'reviews') return;
    document.getElementById(id)?.scrollIntoView();
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
      <NavBar menu={MAIN_MENU} />

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
          {/* 로딩 시간(R-24): 배너 사진은 먼저, 화면 아래 카드·후기 사진은 가까워질 때 받음 (2026-11-23) */}
          <div className="main-banner-image">
            <img src={bannerImage} fetchpriority="high" alt="블러시 핑크 원형 쿠션 케이스에 큐빅, 리본, 각인으로 꾸민 예시 상품" />
            {/* 빛줄기: 사진이 나타난 뒤 한 번 지나감 (모든 기기) */}
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
                  <img src={t.card} loading="lazy" alt={`꾸미지 않은 ${t.name} 케이스`} />
                  {/* 꾸민 예시는 마우스를 올릴 때만 보여서(터치 기기에서는 안 보임, 19번) 터치 기기에서는 사진을 받지 않음 (R-24) */}
                  {!touch && (
                    <div className="case-card-deco">
                      <span className="badge-on-image">꾸민 예시</span>
                      <img src={t.hover} loading="lazy" alt="" />
                    </div>
                  )}
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
      <section id="reviews" ref={reviewsRef} className="main-section main-reviews">
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
                  // 접근성(R-23): article에는 button 역할을 줄 수 없어 div로 바꿈. 이름은 카드 내용(사진 설명·작성자·날짜·후기)을 그대로 읽음
                  <div
                    key={r.id}
                    className="rv-card"
                    tabIndex={hidden ? -1 : 0}
                    aria-hidden={hidden}
                    role="button"
                    onClick={() => showReview(i)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        showReview(i);
                      }
                    }}
                  >
                    <div className="rv-media">
                      <img className="rv-img" src={reviewsNear ? r.img : undefined} loading="lazy" alt={`${getCaseType(r.type).name} 케이스를 꾸민 후기 사진`} />
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
                  </div>
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
