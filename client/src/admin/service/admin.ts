import { AxiosRequestConfig } from "axios";
import HttpClient from "../../network/http";

export default class AdminService {
  http: HttpClient;
  login: (username: string) => void;
  logout: () => void;

  constructor(
    http: HttpClient,
    login: (username: string) => void,
    logout: () => void
  ) {
    this.http = http;
    this.login = login;
    this.logout = logout;
  }

  async auth() {
    try {
      const axiosAPI: AxiosRequestConfig = {
        method: "get",
        url: `/admin/auth`,
      };

      const result = await this.http.axiosAPI(axiosAPI);
      const { admin } = result;

      admin ? this.login(admin) : this.logout();
    } catch (error: any) {
      alert(error.message);
    }
  }

  async adminLogin(admin: string, password: string) {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/admin`,
      data: {
        admin,
        password,
      },
    };

    const result = await this.http.axiosAPI(axiosAPI);

    this.login(result.admin);
  }

  async logoff() {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin/logout`,
    };

    this.logout();
    await this.http.axiosAPI(axiosAPI);
  }

  async getMenuList() {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/admin`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async createAdmin(admin: string, password: string, menuList: string[]) {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/admin/account`,
      data: {
        admin,
        password,
        menuList,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }
}
