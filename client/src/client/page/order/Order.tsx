import { useEffect, useState } from "react";
import { Route, Switch, useHistory } from "react-router-dom";
import "./order.css";
import { CartProducts } from "../../model/member.model";
import { OrderService } from "../../model/order.model";
import NotFound from "../../components/NotFound";
import CompletePayment from "../../components/CompletePayment";
import FailedPayment from "../../components/FailedPayment";
import MobilePayment from "../../components/MobilePayment";
import OrderSheet from "./OrderSheet";
import AccountPage from "./AccountPage";

type Props = {
  orderService: OrderService;
  selectedProducts: CartProducts[];
  totalPrice: number;
  shippingFee: number;
  setQuantityInCart: React.Dispatch<React.SetStateAction<number>>;
};

function Order(props: Props) {
  let {
    orderService,
    selectedProducts,
    totalPrice,
    shippingFee,
    setQuantityInCart,
  } = props;
  const history = useHistory();

  let [showNextPage, setShowNextPage] = useState<boolean>(false);
  let [moveUrl, setMoveUrl] = useState<string>('');

  const moveToForbiddenPage = async () => {
    alert('잘못된 접근입니다')
    history.push(`/home/member/order/notFound`);
  }

  useEffect(()=>{
    if (showNextPage)
      history.push(moveUrl);
  },[showNextPage])

  const moveToCompletePage = async (impUID: string, merchantUID: string) => {
    setMoveUrl(`/home/member/order/complete?imp_uid=${impUID}&merchant_uid=${merchantUID}`)
    setShowNextPage(true);
  }

  const moveToFailPage = async (merchantUID: string, errMsg: string) => {
    setMoveUrl(`/home/member/order/fail?merchant_uid=${merchantUID}&err_msg=${errMsg}`);
    setShowNextPage(true);
  }

  const failedOrder = async (merchantUID: string, errMsg: string) => {
    await orderService.failedOrder(merchantUID || '');
    
    alert(`결제에 실패하였습니다\n${errMsg}`);
  }


  const completeOrder = async (impUID: string, merchantUID: string) => {
    if (impUID) {
      const { quantityInCart } = await orderService.completeOrder(
        impUID || '',
        merchantUID || ''
      );
    }

    alert("주문이 완료되었습니다");
    history.push(`/home/member/order/${merchantUID}`);
  }

  return (
    <Switch>
      <Route exact path="/home/member/order/sheet">
        <OrderSheet 
          orderService={orderService}
          moveToCompletePage={moveToCompletePage}
          moveToFailPage={moveToFailPage}
          moveToForbiddenPage={moveToForbiddenPage}
          totalPrice={totalPrice}
          selectedProducts={selectedProducts}
          shippingFee={shippingFee}
        />
      </Route>
      <Route exact path="/home/member/order/mobile">
        <MobilePayment 
          moveToCompletePage={moveToCompletePage}
          moveToFailPage={moveToFailPage}
          moveToForbiddenPage={moveToForbiddenPage}
        />
      </Route>
      <Route exact path="/home/member/order/complete">
        <CompletePayment 
          showNextPage={showNextPage}
          moveToForbiddenPage={moveToForbiddenPage}
          mainFunction={completeOrder}
        />
      </Route>
      <Route exact path="/home/member/order/fail">
        <FailedPayment 
          showNextPage={showNextPage}
          moveToForbiddenPage={moveToForbiddenPage}
          mainFunction={failedOrder}
        />
      </Route>
      <Route exact path="/home/member/order/notFound">
        <NotFound />
      </Route>
      <Route exact path="/home/member/order/:id">
        <AccountPage 
          orderService={orderService}
          showNextPage={showNextPage}
          moveToForbiddenPage={moveToForbiddenPage}
        />
      </Route>
    </Switch>
  );
}

export default Order;
