import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type Props = {
  moveToCompletePage: (impUID: string, merchantUID: string) => Promise<void>;
  moveToFailPage: (merchantUID: string, errMsg: string) => Promise<void>;
  moveToForbiddenPage: () => Promise<void>;
}

function MobilePayment({moveToCompletePage, moveToFailPage, moveToForbiddenPage}: Props) {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const impSuccess = searchParams.get('imp_success'); // count 취득
  const merchantUID = searchParams.get('merchant_uid');
  const impUID = searchParams.get('imp_uid'); // id 취득
  const errMsg = searchParams.get('error_msg');

  useEffect(()=>{
    if (!impSuccess) {
      moveToForbiddenPage();
      return;
    }

    if(impSuccess=='true' && impUID && merchantUID) {
      moveToCompletePage(impUID, merchantUID);
    } else {
      moveToFailPage(merchantUID || '', errMsg || '')
    }
  },[])
  
  return null
}

export default MobilePayment;



