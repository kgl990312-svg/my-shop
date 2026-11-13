import { Router, useRouter } from './router';
import { ShopProvider } from './store/ShopContext';
import { UIProvider } from './components/Dialogs';
import MainPage from './pages/MainPage';
import DetailPage from './pages/DetailPage';
import CustomizePage from './pages/CustomizePage';
import ConfirmPage from './pages/ConfirmPage';
import OrderPage from './pages/OrderPage';
import CompletePage from './pages/CompletePage';
import CartPage from './pages/CartPage';

// 주소 → 페이지
const ROUTES = {
  '/': MainPage, // P01 메인
  '/detail': DetailPage, // P02 상품 상세 (?type=round)
  '/customize': CustomizePage, // P03 꾸미기
  '/confirm': ConfirmPage, // P04 확인
  '/order': OrderPage, // P05 주문 정보
  '/complete': CompletePage, // P06 주문 완료
  '/cart': CartPage, // P07 장바구니
};

function Pages() {
  const { location } = useRouter();
  const Page = ROUTES[location.pathname] || MainPage;
  return <Page key={location.pathname + location.search} />;
}

export default function App() {
  return (
    <Router>
      <ShopProvider>
        <UIProvider>
          <Pages />
        </UIProvider>
      </ShopProvider>
    </Router>
  );
}
