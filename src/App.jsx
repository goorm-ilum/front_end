import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BasicLayout from './common/BasicLayout';

import Home from './User/pages/Home';
import Commerce from './User/pages/Commerce';
import CommerceDetail from './User/components/Commerce/CommerceDetail';
import ChatPage from './common/chat/ChatPage';
import MyPage from './User/pages/Mypage';

import AdminHome from './Admin/pages/AdminHome';
import AdminProductList from './Admin/pages/AdminProduct/AdminProductListPage';
import AdminProductForm from './Admin/pages/AdminProduct/AdminProductFormPage';
import AdminOrderList from './Admin/pages/AdminOrder/AdminOrderListPage';
import AdminOrderDetail from './Admin/pages/AdminOrder/AdminOrderDetailPage';
import AdminProfilePage from './Admin/pages/AdminProfile/AdminProfilePage';


function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <BrowserRouter>
        <Routes>
          <Route element={<BasicLayout />}>
            {/* 사용자 페이지 라우트들 */}
            <Route path="/" element={<Home />} />
            <Route path="/commerce" element={<Commerce />} />
            <Route path="/commerce/:id" element={<CommerceDetail />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/chat/*" element={<ChatPage />} />

            {/* 관리자 페이지 라우트들 */}
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/admin/products/" element={<AdminProductList />} />
            <Route path="/admin/products/create" element={<AdminProductForm />} />
            <Route path="/admin/products/detail/:productId" element={<AdminProductForm />} />
            <Route path="/admin/orders" element={<AdminOrderList />} />  
            <Route path="/admin/orders/:orderId" element={<AdminOrderDetail />} />
            <Route path="/admin/chats/*" element={<ChatPage />} />
            <Route path="/admin/profile" element={<AdminProfilePage />} />
            
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
