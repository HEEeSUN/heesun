import { useEffect } from "react";

declare global {
  interface Window {
    IMP: any;
  }
}

type Props = {
  merchantUID: string;
  orderId?: number | undefined;
  payInfo:
    | {
        amount: number;
        productName: string;
      }
    | undefined;
  setPayment: React.Dispatch<React.SetStateAction<boolean>>;
  paymentOption: string;
  successPay: (
    merchant_uid: string,
    imp_uid: string,
    orderId?: number
  ) => Promise<void>;
  failPay: (errorMsg: string) => void;
};

function Payment(props: Props) {
  const IMP = window.IMP;
  IMP.init("imp30343536");

  let {
    merchantUID,
    orderId,
    payInfo,
    setPayment,
    paymentOption,
    successPay,
    failPay,
  } = props;

  const requestPay = async () => {
    if (paymentOption !== "cash") {
      try {
        await payByIMP(merchantUID, successPay, failPay);
        // await successPay(merchantUID, merchantUID, orderId);
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
    successPay: (
      merchantUID: string,
      imp_uid: string,
      orderId?: number
    ) => Promise<void>,
    failPay: (msg: string) => void
  ) => {
    IMP.request_pay(
      {
        pg: paymentOption,
        pay_method: "card", //생략 가능
        merchant_uid: merchantUID, // 상점에서 관리하는 주문 번호
        name: payInfo?.productName,
        amount: payInfo?.amount,
      },
      async (rsp: any) => {
        // callback 로직
        if (rsp.success) {
          await successPay(merchantUID, rsp.imp_uid, orderId);
          return;
        } else {
          failPay(rsp.error_msg);
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
