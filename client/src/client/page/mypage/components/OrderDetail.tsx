import { useState } from "react";
import { useHistory } from "react-router-dom";
import { MemberService, Status } from "../../../model/member.model";
import Button from "../../../components/Button";
import WriteReviewModal from "../../../components/WriteReviewModal";
import StatusModal from "./StatusModal";

type Props = {
  orderDetail: any[];
  order_id: number;
  created: string;
  setStatusChange: React.Dispatch<React.SetStateAction<boolean>>;
  memberService: MemberService;
};

function OrderDetail(props: Props) {
  let [deliveryStatus, setDeliveryStatus] = useState<Status[]>([]);
  let [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  let [showModal, setShowModal] = useState<boolean>(false);
  let [code, setCode] = useState<string>("");
  let [id, setId] = useState<number>(0);
  let { orderDetail, order_id, created, setStatusChange, memberService } =
    props;
  let history = useHistory();

  const refund = async () => {
    history.push(`refund/${order_id}`);
  };

  /* 주문 현황 (배송 현황) 가져오기*/
  const getDeliveryStatus = async (deliveryDetailId: number) => {
    try {
      const { status } = await memberService.getDeliveryStatus(
        deliveryDetailId
      );

      setShowStatusModal(true);
      setDeliveryStatus(status);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const cancelOrder = async (orderId: number) => {
    const result = window.confirm(
      "함께 주문한 모든 상품의 주문이 취소됩니다.\n주문을 취소하시겠습니까?"
    );

    if (!result) {
      return;
    }

    try {
      await memberService.cancelOrder(orderId);

      setStatusChange(true);
      alert("주문이 취소되었습니다");
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <>
      <div className="order-date">
        <p>{created}</p>
      </div>
      {orderDetail.map((detail) => {
        console.log(detail);
        if (detail.order_id == order_id) {
          return (
            <div className="order-info">
              <div className="order-info-left">
                <div className="order-product-img">
                  <img src={detail.main_img_src} alt="productImage"></img>
                </div>
                <div className="order-product-name">
                  <p>{detail.product_name}</p>
                  <p>
                    {detail.option1} / {detail.option2}
                  </p>
                </div>
                <div className="order-quantity">
                  <p>{detail.quantity}</p>
                </div>
                <div className="order-status">
                  <p>{detail.status}</p>
                </div>
              </div>
              <div className="order-btn-list">
                {detail.status === "입금대기중" && (
                  <Button
                    title={"주문취소"}
                    handleClickEvent={() => {
                      cancelOrder(detail.order_id);
                    }}
                  />
                )}
                {detail.status === "배송완료" && (
                  <Button
                    title={"리뷰작성"}
                    handleClickEvent={() => {
                      setCode(detail.product_code);
                      setId(detail.detail_id);
                      setShowModal(true);
                    }}
                  />
                )}
                {showModal && (
                  <WriteReviewModal
                    memberService={memberService}
                    product_code={code}
                    detail_id={id}
                    setShowModal={setShowModal}
                    setStatusChange={setStatusChange}
                  />
                )}
                {((!detail.status.startsWith("입금") &&
                  !(detail.status === "주문취소") &&
                  !detail.refund_deadline) ||
                  new Date(detail.refund_deadline) > new Date()) &&
                  !detail.status.startsWith("반품") && (
                    <Button title={"반품/취소"} handleClickEvent={refund} />
                  )}
                <Button
                  title={"상세보기"}
                  handleClickEvent={() => getDeliveryStatus(detail.detail_id)}
                />
              </div>

              {showStatusModal && (
                <StatusModal
                  deliveryStatus={deliveryStatus}
                  setShowStatusModal={setShowStatusModal}
                />
              )}
            </div>
          );
        }
      })}
    </>
  );
}

export default OrderDetail;
