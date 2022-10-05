import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "./order.css";
import {
  MemberService,
  CartProducts,
  UserInfo,
  PayInfo,
} from "../../model/member.model";
import Button from "../../components/Button";
import PostcodePopup from "../../components/PostcodePopup";
import Input from "../../components/Input";
import Payment from "./components/Payment";
import PaymentOption from "./components/PaymentOption";

type Props = {
  memberService: MemberService;
  selectedProducts: CartProducts[];
  totalPrice: number;
  shippingFee: number;
  setQuantityInCart: React.Dispatch<React.SetStateAction<number>>;
};

function Order(props: Props) {
  let [merchantUID, setMerchantUID] = useState<string>("");
  let [orderId, setOrderId] = useState<number>(0);
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
  let {
    memberService,
    selectedProducts,
    totalPrice,
    shippingFee,
    setQuantityInCart,
  } = props;
  let amount = totalPrice;
  let orderList = [...selectedProducts];
  let history = useHistory();

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

  /* 고객 정보 불러오기 (주소, 전화번호 등)*/
  const getUserInfo = async () => {
    try {
      const { userInfo } = await memberService.getUserInfoToOrder();

      setUser(userInfo);
    } catch (error: any) {
      alert(error.message);
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
      const { orderId, merchantUID } = await memberService.requestPay({
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

      setMerchantUID(merchantUID);
      setOrderId(orderId);

      if (paymentOption === "cash") {
        payComplete(merchantUID, merchantUID, orderId);
        return;
      }

      setPayment(true);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const payComplete = async (
    merchant_uid: string,
    imp_uid: string,
    orderId?: number
  ) => {
    try {
      const { quantityInCart } = await memberService.payComplete(
        imp_uid,
        merchant_uid
      );

      setQuantityInCart(quantityInCart);
      alert("주문이 완료되었습니다");
      history.push(`/home/member/order/${orderId}`);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const cancelPayment = async (errorMsg: string) => {
    alert(`결제에 실패하였습니다\n${errorMsg}`);
    memberService.cancelPayment(merchantUID, orderList);
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

  useEffect(() => {
    getUserInfo();
  }, []);

  return (
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
          orderId={orderId}
          payInfo={payInfo}
          setPayment={setPayment}
          paymentOption={paymentOption}
          successPay={payComplete}
          failPay={cancelPayment}
        />
      )}
    </div>
  );
}

export default Order;
