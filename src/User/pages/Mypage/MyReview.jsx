import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyReviews, deleteReview } from '../../../common/api/productApi';
import Pagination from '../../../common/util/Pagination';

const MyReview = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 페이지네이션 설정
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 5;

  // 리뷰 목록 조회
  const loadReviews = async (pageNum = 0) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getMyReviews({
        page: pageNum,
        size: itemsPerPage
      });
      
      console.log('리뷰 목록 API 응답:', data);
      
      if (data.content) {
        setReviews(data.content);
        setTotalItems(data.totalElements || 0);
      } else if (Array.isArray(data)) {
        setReviews(data);
        setTotalItems(data.length);
      } else {
        setReviews([]);
        setTotalItems(0);
      }
      
    } catch (err) {
      console.error('리뷰 목록 조회 오류:', err);
      if (err.message === '로그인이 필요합니다.') {
        alert('로그인이 필요합니다.');
        navigate('/');
        return;
      }
      setError(err.message);
      setReviews([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadReviews(0);
  }, [navigate]);

  // 페이지 변경 시 API 호출
  const handlePageChange = (newPage) => {
    setPage(newPage);
    const pageIndex = newPage - 1;
    loadReviews(pageIndex);
  };

  // 리뷰 수정 페이지로 이동
  const handleEditReview = (reviewId) => {
    navigate(`/mypage/review/edit/${reviewId}`);
  };

  // 리뷰 삭제
  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('정말로 이 리뷰를 삭제하시겠습니까?')) {
      return;
    }

    try {
      await deleteReview(reviewId);

      // 성공적으로 삭제된 경우 목록에서 제거
      setReviews(prevReviews => prevReviews.filter(review => review.reviewId !== reviewId));
      setTotalItems(prev => prev - 1);
      
      // 페이지가 비어있고 이전 페이지가 있다면 이전 페이지로 이동
      if (reviews.length === 1 && page > 1) {
        const newPage = page - 1;
        setPage(newPage);
        loadReviews(newPage - 1);
      }
      
      alert('리뷰가 삭제되었습니다.');
      
    } catch (err) {
      console.error('리뷰 삭제 오류:', err);
      alert('리뷰 삭제에 실패했습니다.');
    }
  };

  // 상품 상세 페이지로 이동
  const handleProductClick = (productId) => {
    navigate(`/commerce/detail/${productId}`);
  };

  // 별점 렌더링
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-5 h-5 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      );
    }
    return stars;
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return '날짜 없음';
    
    try {
      let date;
      
      if (Array.isArray(dateString)) {
        const [year, month, day, hour = 0, minute = 0, second = 0] = dateString;
        date = new Date(year, month - 1, day, hour, minute, second);
      } else if (typeof dateString === 'string') {
        date = new Date(dateString);
      } else {
        date = new Date(dateString);
      }
      
      if (isNaN(date.getTime())) {
        return '날짜 오류';
      }
      
      return date.toLocaleDateString('ko-KR');
    } catch (error) {
      return '날짜 오류';
    }
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">리뷰 목록을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center py-8">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => loadReviews(0)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            내가 작성한 리뷰
          </h1>
          <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto rounded-full"></div>
          <p className="text-gray-600 mt-4">상품에 대한 나의 솔직한 후기를 확인하세요</p>
        </div>

        {reviews.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-gray-400 mb-6">
              <svg className="mx-auto h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
            <h3 className="text-2xl font-medium text-gray-900 mb-3">아직 작성한 리뷰가 없어요</h3>
            <p className="text-gray-500 mb-8">구매한 상품에 대한 솔직한 후기를 남겨보세요!</p>
            <button
              onClick={() => navigate('/commerce')}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-lg"
            >
              쇼핑하러 가기
            </button>
          </div>
        ) : (
          <>
            {/* 리뷰 목록 */}
            <div className="space-y-6 mb-8">
              {reviews.map((review) => (
                <div
                  key={review.reviewId}
                  className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 hover:shadow-2xl transition-all duration-300"
                >
                  {/* 리뷰 헤더 */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-gray-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-md">
                        {review.thumbnailImageUrl ? (
                          <img
                            src={review.thumbnailImageUrl}
                            alt={review.productName}
                            className="w-full h-full object-cover cursor-pointer"
                            onClick={() => handleProductClick(review.productId)}
                          />
                        ) : (
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        )}
                      </div>
                      
                      <div>
                        <h3 
                          className="text-lg font-semibold text-gray-800 mb-1 cursor-pointer hover:text-blue-600 transition-colors duration-200"
                          onClick={() => handleProductClick(review.productId)}
                        >
                          {review.productName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="flex">
                            {renderStars(review.reviewStar)}
                          </div>
                          <span className="text-sm text-gray-600 ml-2">
                            {review.reviewStar}/5
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          {review.nickName || '익명'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-sm text-gray-500 mb-1">
                        {formatDate(review.updatedAt)}
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditReview(review.reviewId)}
                          className="px-3 py-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm rounded-lg hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg transition-all duration-300"
                        >
                          수정
                        </button>
                                                 <button
                           onClick={() => handleDeleteReview(review.reviewId)}
                           className="px-3 py-1 bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm rounded-lg hover:from-red-600 hover:to-pink-600 shadow-md hover:shadow-lg transition-all duration-300"
                         >
                           삭제
                         </button>
                      </div>
                    </div>
                  </div>

                  {/* 리뷰 내용 */}
                  <div className="mb-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <p className="text-gray-800 leading-relaxed">
                        {review.comment || '리뷰 내용이 없습니다.'}
                      </p>
                    </div>
                  </div>

                  {/* 리뷰 이미지 */}
                  {review.reviewImages && review.reviewImages.length > 0 && (
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-2">첨부 이미지</h4>
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        {review.reviewImages.map((image, index) => (
                          <div key={index} className="flex-shrink-0">
                            <img
                              src={image}
                              alt={`리뷰 이미지 ${index + 1}`}
                              className="w-20 h-20 rounded-lg object-cover border-2 border-white shadow-md"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* 페이지네이션 */}
            {totalItems > itemsPerPage && (
              <div className="flex justify-center">
                <Pagination
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  currentPage={page}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default MyReview;
