// CommercePayment.jsx
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Checkout } from './Checkout';

const CommercePayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [optionCounts, setOptionCounts] = useState({});
  const [orderInfo, setOrderInfo] = useState(null); // 주문 생성 결과 저장

  useEffect(() => {
    fetch(`/api/products/${id}`, { credentials: 'include' })
      .then(res => {
        if (!res.ok) throw new Error('상품 정보를 불러오는 데 실패했습니다.');
        return res.json();
      })
      .then(productData => {
        setProduct(productData);

        const searchParams = new URLSearchParams(location.search);
        const initialDate = searchParams.get('date') || (productData.availableDates?.[0] || '');
        setSelectedDate(initialDate);

        const initialOptionCounts = {};
        productData.stocks.forEach(stock => {
          initialOptionCounts[stock.option] = 0;
        });
        setOptionCounts(initialOptionCounts);
      })
      .catch(console.error);
  }, [id, location.search]);

  if (!product) return <div>로딩 중...</div>;

  const handleBack = () => navigate(`/commerce/${id}`);

  const updateOptionCount = (optionName, change) => {
    setOptionCounts(prev => ({
      ...prev,
      [optionName]: Math.max(0, prev[optionName] + change),
    }));
  };

  const totalCount = Object.values(optionCounts).reduce((sum, count) => sum + count, 0);
  const totalPrice = product.stocks.reduce((sum, stock) => {
    const count = optionCounts[stock.option] || 0;
    return sum + (stock.price * count);
  }, 0);

  const selectedOptions = product.stocks.filter(stock => optionCounts[stock.option] > 0);

  // 주문 생성 함수: 백엔드에 주문 생성 요청
  const createOrder = async () => {
    if (totalCount === 0 || !selectedDate) return alert('날짜와 옵션을 모두 선택해주세요.');

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: id,
          date: selectedDate,
          options: selectedOptions.map(opt => ({
            optionName: opt.option,
            quantity: optionCounts[opt.option],
          })),
          totalPrice: totalPrice,
        }),
      });

      if (!response.ok) throw new Error('주문 생성에 실패했습니다.');

      const data = await response.json();
      // 백엔드에서 orderId, orderName, amount 등을 반환한다고 가정
      setOrderInfo(data);
    } catch (err) {
      console.error(err);
      alert('주문 생성 중 오류가 발생했습니다.');
    }
  };

  return (
    <section className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      {/* ... 기존 UI 코드 동일 ... */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">예약 정보 확인</h1>
        <button onClick={handleBack} className="text-blue-600 hover:text-blue-800 font-medium">
          ← 상품 상세로 돌아가기
        </button>
      </div>

      <div className="flex gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
        <img src={product.thumbnailImageUrl} alt={product.productName} className="w-24 h-24 object-cover rounded-lg" />
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{product.productName}</h2>
          <p className="text-gray-600 text-sm">{product.shortDescription}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 날짜 선택 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">날짜 선택</h3>
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">투어 날짜</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="border border-gray-300 rounded-lg px-4 py-2 w-64"
            />
          </div>
        </div>

        {/* 옵션 및 수량 선택 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">옵션 및 수량 선택</h3>
          <div className="space-y-4">
            {product.stocks.map((stock) => (
              <div key={stock.option} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{stock.option}</h4>
                  <p className="text-blue-600 font-semibold">
                    {stock.price ? stock.price.toLocaleString() : '가격 정보 없음'}원/인
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => updateOptionCount(stock.option, -1)}
                    className="w-10 h-10 rounded-lg bg-gray-200"
                    disabled={!selectedDate || optionCounts[stock.option] === 0}
                  >-</button>
                  <span className="w-12 text-center font-medium">{optionCounts[stock.option]}</span>
                  <button
                    onClick={() => updateOptionCount(stock.option, 1)}
                    className="w-10 h-10 rounded-lg bg-gray-200"
                    disabled={!selectedDate}
                  >+</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 예약 정보 요약 */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">예약 정보 요약</h3>
        <div className="space-y-3 text-gray-700">
          <div className="flex justify-between">
            <span>투어 날짜:</span>
            <span>{selectedDate}</span>
          </div>
          {selectedOptions.length > 0 && (
            <>
              <div className="space-y-2">
                <span className="font-medium">선택한 옵션:</span>
                {selectedOptions.map((opt) => (
                  <div key={opt.option} className="flex justify-between ml-4">
                    <span>• {opt.option}</span>
                    <span>{optionCounts[opt.option]}개</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
                <span>총 결제 금액:</span>
                <span className="text-blue-600">{totalPrice.toLocaleString()}원</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* 주문 생성 버튼 */}
      {!orderInfo ? (
        <button
          className="w-full bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg"
          onClick={createOrder}
          disabled={totalCount === 0 || !selectedDate}
        >
          주문 생성 및 결제
        </button>
      ) : (
        // 주문 생성 완료 후 결제 위젯 렌더링
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 방법 선택</h3>
          <Checkout
            orderId={orderInfo.orderId}
            orderName={orderInfo.orderName}
            amount={orderInfo.amount}
            customerEmail={orderInfo.customerEmail}
          />
        </div>
      )}
    </section>
  );
};

export default CommercePayment;
