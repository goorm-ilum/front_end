import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';

const dummyProducts = [
  {
    id: '1',
    title: '서울 시티 투어',
    thumbnail: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80',
    price: 28000,
    description: '서울의 주요 명소를 둘러보는 투어입니다. 전문 가이드와 함께 서울의 역사와 문화를 체험하세요.',
    options: ['오전 출발', '오후 출발'],
    dates: ['2024-06-10', '2024-06-11', '2024-06-12'],
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
    description: '에버랜드 자유이용권 티켓. 온 가족이 즐길 수 있는 테마파크!',
    options: ['1일권', '2일권'],
    dates: ['2024-06-15', '2024-06-16'],
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
    description: '한강에서 즐기는 유람선 체험. 서울의 야경을 만끽하세요.',
    options: ['주간', '야간'],
    dates: ['2024-06-20', '2024-06-21'],
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

  if (!product) {
    return <div>상품을 찾을 수 없습니다.</div>;
  }

  return (
    <section className="max-w-3xl mx-auto p-6 bg-white rounded-lg shadow flex flex-col gap-8">
      {/* 상품 정보 */}
      <div className="flex flex-col md:flex-row gap-8">
        <img src={product.thumbnail} alt={product.title} className="w-full md:w-72 h-56 object-cover rounded-lg border" />
        <div className="flex-1 flex flex-col gap-4">
          <h2 className="text-3xl font-bold">{product.title}</h2>
          <div className="text-xl text-blue-600 font-semibold">{product.price.toLocaleString()}원~</div>
          <div className="flex gap-4 items-center">
            <label className="font-medium">날짜</label>
            <select value={selectedDate} onChange={e => setSelectedDate(e.target.value)} className="border rounded px-2 py-1">
              {product.dates.map(date => (
                <option key={date} value={date}>{date}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 items-center">
            <label className="font-medium">옵션</label>
            <select value={selectedOption} onChange={e => setSelectedOption(e.target.value)} className="border rounded px-2 py-1">
              {product.options.map(option => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-4 items-center">
            <label className="font-medium">인원</label>
            <div className="flex items-center gap-2">
              <button onClick={() => setCount(c => Math.max(1, c - 1))} className="w-8 h-8 rounded bg-gray-200 text-lg">-</button>
              <span className="w-8 text-center">{count}</span>
              <button onClick={() => setCount(c => c + 1)} className="w-8 h-8 rounded bg-gray-200 text-lg">+</button>
            </div>
          </div>
          <button
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 w-fit"
            onClick={() => navigate(`payment`)}
          >
            결제하기
          </button>
        </div>
      </div>

      {/* 상품 설명 */}
      <div>
        <h3 className="text-xl font-semibold mb-2">상품 설명</h3>
        <div className="text-gray-700 whitespace-pre-line">{product.description}</div>
      </div>

      {/* 리뷰 목록 */}
      <div>
        <h3 className="text-xl font-semibold mb-2">상품 후기</h3>
        <ul className="flex flex-col gap-2">
          {product.reviews.length === 0 ? (
            <li className="text-gray-400">아직 후기가 없습니다.</li>
          ) : (
            product.reviews.map((review, idx) => (
              <li key={idx} className="border-b py-2 flex flex-col gap-1">
                <span className="font-medium">{review.user} <span className="text-yellow-400">{'★'.repeat(review.rating)}</span></span>
                <span className="text-gray-700">{review.comment}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* 판매자 정보 */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-t pt-4">
        <div>
          <div className="font-semibold">판매자: {product.seller.name}</div>
          <div className="text-gray-600 text-sm">{product.seller.description}</div>
          <div className="text-gray-500 text-xs">문의: {product.seller.contact}</div>
        </div>
        <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 w-fit">판매자에게 메시지 보내기</button>
      </div>
    </section>
  );
};

export default CommerceDetail;
