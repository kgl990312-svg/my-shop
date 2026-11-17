// 선형 SVG 아이콘 (선 굵기 1.8~2px, 끝 둥글게, 색은 글자 색을 따름)
const base = {
  fill: 'none',
  stroke: 'currentColor',
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

const Svg = ({ size = 24, sw = 2, children, ...rest }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" strokeWidth={sw} {...base} {...rest}>
    {children}
  </svg>
);

export const IconBack = (p) => (
  <Svg {...p}>
    <path d="M15 5l-7 7 7 7" />
  </Svg>
);
export const IconChevronLeft = (p) => (
  <Svg {...p}>
    <path d="M15 6l-6 6 6 6" />
  </Svg>
);
export const IconChevronRight = (p) => (
  <Svg {...p}>
    <path d="M9 6l6 6-6 6" />
  </Svg>
);
export const IconBag = (p) => (
  <Svg sw={1.8} {...p}>
    <path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z" />
    <path d="M9 8V6a3 3 0 0 1 6 0v2" />
  </Svg>
);
export const IconHelp = (p) => (
  <Svg sw={1.8} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6" />
    <path d="M12 17h.01" />
  </Svg>
);
export const IconUndo = (p) => (
  <Svg {...p}>
    <path d="M9 14L4 9l5-5" />
    <path d="M4 9h10a6 6 0 0 1 0 12h-3" />
  </Svg>
);
export const IconRedo = (p) => (
  <Svg {...p}>
    <path d="M15 14l5-5-5-5" />
    <path d="M20 9H10a6 6 0 0 0 0 12h3" />
  </Svg>
);
export const IconReset = (p) => (
  <Svg {...p}>
    <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
    <path d="M3 3v5h5" />
  </Svg>
);
// 더보기 (가로 점 3개) — P03 터치 기기 상단 바
export const IconMore = (p) => (
  <Svg {...p}>
    <circle cx="5" cy="12" r="1.2" />
    <circle cx="12" cy="12" r="1.2" />
    <circle cx="19" cy="12" r="1.2" />
  </Svg>
);
export const IconMinus = (p) => (
  <Svg {...p}>
    <path d="M5 12h14" />
  </Svg>
);
export const IconPlus = (p) => (
  <Svg {...p}>
    <path d="M5 12h14M12 5v14" />
  </Svg>
);
export const IconMenu = (p) => (
  <Svg {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Svg>
);
export const IconClose = (p) => (
  <Svg {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </Svg>
);
export const IconPalette = (p) => (
  <Svg sw={1.8} {...p}>
    <path d="M12 3a9 9 0 0 0 0 18c1.1 0 1.5-.8 1.5-1.5 0-1.2-1-1.5-1-2.5s.8-1.5 1.8-1.5H17a4 4 0 0 0 4-4c0-4.7-4-8.5-9-8.5z" />
    <circle cx="7.5" cy="11" r="1" />
    <circle cx="10" cy="7" r="1" />
    <circle cx="15" cy="7.5" r="1" />
  </Svg>
);
export const IconGem = (p) => (
  <Svg sw={1.8} {...p}>
    <path d="M6 3h12l4 6-10 12L2 9z" />
    <path d="M2 9h20M12 21L8 9l4-6 4 6z" />
  </Svg>
);
export const IconRibbon = (p) => (
  <Svg sw={1.8} {...p}>
    <path d="M12 10C9 6 4 5 3 7s1 6 5 5l4-2z" />
    <path d="M12 10c3-4 8-5 9-3s-1 6-5 5l-4-2z" />
    <path d="M11 11l-3 9 2.5-1.5L12 21l1.5-2.5L16 20l-3-9" />
  </Svg>
);
export const IconHeart = (p) => (
  <Svg sw={1.8} {...p}>
    <path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z" />
  </Svg>
);
export const IconText = (p) => (
  <Svg sw={1.8} {...p}>
    <path d="M5 6V4h14v2M12 4v16M9 20h6" />
  </Svg>
);
export const IconCaseType = (p) => (
  <Svg sw={1.8} {...p}>
    <rect x="4" y="4" width="16" height="16" rx="5" />
    <circle cx="12" cy="12" r="4" />
  </Svg>
);
export const IconHand = (p) => (
  <Svg sw={1.8} {...p}>
    <path d="M9 11V5a1.5 1.5 0 0 1 3 0v5" />
    <path d="M12 10V4a1.5 1.5 0 0 1 3 0v6" />
    <path d="M15 10.5V6a1.5 1.5 0 0 1 3 0v8a6 6 0 0 1-6 6h-1a6 6 0 0 1-5-2.7L3.4 13a1.5 1.5 0 0 1 2.4-1.8L9 14" />
  </Svg>
);
export const IconInfo = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16h.01" />
  </Svg>
);
export const IconExpand = (p) => (
  <Svg {...p}>
    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
  </Svg>
);
export const IconCheck = (p) => (
  <Svg sw={3} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </Svg>
);
export const IconDownload = (p) => (
  <Svg {...p}>
    <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
  </Svg>
);
// 수정하기 (P07 장바구니)
export const IconEdit = (p) => (
  <Svg {...p}>
    <path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3z" />
    <path d="M13.5 7.5l3 3" />
  </Svg>
);
export const IconAlert = (p) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v5M12 16h.01" />
  </Svg>
);

// 반짝이 (네 갈래 별) — 장식 색으로 채움
export const Sparkle = ({ size = 18, color = 'var(--deco-coral)', style, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" style={style} className={className ? `sparkle ${className}` : 'sparkle'}>
    <path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" fill={color} />
  </svg>
);

export const Star = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
    <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" fill="var(--deco-coral)" />
  </svg>
);
