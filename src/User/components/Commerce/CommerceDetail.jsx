import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import React from 'react'; // Added missing import for React

const dummyProducts = [
  {
    id: '1',
    title: '서울 시티 투어',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    price: 28000,
    discountPrice: 22000,
    comment: '서울의 대표 명소들을 전문 가이드와 함께 둘러보는 프리미엄 시티 투어입니다. 경복궁, 남산타워, 홍대거리 등 서울의 핵심 관광지를 효율적으로 탐방하며, 한국의 역사와 현대 문화를 동시에 체험할 수 있습니다. 편안한 전용 차량과 친절한 가이드가 함께하여 최고의 서울 여행 경험을 제공합니다.',
    images: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517154421773-0529f29ea451?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1538485399081-7c8eddf95c93?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80'
    ],
    options: [
      { name: '오전 출발', price: 28000, discountPrice: 22000 },
      { name: '오후 출발', price: 30000, discountPrice: 24000 }
    ],
    dates: ['2024-06-10', '2024-06-11', '2024-06-12'],
    like: false,
    likeCount: 156,
    location: '대한민국',
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
  }
];

const CommerceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = dummyProducts.find(p => p.id === id);

  // 상태 관리
  const [selectedDate, setSelectedDate] = useState(product?.dates[0] || '');
  const [selectedOption, setSelectedOption] = useState(product?.options[0]?.name || '');
  const [optionCounts, setOptionCounts] = useState({});
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(product?.like || false);

  // 초기 옵션별 수량 설정
  React.useEffect(() => {
    const initialCounts = {};
    product?.options.forEach(option => {
      initialCounts[option.name] = 0;
    });
    setOptionCounts(initialCounts);
  }, [product]);

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  const updateOptionCount = (optionName, change) => {
    setOptionCounts(prev => ({
      ...prev,
      [optionName]: Math.max(0, (prev[optionName] || 0) + change),
    }));
  };

  if (!product) {
    return <div>상품을 찾을 수 없습니다.</div>;
  }

  const selectedOptionData = product.options.find(opt => opt.name === selectedOption);
  const totalCount = Object.values(optionCounts).reduce((sum, count) => sum + count, 0);
  const totalPrice = product.options.reduce((sum, option) => {
    const count = optionCounts[option.name] || 0;
    return sum + ((option.discountPrice || option.price) * count);
  }, 0);

  return (
    <section className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow flex flex-col gap-8">
      {/* 썸네일 이미지 */}
      <div className="relative">
        <img 
          src={product.thumbnail} 
          alt={product.title} 
          className="w-full h-96 object-cover rounded-lg shadow-lg"
        />
        {/* 좋아요 버튼 */}
        <button
          onClick={toggleLike}
          className={`absolute top-4 right-4 p-2 rounded-full transition-colors ${
            isLiked 
              ? 'bg-red-500 text-white' 
              : 'bg-white text-gray-600 hover:bg-red-50'
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

      {/* 상품 정보 */}
      <div className="flex flex-col gap-4">
        <div>       
          {/* 해시태그 */}
          {product.hashtags && product.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {product.hashtags.map((tag, index) => (
                <span 
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors cursor-pointer"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          
          {/* 제목과 좋아요, 국가 정보를 한 줄에 배치 */}
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-3xl font-bold text-gray-900">{product.title}</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500 border border-gray-300 rounded-full px-3 py-1">❤️ {product.likeCount}</span>
              <span className="text-sm text-gray-500 border border-gray-300 rounded-full px-3 py-1">📍 {product.location}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">{product.comment}</p>
        </div>
        
        {/* 옵션 선택 섹션 - CommercePayment와 유사한 레이아웃 */}
        <div className="bg-blue-50 p-6 rounded-lg mb-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 날짜 선택 */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">날짜 선택</h4>
              <div className="flex flex-col gap-2">
                <label className="font-medium text-gray-700">투어 날짜</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="border border-gray-300 rounded-lg px-4 py-2 w-full"
                />
              </div>
            </div>

            {/* 옵션 선택 */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-gray-900">옵션 선택</h4>
              <div className="space-y-4">
                {product.options.map((option) => (
                  <div key={option.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                    <div className="flex-1">
                      <h5 className="font-medium text-gray-900">{option.name}</h5>
                      <div className="text-blue-600 font-semibold">
                        {option.discountPrice ? (
                          <div>
                            <span className="text-gray-400 line-through text-sm">{option.price.toLocaleString()}원</span>
                            <div className="text-lg">{option.discountPrice.toLocaleString()}원</div>
                          </div>
                        ) : (
                          <div className="text-lg">{option.price.toLocaleString()}원</div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <button
                        onClick={() => updateOptionCount(option.name, -1)}
                        className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                        disabled={!selectedDate || (optionCounts[option.name] || 0) === 0}
                      >-</button>
                      <span className="w-12 text-center font-medium">{optionCounts[option.name] || 0}</span>
                      <button
                        onClick={() => updateOptionCount(option.name, 1)}
                        className="w-10 h-10 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
                        disabled={!selectedDate}
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 선택된 옵션의 총 가격 표시 */}
          {totalCount > 0 && (
            <div className="mt-6 p-4 bg-white rounded-lg border">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-900">총 결제 금액:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {totalPrice.toLocaleString()}원
                </span>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex gap-3">
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold w-full"
            onClick={() => {
              const selectedOptions = product.options.filter(option => (optionCounts[option.name] || 0) > 0);
              const optionsParam = selectedOptions.map(opt => `${opt.name}:${optionCounts[opt.name]}`).join(',');
              navigate(`/commerce/${id}/payment?date=${selectedDate}&options=${optionsParam}`);
            }}
            disabled={totalCount === 0 || !selectedDate}
          >
            예약진행
          </button>
        </div>
      </div>

      {/* 상품 이미지 갤러리 */}
      <div>
        <h3 className="text-xl font-semibold mb-4 text-gray-900">상품 이미지</h3>
        
        {/* 이미지들 */}
        <div className="flex flex-col gap-4">
          {product.images.map((image, index) => (
            <div key={index}>
              <img 
                src={image} 
                alt={`${product.title} ${index + 1}`}
                className="w-full h-64 object-cover rounded-lg shadow-md"
              />
            </div>
          ))}
        </div>
      </div>

      {/* 리뷰 목록 */}
      <div>
        <h3 className="text-xl font-semibold mb-2 text-gray-900">상품 후기</h3>
        <ul className="flex flex-col gap-2">
          {product.reviews.length === 0 ? (
            <li className="text-gray-400">아직 후기가 없습니다.</li>
          ) : (
            product.reviews.map((review, idx) => (
              <li key={idx} className="border-b py-2 flex flex-col gap-1">
                <span className="font-medium text-gray-900">{review.user} <span className="text-yellow-400">{'★'.repeat(review.rating)}</span></span>
                <span className="text-gray-700">{review.comment}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* 판매자 정보 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t pt-4">
        <div>
          <div className="font-semibold text-gray-900">판매자: {product.seller.name}</div>
          <div className="text-gray-600 text-sm">{product.seller.description}</div>
          <div className="text-gray-500 text-xs">문의: {product.seller.contact}</div>
        </div>
        <button 
          onClick={() => navigate('/chat')}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-fit"
        >
          판매자에게 메시지 보내기
        </button>
      </div>
    </section>
  );
};

export default CommerceDetail;
