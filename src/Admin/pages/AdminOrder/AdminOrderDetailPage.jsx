import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AdminOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 실제 API 호출로 대체
    // fetch(`/api/admin/orders/${orderId}`)
    //   .then(res => res.json())
    //   .then(data => {
    //     setOrder(data);
    //   })
    //   .finally(() => setLoading(false));

    // dummy data for travel package
    const dummy = {
      id: orderId,
      customer: '김여행',
      customerPhone: '010-1234-5678',
      customerEmail: 'travel@example.com',
      orderDate: '2024-06-01',
      amount: 850000,
      payment: '카드',
      status: '결제완료',
      items: [
        { 
          name: '제주도 3박 4일 패키지', 
          qty: 1, 
          price: 750000,
          startDate: '2024-07-15',
          endDate: '2024-07-18',
          description: '항공권 + 호텔 + 렌터카 + 관광지 입장권 포함'
        },
        { 
          name: '추가 옵션 - 제주맥주 투어', 
          qty: 2, 
          price: 50000,
          startDate: '2024-07-16',
          endDate: '2024-07-16',
          description: '제주맥주 공장 투어 및 시음 체험'
        },
      ],
    };
    setOrder(dummy);
    setLoading(false);
  }, [orderId]);

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg text-gray-600">로딩중...</div>
    </div>
  );
  
  if (!order) return (
    <div className="flex justify-center items-center h-64">
      <div className="text-lg text-red-600">주문을 찾을 수 없습니다.</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">주문 상세</h1>
        </div>

        {/* Order ID Badge */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-500">주문번호</span>
              <p className="text-xl font-semibold text-gray-900">#{order.id}</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {order.status}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Product Purchase History */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">상품 구매 내역</h2>
              <div className="space-y-6">
                {order.items.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 text-lg">{item.name}</h3>
                        <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 text-lg">₩{item.price.toLocaleString()}</p>
                        <p className="text-sm text-gray-500">수량: {item.qty}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">시작일</span>
                        <p className="font-medium text-gray-900">{item.startDate}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">종료일</span>
                        <p className="font-medium text-gray-900">{item.endDate}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">고객 정보</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">예약자명</span>
                  <p className="font-medium text-gray-900">{order.customer}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">연락처</span>
                  <p className="font-medium text-gray-900">{order.customerPhone}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">이메일</span>
                  <p className="font-medium text-gray-900">{order.customerEmail}</p>
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">결제 정보</h2>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-500">주문일시</span>
                  <p className="font-medium text-gray-900">{order.orderDate}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">결제수단</span>
                  <p className="font-medium text-gray-900">{order.payment}</p>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <span className="text-sm text-gray-500">총 결제금액</span>
                  <p className="text-2xl font-bold text-gray-900">₩{order.amount.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Buttons */}
        <div className="flex justify-between items-center mt-8">
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-3 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors border border-gray-300"
          >
            ← 목록으로
          </button>
          <button
            onClick={() => {
              if (window.confirm('환불을 요청하시겠습니까?')) {
                // 환불 요청 로직
                alert('환불 요청이 접수되었습니다.');
              }
            }}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            환불 요청
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminOrderDetailPage;