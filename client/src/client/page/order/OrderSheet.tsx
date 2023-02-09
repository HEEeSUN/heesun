import { useEffect, useState } from "react";
import {
  CartProducts,
  UserInfo
} from "../../model/member.model";
import {OrderService, PayInfo} from "../../model/order.model";
import Button from "../../components/Button";
import PostcodePopup from "../../components/PostcodePopup";
import Input from "../../components/Input";
import Payment from "../../components/Payment";
import PaymentOption from "../../components/PaymentOption";

type Props = {
  orderService: OrderService;
  moveToCompletePage: (impUID: string, merchantUID: string) => Promise<void>;
  moveToFailPage: (merchantUID: string, errMsg: string) => Promise<void>;
  moveToForbiddenPage: () => Promise<void>;
  totalPrice: number;
  selectedProducts: CartProducts[];
  shippingFee: number;
}

function OrderSheet(props: Props) {
  let [name, setName] = useState<string>("");
  let [showPostcodePopup, setShowPostcodePopup] = useState<boolean>(false);
  let [address, setAddress] = useState<string>("");
  let [extraAddress, setExtraAddress] = useState<string>("");
  let [number, setNumber] = useState<string>("");
  let [user, setUser] = useState<UserInfo>();
  let [userInfo, setUserInfo] = useState<boolean>(false);
  let [payment, setPayment] = useState<boolean>(false);
  let [payInfo, setPayInfo] = useState<PayInfo>();
  let [paymentOption, setPaymentOption] = useState<string>("html5_inicis");
  let [merchantUID, setMerchantUID] = useState<string>("");
  const { orderService, moveToCompletePage, moveToFailPage, moveToForbiddenPage, totalPrice, selectedProducts, shippingFee } = props;
  let amount = totalPrice;
  let orderList = [...selectedProducts];

  /* 고객 정보 불러오기 (주소, 전화번호 등)*/
  const getUserInfo = async () => {
    try {
      const { userInfo } = await orderService.getUserInfoToOrder();

      setUser(userInfo);
    } catch (error: any) {
      alert(error.message);
    }
  };

  /* 주문자 정보가 제대로 입력되었는지 검증 */
  const validationCheck = async () => {
    if (!name || !number || !extraAddress || !address || !paymentOption) {
      return false;
    }

    return true;
  };

  /* 주소 입력 input 변경시 state 변경*/
  const settings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const targetName = event.target.name;
    const value = event.target.value;

    switch (targetName) {
      case "name":
        setName(value);
        break;
      case "number":
        setNumber(value);
        break;
      case "extraAddress":
        setExtraAddress(value);
        break;
      default:
        break;
    }
  };

  /* 결제 요청 */
  const requestPay = async () => {
    const validation = await validationCheck();

    if (!validation) {
      alert("입력사항을 모두 입력해주세요");
      return;
    }

    setPayInfo({
      amount,
      productName: `${orderList[0].name}${
        orderList.length === 1 ? "" : ` 외 ${orderList.length - 1} 건`
      }`,
    });

    try {
      const { merchantUID } = await orderService.requestPay({
        paymentOption,
        amount,
        shippingFee: shippingFee,
        productPrice: amount - shippingFee,
        orderList,
        orderer: name,
        phone: number,
        address,
        extra_address: extraAddress,
      });

      setMerchantUID(merchantUID)

      if (paymentOption === "cash") {
        // payComplete(merchantUID, merchantUID, orderId);
        moveToCompletePage('', merchantUID);
        return;
      }

      setPayment(true);
    } catch (error: any) {
      alert(error.message);
    }
  };
  
  useEffect(() => {
    if (userInfo && user) {
      setName(user.name);
      setNumber(user.phone);
      setAddress(user.address);
      setExtraAddress(user.extra_address);
    } else {
      setName("");
      setNumber("");
      setAddress("");
      setExtraAddress("");
    }
  }, [userInfo]);


  useEffect(() => {
    if (selectedProducts.length < 1) {
      moveToForbiddenPage();
      return;
    }
    getUserInfo();
  }, []);

  return(
    <div className="order">
    <h5>주문내역</h5>
    <table className="order-table">
      <thead>
        <tr>
          <th>상품명</th>
          <th>가격</th>
          <th>수량</th>
          <th>합계</th>
        </tr>
      </thead>
      <tbody>
        {orderList.map((item) => {
          return (
            <tr>
              <td>
                <p>{item.name}</p>
                <p>
                  {item.option1}/{item.option2}
                </p>
              </td>
              <td>{item.sale_price ? item.sale_price : item.price}</td>
              <td>{item.quantity}</td>
              <td>
                {item.sale_price
                  ? item.sale_price * item.quantity
                  : item.price * item.quantity}
              </td>
            </tr>
          );
        })}
        <tr>
          <td>배송비</td>
          <td colSpan={3}>{shippingFee}</td>
        </tr>
        <tr>
          <td className="total-price">총결제금액</td>
          <td colSpan={3} className="total-price">
            {amount}
          </td>
        </tr>
      </tbody>
    </table>
    <div className="address-form">
      <label>회원정보불러오기</label>
      <input
        type="checkbox"
        name="orderer"
        onChange={(e) => setUserInfo(e.target.checked)}
      ></input>
      <Input
        type="text"
        labelName="주문자명"
        name="name"
        settings={settings}
        value={name}
      />
      <Input
        type="text"
        labelName="연락처"
        name="number"
        settings={settings}
        value={number}
      />
      <div style={{ display: "inline-flex" }}>
        <Input
          type="text"
          labelName="주소"
          name="address"
          settings={settings}
          value={address}
          placeholder="주소찾기를 이용해주세요"
          disabled={true}
        />
        <Button
          title="주소찾기"
          handleClickEvent={() => setShowPostcodePopup(true)}
        />
      </div>
      <Input
        type="text"
        labelName="상세주소"
        name="extraAddress"
        settings={settings}
        value={extraAddress}
      />
      {showPostcodePopup ? (
        <PostcodePopup
          setAddress={setAddress}
          setShowPostcodePopup={setShowPostcodePopup}
        />
      ) : null}
    </div>
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
        <PaymentOption
          title="계좌이체"
          value="cash"
          handleClickEvent={(e) => setPaymentOption(e.target.value)}
        />
      </fieldset>
    </div>
    <Button
      type="button"
      extraClass="pay-btn"
      title="결제하기"
      handleClickEvent={requestPay}
    />
    {payment && (
      <Payment
        merchantUID={merchantUID}
        payInfo={payInfo}
        setPayment={setPayment}
        paymentOption={paymentOption}
        successPay={moveToCompletePage}
        failPay={moveToFailPage}
        mobileRedirectURL={`/home/member/order/mobile`}
      />
    )}
  </div>
  )
}

export default OrderSheet;



