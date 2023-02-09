import { useState } from "react";
import { Route } from "react-router-dom";
import { Switch } from "react-router";
import { Regex } from "../model/model";
import { MemberService, CartProducts } from "../model/member.model";
import { OrderService } from "../model/order.model";
import MyInfo from "./mypage/MyInfo";
import MyPage from "./mypage/MyPage";
import MyCommunity from "./mypage/MyCommunity";
import MyReview from "./mypage/MyReview";
import Order from "./order/Order";
import Cart from "./cart/Cart";
import Refund from "./refund/Refund";
import NotFound from "../components/NotFound";

type Props = {
  memberService: MemberService;
  orderService: OrderService;
  setQuantityInCart: React.Dispatch<React.SetStateAction<number>>;
  regex: Regex;
};

function Member(props: Props) {
  const { memberService, orderService, setQuantityInCart, regex } = props;
  let [selectedProducts, setSelectedProducts] = useState<CartProducts[]>([]);
  let [totalPrice, setTotalPrice] = useState<number>(0);
  let [shippingFee, setShippingFee] = useState<number>(0);

  return (
    <Switch>
      <Route exact path="/home/member/cart">
        <Cart
          memberService={memberService}
          selectedProducts={selectedProducts}
          setSelectedProducts={setSelectedProducts}
          totalPrice={totalPrice}
          setTotalPrice={setTotalPrice}
          shippingFee={shippingFee}
          setShippingFee={setShippingFee}
          setQuantityInCart={setQuantityInCart}
        />
      </Route>
      <Route exact path="/home/member/info">
        <MyPage memberService={memberService} />
      </Route>
      <Route exact path="/home/member/myinfo">
        <MyInfo memberService={memberService} regex={regex} />
      </Route>
      <Route exact path="/home/member/myreview">
        <MyReview memberService={memberService} />
      </Route>
      <Route exact path="/home/member/mypost">
        <MyCommunity memberService={memberService} />
      </Route>
      <Route path="/home/member/order">
        <Order
          orderService={orderService}
          selectedProducts={selectedProducts}
          totalPrice={totalPrice}
          shippingFee={shippingFee}
          setQuantityInCart={setQuantityInCart}
        />
      </Route>
      <Route path="/home/member/refund">
        <Refund orderService={orderService} />
      </Route>
      <Route path="*">
        <NotFound />
      </Route>
    </Switch>
  );
}

export default Member;