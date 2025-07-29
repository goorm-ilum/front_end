import React, { useState } from 'react';

// 별점 표시용 컴포넌트 (5점 만점)
const StarRating = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const emptyStars = 5 - fullStars;
  return (
    <div className="flex text-yellow-400">
      {[...Array(fullStars)].map((_, i) => (
        <svg
          key={`full-${i}`}
          className="w-5 h-5 fill-current"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.561-.955L10 0l2.949 5.955 6.561.955-4.755 4.635 1.123 6.545z" />
        </svg>
      ))}
      {[...Array(emptyStars)].map((_, i) => (
        <svg
          key={`empty-${i}`}
          className="w-5 h-5 fill-gray-300"
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.49 6.91l6.561-.955L10 0l2.949 5.955 6.561.955-4.755 4.635 1.123 6.545z" />
        </svg>
      ))}
    </div>
  );
};

const mockReviews = [
  {
    id: 1,
    thumbnail: 'https://placehold.co/100x100?text=상품1',
    title: '오사카 3박 4일 자유여행 패키지',
    rating: 5,
    content: '정말 최고의 여행이었어요! 가이드도 친절하고 숙소도 만족스러웠습니다.',
    reviewImage: 'https://placehold.co/150x100?text=리뷰이미지1',
  },
  {
    id: 2,
    thumbnail: 'https://placehold.co/100x100?text=상품2',
    title: '제주도 렌터카 포함 2박 3일 숙박패키지',
    rating: 4,
    content: '렌터카가 좀 낡았지만 여행 자체는 즐거웠어요.',
    reviewImage: '',
  },
  {
    id: 3,
    thumbnail: 'https://placehold.co/100x100?text=상품3',
    title: '스위스 알프스 기차여행 7박 8일',
    rating: 3,
    content: '경치는 정말 멋졌지만 일정이 조금 빡빡했어요.',
    reviewImage: 'https://placehold.co/150x100?text=리뷰이미지3',
  },
  {
    id: 4,
    thumbnail: 'https://placehold.co/100x100?text=상품4',
    title: '태국 푸켓 리조트 숙박 패키지',
    rating: 5,
    content: '리조트가 너무 좋아서 계속 머물고 싶었어요.',
    reviewImage: '',
  },
  {
    id: 5,
    thumbnail: 'https://placehold.co/100x100?text=상품5',
    title: '부산 1박 2일 기차여행',
    rating: 2,
    content: '조금 아쉬웠지만 가격 대비 괜찮았습니다.',
    reviewImage: '',
  },
  {
    id: 6,
    thumbnail: 'https://placehold.co/100x100?text=상품6',
    title: '유럽 배낭여행 14박 15일',
    rating: 4,
    content: '배낭여행 답게 자유로웠고 많은 추억이 생겼어요.',
    reviewImage: 'https://placehold.co/150x100?text=리뷰이미지6',
  },
];

const ITEMS_PER_PAGE = 5;

const MyReview = () => {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(mockReviews.length / ITEMS_PER_PAGE);
  const paginatedReviews = mockReviews.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">내가 작성한 리뷰</h1>

      {paginatedReviews.map(review => (
        <div
          key={review.id}
          className="border rounded-lg p-4 mb-6 shadow-sm flex gap-4"
        >
          {/* 썸네일 */}
          <img
            src={review.thumbnail}
            alt={review.title}
            className="w-24 h-24 rounded object-cover"
          />

          {/* 리뷰 내용 */}
          <div className="flex-1 flex flex-col justify-between">
            <div>
              <div className="text-lg font-semibold mb-1">{review.title}</div>
              <StarRating rating={review.rating} />
              <p className="mt-2 text-gray-700 whitespace-pre-line">{review.content}</p>
            </div>

            {/* 리뷰 이미지 */}
            {review.reviewImage && (
              <img
                src={review.reviewImage}
                alt="리뷰 이미지"
                className="mt-4 max-w-xs rounded"
              />
            )}

            {/* 버튼들 */}
            <div className="mt-4 flex gap-3">
              <button className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                수정
              </button>
              <button className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 text-sm">
                삭제
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

export default MyReview;
