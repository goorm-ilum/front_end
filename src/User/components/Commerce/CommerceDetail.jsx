import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';

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
    images: [
      'https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1578662996442-48f60103fc96?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1566576912321-d58ddd7a6088?auto=format&fit=crop&w=800&q=80'
    ],
    options: ['1일권', '2일권'],
    dates: ['2024-06-15', '2024-06-16'],
    like: false,
    hashtags: ['#테마파크', '#가족여행', '#어드벤처', '#엔터테인먼트'],
    reviews: [
    ],
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
    images: [
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=800&q=80'
    ],
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

const CommerceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = dummyProducts.find(p => p.id === id);

  // 상태 관리
  const [selectedDate, setSelectedDate] = useState(product?.dates[0] || '');
  const [selectedOption, setSelectedOption] = useState(product?.options[0] || '');
  const [count, setCount] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isLiked, setIsLiked] = useState(product?.like || false);

  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  if (!product) {
    return <div>상품을 찾을 수 없습니다.</div>;
  }

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
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{product.title}</h2>
          <div className="mb-3">
            {product.discountPrice ? (
              <div>
                <span className="text-gray-400 line-through text-lg">{product.price.toLocaleString()}원</span>
                <div className="text-2xl text-red-600 font-semibold">{product.discountPrice.toLocaleString()}원~</div>
              </div>
            ) : (
              <div className="text-2xl text-blue-600 font-semibold">{product.price.toLocaleString()}원~</div>
            )}
          </div>
          
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
        </div>
        
        <div className="flex flex-col gap-4">
          <div className="flex gap-4 items-center">
            <label className="font-medium text-gray-700">날짜</label>
            <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border rounded px-2 py-1">
              {product.dates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 items-center">
            <label className="font-medium text-gray-700">옵션</label>
            <select value={selectedOption} onChange={e => setSelectedOption(e.target.value)} className="border rounded px-2 py-1">
              {product.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          {/* <div className="flex gap-4 items-center">
            <label className="font-medium text-gray-700">인원</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setCount(c => Math.max(1, c - 1))} className="w-8 h-8 rounded bg-gray-200 text-lg">-</button>
              <span className="w-8 text-center text-gray-900">{count}</span>
              <button onClick={() => setCount(c => c + 1)} className="w-8 h-8 rounded bg-gray-200 text-lg">+</button>
            </div>
          </div> */}
        </div>
        
        <div className="flex gap-3">
          <button
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
            onClick={() => navigate(`/commerce/${id}/before-payment?date=${selectedDate}&option=${selectedOption}`)}
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
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-fit">판매자에게 메시지 보내기</button>
      </div>
    </section>
  );
};

export default CommerceDetail;
