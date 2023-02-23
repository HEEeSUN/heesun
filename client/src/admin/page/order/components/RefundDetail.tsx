import { useEffect, useState } from "react";
import {
  AdminOrderService,
  RefundDetails,
  PaymentInfo
} from "../../../model/order.model";

type Props = {
  adminOrderService: AdminOrderService;
  refundId: number;
  closePopup: () => Promise<void>;
};


function RefundDetail(props: Props) {
  let [realRefundProducts, setRealRefundProducts] = useState<number>(0);
  let [realRefundShippingFee, setRealRefundShippingFee] = useState<number>(0);
  let [realReturnShippingFee, setRealReturnShippingFee] = useState<number>(0);
  let [realRefundAmount, setRealRefundAmount] = useState<number>(0);
  let [차감액, set차감액] = useState<number>(0);
  
  let [refundProducts, setRefundProducts] = useState<RefundDetails[]>([]);
  let [refundDetail, setRefundDetail] = useState<RefundDetails[]>([]);
  let [paymentInfo, setPaymentInfo] = useState<PaymentInfo>();

  let [setOff, setSetOff] = useState<number>(0);
  let [extraPay, setExtraPay] = useState<number>(0);

  const {
    adminOrderService,
    refundId,
    closePopup
  } = props;

  const getPendingRefundDetail = async () => {
    try {
      const { refundDetail, paymentInfo } = await adminOrderService.getPendingRefundDetail(refundId);

      setRefundDetail(refundDetail)
      setPaymentInfo(paymentInfo)
    } catch (error: any) {
      alert(error.message);
    }
  }

  const refund = async () => {
    let newArray: number[] = [];

    refundProducts.map((refund) => {
      newArray = [...newArray, refund.detail_id];
    });

    const refundInfo = {
      pendingRefundId: refundId,
      merchantUID: paymentInfo?.merchantUID,
      imp_uid: paymentInfo?.imp_uid,
      detailId: newArray,
      realRefundProducts,
      realRefundShippingFee,
      realReturnShippingFee,
      refundAmount: realRefundAmount,
      setOff,
      extraPay
    };

    try {
      if (paymentInfo?.paymentOption === "cash") {
        const confirm = window.confirm('현금 결제건입니다.\환불을 먼저 하신 다음 확인을 눌러주세요.')
        
        if (!confirm) {
          return;
        }
      }

      await adminOrderService.refund(refundInfo);

      alert("선택하신 상품에 대하여 환불이 완료되었습니다");
      closePopup();
    } catch (error: any) {
      alert(error.message)
    }
  };

  const checked = async (event: React.ChangeEvent<HTMLInputElement>) => {
    let newArray = [...refundProducts];

    if (event.target.checked) {
      const find = refundDetail.find(
        (refund) => refund.detail_id === Number(event.target.value)
      );

      if (find) {
        newArray = [...newArray, find];
      }
    } else {
      const filter = refundProducts.filter(
        (refund) => refund.detail_id !== Number(event.target.value)
      );
      newArray = filter;
    }

    setRefundProducts(newArray);
  };

  useEffect(() => {
    let amount = 0;

    refundProducts.map((refund) => {
      amount += refund.price * refund.quantity;
    });

    const find =  refundProducts.find(product => product.deliverystatus !== "결제완료");
    
    let tempRealReturnShippingFee = 0;
    let real차감액 = 0;

    if (refundProducts.length === 0) {
      setRealReturnShippingFee(0);
    } else {
      if (paymentInfo?.returnShippingFee) {
        if (find) {
          setRealReturnShippingFee(paymentInfo.returnShippingFee);
          tempRealReturnShippingFee = paymentInfo.returnShippingFee;

          setSetOff(paymentInfo.setOff);
          setExtraPay(paymentInfo.extraPay);

          set차감액(paymentInfo.extraPay + paymentInfo.setOff);
          real차감액 = paymentInfo.extraPay + paymentInfo.setOff;

        } else {
          setRealReturnShippingFee(0);
          tempRealReturnShippingFee = 0;

          setSetOff(0);
          setExtraPay(0);

          set차감액(0);
          real차감액 = 0;
        }
      }
    }

    let tempRealRefundShippingFee = 0;
    if (amount === paymentInfo?.productsPrice) {
      setRealRefundShippingFee(paymentInfo.shippingFee);
      tempRealRefundShippingFee = paymentInfo.shippingFee;
    } else {
      setRealRefundShippingFee(0);
      tempRealRefundShippingFee = 0;
    }
    setRealRefundProducts(amount);

    // let real차감액 = 0;
    // if(refundProducts && paymentInfo?.extraPay || paymentInfo?.setOff) {
    //   set차감액(paymentInfo.extraPay + paymentInfo.setOff);
    //   real차감액 = paymentInfo.extraPay + paymentInfo.setOff;
    // } 
    
    setRealRefundAmount(amount+tempRealRefundShippingFee-tempRealReturnShippingFee+real차감액)
  }, [refundProducts]);

  useEffect(() => {
    getPendingRefundDetail();

    return () => {
      closePopup();
    };
  }, []);

  return (
    <div className="order-popup-body">
      <div className="order-info">
        <table>
          <tr>
            <td className="order-info-label">주문번호</td>
            <td>{paymentInfo?.merchantUID}</td>
          </tr>
          <tr>
            <td className="order-info-label">주문자</td>
            <td>{paymentInfo?.orderer}</td>
          </tr>
          <tr>
            <td className="order-info-label">연락처</td>
            <td>{paymentInfo?.phone}</td>
          </tr>
          <tr>
            <td className="order-info-label">배송지</td>
            <td>{String(paymentInfo?.address)+ String(paymentInfo?.extra_address)}</td>
          </tr>
        </table>
      </div>
      <div className="order-refund-info">
        <table>
          <tr>
            <th rowSpan={2}>결제정보</th>
            <th>결제수단</th>
            <th>총결제금액</th>
            <th>이전환불액</th>
            <th>환불가능액</th>
            <th>환불요청액</th>
          </tr>
          <tr>
            <td>{paymentInfo?.paymentOption}</td>
            <td>{paymentInfo?.payAmount}</td>
            <td>{paymentInfo?.pastAmount}</td>
            <td>{paymentInfo? paymentInfo.payAmount-paymentInfo.pastAmount : 0}</td>
            <td>{paymentInfo? paymentInfo.amount : 0}</td>
          </tr>
          <tr>
            <th rowSpan={2}>환불요청정보</th>
            <th>상품가액</th>
            <th>환불배송비</th>
            <th>반품배송비</th>
            <th>선결제액</th>
            <th>총환불액</th>
          </tr>
          <tr>
            <td>{paymentInfo?.productsPrice}</td>
            <td>{paymentInfo?.shippingFee}</td>
            <td>{paymentInfo?.returnShippingFee}</td>
            <td>{paymentInfo? paymentInfo?.extraPay + paymentInfo?.setOff : 0}</td>
            <td>
              {paymentInfo
                ? paymentInfo.amount
                : 0}
            </td>
          </tr>
        </table>
      </div>
      <div className="order-status">
        <table>
          <tr>
            <th></th>
            <th>품명</th>
            <th>상품가액</th>
            <th>수량</th>
            <th>주문상태</th>
          </tr>
          {refundDetail.map((refund) => {
            return (
              <tr>
                <td>
                  <input
                    type="checkbox"
                    value={refund.detail_id}
                    onChange={checked}
                  ></input>
                </td>
                <td>{refund.product_name}</td>
                <td>{refund.price}</td>
                <td>{refund.quantity}</td>
                <td>{refund.deliverystatus}</td>
              </tr>
            );
          })}
        </table>
      </div>
      <div className="order-refund-info">
        <table>
          <tr>
            <th className="refund-notice" colSpan={5}>
              환불하실 상품을 선택하고 하단의 환불액을 확인하신 후 환불 버튼을
              눌러주세요
            </th>
          </tr>
          <tr>
            <th rowSpan={2}>환불정보</th>
            <th>상품가액</th>
            <th>환불배송비</th>
            <th>반품배송비</th>
            <th>선결제차감액</th>
            <th>총환불액</th>
          </tr>
          <tr>
            <td>{realRefundProducts}</td>
            <td>{realRefundShippingFee}</td>
            <td>{realReturnShippingFee}</td>
            <td>{차감액}</td>
            <td>{realRefundAmount}</td>
          </tr>
        </table>
      </div>
      <button onClick={refund}>선택상품환불</button>
    </div>
  );
}
export default RefundDetail;
