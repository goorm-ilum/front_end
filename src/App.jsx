// App.jsx
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import BasicLayout from './common/BasicLayout';
import MemberRouter from './common/router/memberRouter';
import AdminProtectedRoute from './common/components/AdminProtectedRoute';

import Home from './User/pages/Home';
import Commerce from './User/pages/Commerce';
import CommerceList from './User/components/Commerce/CommerceList';
import CommerceDetail from './User/components/Commerce/CommerceDetail';

import CommercePayment from './User/components/Commerce/CommercePayment';
import Checkout from './User/components/Commerce/Checkout';
import OrderSuccess from './User/pages/Commerce/OrderSuccess';
import OrderFailure from './User/pages/Commerce/OrderFailure';
import MyOrderDetail from './User/pages/Mypage/MyOrderDetail';


import MyPage from './User/pages/Mypage';
import ReviewForm from './User/pages/Mypage/ReviewForm';
import ChatPage from './common/chat/ChatPage';

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
          {/* 기본 레이아웃을 사용하는 라우트 그룹 */}
          <Route element={<BasicLayout />}>
            {/* 회원 관련 라우터 */}
            <Route path="/member/*" element={<MemberRouter />} />

            {/* 사용자용 페이지들 */}
            <Route path="/" element={<Home />} />
            <Route path="/commerce/*" element={<Commerce />}>
              <Route index element={<CommerceList />} />
              <Route path=":id" element={<CommerceDetail />} />
              <Route path=":id/payment" element={<CommercePayment />} />
            </Route>
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/mypage/review/create/:productId" element={<ReviewForm />} />
            <Route path="/mypage/review/edit/:reviewId" element={<ReviewForm />} />
            <Route path="/chat/*" element={<ChatPage />} />
            <Route path="/commerce/checkout" element={<Checkout />} />
            <Route path="/commerce/order/success" element={<OrderSuccess />} /> 
            <Route path="/commerce/order/fail" element={<OrderFailure />} />
            <Route path="/order-detail" element={<MyOrderDetail />} />

            {/* 관리자용 페이지들 */}
            <Route path="/admin" element={<AdminHome />} />
            <Route path="/admin/products" element={
              <AdminProtectedRoute>
                <AdminProductList />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/products/create" element={
              <AdminProtectedRoute>
                <AdminProductForm />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/products/detail/:productId" element={
              <AdminProtectedRoute>
                <AdminProductForm />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/orders" element={
              <AdminProtectedRoute>
                <AdminOrderList />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/orders/:orderId" element={
              <AdminProtectedRoute>
                <AdminOrderDetail />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/chats/*" element={
              <AdminProtectedRoute>
                <ChatPage />
              </AdminProtectedRoute>
            } />
            <Route path="/admin/profile" element={
              <AdminProtectedRoute>
                <AdminProfilePage />
              </AdminProtectedRoute>
            } />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
