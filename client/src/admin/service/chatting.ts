import { AxiosRequestConfig } from "axios";
import HttpClient from "../../network/http";

export default class AdminChattingService {
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async getInquiry(socketId: string, chattingUser: string) {
    console.log("this : " + socketId);
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin/inquiries?id=${socketId}&user=${chattingUser}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getChatting(
    roomname: string,
    pageNumber: number,
    chattingUser: string
  ) {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin/inquiries/${roomname}?page=${pageNumber}&user=${chattingUser}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getNewChatting(roomname: string, chattingUser: string) {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin/inquiries/${roomname}?user=${chattingUser}`,
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
    master: boolean,
    socketId: string,
    chattingUser: string
  ) {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/admin/inquiries/${roomname}`,
      data: {
        uniqueId,
        message: chat,
        readAMsg: master,
        socketId,
        chattingUser,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }
}
