import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { useParams } from "react-router-dom";
import { UseParams } from "../../../model/model";
import {
  OrderService,
  OrderDetails,
  PayInfo,
} from "../../../model/order.model";
import Input from "../../../components/Input";
import Payment from "../../..//components/Payment";
import PaymentOption from "../../../components/PaymentOption";
import RefundReasonForm from "./RefundReasonForm"

type Props = {
  orderService: OrderService;
  moveToCompletePage: (impUID: string, merchantUID: string) => Promise<void>;
  moveToFailPage: (merchantUID: string, errMsg: string) => Promise<void>;
  setOrderId: React.Dispatch<React.SetStateAction<string>>;
};

type RefundOrder = {
  amount: number;
  merchantUID: string;  
  imp_uid: string; 
  paymentOption: string; 
  products_price: number; 
  shippingfee: number; 
  orderer: string; 
  phone: string; 
  address: string;
  extra_address: string; 
  return_shippingfee: number; 
}

function RefundSheet(props: Props){
  const orderId: string = useParams<UseParams>().id;
  
  let [payment, setPayment] = useState<boolean>(false);
  let [payInfo, setPayInfo] = useState<PayInfo>();
  let [paymentOption, setPaymentOption] = useState<string>("html5_inicis");
  let [merchantUID, setMerchantUID] = useState<string>(""); //추가결제시 생성되는 주문번호
  let [refundProduct, setRefundProduct] = useState<OrderDetails[]>([]); // 환불을 요청할 주문 상세 내역
  let [refundAmountForProduct, setRefundAmountForProduct] = useState<number>(0); //환불할 상품가격
  let [refundAmountForShipping, setRefundAmountForShipping] =
  useState<number>(0); // 환불 배송비 (돌려줄 것)
  let [refundAmount, setRefundAmount] = useState<number>(0); // 전체 환불비(환불할 상품가격 + 환불 배송비)
  let [pendingRefundAmountForProduct, setPendingRefundAmountForProduct] =
  useState<number>(0); // 판매자 확인후 환불할 상품가격
  let [pendingRefundAmountForShipping, setPendingRefundAmountForShipping] =
    useState<number>(0); // 판매자 확인후 환불할 배송비 (돌려줄 것)
  let [pendingRefundAmount, setPendingRefundAmount] = useState<number>(0); // 판매자 확인후 환불할 전체 환불비
    let [returnShippingFee, setReturnShippingFee] = useState<number>(0); // 반품배송비(받을 것)
  let [prePayment, setPrePayment] = useState<number>(0);
  let [extraPay, setExtraPay] = useState<number>(0);
  const { orderService, moveToCompletePage, moveToFailPage, setOrderId } = props;
  let history = useHistory();

  let [order, setOrder] = useState<RefundOrder>(); // 주문 내역
  let [orderDetail, setOrderDetail] = useState<OrderDetails[]>([]); // 주문 상세 내역

  const getOrder = async () => {
    try {
      const result = await orderService.getOrder(orderId);
      const { order, orderDetail } = result;

      setOrderId(orderId);
      setOrder(order);
      setOrderDetail(orderDetail);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const checked = async (
    event: React.ChangeEvent<HTMLInputElement>,
    product: OrderDetails
  ) => {
    if (event.target.checked) {
      let tempArray = [...refundProduct];
      tempArray.push(product);
      setRefundProduct(tempArray);
    } else {
      let tempArray = refundProduct.filter(
        (item) => item.detail_id !== product.detail_id
      );
      setRefundProduct(tempArray);
    }
  };

  const valiedateRefundInformation = () => {
    let emptyRefundReason = refundProduct.find(
      (product) => !product.refundReason
    );

    if (refundProduct.length < 1) {
      alert("상품을 선택해 주세요");
      return false;
    } 
    if (emptyRefundReason) {
      alert("반품 사유를 선택해 주세요");
      return false;
    } 
    const found = refundProduct.filter(
      (item) => item.status !== "결제완료" && item.status !== "입금대기중"
    );

    if (found.length > 0) {
      const result = window.confirm(
        "이미 배송이 진행된 상품의 경우 판매자 확인후 환불이 가능합니다.\n계속하시겠습니까?"
      );

      if (!result) {
        return false;
      }
    }

    if (extraPay > 0) {
      const result = window.confirm(
        `${extraPay} 원의 추가 결제 금액이 발생합니다.\n계속하시겠습니까?`
      );

      if (!result) {
        return false;
      }
    } 
    
    return true;
  }

  const requestRefund = async () => {
    if (!valiedateRefundInformation()) {
      return;
    }

    if (!order) {
      return;
    }
      
    const orderDetailIdArray = refundProduct.map((product) => {
      return {
        detail_id : product.detail_id, 
        status: product.status,
        price: product.price,
        quantity: product.quantity
      }
    })

    const refundInfo = {
      merchantUID: order.merchantUID,
      imp_uid: order.imp_uid,
      extraCharge: extraPay,
      prePayment,
      refundProduct: orderDetailIdArray,
      refundAmount,
    };

    const pendingRefundInfo = {
      pendingRefundAmountForProduct,
      returnShippingFee,
      pendingRefundAmountForShipping,
    };

    const immediatelyRefundInfo = {
      refundAmountForProduct,
      refundAmountForShipping,
    };

    if (extraPay > 0) {
      const { newMerchantUID } = await orderService.payAndRefund(
        refundInfo, immediatelyRefundInfo, pendingRefundInfo, orderId
      )
      
      setPayInfo({
        amount: extraPay,
        productName: `환불`,
      });
      setMerchantUID(newMerchantUID);
      setPayment(true);
    } else {
      await orderService.refund(
        refundInfo, immediatelyRefundInfo, pendingRefundInfo, orderId
      )

      alert('환불이 요청이 완료되었습니다')
      history.push('/home/member/info')
    }
  };

  const setProductPrice = async () => {
    let tempImmediatelyRefundAmount = 0;
    let tempPendingRefundAmount = 0;
    let tempImmediatelyShipping = 0;
    let tempPendingShipping = 0;
    let tempReturnShippingFee = 0;

    if (order?.paymentOption === "cash") { // 현금 결제인경우 판매자 확인후 환불 진행
      refundProduct.map((product) => {
        tempPendingRefundAmount += product.price * product.quantity;
      });
    } else {
      refundProduct.map((product) => {
        if (product.status === "결제완료" || product.status === "입금대기중") {
          tempImmediatelyRefundAmount += product.price * product.quantity;
        } else {
          tempPendingRefundAmount += product.price * product.quantity;
        }
      });
    }

    setRefundAmountForProduct(tempImmediatelyRefundAmount);
    setPendingRefundAmountForProduct(tempPendingRefundAmount);

    const totalRefundAmount =
      tempPendingRefundAmount + tempImmediatelyRefundAmount;

    const find = refundProduct.find(
      (product) =>
        product.status !== "결제완료" && product.status !== "입금대기중"
    );

    if (order) {
      if (order.products_price === totalRefundAmount) {
        if (find) {
          tempPendingShipping = order.shippingfee;
          setPendingRefundAmountForShipping(order.shippingfee);
          setRefundAmountForShipping(0);
        } else {
          if (order.paymentOption === "cash") {
            tempPendingShipping = order.shippingfee;
            setPendingRefundAmountForShipping(order.shippingfee);
            setRefundAmountForShipping(0);
          } else {
            tempImmediatelyShipping = order.shippingfee;
            setPendingRefundAmountForShipping(0);
            setRefundAmountForShipping(order.shippingfee);
          }
        }
      } else {
        setPendingRefundAmountForShipping(0);
        setRefundAmountForShipping(0);
      }
    }

    if (order?.return_shippingfee && order?.return_shippingfee > 0) {
      tempReturnShippingFee = 0;
      setReturnShippingFee(0);
    } else {
      const result = refundProduct.find(
        (product) =>
          product.status !== "결제완료" && product.status !== "입금대기중"
      );
      if (result) {
        tempReturnShippingFee = 5000;
        setReturnShippingFee(5000);
      } else {
        tempReturnShippingFee = 0;
        setReturnShippingFee(0);
      }
    }

    if (tempReturnShippingFee > 0) {
      if (
        tempImmediatelyRefundAmount + tempImmediatelyShipping >=
        tempReturnShippingFee
      ) {
        const tmp =
          tempImmediatelyRefundAmount +
          tempImmediatelyShipping -
          tempReturnShippingFee;
        setRefundAmount(tmp);
        setPrePayment(tempReturnShippingFee);
        tempReturnShippingFee = 0;
      } else {
        tempReturnShippingFee -=
          tempImmediatelyRefundAmount + tempImmediatelyShipping;
        setPrePayment(tempImmediatelyRefundAmount + tempImmediatelyShipping);
        setRefundAmount(0);
      }

      setExtraPay(tempReturnShippingFee);
    } else {
      setRefundAmount(tempImmediatelyRefundAmount + tempImmediatelyShipping);
      setExtraPay(0);
    }
    setPendingRefundAmount(tempPendingRefundAmount + tempPendingShipping);
  };

  useEffect(()=>{
    getOrder();
  },[])

  useEffect(() => {
    setProductPrice();
  }, [refundProduct]);

  return(
    <div className="refund-page">
      <h5>반품 및 취소</h5>
      <h6 className="refund-text">주문내역</h6>
      <table className="refund-table">
        <thead>
          <tr>
            <th className="refund-checkbox"></th>
            <th className="refund-img"></th>
            <th className="refund-name">상품명</th>
            <th className="refund-price">가격</th>
            <th className="refund-quantity">수량</th>
            <th className="refund-name">주문상태</th>
            <th className="refund-total">합계</th>
          </tr>
        </thead>
        <tbody>
          {orderDetail.map((item) => {
            return (
              <tr
                className={
                  item.status === "반품및취소요청" ||
                  item.status === "반품및취소완료"
                    ? "already-refund"
                    : ""
                }
              >
                <td>
                  <input
                    type="checkbox"
                    onChange={(e) => checked(e, item)}
                    disabled={
                      item.status === "반품및취소요청" ||
                      item.status === "반품및취소완료"
                    }
                  ></input>
                </td>
                <td className="refund-img">
                  <img
                    src={item.main_img_src || "/image/noImage.jpg"}
                    alt="product image"
                  ></img>
                </td>
                <td>
                  <p>{item.product_name}</p>
                  <p>
                    {item.option1}/{item.option2}
                  </p>
                </td>
                <td>{item.price}</td>
                <td>{item.quantity}</td>
                <td>{item.status}</td>
                <td>{item.price * item.quantity}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <h6 className="refund-text">주문정보</h6>
      <div className="order-info-form">
        <Input
          type="text"
          labelName="주문자명"
          name="name"
          value={order?.orderer}
          disabled={true}
        />
        <Input
          type="text"
          labelName="연락처"
          name="number"
          value={order?.phone}
          disabled={true}
        />
        <Input
          type="text"
          labelName="주소"
          name="address"
          value={order?.address}
          disabled={true}
        />
        <Input
          type="text"
          labelName="상세주소"
          name="extraAddress"
          value={order?.extra_address}
          disabled={true}
        />
      </div>
      <RefundReasonForm 
        refundProduct={refundProduct}
        setRefundProduct={setRefundProduct}
      />
      <div className="refund-amount-form">
        <div className="refund-amount-label">
          <p>결제금액</p>
          <p>{order?.amount}</p>
        </div>
        <hr />
        <div className="refund-amount-label">
          <p>환불상품금액</p>
          <p>{refundAmountForProduct+pendingRefundAmountForProduct}</p>
        </div>
        <div className="refund-amount-label">
          <p>환불배송비</p>
          <p>{refundAmountForShipping + pendingRefundAmountForShipping}</p>
        </div>
        <div className="refund-amount-label">
          <p>총환불요청액</p>
          <p>{refundAmountForProduct + pendingRefundAmountForProduct + refundAmountForShipping + pendingRefundAmountForShipping}</p>
        </div>
        <hr />
        <div className="refund-amount-label">
          <p>반품배송비</p>
          <p>{returnShippingFee}</p>
        </div>
        <hr />
        <div className="refund-amount-label">
          <p>
            즉시환불금액
          </p>
          <p>{refundAmount}</p>
        </div>
        <div className="refund-amount-label">
          <p>판매자확인후 환불가능금액</p>
          <p>{pendingRefundAmount}</p>
        </div>
        {
         extraPay > 0 && 
        <div className="refund-amount-label">
          <p>추가결제액</p>
          <p>{extraPay}</p>
        </div>
        }
      </div>
      {
        returnShippingFee > 0 &&
        <div> 반품배송비는 환불 받으실 금액에서 차감됩니다</div>
      }
      {
        extraPay > 0 && 
        <div className="payment-option">
          <p>결제수단선택</p>
          <fieldset>
            <PaymentOption
              title="이니시스결제"
              value="html5_inicis"
              defaultChecked={true}
              handleClickEvent={(e) => setPaymentOption(e.target.value)}
            />
            <PaymentOption
              title="카카오페이"
              value="kakaopay"
              handleClickEvent={(e) => setPaymentOption(e.target.value)}
            />
          </fieldset>
        </div>
      }
      <button className="refund-btn" onClick={requestRefund}>
        완료
      </button>
      {payment && (
        <Payment
          merchantUID={merchantUID}
          payInfo={payInfo}
          setPayment={setPayment}
          paymentOption={paymentOption}
          successPay={moveToCompletePage}
          failPay={moveToFailPage}
          mobileRedirectURL={`/home/member/refund/${orderId}/mobile`}
        />
      )}
    </div>
  )
}

export default RefundSheet;
