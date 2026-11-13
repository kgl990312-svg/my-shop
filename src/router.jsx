// 작은 라우터: 주소(history API)로 페이지를 바꾸고,
// 꾸민 내용이 있을 때 브라우저 뒤로가기를 막아 안내창을 띄울 수 있게 한다.
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';

const RouterContext = createContext(null);

// 배포 주소의 앞부분(예: GitHub Pages의 /my-shop). 앱 안에서는 이 부분을 뺀 경로('/cart')만 쓴다.
const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const stripBase = (p) => (BASE && p.startsWith(BASE) ? p.slice(BASE.length) || '/' : p);
export const withBase = (to) => (to.startsWith('/') ? BASE + to : to);
const currentPath = () => stripBase(window.location.pathname) + window.location.search;

const readLocation = () => ({
  pathname: stripBase(window.location.pathname),
  search: window.location.search,
});

export function Router({ children }) {
  const [location, setLocation] = useState(readLocation);
  const blockerRef = useRef(null); // (tx) => 'block' | { redirect } | undefined
  const bypassRef = useRef(false);
  const lastRef = useRef(currentPath());

  // 처음 들어온 페이지에 순서 번호를 붙여 둔다 (뒤로 갈 곳이 있는지 알기 위해)
  useEffect(() => {
    if (!window.history.state || window.history.state.idx == null) {
      window.history.replaceState({ idx: 0 }, '');
    }
  }, []);

  const commit = useCallback((to, replace) => {
    const samePage = currentPath() === to;
    const idx = (window.history.state?.idx ?? 0) + (replace ? 0 : 1);
    if (replace) window.history.replaceState({ idx }, '', withBase(to));
    else window.history.pushState({ idx }, '', withBase(to));
    lastRef.current = to;
    setLocation(readLocation());
    if (!samePage) window.scrollTo(0, 0); // 다른 페이지로 가면 맨 위에서 시작
  }, []);

  const navigate = useCallback(
    (to, opts = {}) => {
      if (typeof to === 'number') {
        window.history.go(to);
        return;
      }
      const blocker = blockerRef.current;
      if (blocker && !opts.force) {
        const res = blocker({ to, action: 'PUSH', proceed: () => commit(to, opts.replace) });
        if (res === 'block') return;
      }
      commit(to, opts.replace);
    },
    [commit]
  );

  useEffect(() => {
    const onPop = () => {
      const to = currentPath();
      if (bypassRef.current) {
        bypassRef.current = false;
        lastRef.current = to;
        setLocation(readLocation());
        window.scrollTo(0, 0);
        return;
      }
      const blocker = blockerRef.current;
      if (blocker) {
        const from = lastRef.current;
        const res = blocker({
          to,
          action: 'POP',
          proceed: () => {
            // 막았던 이동을 이어서 진행
            bypassRef.current = true;
            window.history.back();
          },
        });
        if (res === 'block') {
          // 주소를 원래 페이지로 되돌려 놓는다
          window.history.pushState({ idx: (window.history.state?.idx ?? 0) + 1 }, '', withBase(from));
          return;
        }
        if (res && res.redirect) {
          window.history.replaceState({ idx: window.history.state?.idx ?? 0 }, '', withBase(res.redirect));
          lastRef.current = res.redirect;
          setLocation(readLocation());
          window.scrollTo(0, 0);
          return;
        }
      }
      lastRef.current = to;
      setLocation(readLocation());
      window.scrollTo(0, 0);
    };
    window.addEventListener('popstate', onPop);
    return () => window.removeEventListener('popstate', onPop);
  }, []);

  // 화면의 ← 뒤로: 이전 기록이 있으면 브라우저 뒤로가기와 똑같이, 없으면 정해 둔 곳으로
  const goBack = useCallback(
    (fallback = '/') => {
      if ((window.history.state?.idx ?? 0) > 0) window.history.back();
      else navigate(fallback, { replace: true });
    },
    [navigate]
  );

  const value = useMemo(
    () => ({ location, navigate, goBack, blockerRef }),
    [location, navigate, goBack]
  );
  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export const useRouter = () => useContext(RouterContext);
export const useNavigate = () => useContext(RouterContext).navigate;

export function useQuery() {
  const { location } = useRouter();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}

// 페이지를 떠나려 할 때 확인하는 함수 등록
export function useBlocker(fn) {
  const { blockerRef } = useRouter();
  const fnRef = useRef(fn);
  fnRef.current = fn;
  useEffect(() => {
    const wrapper = (tx) => fnRef.current(tx);
    blockerRef.current = wrapper;
    return () => {
      if (blockerRef.current === wrapper) blockerRef.current = null;
    };
  }, [blockerRef]);
}

export function Link({ to, children, onClick, ...rest }) {
  const navigate = useNavigate();
  return (
    <a
      href={withBase(to)}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        navigate(to);
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
