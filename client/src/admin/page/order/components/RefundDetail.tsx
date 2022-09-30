import { useEffect, useState } from "react";
import {
  AdminOrderService,
  Order,
  RefundAmount,
} from "../../../model/order.model";

type Props = {
  setShowStatusModal: React.Dispatch<React.SetStateAction<boolean>>;
  refundList: Order[];
  refundAmount: RefundAmount | undefined;
  setRefundId: React.Dispatch<React.SetStateAction<number>>;
  adminOrderService: AdminOrderService;
  updatePendingRefund: () => Promise<void>;
};

function RefundDetail(props: Props) {
  let [refundProducts, setRefundProducts] = useState<Order[]>([]);
  let [refundAll, setRefundAll] = useState<boolean>(false);
  let [realRefundProducts, setRealRefundProducts] = useState<number>(0);
  let [realRefundShippingFee, setRealRefundShippingFee] = useState<number>(0);
  let [realReturnShippingFee, setRealReturnShippingFee] = useState<number>(0);
  let [realRefundAmount, setRealRefundAmount] = useState<number>(0);
  let [차감액, set차감액] = useState<number>(0);
  let [reflection, setRefelction] = useState<boolean>(false);

  const {
    setShowStatusModal,
    refundList,
    setRefundId,
    refundAmount,
    adminOrderService,
    updatePendingRefund
  } = props;

  const onClose = async () => {
    await updatePendingRefund();
    setShowStatusModal(false);
    setRefundId(0);
  };

  const refund = async () => {
    let newArray: number[] = [];

    refundProducts.map((refund) => {
      newArray = [...newArray, refund.detail_id];
    });

    const refundInfo = {
      paymentOption : refundList[0].paymentOption,
      refundId: refundAmount?.refundId,
      merchantUID: refundList[0].merchantUID,
      impUID: refundList[0].imp_uid,
      all: refundAll,
      detailId: newArray,
      realRefundProducts,
      realRefundShippingFee,
      realReturnShippingFee,
      reflection,
      realRefundAmount
    };

    try {
      if (refundList[0].paymentOption === "cash") {
        const confirm = window.confirm('현금 결제건입니다.\환불을 먼저 하신 다음 확인을 눌러주세요.')
        
        if (!confirm) {
          return;
        }
      }

      await adminOrderService.refund(refundInfo);

      alert("선택하신 상품에 대하여 환불이 완료되었습니다");
      onClose();
    } catch (error: any) {
      alert(error.message)
    }
  };

  const checked = async (event: React.ChangeEvent<HTMLInputElement>) => {
    let newArray = [...refundProducts];

    if (event.target.checked) {
      const find = refundList.find(
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
    if (refundProducts.length === 0) {
      setRealReturnShippingFee(0);
    } else {
      if (refundAmount?.returnShippingFee) {
        if (find) {
          setRealReturnShippingFee(refundAmount.returnShippingFee);
          tempRealReturnShippingFee = refundAmount.returnShippingFee;
        } else {
          setRealReturnShippingFee(0);
          tempRealReturnShippingFee = 0;
        }
      }
    }

    let tempRealRefundShippingFee = 0;
    if (amount === refundAmount?.refundProductPrice) {
      setRefundAll(true);
      setRealRefundShippingFee(refundAmount.refundShippingFee);
      tempRealRefundShippingFee = refundAmount.refundShippingFee;
    } else {
      setRefundAll(false);
      setRealRefundShippingFee(0);
      tempRealRefundShippingFee = 0;
    }
    setRealRefundProducts(amount);

    let real차감액 = 0;
    if(refundProducts && !refundAmount?.reflection && refundAmount?.extraPay) {
      set차감액(refundAmount.extraPay);
      real차감액 = refundAmount.extraPay;
      setRefelction(true);
    } 
    // else {
    //   set차감액(0);
    //   real차감액 = 0;
    //   setRefelction(false);
    // }
    
    setRealRefundAmount(amount+tempRealRefundShippingFee-tempRealReturnShippingFee+real차감액)
  }, [refundProducts]);

  useEffect(() => {
    return () => {
      setRefundId(0);
    };
  }, []);

  return (
    <div className="order-popup-body">
      <div className="order-info">
        <table>
          <tr>
            <td className="order-info-label">주문번호</td>
            <td>{refundList[0].merchantUID}</td>
          </tr>
          <tr>
            <td className="order-info-label">주문자</td>
            <td>{refundList[0].orderer}</td>
          </tr>
          <tr>
            <td className="order-info-label">연락처</td>
            <td>{refundList[0].phone}</td>
          </tr>
          <tr>
            <td className="order-info-label">배송지</td>
            <td>{refundList[0].address + refundList[0].extra_address}</td>
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
            <td>{refundList[0].paymentOption}</td>
            <td>{refundList[0].amount}</td>
            <td>{refundList[0].refund_amount}</td>
            <td>{refundList[0].rest_refund_amount}</td>
            <td>{refundAmount
                ? refundAmount.refundProductPrice +
                  refundAmount.refundShippingFee
                : 0}</td>
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
            <td>{refundAmount?.refundProductPrice}</td>
            <td>{refundAmount?.refundShippingFee}</td>
            <td>{refundAmount?.returnShippingFee}</td>
            <td>{refundAmount?.extraPay}</td>
            <td>
              {refundAmount
                ? refundAmount.refundProductPrice +
                  refundAmount.refundShippingFee
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
          {refundList.map((refund) => {
            return (
              <tr>
                <td>
                  <input
                    type="checkbox"
                    value={refund.detail_id}
                    onChange={checked}
                    disabled={refund.refundStatus === "complete"}
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
