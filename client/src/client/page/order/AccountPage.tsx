import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router";
import { UseParams } from "../../model/model";
import { OrderService, Order, OrderDetails } from "../../model/order.model";
import Button from "../../components/Button";
import Input from "../../components/Input";

type Props = {
  orderService: OrderService;
};

function AccountPage({ orderService }: Props) {
  let [order, setOrder] = useState<Order>();
  let [orderDetail, setOrderDetail] = useState<OrderDetails[]>([]);
  const orderId: string = useParams<UseParams>().id;
  let history = useHistory();

  const getOrder = async () => {
    try {
      const { order, orderDetail } = await orderService.getNewOrder(orderId);

      setOrder(order);
      setOrderDetail(orderDetail);
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    getOrder();
  }, []);

  return (
    <>
      <div className="order-sheet">
        <h5>주문내역</h5>
        <table className="order-table">
          <thead>
            <tr>
              <th className="order-img"></th>
              <th className="order-name">상품명</th>
              <th className="order-price">가격</th>
              <th className="order-quantity">수량</th>
              <th className="order-name">주문상태</th>
              <th className="order-total">합계</th>
            </tr>
          </thead>
          <tbody>
            {orderDetail.map((item) => {
              return (
                <tr>
                  <td className="order-img">
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
            <tr className="order-shipping-fee">
              <td colSpan={5}>배송비</td>
              <td>{order?.shippingfee}</td>
            </tr>
            <tr className="order-amount">
              <td colSpan={5}>합계액</td>
              <td>{order?.amount}</td>
            </tr>
          </tbody>
        </table>
        <h6>주문정보</h6>
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
        {orderDetail[0]?.status === "입금대기중" && (
          <div className="pay-info">
            <h6>입금정보</h6>
            <hr />
            <table>
              <tbody>
                <tr>
                  <td>주문일시</td>
                  <td className="separator">|</td>
                  <td style={{ paddingLeft: "30PX" }}>{order?.createdAt}</td>
                </tr>
                <tr>
                  <td>주문번호</td>
                  <td className="separator">|</td>
                  <td>{order?.merchantUID}</td>
                </tr>
                <tr>
                  <td>입금계좌정보</td>
                  <td className="separator">|</td>
                  <td>KB 0000-0000-1234-5678</td>
                </tr>
                <tr>
                  <td>입금액</td>
                  <td className="separator">|</td>
                  <td>{order?.amount}</td>
                </tr>
                <tr>
                  <td>입금기한</td>
                  <td className="separator">|</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
            <hr />
            입금정보를 확인하신 후 기한내 입금해주시기 바랍니다.
          </div>
        )}
        <Button
          type="button"
          title="나의정보로"
          handleClickEvent={() => history.push("/home/member/info")}
        />
      </div>
    </>
  );
}

export default AccountPage;
