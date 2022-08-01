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

  async findId(userInfo: { name: string; email: string }) {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: "/member/search?id=true",
      data: {
        userInfo,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async findPassword(userInfo: { id: string; email: string }) {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: "/member/search?pw=true",
      data: {
        userInfo,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 회원가입시 아이디 중복 체크 */
  async checkDuplicate(signupInfo: {
    idCheck: boolean;
    username: string;
  }): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: "/member/signup",
      data: {
        idCheck: signupInfo.idCheck,
        username: signupInfo.username,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 회원가입 */
  async signup(signupInfo: {
    idCheck: boolean;
    username: string;
    password?: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    extraAddress: string;
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
      url: `/member/post?post=true&page=${pageNumber}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async getPostsWithMyComment(pageNumber: number): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/member/post?comment=true&page=${pageNumber}`,
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
      url: `/member/info/delivery?id=${detail_id}`,
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
    password: string;
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

  async getUserInfoToOrder(): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/member/order`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /*결제요청시 merchantUID 생성을 위한 1차 결제 정보 저장*/
  async requestPay(payInfo: {
    paymentOption: string;
    amount: number;
    shippingFee: number;
    productPrice: number;
    orderList: any;
    orderer: string;
    phone: string;
    address: string;
    extra_address: string;
  }): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/member/order`,
      data: {
        paymentOption: payInfo.paymentOption,
        amount: payInfo.amount,
        shippingFee: payInfo.shippingFee,
        productPrice: payInfo.productPrice,
        newArray: payInfo.orderList,
        orderer: payInfo.orderer,
        phone: payInfo.phone,
        address: payInfo.address,
        extra_address: payInfo.extra_address,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* PG사를 이용한 결제 성공시 주문 상품 관련 정보 DB 저장*/
  async payComplete(imp_uid: string, merchant_uid: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/member/order/paycomplete`,
      data: {
        imp_uid,
        merchant_uid,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async cancelPayment(merchantUID: string, newArray: any): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/member/order/cancel`,
      data: {
        merchantUID,
        newArray,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async cancelOrder(orderId: number): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/member/refund/${orderId}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async requestRefund(
    refundInfo: {
      merchantUID: string;
      impUID: string;
      extraCharge: number;
      refundProduct: any;
      refundAmount: number;
    },
    immediatelyRefundInfo: {
      refundAmountForProduct: number;
      refundAmountForShipping: number;
    },
    pendingRefundInfo: {
      pendingRefundAmountForProduct: number;
      returnShippingFee: number;
      pendingRefundAmountForShipping: number;
    }
  ): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/member/refund`,
      data: {
        refundInfo,
        immediatelyRefundInfo,
        pendingRefundInfo,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* PG사를 이용한 결제 성공시 주문 상품 관련 정보 DB 저장*/
  async refundComplete(imp_uid: string, merchant_uid: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/member/refund/paycomplete`,
      data: {
        imp_uid: imp_uid,
        merchant_uid: merchant_uid,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  async refundFail(
    refundInfo: {
      merchantUID: string;
      impUID: string;
      extraCharge: number;
      refundProduct: any;
      refundAmount: number;
      newMerchantUID?: string;
      refundId?: number;
    },
    refundFailInfo: any
  ): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "post",
      url: `/member/refund/cancel`,
      data: {
        refundInfo,
        refundFailInfo,
      },
    };

    return this.http.axiosAPI(axiosAPI);
  }

  /* 환불페이지에 주문 내역 불러오기 */
  async getOrder(orderId: string): Promise<any> {
    const axiosAPI: AxiosRequestConfig = {
      method: "get",
      url: `/member/refund/${orderId}`,
    };

    return this.http.axiosAPI(axiosAPI);
  }
}
