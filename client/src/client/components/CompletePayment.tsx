import { useEffect } from "react";
import { useLocation } from "react-router-dom";

type Props = {
  showNextPage: boolean;
  moveToForbiddenPage: () => Promise<void>
  mainFunction: (impUID: string, merchantUID: string) => Promise<void>;
}

function CompletePayment(props: Props) {
  const {showNextPage, moveToForbiddenPage, mainFunction} = props;
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const merchantUID = searchParams.get('merchant_uid');
  const impUID = searchParams.get('imp_uid'); // id 취득

  useEffect(()=>{
    if (!showNextPage) {
      moveToForbiddenPage();
      return;
    }
    mainFunction(impUID ||'', merchantUID ||'');
  },[])

  return null
}

export default CompletePayment;



