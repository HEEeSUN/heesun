import { AxiosRequestConfig } from "axios";
import HttpClient from "../../network/http";

export default class MemberService {
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

  async apiDOCS() {
    try {
      const axiosAPI: AxiosRequestConfig = {
        method: "get",
        url: "/api-docs",
      };

     return await this.http.axiosAPI(axiosAPI);
    } catch (error: any) {
      alert(error.message);
    }
  }

  async auth(handleCartQuantity: (quantity: number) => void) {
    try {
      const axiosAPI: AxiosRequestConfig = {
        method: "get",
        url: "/member/auth",
      };

      const result: any = await this.http.axiosAPI(axiosAPI);

      const { username, quantityInCart } = result;
      username ? this.login(username) : this.logout();
      handleCartQuantity(quantityInCart);
    } catch (error: any) {
      alert(error.message);
    }
  }

  /* 로그인 */
  async loginCheck(userInfo: { username: string; password: string }) {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: "/member/login",
      data: {
        userInfo,
      },
    };

    const { username } = await this.http.axiosAPI(axiosAPI);

    this.login(username);
  }

  async kakaoLogin(kakao_account: string) {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/member/login/kakao`,
      data: {
        kakao_account,
      },
    };

    const { username } = await this.http.axiosAPI(axiosAPI);

    this.login(username);
    return;
  }

  async logoff() {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: "/member/logout",
    };

    this.logout();
    await this.http.axiosAPI(axiosAPI);
  }

  async findId(userInfo: { username: string; email: string }) {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: "/member/search?thing=id",
      data: {
        userInfo,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async findPassword(userInfo: { username: string; email: string }) {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: "/member/search?thing=pw",
      data: {
        userInfo,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 회원가입시 아이디 중복 체크 */
  async checkDuplicate(username: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/member/signup?username=${username}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 회원가입 */
  async signup(signupInfo: {
    username: string;
    password?: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    extra_address: string;
  }): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: "/member/signup",
      data: {
        signupInfo,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* cart에 담긴 상품 가져오기 */
  async getProductInfoFromCart(): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: "/member/cart",
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* cart안 상품 제거 */
  async removeCartProduct(cart_id: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "delete",
      url: `/member/cart?id=${cart_id}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 주문목록 가져오기 */
  async getOrderList(
    pageNumber: number,
    date1: string,
    date2: string
  ): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/member/info?page=${pageNumber}&date1=${date1}&date2=${date2}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getMyPost(pageNumber: number): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/member/post?thing=post&page=${pageNumber}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getPostsWithMyComment(pageNumber: number): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/member/post?thing=comment&page=${pageNumber}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getMyReviews(status: "yet" | "done", pageNumber: number): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/member/review?status=${status}&page=${pageNumber}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 주문상태 가져오기 */
  async getDeliveryStatus(detail_id: number): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/member/info/${detail_id}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 리뷰저장 */
  async storeReview(productInfo: {
    product_code: string;
    text: string;
    detail_id: number;
  }): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/member/review`,
      data: {
        product_code: productInfo.product_code,
        text: productInfo.text,
        detail_id: productInfo.detail_id,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getUserInfo(): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/member/info/myInfo`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async modifyUserinfo(userInfo: {
    username?: string;
    name?: string;
    phone?: string;
    email?: string;
    address?: string;
    extra_address?: string;
    password?: string;
  }): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/member/info/myInfo`,
      data: {
        userInfo,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async cancelOrder(orderId: number): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "delete",
      url: `/member/refund/${orderId}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }
}
