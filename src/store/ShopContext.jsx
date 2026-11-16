// 사이트 전체에서 쓰는 상태
// - design: 지금 꾸미는 케이스 (P03·P04·P05) → 새로고침해도 유지(sessionStorage), 나가기·주문 완료 때 삭제
// - cart: 장바구니 (P07) → 다시 방문해도 유지(localStorage), 주문 완료 때 주문한 케이스 삭제
// - checkout: 주문 정보로 온 곳 (바로 구매 / 장바구니)
// - lastOrder: 주문 완료 화면에 보여줄 내용
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { CASE_COLORS } from '../data/catalog';

const ShopContext = createContext(null);

const KEYS = {
  design: 'moa-design',
  cart: 'moa-cart',
  checkout: 'moa-checkout',
  lastOrder: 'moa-last-order',
};

function load(storage, key, fallback) {
  try {
    const raw = storage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function save(storage, key, value) {
  try {
    if (value == null) storage.removeItem(key);
    else storage.setItem(key, JSON.stringify(value));
  } catch {
    /* 저장할 수 없는 환경이면 화면 안에서만 유지 */
  }
}

export const newDesign = (type, color = CASE_COLORS[0].key) => ({ type, color, items: [] });

// 실제로 꾸민 것이 있는지 (내용 없는 각인은 빼고)
export const hasDecoration = (design) =>
  !!design && design.items.some((it) => it.kind !== 'engrave' || (it.text || '').trim().length > 0);

// 주문·장바구니에 넣을 때는 내용 없는 각인을 뺀다
export const cleanDesign = (design) => ({
  ...design,
  items: design.items.filter((it) => it.kind !== 'engrave' || (it.text || '').trim().length > 0),
});

export function ShopProvider({ children }) {
  const [design, setDesignState] = useState(() => load(sessionStorage, KEYS.design, null));
  const [cart, setCart] = useState(() => load(localStorage, KEYS.cart, []));
  const [checkout, setCheckoutState] = useState(() => load(sessionStorage, KEYS.checkout, null));
  const [lastOrder, setLastOrderState] = useState(() => load(sessionStorage, KEYS.lastOrder, null));

  useEffect(() => save(sessionStorage, KEYS.design, design), [design]);
  useEffect(() => save(localStorage, KEYS.cart, cart), [cart]);
  useEffect(() => save(sessionStorage, KEYS.checkout, checkout), [checkout]);
  useEffect(() => save(sessionStorage, KEYS.lastOrder, lastOrder), [lastOrder]);

  const setDesign = useCallback((next) => setDesignState(next), []);
  const clearDesign = useCallback(() => setDesignState(null), []);

  const addToCart = useCallback((d) => {
    const { editingId, ...rest } = cleanDesign(d); // 꾸미기용 표시(수정 중인 카드)는 빼고 담음
    const item = { ...rest, id: `c${Date.now()}`, addedAt: Date.now() };
    setCart((prev) => [...prev, item]);
    return item;
  }, []);

  const removeFromCart = useCallback((id) => setCart((prev) => prev.filter((it) => it.id !== id)), []);

  // 67 수정하기: 장바구니의 원래 카드 자리에 고친 디자인을 넣음 (id·담은 시각은 그대로, 카드가 없으면 false)
  const replaceInCart = useCallback((id, d) => {
    let found = false;
    setCart((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        found = true;
        const { editingId, ...rest } = cleanDesign(d); // 꾸미기용 표시는 빼고 저장
        return { ...rest, id: it.id, addedAt: it.addedAt };
      })
    );
    return found;
  }, []);

  // 삭제 되돌리기: 뺐던 디자인을 원래 자리에 다시 넣음 (이미 있으면 그대로)
  const restoreToCart = useCallback(
    (item, index) =>
      setCart((prev) => {
        if (prev.some((it) => it.id === item.id)) return prev;
        const next = [...prev];
        next.splice(Math.min(Math.max(index, 0), next.length), 0, item);
        return next;
      }),
    []
  );

  const placeOrder = useCallback(
    (order) => {
      setLastOrderState(order);
      if (checkout?.from === 'cart') {
        const ordered = new Set(order.items.map((it) => it.id));
        setCart((prev) => prev.filter((it) => !ordered.has(it.id)));
      } else {
        setDesignState(null);
      }
      setCheckoutState(null);
    },
    [checkout]
  );

  const value = useMemo(
    () => ({
      design,
      setDesign,
      clearDesign,
      cart,
      addToCart,
      removeFromCart,
      restoreToCart,
      replaceInCart,
      checkout,
      setCheckout: setCheckoutState,
      lastOrder,
      placeOrder,
    }),
    [design, setDesign, clearDesign, cart, addToCart, removeFromCart, restoreToCart, replaceInCart, checkout, lastOrder, placeOrder]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export const useShop = () => useContext(ShopContext);
