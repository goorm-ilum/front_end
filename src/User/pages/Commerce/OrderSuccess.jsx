import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export function OrderSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    // 쿼리 파라미터 값이 결제 요청할 때 보낸 데이터와 동일한지 반드시 확인하세요.
    // 클라이언트에서 결제 금액을 조작하는 행위를 방지할 수 있습니다.
    const requestData = {
      orderId: searchParams.get("orderId"),
      amount: searchParams.get("amount"),
      paymentKey: searchParams.get("paymentKey"),
    };

    async function confirm() {
      try {
        const response = await fetch("/api/tosspay/confirm", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        });

        const json = await response.json();

        if (!response.ok) {
          // 결제 실패 비즈니스 로직을 구현하세요.
          navigate(`/commerce/order/fail?message=${json.message}&code=${json.code}`);
          return;
        }

        // 결제 성공 비즈니스 로직을 구현하세요.
        setIsConfirmed(true);
      } catch (error) {
        console.error('결제 승인 중 오류:', error);
        navigate(`/commerce/order/fail?message=결제 승인 중 오류가 발생했습니다.&code=CONFIRM_ERROR`);
      } finally {
        setIsLoading(false);
      }
    }
    confirm();
  }, [navigate, searchParams]);

  const handleGoHome = () => {
    navigate('/commerce');
  };

  const handleGoMyPage = () => {
    navigate('/mypage?tab=order');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">결제 승인 중</h2>
          <p className="text-gray-600">잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">결제 완료</h1>
          <p className="text-blue-100">안전하게 결제가 처리되었습니다</p>
        </div>

        {/* 결제 정보 */}
        <div className="px-6 py-8">
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600 font-medium">주문번호</span>
              <span className="text-gray-900 font-mono text-sm">{searchParams.get("orderId")}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600 font-medium">결제 금액</span>
              <span className="text-2xl font-bold text-blue-600">
                {Number(searchParams.get("amount")).toLocaleString()}원
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600 font-medium">결제 수단</span>
              <span className="text-gray-900">
                {searchParams.get("paymentType") === 'NORMAL' ? '일반결제' : searchParams.get("paymentType")}
              </span>
            </div>
            
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600 font-medium">결제 상태</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                결제 완료
              </span>
            </div>
          </div>

          {/* 안내 메시지 */}
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-500 mt-0.5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-blue-700">
                <p className="font-medium">결제가 성공적으로 완료되었습니다.</p>
                <p className="mt-1">주문 내역은 마이페이지에서 확인하실 수 있습니다.</p>
              </div>
            </div>
          </div>

          {/* 버튼 */}
          <div className="mt-8 space-y-3">
            <button
              onClick={handleGoMyPage}
              className="w-full bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              주문 내역 확인
            </button>
            <button
              onClick={handleGoHome}
              className="w-full bg-gray-100 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors duration-200"
            >
              쇼핑 계속하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;