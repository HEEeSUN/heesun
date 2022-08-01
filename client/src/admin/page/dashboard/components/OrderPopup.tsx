import { AdminOrderService } from "../../../model/order.model";
import Order from "../../order/Order";

type Props = {
  adminOrderService: AdminOrderService;
  request: "" | "REFUND" | "NEWORDER";
  setPopup: React.Dispatch<React.SetStateAction<boolean>>;
};

function OrderPopup({ adminOrderService, request, setPopup }: Props) {
  const onClose = () => {
    setPopup(false);
  };

  return (
    <div className="popup-wrap">
      <div className="popup-body">
        <div className="popup-top-bar">
          <span onClick={onClose}>x</span>
        </div>
        <Order adminOrderService={adminOrderService} request={request} />
      </div>
    </div>
  );
}

export default OrderPopup;
