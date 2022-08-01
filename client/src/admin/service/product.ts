import { AxiosRequestConfig } from "axios";
import HttpClient from "../../network/http";

export default class AdminProductService {
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async getInitialData() {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin/home`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getProduct(category: string, searchText: string, pageNumber: number) {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin/products?category=${category}&search=${searchText}&page=${pageNumber}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getDetail(code: string) {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin/products/${code}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async duplicateCheck(product_code: string) {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/admin/products/codeCheck`,
      data: {
        product_code,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async addProduct(formData: FormData) {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/admin/products`,
      data: formData,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async updateProduct(code: string, formData: FormData) {
    const axiosAPI: AxiosRequestConfig = {
      method: "patch",
      url: `/admin/products/${code}`,
      data: formData,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async deleteProduct(code: string) {
    const axiosAPI: AxiosRequestConfig = {
      method: "delete",
      url: `/admin/products/${code}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }
}
