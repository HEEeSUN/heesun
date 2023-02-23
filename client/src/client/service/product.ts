import { AxiosRequestConfig } from "axios";
import HttpClient from "../../network/http";

export default class ProductService {
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async addToCart(product: {
    product_code: string;
    price: number | undefined;
    option_number: number | null;
    quantity: number;
  }): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: "/member/cart",
      data: {
        product_code: product.product_code,
        price: product.price,
        option_number: product.option_number,
        quantity: product.quantity,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 상품목록 가져오기 */
  async getProducts(): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/home?page=${1}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 검색 상품 목록 가져오기 */
  async getSearchProduct(
    searchWord: string,
    sortCode: string,
    pageNumber: number
  ): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/home?searchWord=${searchWord}&sortCode=${sortCode}&page=${pageNumber}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 특정 상품 가져오기 */
  async getProduct(product_code: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/home/${product_code}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 리뷰 가져오기 */
  async getReviews(product_code: string, pageNum: number): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/home/${product_code}/reviews?reviewPage=${pageNum}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }
}
