import { useEffect, useState } from "react";
import {
  AdminOrderService,
  Order,
  RefundAmount,
  OrderList,
} from "../../../model/order.model";
import Page from "../../../components/Page";
import RefundDetail from "./RefundDetail";
import Button from "../../../../client/components/Button";
import Popup from "../../../components/Popup";

type Props = {
  adminOrderService: AdminOrderService;
  updateRefundNum: (refundNum: number) => Promise<void>
};

function Refund({ adminOrderService, updateRefundNum }: Props) {
  let [pageNumber, setPageNumber] = useState<number>(1);
  let [pageLength, setPageLength] = useState<number>(0);
  let [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  let [change, setChange] = useState<boolean>(false);
  let [orderList, setOrderList] = useState<OrderList[]>([]);
  let [refundList, setRefundList] = useState<Order[]>([]);
  let [refundAmountList, setRefundAmountList] = useState<RefundAmount[]>([]);
  let [refundAmount, setRefundAmount] = useState<RefundAmount>();
  let [refundId, setRefundId] = useState<number>(0);

  const updatePendingRefund = async () => {
    setPageNumber(0)
  }

  const refundDetailCmp = (
    <RefundDetail
      setShowStatusModal={setShowStatusModal}
      refundList={refundList}
      refundAmount={refundAmount}
      setRefundId={setRefundId}
      adminOrderService={adminOrderService}
      updatePendingRefund={updatePendingRefund}
    />
  );

  /* 주문 목록 가져오기 */
  const getPendingRefund = async () => {
    try {
      const { refundList, orderList, orderPageLength } =
        await adminOrderService.getPendingRefund(pageNumber);

      setRefundAmountList(refundList);
      setPageLength(orderPageLength);
      setChange(true);
      setOrderList(orderList);
      updateRefundNum(orderList.length);
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    if (refundId) {
      const filter1 = orderList.filter(
        (order) => order[0].refundId === refundId
      );
      const find = refundAmountList.find(
        (refund) => refund.refundId === refundId
      );

      setRefundList(filter1[0]);
      setRefundAmount(find);
      setShowStatusModal(true);
    }
  }, [refundId]);

  useEffect(() => {
    if (pageNumber === 0) {
      setPageNumber(1);
    } else {
      getPendingRefund();
    }
  }, [pageNumber]);

  return (
    <div className="refund-list">
      {orderList.length < 1 ? (
        <div>환불요청이 없습니다</div>
      ) : (
        orderList.map((refund) => {
          return (
            <div className="refund">
              <div className="refund-title">
                <p>{`[${refund[0].merchantUID}] `}</p>
                <p>
                  {`${refund[0].product_name} ${
                    refund.length > 1 ? `외 ${refund.length - 1}` : " "
                  }주문건 환불 요청`}
                </p>
              </div>
              <Button
                type="button"
                title="상세보기"
                handleClickEvent={() => setRefundId(refund[0].refundId)}
              />
            </div>
          );
        })
      )}

      {showStatusModal && (
        <Popup
          children={refundDetailCmp}
          title={"환불 상세 내역"}
          setPopup={setShowStatusModal}
        />
      )}
      <Page
        amountOfPerPage={5}
        change={change}
        setChange={setChange}
        pageLength={pageLength}
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
      />
    </div>
  );
}

export default Refund;
