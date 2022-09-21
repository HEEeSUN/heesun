import { AxiosRequestConfig } from "axios";
import HttpClient from "../../network/http";
import { Menulist } from "../model/admin.model";

export default class AdminService {
  http: HttpClient;
  login: (username: string) => void;
  logout: () => void;
  setMenus: (menuList: Menulist[]) => void;

  constructor(
    http: HttpClient,
    login: (username: string) => void,
    logout: () => void,
    setMenus: (menuList: Menulist[]) => void
  ) {
    this.http = http;
    this.login = login;
    this.logout = logout;
    this.setMenus = setMenus;
  }

  async auth() {
    try {
      const axiosAPI: AxiosRequestConfig = {
        method: "get",
        url: `/admin/auth`,
      };

      const result = await this.http.axiosAPI(axiosAPI);
      const { username, menuList } = result;

      if (username && menuList.length > 0) {
        this.login(username)
        this.setMenus(menuList);
      } else {
        this.logout();
      }
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

    const { username, menuList } = await this.http.axiosAPI(axiosAPI);

    if (username && menuList.length > 0) {
      this.login(username)
      this.setMenus(menuList);
    } 
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
