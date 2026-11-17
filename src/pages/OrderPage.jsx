// P05 주문 정보: 네비게이션 바 → 페이지 제목 → 배송 정보 → 결제 수단 → 동의 → 금액 → 결제하기 → 푸터
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useRouter } from '../router';
import { cleanDesign, useShop } from '../store/ShopContext';
import { Footer, NavBar } from '../components/Layout';
import { IconAlert } from '../components/Icons';
import { PAYMENT_METHODS, fmtPrice, shippingFor } from '../data/catalog';
import { sumPrice } from '../utils/summary';
import './OrderFlow.css';

const PHONE_RE = /^01[016789]-?\d{3,4}-?\d{4}$/;

const FIELDS = [
  { id: 'name', label: '받는 사람', type: 'text', placeholder: '받는 사람', autoComplete: 'name' },
  { id: 'phone', label: '연락처', type: 'tel', placeholder: '010-0000-0000', autoComplete: 'tel' },
  { id: 'addr', label: '주소', type: 'text', placeholder: '주소', autoComplete: 'address-line1' },
  { id: 'addr2', label: '상세 주소', type: 'text', placeholder: '상세 주소', autoComplete: 'address-line2' },
];

// 안내 문구 (2026-11-17 확정)
const MSG = {
  name: '받는 사람을 입력해 주세요',
  phone: '연락처를 입력해 주세요',
  phoneFormat: '연락처 형식을 확인해 주세요 (예: 010-1234-5678)',
  addr: '주소를 입력해 주세요',
  addr2: '상세 주소를 입력해 주세요',
  pay: '결제 수단을 골라 주세요',
  agree: '필수 항목에 모두 동의해 주세요',
};

const pad = (n) => String(n).padStart(2, '0');

// 연락처 자동 하이픈: 숫자만 입력해도 010-1234-5678 형태로 (모든 기기, 승인된 예외 — docs/interaction-list.md)
// 입력 중에는 010-1234 → 010-123-4567(10자리) → 010-1234-5678(11자리) 순으로 바뀜. 숫자 외 글자는 지움.
const formatPhone = (value) => {
  const d = value.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 3) return d;
  if (d.length <= 7) return `${d.slice(0, 3)}-${d.slice(3)}`;
  if (d.length <= 10) return `${d.slice(0, 3)}-${d.slice(3, 6)}-${d.slice(6)}`;
  return `${d.slice(0, 3)}-${d.slice(3, 7)}-${d.slice(7)}`;
};

