import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

const dummyProducts = [
  {
    id: '1',
    title: '서울 시티 투어',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    price: 28000,
    discountPrice: 22000,
    comment: '서울의 대표 명소들을 전문 가이드와 함께 둘러보는 프리미엄 시티 투어입니다. 경복궁, 남산타워, 홍대거리 등 서울의 핵심 관광지를 효율적으로 탐방하며, 한국의 역사와 현대 문화를 동시에 체험할 수 있습니다. 편안한 전용 차량과 친절한 가이드가 함께하여 최고의 서울 여행 경험을 제공합니다.',
    options: ['오전 출발', '오후 출발'],
    dates: ['2024-06-10', '2024-06-11', '2024-06-12'],
    like: false,
    hashtags: ['#어트랙션', '#힐링여행', '#도시투어', '#문화체험'],
    reviews: [
      { user: '홍길동', rating: 5, comment: '정말 재밌었어요!' },
      { user: '김영희', rating: 4, comment: '가이드님이 친절했어요.' },
    ],
    seller: {
      name: '하루하루투어',
      contact: 'help@harutour.com',
      description: '25년 경력의 일본 현지 투어 전문 업체. 믿을 수 있는 여행 파트너!'
    }
  },
  {
    id: '2',
    title: '에버랜드 입장권',
    thumbnail: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=600&q=80',
    price: 48000,
    discountPrice: 42000,
    comment: '국내 최대 규모의 테마파크 에버랜드에서 온 가족이 함께 즐길 수 있는 특별한 시간을 보내세요. 스릴 넘치는 롤러코스터부터 귀여운 동물들과의 만남까지, 모든 연령대가 즐길 수 있는 다양한 어트랙션과 쇼가 준비되어 있습니다. 특히 봄에는 벚꽃축제, 가을에는 할로윈축제 등 계절별 특별 이벤트도 함께 즐기실 수 있어요.',
    options: ['1일권', '2일권'],
    dates: ['2024-06-15', '2024-06-16'],
    like: false,
    hashtags: ['#테마파크', '#가족여행', '#어드벤처', '#엔터테인먼트'],
    reviews: [],
    seller: {
      name: '에버랜드 공식',
      contact: 'info@everland.com',
      description: '국내 최대 테마파크, 에버랜드 공식 판매처.'
    }
  },
  {
    id: '3',
    title: '한강 유람선',
    thumbnail: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=600&q=80',
    price: 25000,
    discountPrice: null,
    comment: '서울의 아름다운 한강을 유람선에서 감상하는 특별한 경험을 선사합니다. 주간에는 한강의 푸른 물과 주변의 녹지, 야간에는 반짝이는 서울의 야경을 만끽할 수 있어요. 특히 저녁 시간대의 유람선은 로맨틱한 분위기로 연인들의 데이트 코스로도 인기가 높습니다. 선상에서 즐기는 음악 공연과 함께 특별한 추억을 만들어보세요.',
    options: ['주간', '야간'],
    dates: ['2024-06-20', '2024-06-21'],
    like: false,
    hashtags: ['#크루즈', '#야경투어', '#로맨틱', '#힐링'],
    reviews: [
      { user: '이민수', rating: 4, comment: '야경이 정말 멋졌어요.' },
    ],
    seller: {
      name: '한강크루즈',
      contact: 'cruise@hangang.com',
      description: '서울 대표 유람선 서비스, 한강크루즈.'
    }
  }
];

const CommerceBeforePayment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const product = dummyProducts.find(p => p.id === id);

  // URL 파라미터에서 전달받은 값들
  const searchParams = new URLSearchParams(location.search);
  const initialDate = searchParams.get('date') || product?.dates[0] || '';
  const initialOption = searchParams.get('option') || product?.options[0] || '';

  // 상태 관리
  const [selectedDate, setSelectedDate] = useState(initialDate);
  const [selectedOption, setSelectedOption] = useState(initialOption);
  const [count, setCount] = useState(1);
  const [isLiked, setIsLiked] = useState(product?.like || false);

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const handlePayment = () => {
    // 결제 페이지로 이동하면서 선택된 정보 전달
    navigate(`/commerce/${id}/payment?date=${selectedDate}&option=${selectedOption}&count=${count}`);
  };

  const handleBack = () => {
    // 상품 상세 페이지로 돌아가기
    navigate(`/commerce/${id}`);
  };

  if (!product) {
    return <div>상품을 찾을 수 없습니다.</div>;
  }

  const finalPrice = product.discountPrice || product.price;
  const totalPrice = finalPrice * count;

  return (
    <section className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">예약 정보 확인</h1>
        <button
          onClick={handleBack}
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          ← 상품 상세로 돌아가기
        </button>
      </div>

      {/* 상품 정보 요약 */}
      <div className="flex gap-6 mb-8 p-4 bg-gray-50 rounded-lg">
        <img 
          src={product.thumbnail} 
          alt={product.title} 
          className="w-24 h-24 object-cover rounded-lg"
        />
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">{product.title}</h2>
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
        <button
          onClick={toggleLike}
          className={`p-2 rounded-full transition-colors ${
            isLiked 
              ? 'bg-red-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-red-50 border'
          }`}
        >
          {isLiked ? (
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          )}
        </button>
      </div>

      {/* 예약 옵션 선택 */}
      <div className="space-y-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900">예약 옵션 선택</h3>
        
        {/* 날짜 선택 */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">날짜 선택</label>
          <select 
            value={selectedDate} 
            onChange={e => setSelectedDate(e.target.value)} 
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {product.dates.map(date => (
              <option key={date} value={date}>
                {new Date(date).toLocaleDateString('ko-KR', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  weekday: 'long'
                })}
              </option>
            ))}
          </select>
        </div>

        {/* 옵션 선택 */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">옵션 선택</label>
          <select 
            value={selectedOption} 
            onChange={e => setSelectedOption(e.target.value)} 
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {product.options.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        {/* 인원 선택 */}
        <div className="flex flex-col gap-2">
          <label className="font-medium text-gray-700">인원 선택</label>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCount(c => Math.max(1, c - 1))} 
                className="w-10 h-10 rounded-lg bg-gray-200 text-lg hover:bg-gray-300 transition-colors"
              >
                -
              </button>
              <span className="w-12 text-center text-lg font-medium text-gray-900">{count}</span>
              <button 
                onClick={() => setCount(c => c + 1)} 
                className="w-10 h-10 rounded-lg bg-gray-200 text-lg hover:bg-gray-300 transition-colors"
              >
                +
              </button>
            </div>
            <span className="text-gray-600">명</span>
          </div>
        </div>
      </div>

      {/* 예약 정보 요약 */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">예약 정보 요약</h3>
        <div className="space-y-3 text-gray-700">
          <div className="flex justify-between">
            <span>선택한 날짜:</span>
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
            <span>선택한 옵션:</span>
            <span className="font-medium">{selectedOption}</span>
          </div>
          <div className="flex justify-between">
            <span>인원:</span>
            <span className="font-medium">{count}명</span>
          </div>
          <div className="flex justify-between">
            <span>1인당 가격:</span>
            <span className="font-medium">{finalPrice.toLocaleString()}원</span>
          </div>
          <div className="border-t pt-3 mt-3">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>총 결제 금액:</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
          </div>
        </div>
      </div>

      {/* 버튼 */}
      <div className="flex gap-4 justify-end">
        <button
          onClick={handleBack}
          className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          뒤로가기
        </button>
        <button
          onClick={handlePayment}
          className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          결제하기
        </button>
      </div>
    </section>
  );
};

export default CommerceBeforePayment; 