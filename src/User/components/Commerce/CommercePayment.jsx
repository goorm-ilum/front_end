import { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

const dummyProducts = [
  {
    id: '1',
    title: '서울 시티 투어',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    price: 28000,
    discountPrice: 22000,
    options: ['오전 출발', '오후 출발'],
    dates: ['2024-06-10', '2024-06-11', '2024-06-12'],
  },
  {
    id: '2',
    title: '에버랜드 입장권',
    thumbnail: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    price: 48000,
    discountPrice: 42000,
    options: ['1일권', '2일권'],
    dates: ['2024-06-15', '2024-06-16'],
  },
  {
    id: '3',
    title: '한강 유람선',
    thumbnail: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80',
    price: 25000,
    discountPrice: null,
    options: ['주간', '야간'],
    dates: ['2024-06-20', '2024-06-21'],
  }
];

const CommercePayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const product = dummyProducts.find(p => p.id === id);

  // URL 파라미터에서 전달받은 값들
  const searchParams = new URLSearchParams(location.search);
  const selectedDate = searchParams.get('date') || '';
  const selectedOption = searchParams.get('option') || '';
  const count = parseInt(searchParams.get('count')) || 1;

  const [form, setForm] = useState({ 
    name: '', 
    email: '',
    phone: '',
    card: '',
    expiry: '',
    cvv: ''
  });
  const [paid, setPaid] = useState(false);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = e => {
    e.preventDefault();
    setPaid(true);
  };

  const handleBack = () => {
    navigate(`/commerce/${id}/before-payment?date=${selectedDate}&option=${selectedOption}&count=${count}`);
  };

  if (!product) {
    return <div>상품을 찾을 수 없습니다.</div>;
  }

  const finalPrice = product.discountPrice || product.price;
  const totalPrice = finalPrice * count;

  if (paid) {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow">
        <div className="flex flex-col items-center gap-6 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-green-600">결제가 완료되었습니다!</h2>
          <div className="text-gray-700 space-y-2">
            <p>예약이 성공적으로 완료되었습니다.</p>
            <p>예약 확인 이메일을 발송해드렸습니다.</p>
            <p className="text-sm text-gray-500">즐거운 여행 되세요! :)</p>
          </div>
          <button
            onClick={() => navigate('/commerce')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            상품 목록으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">결제하기</h1>
        <button
          onClick={handleBack}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← 예약 정보로 돌아가기
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 결제 정보 */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">결제 정보</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">예약자 이름</label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="홍길동"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="example@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="010-1234-5678"
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-lg font-medium text-gray-900 mb-3">카드 정보</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">카드번호</label>
                <input
                  type="text"
                  name="card"
                  value={form.card}
                  onChange={handleChange}
                  required
                  maxLength={16}
                  pattern="[0-9]{16}"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="1234 5678 9012 3456"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">만료일</label>
                  <input
                    type="text"
                    name="expiry"
                    value={form.expiry}
                    onChange={handleChange}
                    required
                    maxLength={5}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="text"
                    name="cvv"
                    value={form.cvv}
                    onChange={handleChange}
                    required
                    maxLength={3}
                    pattern="[0-9]{3}"
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg"
            >
              {totalPrice.toLocaleString()}원 결제하기
            </button>
          </form>
        </div>

        {/* 예약 정보 요약 */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-900">예약 정보</h2>
          
          {/* 상품 정보 */}
          <div className="flex gap-4 p-4 bg-gray-50 rounded-lg mb-6">
            <img 
              src={product.thumbnail} 
              alt={product.title} 
              className="w-20 h-20 object-cover rounded-lg"
            />
            <div>
              <h3 className="font-semibold text-gray-900">{product.title}</h3>
              <div className="text-lg font-bold text-blue-600">
                {product.discountPrice ? (
                  <div>
                    <span className="text-gray-400 line-through text-sm">{product.price.toLocaleString()}원</span>
                    <div>{product.discountPrice.toLocaleString()}원</div>
                  </div>
                ) : (
                  <div>{product.price.toLocaleString()}원</div>
                )}
              </div>
            </div>
          </div>

          {/* 예약 세부사항 */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-3">예약 세부사항</h3>
            <div className="space-y-2 text-gray-700">
              <div className="flex justify-between">
                <span>날짜:</span>
                <span className="font-medium">
                  {new Date(selectedDate).toLocaleDateString('ko-KR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    weekday: 'long'
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>옵션:</span>
                <span className="font-medium">{selectedOption}</span>
              </div>
              <div className="flex justify-between">
                <span>인원:</span>
                <span className="font-medium">{count}명</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>총 결제 금액:</span>
                  <span>{totalPrice.toLocaleString()}원</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommercePayment;
