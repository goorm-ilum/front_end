import { useSearchParams, useNavigate } from "react-router-dom";

export function OrderFailure() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleRetry = () => {
    navigate(-1); // 이전 페이지로 돌아가기
  };

  const handleGoHome = () => {
    navigate('/commerce');
  };

  const getErrorMessage = (code) => {
    const errorMessages = {
      'PAY_PROCESS_CANCELED': '결제가 취소되었습니다.',
      'PAY_PROCESS_ABORTED': '결제가 중단되었습니다.',
      'INVALID_CARD': '유효하지 않은 카드입니다.',
      'INSUFFICIENT_FUNDS': '잔액이 부족합니다.',
      'CARD_EXPIRED': '만료된 카드입니다.',
      'INVALID_PASSWORD': '카드 비밀번호가 올바르지 않습니다.',
      'EXCEED_DAILY_LIMIT': '일일 결제 한도를 초과했습니다.',
      'EXCEED_MONTHLY_LIMIT': '월 결제 한도를 초과했습니다.',
      'CARD_NOT_SUPPORTED': '지원하지 않는 카드입니다.',
      'BANK_SERVER_ERROR': '은행 서버 오류가 발생했습니다.',
      'BANK_TIMEOUT': '은행 응답 시간이 초과되었습니다.',
      'CONFIRM_ERROR': '결제 승인 중 오류가 발생했습니다.'
    };
    
    return errorMessages[code] || '결제 중 오류가 발생했습니다.';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">결제 실패</h1>
          <p className="text-red-100">결제 처리 중 문제가 발생했습니다</p>
        </div>

        {/* 오류 정보 */}
        <div className="px-6 py-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600 font-medium">오류 코드</span>
              <span className="text-gray-900 font-mono text-sm">{searchParams.get("code") || "UNKNOWN"}</span>
            </div>
            
            <div className="flex justify-between items-start py-3 border-b border-gray-100">
              <span className="text-gray-600 font-medium">실패 사유</span>
              <span className="text-gray-900 text-right max-w-xs">
                {getErrorMessage(searchParams.get("code"))}
              </span>
            </div>
            
            {searchParams.get("orderId") && (
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600 font-medium">주문번호</span>
                <span className="text-gray-900 font-mono text-sm">{searchParams.get("orderId")}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600 font-medium">결제 상태</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                결제 실패
              </span>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="mt-6 p-4 bg-red-50 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-red-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-red-700">
                <p className="font-medium">결제에 실패했습니다.</p>
                <p className="mt-1">다른 결제 수단을 선택하거나 잠시 후 다시 시도해주세요.</p>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-red-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-red-700 transition-colors duration-200"
            >
              다시 시도하기
            </button>
            <button
              onClick={handleGoHome}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              쇼핑 계속하기
            </button>
          </div>

          {/* 도움말 */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              문제가 지속되면 고객센터로 문의해주세요
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderFailure;