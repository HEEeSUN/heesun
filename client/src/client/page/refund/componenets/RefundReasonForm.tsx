import { useState } from "react";
import { OrderDetails, refundReasons } from "../../../model/order.model";

type Props = {
  refundProduct: OrderDetails[];
  setRefundProduct: React.Dispatch<React.SetStateAction<OrderDetails[]>>;
}

function RefundReasonForm({refundProduct, setRefundProduct}: Props) {
  let [reasonNumber, setReasonNumber] = useState<number>(0);

  const setRefundReason = (key: number, reason: string) => {
    let tempArray = [...refundProduct];
    tempArray[key].refundReason = reason;
    setRefundProduct(tempArray);
  };

  return (
    <>
      <h6 className="refund-text">사유</h6>
      {refundProduct.length > 0 && (
        <div className="refund-reason-form">
          {refundProduct.map((product, key) => {
            return (
              <div className="refund-reason">
                <h6>
                  {product.product_name} 상품의 반품 사유
                  <span onClick={() => setReasonNumber(key + 1)}>
                    {reasonNumber === key + 1 ? " -" : " +"}
                  </span>
                  <span onClick={() => setReasonNumber(key + 1)}>
                    {!refundProduct[key].refundReason && "(선택해주세요)"}
                  </span>
                </h6>
                <div
                  className={
                    reasonNumber === key + 1 ? "show-reason" : "hidden-reason"
                  }
                >
                  {refundReasons.map((reason) => {
                    if (reason.reason === "") {
                      return (
                        <p className="refund-reason-text">{reason.type}</p>
                      );
                    } else {
                      return (
                        <div className="reason-label">
                          <input
                            type="radio"
                            name="reason"
                            onChange={() => setRefundReason(key, reason.reason)}
                          ></input>
                          <label>{reason.reason}</label>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  )
}

export default RefundReasonForm;
