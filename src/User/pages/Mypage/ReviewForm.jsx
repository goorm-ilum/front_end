import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { updateReview, getReviewFormData, getReviewEditFormData, createReview } from '../../../common/api/productApi';

const ReviewForm = () => {
  const navigate = useNavigate();
  const { reviewId, productId } = useParams();
  
  // 상태 관리
  const [formData, setFormData] = useState({
    comment: '',
    reviewStar: 5
  });
  const [productInfo, setProductInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // 수정 모드인지 확인하고 데이터 로드
  useEffect(() => {
    const loadFormData = async () => {
      setLoading(true);
      setError('');
      
      try {
        if (reviewId) {
          // 리뷰 수정 모드
          setIsEditing(true);
          const response = await getReviewEditFormData(reviewId);
          
          // 백엔드 응답 구조에 맞게 데이터 설정
          setProductInfo({
            productName: response.productName,
            thumbnailImageUrl: response.thumbnailUrl
          });
          setFormData({
            comment: response.myComment || '',
            reviewStar: response.myStar || 5
          });
        } else if (productId) {
          // 리뷰 작성 모드
          setIsEditing(false);
          const response = await getReviewFormData(productId);
          setProductInfo(response);
        } else {
          // productId가 없는 경우 에러 처리
          setError('상품 정보를 찾을 수 없습니다.');
        }
      } catch (error) {
        console.error('폼 데이터 로드 실패:', error);
        
        let errorMessage = '폼 데이터를 불러오는데 실패했습니다.';
        
        if (error.response) {
          const status = error.response.status;
          if (status === 401) {
            errorMessage = '로그인이 필요합니다.';
          } else if (status === 404) {
            errorMessage = '상품 또는 리뷰를 찾을 수 없습니다.';
          } else {
            errorMessage = `서버 오류: ${status}`;
          }
        } else if (error.request) {
          errorMessage = '서버에 연결할 수 없습니다.';
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    loadFormData();
  }, [reviewId, productId]);

  // 폼 데이터 변경 핸들러
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'reviewStar' ? parseFloat(value) : value
    }));
  };

  // 별점 변경 핸들러
  const handleStarChange = (rating) => {
    setFormData(prev => ({
      ...prev,
      reviewStar: rating
    }));
  };

  // 폼 제출 핸들러
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.comment.trim()) {
      setError('리뷰 내용을 입력해주세요.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (isEditing) {
        // 리뷰 수정
        await updateReview(reviewId, formData);
        console.log('리뷰 수정 완료');
      } else {
        // 리뷰 작성
        await createReview(productId, formData);
        console.log('리뷰 작성 완료');
      }
      
      // 성공 후 내 리뷰 목록으로 이동
      navigate('/mypage?tab=review');
      
    } catch (error) {
      console.error('리뷰 처리 실패:', error);
      
      let errorMessage = isEditing ? '리뷰 수정 중 오류가 발생했습니다.' : '리뷰 작성 중 오류가 발생했습니다.';
      
      if (error.response) {
        const status = error.response.status;
        if (status === 401) {
          errorMessage = '로그인이 필요합니다. 로그인 후 다시 시도해주세요.';
        } else if (status === 404) {
          errorMessage = isEditing ? '리뷰를 찾을 수 없습니다.' : '상품을 찾을 수 없습니다.';
        } else if (status === 403) {
          errorMessage = '권한이 없습니다.';
        } else {
          errorMessage = `서버 오류: ${status}`;
        }
      } else if (error.request) {
        errorMessage = '서버에 연결할 수 없습니다.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // 별점 표시 컴포넌트
  const StarRating = ({ rating, onRatingChange, readonly = false }) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => !readonly && onRatingChange(star)}
            className={`text-2xl ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            } ${!readonly ? 'hover:text-yellow-300' : ''}`}
            disabled={readonly}
          >
            ★
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">{rating}/5</span>
      </div>
    );
  };

  // 로딩 상태
  if (loading && !productInfo) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-8">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 에러 상태
  if (error && !productInfo) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-red-600">{error}</p>
          <button
            onClick={() => navigate('/mypage?tab=review')}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isEditing ? '리뷰 수정' : '리뷰 작성'}
        </h2>
        <p className="text-gray-600">
          {isEditing ? '리뷰를 수정해주세요.' : '상품에 대한 리뷰를 작성해주세요.'}
        </p>
      </div>

      {/* 상품 정보 표시 */}
      {productInfo && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-4">
            {productInfo.thumbnailImageUrl ? (
              <img
                src={productInfo.thumbnailImageUrl}
                alt={productInfo.productName}
                className="w-16 h-16 object-cover rounded-lg"
              />
            ) : (
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900">{productInfo.productName}</h3>
              {productInfo.price && (
                <p className="text-sm text-gray-600">
                  {productInfo.price.toLocaleString()}원
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 별점 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            별점
          </label>
          <StarRating 
            rating={formData.reviewStar} 
            onRatingChange={handleStarChange}
          />
        </div>

        {/* 리뷰 내용 */}
        <div>
          <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
            리뷰 내용
          </label>
          <textarea
            id="comment"
            name="comment"
            value={formData.comment}
            onChange={handleInputChange}
            rows={6}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="상품에 대한 솔직한 리뷰를 작성해주세요..."
            required
          />
        </div>

        {/* 에러 메시지 */}
        {error && (
          <div className="text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* 버튼 그룹 */}
        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={() => navigate('/mypage?tab=review')}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? '처리 중...' : (isEditing ? '수정 완료' : '리뷰 작성')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReviewForm; 