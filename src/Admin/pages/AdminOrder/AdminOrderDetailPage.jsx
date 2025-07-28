import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const AdminOrderDetailPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // 주문 상태, 배송 상태 변경용 state
  const [status, setStatus] = useState('');
  const [shipping, setShipping] = useState('');

  useEffect(() => {
    // 실제 API 호출로 대체
    // fetch(`/api/admin/orders/${orderId}`)
    //   .then(res => res.json())
    //   .then(data => {
    //     setOrder(data);
    //     setStatus(data.status);
    //     setShipping(data.shipping);
    //   })
    //   .finally(() => setLoading(false));

    // dummy
    const dummy = {
      id: orderId,
      customer: '홍길동',
      date: '2024-06-01',
      amount: 12000,
      payment: '카드',
      status: '결제완료',
      shipping: '준비중',
      items: [
        { name: '상품 A', qty: 2, price: 5000 },
        { name: '상품 B', qty: 1, price: 2000 },
      ],
      shippingInfo: { receiver: '홍길동', address: '서울시 강남구 …' },
    };
    setOrder(dummy);
    setStatus(dummy.status);
    setShipping(dummy.shipping);
    setLoading(false);
  }, [orderId]);

  const handleUpdate = async () => {
    try {
      // 주문 상태/배송 상태만 PUT
      await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, shipping }),
      });
      alert('상태가 업데이트되었습니다.');
      // 필요시 재패칭
    } catch (err) {
      console.error(err);
      alert('업데이트 실패');
    }
  };

  if (loading) return <div>로딩중…</div>;
  if (!order) return <div>주문을 찾을 수 없습니다.</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl mb-4">주문 상세: {order.id}</h1>

      {/* 주문 요약 정보 */}
      <section className="mb-6">
        <p><strong>주문자:</strong> {order.customer}</p>
        <p><strong>금액:</strong> ₩{order.amount.toLocaleString()}</p>
        <p><strong>결제수단:</strong> {order.payment}</p>
        <p><strong>배송지:</strong> {order.shippingInfo.address}</p>
      </section>

      {/* 주문 상품 목록 */}
      <section className="mb-6">
        <h2 className="font-semibold mb-2">주문 상품</h2>
        <ul className="list-disc list-inside">
          {order.items.map((it, i) => (
            <li key={i}>{it.name} × {it.qty} / ₩{it.price.toLocaleString()}</li>
          ))}
        </ul>
      </section>

      {/* 상태 변경 폼 */}
      <section className="space-y-4 bg-white p-4 rounded shadow">
        <div>
          <label className="block font-medium">주문 상태</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option>결제완료</option>
            <option>취소요청</option>
            <option>환불완료</option>
          </select>
        </div>
        <div>
          <label className="block font-medium">배송 상태</label>
          <select
            value={shipping}
            onChange={e => setShipping(e.target.value)}
            className="border px-2 py-1 rounded"
          >
            <option>준비중</option>
            <option>배송중</option>
            <option>배송완료</option>
          </select>
        </div>
        <button
          onClick={handleUpdate}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          변경 저장
        </button>
      </section>

      <button
        onClick={() => navigate(-1)}
        className="mt-4 text-gray-600 hover:underline"
      >
        ← 목록으로
      </button>
    </div>
  );
};

export default AdminOrderDetailPage;