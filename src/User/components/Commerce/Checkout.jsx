// Checkout.jsx
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import { useEffect, useState } from "react";

export function Checkout({ orderId, orderName, amount, customerEmail }) {
  const [ready, setReady] = useState(false);
  const [widgets, setWidgets] = useState(null);

  useEffect(() => {
    async function fetchPaymentWidgets() {
      const tossPayments = await loadTossPayments(clientKey);
      const widgets = tossPayments.widgets({
        // 비회원 결제 시 customerKey: ANONYMOUS
        // 회원 결제 시 고객별 키를 넣으면 됩니다.
        customerKey: ANONYMOUS,
      });
      setWidgets(widgets);
    }

    fetchPaymentWidgets();
  }, []);

  useEffect(() => {
    async function renderWidgets() {
      if (!widgets) return;
      await widgets.setAmount({
        currency: "KRW",
        value: amount,
      });
      await Promise.all([
        widgets.renderPaymentMethods({
          selector: "#payment-method",
          variantKey: "DEFAULT",
        }),
        widgets.renderAgreement({
          selector: "#agreement",
          variantKey: "AGREEMENT",
        }),
      ]);
      setReady(true);
    }

    renderWidgets();
  }, [widgets, amount]);

  return (
    <div className="wrapper">
      <div className="box_section">
        <div id="payment-method" />
        <div id="agreement" />
        <button
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition-colors duration-200"
          disabled={!ready}
          onClick={async () => {
            try {
              await widgets.requestPayment({
                orderId,
                orderName,
                successUrl: window.location.origin + "/success",
                failUrl: window.location.origin + "/fail",
                // 필요한 경우 추가 정보 (ex. 고객명, 전화번호) 넣어주세요
                // customerName: "홍길동",
                // customerMobilePhone: "010-1234-5678",
              });
            } catch (error) {
              console.error(error);
              alert("결제 중 오류가 발생했습니다.");
            }
          }}
        >
          결제하기
        </button>
      </div>
    </div>
  );
}

export default Checkout;
