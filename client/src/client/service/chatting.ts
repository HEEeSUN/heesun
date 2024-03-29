import { AxiosRequestConfig } from "axios";
import HttpClient from "../../network/http";

export default class ChattingService {
  http: HttpClient;

  constructor(http: HttpClient) {
    this.http = http;
  }

  async getChattings(socketId: string, chattingUser: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/chatting?id=${socketId}&user=${chattingUser}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async deleteChatting(roomname: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "delete",
      url: `/chatting/${roomname}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async createRoom(socketId: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/chatting`,
      data: {
        socketId,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async sendMessage(
    uniqueId: string,
    text: string,
    roomname: string,
    masterLeaveOrNot: boolean,
    socketId: string,
    chattingUser: string
  ): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/chatting/${roomname}`,
      data: {
        uniqueId,
        message: text,
        readAMsg: masterLeaveOrNot,
        socketId,
        chattingUser,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getMessage(
    roomname: string,
    pageNumber: number,
    chattingUser: string
  ): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/chatting/${roomname}?page=${pageNumber}&user=${chattingUser}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getMyMessage(roomname: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/chatting/${roomname}?my=true`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getNewMessage(roomname: string, chattingUser: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/chatting/${roomname}/new?user=${chattingUser}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }
}
