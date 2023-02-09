import { useEffect, useState } from "react";
import {
  AdminOrderService,
  RefundList
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
  let [refundList, setRefundList] = useState<RefundList[]>([]);
  let [refundId, setRefundId] = useState<number>(0);

  const closePopup = async () => {
    await updatePendingRefund();
    setShowStatusModal(false);
    setRefundId(0);
  };

  const updatePendingRefund = async () => {
    setPageNumber(0)
  }

  const refundDetailCmp = (
    <RefundDetail
      adminOrderService={adminOrderService}
      refundId={refundId}
      closePopup={closePopup}
    />
  );

  /* 주문 목록 가져오기 */
  const getPendingRefund = async () => {
    try {
      const { refundList, orderPageLength } =
        await adminOrderService.getPendingRefundList(pageNumber);

      setRefundList(refundList);
      setPageLength(orderPageLength);
      setChange(true);
      updateRefundNum(refundList.length);
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    if (refundId) {
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
      {refundList.length < 1 ? (
        <div>환불요청이 없습니다</div>
      ) : (
        refundList.map((refund) => {
          return (
            <div className="refund">
              <div className="refund-title">
                <p>{`[${refund.merchantUID}] `}</p>
                <p>
                  {`${refund.product_name} ${
                    refund.count > 1 ? `외 ${refund.count - 1}` : " "
                  }주문건 환불 요청`}
                </p>
              </div>
              <Button
                type="button"
                title="상세보기"
                handleClickEvent={() => setRefundId(refund.pendingRefundId)}
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
