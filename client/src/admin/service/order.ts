import { AxiosRequestConfig } from "axios";
import { RefundInfo } from "../model/order.model";
import HttpClient from "../../network/http";

export default class AdminOrderService {
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async getOrderListByWord(
    pageNumber: number,
    startDate: string,
    endDate: string,
    category: string,
    status: string,
    searchWord: string
  ) {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin/orders?page=${pageNumber}&date1=${startDate}&date2=${endDate}&category=${category}&status=${status}&searchWord=${searchWord}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async changeState(detail_id: number, state: string) {
    const axiosAPI: AxiosRequestConfig = {
      method: "patch",
      url: `/admin/orders/${detail_id}`,
      data: {
        state,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getDeliveryStatus(deliveryDetailId: number) {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin/orders/${deliveryDetailId}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getPendingRefundList(pageNumber: number) {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin/orders/refund?page=${pageNumber}`
    };

    return this.http.axiosAPI(axiosAPI);
  }


  async getPendingRefundDetail(refundId: number) {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin/orders/refund/${refundId}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async refund(refundInfo: RefundInfo) {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/admin/orders/refund/${refundInfo.pendingRefundId}`,
      data: {
        refundInfo,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }
}
