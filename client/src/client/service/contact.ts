import { AxiosRequestConfig } from "axios";
import HttpClient from "../../network/http";
import { inquiryInformation } from "../model/contact.model";

export default class ContactService {
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async writeInquiry(inquiryInformation: inquiryInformation): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/contact`,
      data: {
        inquiryInformation,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }
}
