import { useNavigate } from 'react-router-dom';
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
      { user: '박철수', rating: 5, comment: '아이들과 좋은 추억 만들었어요.' },
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
  },
];

const CommerceList = () => {
  const navigate = useNavigate();
  // 검색어 상태 추가
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [sort, setSort] = useState("latest");

  // 페이지네이션 가안
  const [page, setPage] = useState(1);
  const totalPages = 5;

  // 검색 필터링 (간단히 제목/설명에 검색어 포함 여부)
  const filteredProducts = dummyProducts.filter(product =>
    (!search || product.title.includes(search) || product.description.includes(search)) &&
    (!date || product.dates.includes(date))
  );

  return (
    <section className="flex flex-col gap-6 items-stretch">
      <h2 className="text-2xl font-bold mb-2 text-left">투어 상품 목록</h2>
      {/* 필터 영역 */}
      <div className="flex flex-col gap-2 mb-4 w-full max-w-lg">
        <div className="flex flex-col">
          <label className="block text-sm mb-1">언제 이용하시나요?</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="p-2 border rounded w-full"
            placeholder="날짜 선택"
          />
        </div>
        <div className="flex flex-col mt-2">
          <label className="block text-sm mb-1">어떤 상품을 찾고 계신가요?</label>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="어디로, 무엇을 찾으시나요?"
            className="p-2 border rounded w-full"
          />
        </div>
        <button
          className="mt-4 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 w-full"
          style={{ minWidth: '80px' }}
        >
          조회
        </button>
      </div>
      {/* 카드 리스트 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {filteredProducts.map(product => (
          <div
            key={product.id}
            className="border rounded-lg shadow hover:shadow-lg transition cursor-pointer flex flex-col"
            onClick={() => navigate(`${product.id}`)}
          >
            <img src={product.thumbnail} alt="썸네일" className="w-full h-40 object-cover rounded-t-lg bg-gray-100" />
            <div className="p-4 flex-1 flex flex-col justify-between">
              <div>
                <div className="text-lg font-semibold mb-1">{product.title}</div>
                <div className="text-gray-600 text-sm mb-2">{product.description}</div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-yellow-500 font-bold">★ {product.reviews && product.reviews.length > 0 ? (product.reviews.reduce((acc, cur) => acc + cur.rating, 0) / product.reviews.length).toFixed(1) : '-'}</span>
                <span className="text-blue-700 font-bold">{product.price.toLocaleString()}원</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* 페이지네이션 */}
      <div className="flex justify-center items-center gap-2 mt-6">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">이전</button>
        {[...Array(totalPages)].map((_, idx) => (
          <button
            key={idx}
            onClick={() => setPage(idx + 1)}
            className={`px-3 py-1 border rounded ${page === idx + 1 ? 'bg-blue-600 text-white' : ''}`}
          >
            {idx + 1}
          </button>
        ))}
        <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 border rounded disabled:opacity-50">다음</button>
      </div>
    </section>
  );
};

export default CommerceList;
