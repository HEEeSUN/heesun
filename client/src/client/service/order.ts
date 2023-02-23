import { AxiosRequestConfig } from "axios";
import HttpClient from "../../network/http";
import { RefundInfo, ImmediatelyRefundInfo, PendingRefundInfo } from "../model/order.model";

export default class OrderService {
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async getUserInfoToOrder(): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/member/order`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /*결제요청시 merchantUID 생성을 위한 1차 결제 정보 저장*/
  async requestPay(payInfo: {
    paymentOption: string;
    amount: number;
    shippingFee: number;
    productPrice: number;
    orderList: any;
    orderer: string;
    phone: string;
    address: string;
    extra_address: string;
  }): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/member/order`,
      data: {
        paymentOption: payInfo.paymentOption,
        amount: payInfo.amount,
        shippingFee: payInfo.shippingFee,
        productPrice: payInfo.productPrice,
        newArray: payInfo.orderList,
        orderer: payInfo.orderer,
        phone: payInfo.phone,
        address: payInfo.address,
        extra_address: payInfo.extra_address,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async completeOrder(impUID: string, merchantUID: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/member/order/complete`,
      data: {
        impUID,
        merchantUID
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }
  
  async failedOrder(merchantUID: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/member/order/failed`,
      data: {
        merchantUID
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getNewOrder(merchantUID: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/member/order/${merchantUID}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 환불페이지에 주문 내역 불러오기 */
  async getOrder(orderId: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/member/refund/${orderId}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async payAndRefund(
    refundInfo: RefundInfo,
    immediatelyRefundInfo: ImmediatelyRefundInfo,
    pendingRefundInfo: PendingRefundInfo,
    orderId: string
  ): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/member/refund/${orderId}/pay`,
      data: {
        refundInfo,
        immediatelyRefundInfo,
        pendingRefundInfo
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async refund(
    refundInfo: RefundInfo,
    immediatelyRefundInfo: ImmediatelyRefundInfo,
    pendingRefundInfo: PendingRefundInfo,
    orderId: string
    ): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/member/refund/${orderId}`,
      data: {
        refundInfo,
        immediatelyRefundInfo,
        pendingRefundInfo
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async completeRefund(
    orderId: string,
    impUID: string,
    merchantUID: string
  ): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/member/refund/${orderId}/pay/complete`,
      data: {
        merchant_uid: merchantUID,
        imp_uid: impUID
      },
    };

    return this.http.axiosAPI(axiosAPI); 
  }

  async failedRefund(
    orderId: string,
    merchantUID: string
  ): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/member/refund/${orderId}/pay/fail`,
      data: {
        merchantUID,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }
}
