import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAdminProductReviews } from '../../../common/api/adminApi';
import MessagePopup from '../../../common/components/MessagePopup';
import Pagination from '../../../common/util/Pagination';

const AdminProductReviewsPage = () => {
  const { productId } = useParams();
  
  // 상태
  const [reviews, setReviews] = useState([]);
  const [productInfo, setProductInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [messageData, setMessageData] = useState({ message: '', type: 'info' });

  // 페이징
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 10;

  // 정렬 상태
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // 리뷰 목록 로드
  const loadReviews = async () => {
    try {
      setLoading(true);
      setError('');
      
      const params = {
        page: currentPage - 1,
        size: itemsPerPage,
        sortBy: sortKey,
        ascending: sortOrder === 'asc'
      };
      
      const response = await getAdminProductReviews(productId, params);
      console.log('리뷰 목록 응답:', response);
      
             const reviewsData = response.content || [];
       setReviews(reviewsData);
       
       // 페이지네이션 정보 설정
       setTotalPages(response.totalPages || 0);
       setTotalItems(response.totalElements || 0);
       
       // 첫 번째 리뷰에서 상품 정보 추출
       if (reviewsData.length > 0) {
         const firstReview = reviewsData[0];
         setProductInfo({
           productName: firstReview.productName,
           thumbnailImageUrl: firstReview.thumbnailImageUrl
         });
       }
    } catch (error) {
      console.error('리뷰 목록 로드 실패:', error);
      
      let errorMessage = '리뷰 목록을 불러오는데 실패했습니다.';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = '로그인이 필요합니다.';
        } else if (status === 403) {
          errorMessage = '관리자 권한이 필요합니다.';
        } else if (status === 404) {
          errorMessage = '상품을 찾을 수 없습니다.';
        } else {
          errorMessage = `서버 오류: ${status}`;
        }
      } else if (error.request) {
        errorMessage = '서버에 연결할 수 없습니다.';
      }
      
      setError(errorMessage);
      setMessageData({ message: errorMessage, type: 'error' });
      setShowMessagePopup(true);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 리뷰 목록 로드
  useEffect(() => {
    loadReviews();
  }, [currentPage, sortKey, sortOrder]);

  // 정렬 변경 핸들러
  const handleSortChange = (newSortKey) => {
    setSortKey(newSortKey);
    setCurrentPage(1);
  };

  // 정렬 순서 변경 핸들러
  const handleSortOrderChange = (newSortOrder) => {
    setSortOrder(newSortOrder);
    setCurrentPage(1);
  };

  // 별점 렌더링 함수
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <svg
          key={i}
          className={`w-4 h-4 ${i <= rating ? 'text-yellow-400' : 'text-gray-300'}`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      );
    }
    return stars;
  };

  // 리뷰 평점에 따른 이모티콘/배경 색상
  const getReviewEmoji = (rating) => {
    if (rating >= 5) return '😍';
    if (rating >= 4) return '😊';
    if (rating >= 3) return '🙂';
    if (rating >= 2) return '🙁';
    if (rating >= 1) return '😡';
    return '💬';
  };

  const getReviewEmojiClass = (rating) => {
    if (rating >= 5) return 'bg-pink-100 text-pink-600';
    if (rating >= 4) return 'bg-green-100 text-green-600';
    if (rating >= 3) return 'bg-blue-100 text-blue-600';
    if (rating >= 2) return 'bg-yellow-100 text-yellow-700';
    if (rating >= 1) return 'bg-red-100 text-red-600';
    return 'bg-gray-200 text-gray-600';
  };

  if (loading) {
    return <div className="p-6 text-center">로딩중…</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-7xl mx-auto px-4 space-y-8">
      {/* 메시지 팝업 */}
      <MessagePopup
        isOpen={showMessagePopup}
        onClose={() => setShowMessagePopup(false)}
        message={messageData.message}
        type={messageData.type}
      />

      {/* 페이지 제목 */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">상품 리뷰 관리</h1>
        <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mt-4 rounded-full"></div>
        <div className="mt-4">
          <Link
            to="/admin/products"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span>상품 목록으로</span>
          </Link>
        </div>
      </div>

      {/* 상품 정보 섹션 */}
      {productInfo && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900">상품 정보</h3>
          </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="flex items-center space-x-3">
               <img
                 src={productInfo.thumbnailImageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'}
                 alt={productInfo.productName}
                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                 onError={(e) => {
                   e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
                 }}
               />
               <div>
                 <h4 className="font-medium text-gray-900">{productInfo.productName}</h4>
               </div>
             </div>
             <div>
               <p className="text-sm text-gray-500">총 리뷰 수</p>
               <p className="font-medium text-gray-900">{totalItems}개</p>
             </div>
           </div>
        </div>
      )}

      {/* 정렬 섹션 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-8 h-8 bg-gradient-to-r from-gray-500 to-gray-700 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">정렬 옵션</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">정렬 기준</label>
            <select
              value={sortKey}
              onChange={e => handleSortChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50"
            >
              <option value="createdAt">등록일순</option>
              <option value="rating">별점순</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">정렬 순서</label>
            <select
              value={sortOrder}
              onChange={e => handleSortOrderChange(e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50/50"
            >
              <option value="desc">내림차순</option>
              <option value="asc">오름차순</option>
            </select>
          </div>
        </div>
      </div>

      {/* 리뷰 목록 섹션 */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900">리뷰 목록</h3>
        </div>

        {/* 리뷰 목록 */}
        <div className="space-y-6">
          {reviews.length > 0 ? (
            reviews.map((review, index) => (
              <div key={`review-${review.id}-${index}`} className="border border-gray-200 rounded-lg p-6 bg-white/40 hover:bg-gradient-to-r hover:from-blue-50/60 hover:to-purple-50/60 transition-all duration-300">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${getReviewEmojiClass(review.reviewStar || 0)}`}>
                      {getReviewEmoji(review.reviewStar || 0)}
                    </div>
                                         <div>
                       <p className="font-medium text-gray-900">{review.nickName || '익명'}</p>
                       <p className="text-sm text-gray-500">
                         {review.updatedAt ? new Date(review.updatedAt).toLocaleDateString('ko-KR') : '-'}
                       </p>
                     </div>
                   </div>
                   <div className="flex items-center space-x-1">
                     {renderStars(review.reviewStar || 0)}
                     <span className="text-sm text-gray-600 ml-2">({review.reviewStar || 0}/5)</span>
                   </div>
                 </div>
                 
                 <div className="mb-4">
                   <p className="text-gray-700 leading-relaxed">{review.comment || '내용이 없습니다.'}</p>
                 </div>

                {/* 리뷰 이미지가 있다면 표시 */}
                {review.reviewImages && review.reviewImages.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-500 mb-2">첨부 이미지:</p>
                    <div className="flex space-x-2 overflow-x-auto">
                      {review.reviewImages.map((image, imgIndex) => (
                        <img
                          key={imgIndex}
                          src={image}
                          alt={`리뷰 이미지 ${imgIndex + 1}`}
                          className="w-20 h-20 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                                 {/* 리뷰 메타 정보 */}
                 <div className="flex items-center justify-between text-sm text-gray-500">
                   <div className="flex items-center space-x-4">
                     {/* 리뷰 ID 숨김 */}
                   </div>
                 </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="flex flex-col items-center space-y-4">
                <svg className="w-16 h-16 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-lg font-medium text-gray-900">아직 리뷰가 없습니다.</p>
                  <p className="text-sm text-gray-500">이 상품에 대한 첫 번째 리뷰를 기다리고 있습니다.</p>
                </div>
              </div>
            </div>
          )}
        </div>

                 {/* 페이지네이션 */}
      {totalItems > 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-6 mt-6">
          <div className="flex items-center justify-center">
            <Pagination
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
              className="pagination-modern"
            />
          </div>
        </div>
      )}
    </div>
      </div>
    </div>
  );
};

export default AdminProductReviewsPage;
