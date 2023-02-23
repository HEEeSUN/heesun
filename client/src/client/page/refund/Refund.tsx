import { useEffect, useState } from "react";
import { Route, Switch, useHistory } from "react-router";
import "./refund.css";
import { OrderService } from "../../model/order.model";
import MobilePayment from "../../components/MobilePayment";
import CompletePayment from "../../components/CompletePayment";
import FailedPayment from "../../components/FailedPayment";
import RefundSheet from "./componenets/RefundSheet";

type Props = {
  orderService: OrderService;
};

function Refund({orderService}: Props) {
  let [showNextPage, setShowNextPage] = useState<boolean>(false);
  let [moveUrl, setMoveUrl] = useState<string>('');
  let [orderId, setOrderId] = useState<string>('')
  const history = useHistory();
  
  const moveToForbiddenPage = async () => {
    alert('잘못된 접근입니다')
    history.push(`/home/member/refund/notFound`);
  }

  useEffect(()=>{
    if (showNextPage)
      history.push(moveUrl);
  },[showNextPage])

  const moveToCompletePage = async (impUID: string, merchantUID: string) => {
    setMoveUrl(`/home/member/refund/complete?imp_uid=${impUID}&merchant_uid=${merchantUID}`)
    setShowNextPage(true);
  }

  const moveToFailPage = async (merchantUID: string, errMsg: string) => {
    setMoveUrl(`/home/member/refund/fail?merchant_uid=${merchantUID}&err_msg=${errMsg}`);
    setShowNextPage(true);
  }

  const failedRefund = async (merchantUID: string, errMsg: string) => {
    await orderService.failedRefund(
      orderId, merchantUID
    );
    
    alert(`환불에 실패하였습니다\n${errMsg}`);
  }

  const completeRefund = async (impUID: string, merchantUID: string) => {
    try {
      await orderService.completeRefund(
        orderId, impUID, merchantUID
      );

      alert("환불 요청이 완료되었습니다");
      history.push(`/home/member/info`);
    } catch (error: any) {
      alert(error.message);
    }
  }

  return (
    <Switch>
      <Route exact path="/home/member/refund/mobile">
        <MobilePayment 
          moveToCompletePage={moveToCompletePage}
          moveToFailPage={moveToFailPage}
          moveToForbiddenPage={moveToForbiddenPage}
        />
      </Route>
      <Route exact path="/home/member/refund/complete">
        <CompletePayment 
          showNextPage={showNextPage}
          moveToForbiddenPage={moveToForbiddenPage}
          mainFunction={completeRefund}
        />
      </Route>
      <Route exact path="/home/member/refund/fail">
        <FailedPayment 
          showNextPage={showNextPage}
          moveToForbiddenPage={moveToForbiddenPage}
          mainFunction={failedRefund}
        />
      </Route>
      <Route exact path="/home/member/refund/:id">
        <RefundSheet 
          orderService={orderService}
          moveToCompletePage={moveToCompletePage}
          moveToFailPage={moveToFailPage}
          setOrderId={setOrderId}
        />
      </Route>
    </Switch>

  );
}

export default Refund;
