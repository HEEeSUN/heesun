import { Orders } from "../../../model/order.model";

type Props = {
  order: Orders;
  setDeliveryDetailId: React.Dispatch<React.SetStateAction<number>>;
};

function OrderList({ order, setDeliveryDetailId }: Props) {
  return (
    <tr>
      <td className="order-date">{order.created}</td>
      <td className="order-num">{order.merchantUID}</td>
      <td className="order-name">
        <p>{order.product_code}</p>
        <p>{order.product_name}</p>
      </td>
      <td className="order-quantity">{order.quantity}</td>
      <td className="order-orderer">
        <p>{order.username}</p>
        <p>{order.name}</p>
      </td>
      <td className="order-delivery-status">
        <span>{order.status}</span>
      </td>
      <td className="order-detail">
        <button
          className="status-btn"
          onClick={() => setDeliveryDetailId(order.detail_id)}
        >
          상세보기
        </button>
      </td>
      <td className="order-refund">
        {order.refundStatus === "waiting"
          ? "환불요청"
          : order.refundStatus === "complete"
          ? "환불완료"
          : null}
      </td>
    </tr>
  );
}

export default OrderList;
