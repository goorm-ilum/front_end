import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const mockOrders = [
  {
    id: 1,
    thumbnail: 'https://placehold.co/100x100?text=상품1',
    title: '오사카 3박 4일 자유여행 패키지',
    orderDate: '2025-07-15',
    quantity: 2,
    status: '구매완료',
    paymentMethod: '카카오페이',
    amount: 820000,
  },
  {
    id: 2,
    thumbnail: 'https://placehold.co/100x100?text=상품2',
    title: '제주도 렌터카 포함 2박 3일 숙박패키지',
    orderDate: '2025-06-10',
    quantity: 1,
    status: '구매취소',
    paymentMethod: '신용카드',
    amount: 340000,
  },
  {
    id: 3,
    thumbnail: 'https://placehold.co/100x100?text=상품3',
    title: '스위스 알프스 기차여행 7박 8일',
    orderDate: '2025-05-01',
    quantity: 3,
    status: '구매완료',
    paymentMethod: '네이버페이',
    amount: 2580000,
  },
  {
    id: 4,
    thumbnail: 'https://placehold.co/100x100?text=상품4',
    title: '태국 푸켓 리조트 숙박 패키지',
    orderDate: '2025-04-20',
    quantity: 2,
    status: '구매완료',
    paymentMethod: '토스페이',
    amount: 720000,
  },
  {
    id: 5,
    thumbnail: 'https://placehold.co/100x100?text=상품5',
    title: '부산 1박 2일 기차여행',
    orderDate: '2025-03-15',
    quantity: 1,
    status: '구매완료',
    paymentMethod: '삼성페이',
    amount: 160000,
  },
  {
    id: 6,
    thumbnail: 'https://placehold.co/100x100?text=상품6',
    title: '유럽 배낭여행 14박 15일',
    orderDate: '2025-02-01',
    quantity: 1,
    status: '구매완료',
    paymentMethod: '카카오페이',
    amount: 3290000,
  },
];

const ITEMS_PER_PAGE = 5;

const MyOrder = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const totalPages = Math.ceil(mockOrders.length / ITEMS_PER_PAGE);
  const paginatedOrders = mockOrders.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">내 구매내역</h1>

      {paginatedOrders.map(order => (
        <div
          key={order.id}
          className="border rounded-lg p-4 mb-6 shadow-sm flex gap-4"
        >
          <img
            src={order.thumbnail}
            alt={order.title}
            className="w-24 h-24 rounded object-cover"
          />

          <div className="flex-1 space-y-2">
            <div className="text-lg font-semibold">{order.title}</div>
            <div className="text-sm text-gray-600">
              <span className="mr-4">구매일: {order.orderDate}</span>
              <span className="mr-4">수량: {order.quantity}</span>
              <span className="mr-4">결제: {order.paymentMethod}</span>
            </div>
            <div className="text-sm text-gray-600">
              상태: <span className="font-medium">{order.status}</span>
            </div>
            <div className="text-lg font-bold text-blue-700">
              총 결제금액: {order.amount.toLocaleString()}원
            </div>

            <div className="flex gap-2 mt-2 flex-wrap">
              <button className="px-3 py-1 bg-gray-100 rounded border hover:bg-gray-200 text-sm">
                주문상세
              </button>
              <button 
                onClick={() => navigate(`/mypage?mode=create&productId=${order.id}`)}
                className="px-3 py-1 bg-gray-100 rounded border hover:bg-gray-200 text-sm"
              >
                리뷰 작성
              </button>
              <button className="px-3 py-1 bg-gray-100 rounded border hover:bg-gray-200 text-sm">
                반품 접수요청
              </button>
            </div>
          </div>
        </div>
      ))}

      {/* 페이지네이션 */}
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          이전
        </button>
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx + 1}
            onClick={() => setCurrentPage(idx + 1)}
            className={`px-3 py-1 border rounded hover:bg-gray-100 ${
              currentPage === idx + 1 ? 'bg-blue-100 font-bold' : ''
            }`}
          >
            {idx + 1}
          </button>
        ))}
        <button
          onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default MyOrder;
