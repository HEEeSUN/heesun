import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from "axios";
import { ErrorMessage } from "../client/service/error";

export default class HttpClient {
  memberAuthError: () => void;
  adminAuthError: () => void;
  apiClient: AxiosInstance;
  expiredSession: () => void;

  constructor(
    baseURL: string | undefined,
    memberAuthError: () => void,
    adminAuthError: () => void,
    expiredSession: () => void
  ) {
    this.memberAuthError = memberAuthError;
    this.adminAuthError = adminAuthError;
    this.apiClient = axios.create({
      baseURL: baseURL,
      withCredentials: true,
    });
    this.expiredSession = expiredSession;
  }

  async axiosAPI(apiOption: AxiosRequestConfig): Promise<any> {
    let result: AxiosResponse;
    let data: any;
    let error: AxiosResponse;
    let message: string = "";

    try {
      result = await this.apiClient(apiOption);
      data = result.data;
      return data;
    } catch (err: any) {
      error = err.response;
    }

    if (error.status > 299 || error.status < 200) {
      if (error.status === 401) {
        if (error.data.code === "ERROR00001") {
          if (error.config.url?.startsWith("/admin")) {
            // this.adminAuthError();
            this.expiredSession();
          } else if (
            error.config.url?.startsWith("/member")
            // error.config.url?.startsWith("/community")
          ) {
            this.memberAuthError();
          }
        }
        message =
          ErrorMessage.find((err) => err.code === error.data.code)
            ?.alertMessage || "예기치 못한 오류가 발생하였습니다";
      } else if (error.status === 403) {
        message = "접근 권한이 없습니다";
      } else if (error.status === 404) {
        message = "페이지를 찾을 수 없습니다";
      } else if (error.data.code === "ERROR50001") {
        message = "socket error";
      } else {
        message =
          ErrorMessage.find((err) => err.code === error.data.code)
            ?.alertMessage || "예기치 못한 오류가 발생하였습니다";
      }

      throw new Error(message);
    }
  }
}
