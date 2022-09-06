import { useEffect, useState } from "react";
import {
  AdminOrderService,
  Orders,
  DeliveryStatus,
} from "../../../model/order.model";

type Props = {
  adminOrderService: AdminOrderService;
  order: Orders;
  setChangeStatus: React.Dispatch<React.SetStateAction<boolean>>;
  stateArray: string[];
  setShowStatusModal: React.Dispatch<React.SetStateAction<boolean>>;
  deliveryDetailId: number;
  setDeliveryDetailId: React.Dispatch<React.SetStateAction<number>>;
};

function StatusModal(props: Props) {
  const {
    adminOrderService,
    order,
    setChangeStatus,
    stateArray,
    deliveryDetailId,
    setShowStatusModal,
    setDeliveryDetailId,
  } = props;
  let [statusArray, setStatusArray] = useState<string[]>([]);
  let [deliveryStatus, setDeliveryStatus] = useState<DeliveryStatus[]>([]);

  const getDeliveryStatus = async () => {
    try {
      const { status } = await adminOrderService.getDeliveryStatus(
        deliveryDetailId
      );

      setDeliveryStatus(status);
    } catch (error: any) {
      alert(error.message);
    }
  };

  /* 배송정보 변경 */
  const changeState = async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const state = event.target.value;

    try {
      await adminOrderService.changeState(deliveryDetailId, state);

      alert("배송정보가 변경되었습니다");
      getDeliveryStatus();
      setChangeStatus(true)
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleClose = () => {
    setShowStatusModal(false);
    setDeliveryDetailId(0);
  };

  useEffect(() => {
    const filter = stateArray.filter((state) => state !== order.status);
    setStatusArray(filter);
    getDeliveryStatus();

    console.log(order);
  }, []);

  return (
    <div className="order-popup-wrap">
      <div className="order-popup">
        <div className="order-popup-head">
          <span>주문현황</span>
          <span onClick={handleClose}>x</span>
        </div>
        <div className="order-popup-body">
          <div className="order-info">
            <table>
              <tr>
                <td className="order-info-label">주문번호</td>
                <td>{order.merchantUID}</td>
              </tr>
              <tr>
                <td className="order-info-label">주문자</td>
                <td>{order.name}</td>
              </tr>
              <tr>
                <td className="order-info-label">연락처</td>
                <td>{order.phone}</td>
              </tr>
              <tr>
                <td className="order-info-label" rowSpan={2}>
                  배송지
                </td>
                <td>{order.address}</td>
              </tr>
              <tr>
                <td>{order.extra_address}</td>
              </tr>
            </table>
          </div>
          <div className="order-status">
            <table>
              <tr>
                <th>주문일자</th>
                <th>배송현황</th>
              </tr>
              {deliveryStatus.map((item) => {
                return (
                  <tr>
                    <td>{item.date}</td>
                    <td>{item.status}</td>
                  </tr>
                );
              })}
            </table>
          </div>
          <div className="order-status-option">
            <label>주문상태변경</label>
            <select onChange={changeState}>
              <option value={order.status} selected>
                {order.status}
              </option>
              {statusArray.map((state) => {
                return <option value={state}>{state}</option>;
              })}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StatusModal;
