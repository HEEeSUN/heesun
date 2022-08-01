import { AxiosRequestConfig } from "axios";
import HttpClient from "../../network/http";
import { Product, SaleTime, ChangeProduct } from "../model/discount.model";

export default class AdminDiscountService {
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async getProductWithOption(
    category: string,
    searchText: string,
    pageNumber: number
  ) {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin/products?option=true&category=${category}&search=${searchText}&page=${pageNumber}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getSaleList() {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin/discount`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async addSaleProduct(productList: Product[], saleTime: SaleTime | undefined) {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/admin/discount`,
      data: {
        productList,
        saleTime,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async updateSaleProduct(
    timeId: number,
    changeList: ChangeProduct[],
    deleteList: number[]
  ) {
    const axiosAPI: AxiosRequestConfig = {
      method: "patch",
      url: `/admin/discount`,
      data: {
        timeId,
        changeList,
        deleteList,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async deleteSaleGroup(timeId?: number) {
    const axiosAPI: AxiosRequestConfig = {
      method: "delete",
      url: `/admin/discount/${timeId}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }
}