export default function OrderPage() {
  const navigate = useNavigate();
  const { goBack } = useRouter();
  const { design, cart, checkout, setCheckout, placeOrder } = useShop();

  // 온 곳: 바로 구매(확인) 또는 장바구니
  const from = checkout?.from || (design ? 'direct' : 'cart');
  const items = useMemo(
    () => (from === 'cart' ? cart : design ? [cleanDesign({ ...design, id: 'direct' })] : []),
    [from, cart, design]
  );

  const [form, setForm] = useState({ name: '', phone: '', addr: '', addr2: '' });
  const [pay, setPay] = useState('');
  const [agree, setAgree] = useState({ terms: false, privacy: false });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!checkout) setCheckout({ from });
  }, [checkout, from, setCheckout]);

  useEffect(() => {
    if (!submitting && items.length === 0) navigate('/', { replace: true });
  }, [items.length, submitting, navigate]);

  const errors = {
    name: !form.name.trim() ? MSG.name : '',
    phone: !form.phone.trim() ? MSG.phone : !PHONE_RE.test(form.phone.trim()) ? MSG.phoneFormat : '',
    addr: !form.addr.trim() ? MSG.addr : '',
    addr2: !form.addr2.trim() ? MSG.addr2 : '',
    pay: !pay ? MSG.pay : '',
    agree: !(agree.terms && agree.privacy) ? MSG.agree : '',
  };
  const valid = Object.values(errors).every((v) => !v);

  const subtotal = sumPrice(items);
  const shipping = shippingFor(subtotal); // 15,000원 이상 무료배송
  const total = subtotal == null || shipping == null ? null : subtotal + shipping;

  const onChange = (id) => (e) => {
    if (id !== 'phone') {
      setForm((f) => ({ ...f, [id]: e.target.value }));
      return;
    }
    // 연락처: 하이픈을 자동으로 넣고, 커서는 입력하던 숫자 바로 뒤에 그대로 둠 (중간을 고칠 때 끝으로 튀지 않게)
    const el = e.target;
    const pos = el.selectionStart ?? el.value.length;
    const digitsBefore = el.value.slice(0, pos).replace(/\D/g, '').length;
    const next = formatPhone(el.value);
    setForm((f) => ({ ...f, phone: next }));
    requestAnimationFrame(() => {
      let i = 0;
      let n = 0;
      while (i < next.length && n < digitsBefore) {
        if (/\d/.test(next[i])) n += 1;
        i += 1;
      }
      try {
        el.setSelectionRange(i, i);
      } catch {
        /* 커서를 옮길 수 없는 입력칸이면 그대로 */
      }
    });
  };
  const onBlur = (id) => () => setTouched((t) => ({ ...t, [id]: true }));
  const showErr = (id) => touched[id] && errors[id];

  const submit = () => {
    if (submitting) return;
    if (!valid) {
      // 비활성 상태에서 누르면 빠진 항목 아래에 안내 문구를 보여줌
      setTouched({ name: true, phone: true, addr: true, addr2: true, pay: true, agree: true });
      return;
    }
    setSubmitting(true);
    const now = new Date();
    const order = {
      no: `MOA${String(now.getFullYear()).slice(2)}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.floor(
        1000 + Math.random() * 9000
      )}`,
      date: `${now.getFullYear()}.${pad(now.getMonth() + 1)}.${pad(now.getDate())}`,
      items,
      address: `${form.addr.trim()} ${form.addr2.trim()}`,
      payment: pay,
      total,
    };
    // 가상 결제: 잠시 "처리 중"을 보여준 뒤 완료 화면으로
    setTimeout(() => {
      placeOrder(order);
      navigate('/complete', { replace: true });
    }, 900);
  };

  if (items.length === 0) return null;

  return (
    <div className="page">
      <NavBar onBack={() => goBack(from === 'cart' ? '/cart' : '/confirm')} guard />

      <div className="order-wrap">
        {/* P05-S02 페이지 제목 */}
        <h1 className="page-title order-title">주문 정보</h1>

        {/* P05-S03 배송 정보 */}
        <section className="order-card">
          <h2 className="order-h2">배송 정보</h2>
          {FIELDS.map((f) => (
            <div key={f.id} className="field">
              <label htmlFor={f.id} className="field-label">
                {f.label} <span className="req">*</span>
              </label>
              <input
                id={f.id}
                type={f.type}
                className={`field-input${showErr(f.id) ? ' is-error' : ''}`}
                value={form[f.id]}
                placeholder={f.placeholder}
                autoComplete={f.autoComplete}
                onChange={onChange(f.id)}
                onBlur={onBlur(f.id)}
                aria-invalid={!!showErr(f.id)}
                aria-describedby={showErr(f.id) ? `${f.id}-err` : undefined}
              />
              {showErr(f.id) && (
                <span id={`${f.id}-err`} className="field-error">
                  <IconAlert size={14} />
                  {errors[f.id]}
                </span>
              )}
            </div>
          ))}
        </section>

        {/* P05-S04 결제 수단 */}
        <section className="order-card">
          <h2 className="order-h2">
            결제 수단 <span className="req">*</span>
          </h2>
          <div role="radiogroup" aria-label="결제 수단" className="choice-row">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={pay === m}
                className={`choice${pay === m ? ' is-on' : ''}`}
                onClick={() => setPay(m)}
              >
                {m}
              </button>
            ))}
          </div>
          {showErr('pay') && (
            <span className="field-error">
              <IconAlert size={14} />
              {errors.pay}
            </span>
          )}
        </section>

        {/* P05-S05 동의 */}
        <section className="order-card order-agree">
          <h2 className="order-h2">
            동의 <span className="req">*</span>
          </h2>
          {/* 70: 모두 동의 — 필수 항목을 한 번에 켜고 끔 (모든 기기, 승인된 예외) */}
          <label className="check check-all">
            <input
              type="checkbox"
              checked={agree.terms && agree.privacy}
              onChange={(e) => setAgree({ terms: e.target.checked, privacy: e.target.checked })}
            />
            모두 동의
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={agree.terms}
              onChange={(e) => setAgree((a) => ({ ...a, terms: e.target.checked }))}
            />
            구매 조건 확인 동의 <span className="req">*</span>
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={agree.privacy}
              onChange={(e) => setAgree((a) => ({ ...a, privacy: e.target.checked }))}
            />
            개인정보 수집·이용 동의 <span className="req">*</span>
          </label>
          {showErr('agree') && (
            <span className="field-error">
              <IconAlert size={14} />
              {errors.agree}
            </span>
          )}
        </section>

        {/* P05-S06 금액 */}
        <section className="order-amount">
          <div className="order-amount-row">
            <span className="muted">상품 금액</span>
            <span>{subtotal == null ? '[상품 금액]' : fmtPrice(subtotal)}원</span>
          </div>
          <div className="order-amount-row">
            <span className="muted">배송비</span>
            <span>{shipping == null ? '[배송비]원' : shipping === 0 ? '무료' : `${fmtPrice(shipping)}원`}</span>
          </div>
          <div className="order-amount-line" />
          <div className="order-amount-row order-amount-total">
            <strong>총 결제 금액</strong>
            <strong className="price">{total == null ? '[총 결제 금액]' : fmtPrice(total)}원</strong>
          </div>
        </section>

        {/* P05-S07 결제하기 */}
        <button
          type="button"
          className="btn btn-primary order-pay"
          aria-disabled={!valid || submitting}
          onClick={submit}
        >
          {submitting ? '처리 중' : '결제하기'}
        </button>
      </div>

      <Footer />
    </div>
  );
}
