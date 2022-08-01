import { AxiosRequestConfig } from "axios";
import HttpClient from "../../network/http";

export default class AdminChattingService {
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async getInquiry() {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin/inquiries`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getChatting(roomname: string, pageNumber: number) {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin/inquiries/${roomname}?page=${pageNumber}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getNewChatting(roomname: string) {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin/inquiries/${roomname}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async deleteChat(roomname: string) {
    const axiosAPI: AxiosRequestConfig = {
      method: "delete",
      url: `/admin/inquiries/${roomname}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async sendMessage(
    uniqueId: string,
    chat: string,
    roomname: string,
    master: boolean
  ) {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/admin/inquiries/${roomname}`,
      data: {
        uniqueId,
        text: chat,
        masterLeaveOrNot: master,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }
}
