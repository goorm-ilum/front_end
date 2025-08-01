import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Checkout } from './Checkout';

const CommercePayment = () => {
  const { id } = useParams();
  console.log('현재 상품 id:', id);
  const navigate = useNavigate();
  const location = useLocation();

  const [product, setProduct] = useState(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [optionCounts, setOptionCounts] = useState({});

  useEffect(() => {
    fetch(`/api/products/${id}`, {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) {
          throw new Error('상품 정보를 불러오는 데 실패했습니다.');
        }
        return res.json();
      })
      .then(productData => {
        setProduct(productData);

        const searchParams = new URLSearchParams(location.search);
        const initialDate = searchParams.get('date') || (productData.availableDates?.[0] || '');
        setSelectedDate(initialDate);

        const initialOptionCounts = {};
        productData.stocks.forEach(stock => {
          initialOptionCounts[stock.optionName] = 0;
        });
        setOptionCounts(initialOptionCounts);
      })
      .catch(err => {
        console.error('상품 정보를 불러오는 데 실패했습니다.', err);
      });
  }, [id, location.search]);

  if (!product) return <div>로딩 중...</div>;

  const handleBack = () => navigate(`/commerce/${id}`);

  const updateOptionCount = (optionName, change) => {
    setOptionCounts(prev => ({
      ...prev,
      [optionName]: Math.max(0, prev[optionName] + change)
    }));
  };

  const totalCount = Object.values(optionCounts).reduce((sum, count) => sum + count, 0);
  const totalPrice = product.stocks.reduce((sum, stock) => {
    const count = optionCounts[stock.optionName] || 0;
    return sum + (stock.price * count);
  }, 0);

  const selectedOptions = product.stocks.filter(stock => optionCounts[stock.optionName] > 0);

  return (
    <section className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
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
            <p className="text-sm text-gray-500">
              {selectedDate
                ? new Date(selectedDate).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })
                : '날짜를 선택해주세요'}
            </p>
          </div>
        </div>

        {/* 옵션 수량 선택 */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">옵션 및 수량 선택</h3>
          <div className="space-y-4">
            {product.stocks.map((stock) => (
              <div key={stock.optionName} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900">{stock.optionName}</h4>
                  <p className="text-blue-600 font-semibold">
                    {stock.price ? stock.price.toLocaleString() : '가격 정보 없음'}원/인
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => updateOptionCount(stock.optionName, -1)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      !selectedDate || optionCounts[stock.optionName] === 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    disabled={!selectedDate || optionCounts[stock.optionName] === 0}
                  >
                    -
                  </button>
                  <span className="w-12 text-center font-medium">{optionCounts[stock.optionName]}</span>
                  <button
                    onClick={() => updateOptionCount(stock.optionName, 1)}
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      !selectedDate
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                    disabled={!selectedDate}
                  >
                    +
                  </button>
                  <span className="text-gray-600 w-8">개</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 예약 요약 */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">예약 정보 요약</h3>
        <div className="space-y-3 text-gray-700">
          <div className="flex justify-between">
            <span>투어 날짜:</span>
            <span>
              {selectedDate
                ? new Date(selectedDate).toLocaleDateString('ko-KR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    weekday: 'long',
                  })
                : '날짜 미선택'}
            </span>
          </div>

          {selectedOptions.length > 0 ? (
            <>
              <div className="space-y-2">
                <span className="font-medium">선택한 옵션:</span>
                {selectedOptions.map((opt) => (
                  <div key={opt.optionName} className="flex justify-between ml-4">
                    <span>• {opt.optionName}</span>
                    <span>{optionCounts[opt.optionName]}개</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between">
                <span>총 수량:</span>
                <span>{totalCount}개</span>
              </div>
              <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t">
                <span>총 결제 금액:</span>
                <span className="text-blue-600">{totalPrice.toLocaleString()}원</span>
              </div>
            </>
          ) : (
            <div className="text-center text-gray-500 py-4">옵션을 선택해주세요</div>
          )}
        </div>
      </div>

      {/* 결제 위젯 */}
      {totalCount > 0 && selectedDate && (
        <div className="border-t pt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">결제 방법 선택</h3>
          <Checkout
            amount={totalPrice}
            orderName={`${product.productName} - ${selectedOptions
              .map((opt) => `${opt.optionName}(${optionCounts[opt.optionName]}개)`)
              .join(', ')}`}
          />
        </div>
      )}

      {/* 결제 버튼 비활성 */}
      {(totalCount === 0 || !selectedDate) && (
        <div className="border-t pt-8">
          <button
            className="w-full bg-gray-400 text-white font-semibold py-4 px-6 rounded-lg cursor-not-allowed"
            disabled
          >
            {!selectedDate ? '날짜를 선택해주세요' : '옵션을 선택해주세요'}
          </button>
        </div>
      )}
    </section>
  );
};

export default CommercePayment;
