import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyReviews, updateReview, deleteReview } from '../../../common/api/productApi';
import Pagination from '../../../common/Pagination';
import MessagePopup from '../../../common/components/MessagePopup';
import ConfirmPopup from '../../../common/components/ConfirmPopup';

const MyReview = () => {
  const navigate = useNavigate();
  
  // 상태 관리
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showMessagePopup, setShowMessagePopup] = useState(false);
  const [messageData, setMessageData] = useState({ message: '', type: 'info' });
  const [showConfirmPopup, setShowConfirmPopup] = useState(false);
  const [confirmData, setConfirmData] = useState({ message: '', onConfirm: null });
  
  // 페이지네이션 설정
  const [page, setPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 9;

  // 내 리뷰 목록 로드
  const loadMyReviews = async (pageNum = 0) => {
    setLoading(true);
    setError('');
    
    try {
      console.log('내 리뷰 목록 조회 중...', { page: pageNum, size: itemsPerPage });
      const response = await getMyReviews({
        page: pageNum,
        size: itemsPerPage
      });
      
      console.log('내 리뷰 목록 응답:', response);
      
      // 백엔드 응답 구조에 맞게 데이터 변환
      if (Array.isArray(response)) {
        const transformedReviews = response.map(review => ({
          id: review.reviewId,
          productName: review.productName,
          thumbnailImageUrl: review.thumbnailImageUrl,
          content: review.comment,
          rating: review.reviewStar,
          updatedAt: review.updatedAt
        }));
        setReviews(transformedReviews);
        setTotalItems(transformedReviews.length);
      } else if (response.content) {
        const transformedReviews = response.content.map(review => ({
          id: review.reviewId,
          productName: review.productName,
          thumbnailImageUrl: review.thumbnailImageUrl,
          content: review.comment,
          rating: review.reviewStar,
          updatedAt: review.updatedAt
        }));
        setReviews(transformedReviews);
        setTotalItems(response.totalElements || transformedReviews.length);
      } else {
        setReviews([]);
        setTotalItems(0);
      }
      
    } catch (error) {
      console.error('내 리뷰 목록 조회 실패:', error);
      
      let errorMessage = '내 리뷰 목록을 불러오는데 실패했습니다.';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = '로그인이 필요합니다. 로그인 후 다시 시도해주세요.';
        } else if (status === 404) {
          errorMessage = '리뷰 목록을 찾을 수 없습니다.';
        } else {
          errorMessage = `서버 오류: ${status}`;
        }
      } else if (error.request) {
        errorMessage = '서버에 연결할 수 없습니다.';
      }
      
      setMessageData({ message: errorMessage, type: 'error' });
      setShowMessagePopup(true);
      setReviews([]);
      setTotalItems(0);
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 리뷰 목록 로드
  useEffect(() => {
    loadMyReviews(0);
  }, []);

  // 페이지 변경 시 API 호출
  const handlePageChange = (newPage) => {
    setPage(newPage);
    const pageIndex = newPage - 1;
    loadMyReviews(pageIndex);
  };

  // 리뷰 수정 핸들러
  const handleEditReview = (review) => {
    console.log('리뷰 수정:', review.id);
    
    // 리뷰 수정 페이지로 이동 (reviewId만 필요)
    navigate(`/mypage/review/edit/${review.id}`);
  };

  // 리뷰 삭제 확인 핸들러
  const handleDeleteConfirm = (reviewId) => {
    setConfirmData({
      message: '정말로 이 리뷰를 삭제하시겠습니까?',
      onConfirm: () => performDeleteReview(reviewId)
    });
    setShowConfirmPopup(true);
  };

  // 실제 리뷰 삭제 실행
  const performDeleteReview = async (reviewId) => {
    try {
      console.log('리뷰 삭제 중...', reviewId);
      
      // 백엔드에 삭제 요청
      await deleteReview(reviewId);
      console.log('리뷰 삭제 완료');
      
      // 성공 메시지 표시
      setMessageData({ message: '리뷰가 삭제되었습니다.', type: 'success' });
      setShowMessagePopup(true);
      
      // 리뷰 목록 새로고침
      loadMyReviews(page - 1);
      
    } catch (error) {
      console.error('리뷰 삭제 실패:', error);
      
      let errorMessage = '리뷰 삭제 중 오류가 발생했습니다.';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = '로그인이 필요합니다. 로그인 후 다시 시도해주세요.';
        } else if (status === 404) {
          errorMessage = '리뷰를 찾을 수 없습니다.';
        } else if (status === 403) {
          errorMessage = '리뷰를 삭제할 권한이 없습니다.';
        } else {
          errorMessage = `서버 오류: ${status}`;
        }
      } else if (error.request) {
        errorMessage = '서버에 연결할 수 없습니다.';
      }
      
      setMessageData({ message: errorMessage, type: 'error' });
      setShowMessagePopup(true);
    }
  };

  // 별점 표시 컴포넌트
  const StarRating = ({ rating }) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, index) => (
          <svg
            key={index}
            className={`w-4 h-4 ${
              index < rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">내가 작성한 리뷰</h2>
        <p className="text-gray-600">내가 작성한 리뷰들을 확인하세요</p>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">리뷰 목록을 불러오는 중...</p>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* 리뷰 목록이 비어있는 경우 */}
      {!loading && !error && reviews.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">아직 작성한 리뷰가 없습니다</h3>
          <p className="text-gray-500 mb-4">상품을 구매하고 리뷰를 작성해보세요!</p>
          <button
            onClick={() => navigate('/commerce')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            상품 둘러보기
          </button>
        </div>
      )}

      {/* 리뷰 목록 */}
      {!loading && !error && reviews.length > 0 && (
        <>
          <div className="space-y-6 mb-6">
            {reviews.map(review => (
              <div
                key={review.id}
                className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow p-6"
              >
                <div className="flex items-start space-x-4">
                  {/* 상품 썸네일 */}
                  <div className="flex-shrink-0">
                    <img 
                      src={review.thumbnailImageUrl || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80'} 
                      alt="썸네일" 
                      className="w-full h-40 object-cover rounded-t-lg bg-gray-100 cursor-pointer" 
                      onClick={() => navigate(`/commerce/${review.productId}`)}
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80';
                      }}
                    />
                  </div>
                  
                  {/* 리뷰 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {review.productName}
                      </h3>
                      <span className="text-sm text-gray-500">
                        {new Date(review.updatedAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    
                    {/* 별점 */}
                    <div className="mb-3">
                      <StarRating rating={review.rating} />
                    </div>
                    
                    {/* 리뷰 내용 */}
                    <div className="text-gray-700 leading-relaxed">
                      {review.content}
                    </div>
                  </div>
                </div>
                
                {/* 수정/삭제 버튼 */}
                <div className="flex justify-end mt-4 space-x-2">
                  <button
                    onClick={() => handleEditReview(review)}
                    className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDeleteConfirm(review.id)}
                    className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition-colors"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalItems > 0 && (
            <Pagination
              totalItems={totalItems}
              itemsPerPage={itemsPerPage}
              currentPage={page}
              onPageChange={handlePageChange}
              className="mt-6"
            />
          )}
        </>
      )}

      {/* 메시지 팝업 */}
      <MessagePopup
        isOpen={showMessagePopup}
        onClose={() => setShowMessagePopup(false)}
        message={messageData.message}
        type={messageData.type}
      />

      {/* 확인 팝업 */}
      <ConfirmPopup
        isOpen={showConfirmPopup}
        onClose={() => setShowConfirmPopup(false)}
        onConfirm={confirmData.onConfirm}
        message={confirmData.message}
        title="리뷰 삭제"
      />
    </div>
  );
};

export default MyReview;
