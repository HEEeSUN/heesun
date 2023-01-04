import { AxiosRequestConfig } from "axios";
import HttpClient from "../../network/http";

export default class AdminInquiryService {
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async getInquiry(id: number) {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin/contact/${id}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getInquiries(pageNumber: number) {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin/contact?page=${pageNumber}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async answer(
    inquiryId: number | undefined,
    text: string
  ) {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/admin/contact/${inquiryId}`,
      data: {
        text,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }
}
