// 모바일(휴대폰·태블릿) 판단 — 모바일 전용 인터랙션은 모두 이 기준을 따른다.
// 데스크탑(폭 1025px 이상)이나 마우스를 쓰는 기기에서는 false라서, 데스크탑 화면과 동작은 그대로다.
// CSS의 모바일 전용 블록도 같은 조건을 쓴다: @media (hover: none) and (pointer: coarse) and (max-width: 1024px)
export const MOBILE_QUERY = '(hover: none) and (pointer: coarse) and (max-width: 1024px)';

export const isMobile = () => {
  try {
    return window.matchMedia?.(MOBILE_QUERY).matches ?? false;
  } catch {
    return false;
  }
};
