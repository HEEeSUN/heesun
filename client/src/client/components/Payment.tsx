import { useEffect } from "react";

declare global {
  interface Window {
    IMP: any;
  }
}

type Props = {
  merchantUID: string;
  payInfo:
    | {
        amount: number;
        productName: string;
      }
    | undefined;
  setPayment: React.Dispatch<React.SetStateAction<boolean>>;
  paymentOption: string;
  successPay: (impUID: string, merchantUID: string) => Promise<void>;
  failPay: (merchantUID: string, errMsg: string) => Promise<void>;
  mobileRedirectURL: string;
};

function Payment(props: Props) {
  const IMP = window.IMP;
  IMP.init("imp30343536");

  let {
    merchantUID,
    payInfo,
    setPayment,
    paymentOption,
    successPay,
    failPay,
    mobileRedirectURL
  } = props;

  const requestPay = async () => {
    if (paymentOption !== "cash") {
      try {
        await payByIMP(merchantUID, successPay, failPay);
        setPayment(false);
      } catch (error: any) {
        alert(error.message);
        return;
      }
    } else {
      // payInCash
    }
  };

  const payByIMP = async (
    merchantUID: string,
    successPay: (impUID: string, merchantUID: string) => Promise<void>,
    failPay: (merchantUID: string, errMsg: string) => Promise<void>
  ) => {
    IMP.request_pay(
      {
        pg: paymentOption,
        pay_method: "card", //생략 가능
        merchant_uid: merchantUID, // 상점에서 관리하는 주문 번호
        name: payInfo?.productName,
        amount: payInfo?.amount,
        m_redirect_url: `http://heesun.store${mobileRedirectURL}`
      },
      async (rsp: any) => {
        // callback 로직
        if (rsp.success) {
          await successPay(rsp.imp_uid, merchantUID);
          // await successPay(merchantUID, rsp.imp_uid, orderId);
          return;
        } else {
          failPay(merchantUID, rsp.error_msg);
          return;
        }
      }
    );
  };

  useEffect(() => {
    requestPay();
  }, []);

  return null;
}

export default Payment;
