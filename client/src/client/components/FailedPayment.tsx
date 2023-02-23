import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type Props= {
  showNextPage: boolean;
  moveToForbiddenPage: () => Promise<void>
  mainFunction: (impUID: string, merchantUID: string) => Promise<void>
}

function FailedPayment (props: Props) {
  const {showNextPage, moveToForbiddenPage, mainFunction} = props;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const merchantUID = searchParams.get('merchant_uid');
  const errMsg = searchParams.get('err_msg'); // id 취득

  useEffect(()=>{
    if (!showNextPage) {
      moveToForbiddenPage();
      return;
    }
    mainFunction(merchantUID || '', errMsg || '');
  },[]);

  return null;
}

export default FailedPayment;



