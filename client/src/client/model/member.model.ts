import { PostSummary } from "./community.model";

export type MemberService = {
  login: (username: string) => void;
  logout: () => void;
  auth: (handleCartQuantity: (quantity: number) => void) => Promise<void>;
  loginCheck: (userInfo: {
    username: string;
    password: string;
  }) => Promise<void>;
  kakaoLogin: (kakao_account: string) => Promise<void>;
  logoff: () => Promise<void>;
  findId: (userInfo: { name: string; email: string }) => Promise<void>;
  findPassword: (userInfo: { id: string; email: string }) => Promise<void>;
  checkDuplicate: (signupInfo: {
    idCheck: boolean;
    username: string;
  }) => Promise<void>;
  signup: (signupInfo: SignupInfo) => Promise<void>;
  getProductInfoFromCart: () => Promise<{
    adjustmentProduct: AdjustmentProduct[] | [];
    products: CartProducts[] | [];
  }>;
  removeCartProduct: (cartId: string) => Promise<void>;
  getOrderList: (
    pageNumber: number,
    date1: string,
    date2: string
  ) => Promise<{
    username: string;
    orderList: OrderList[] | [];
    orderDetailList: OrderDetailList[] | [];
    hasmore: boolean;
  }>;
  getMyPost: (
    postPageNumber: number
  ) => Promise<{ newPosts: PostSummary[] | []; hasmore: number }>;
  getPostsWithMyComment: (
    postPageNumber: number
  ) => Promise<{ newPosts: PostSummary[] | []; hasmore: number }>;
  getMyReviews: (
    status: "yet" | "done",
    pageNumber: number
  ) => Promise<{ newReviews: MyReviews[] | []; hasmore: number }>;
  getDeliveryStatus: (
    deliveryDetailId: number
  ) => Promise<{ status: Status[] | [] }>;
  storeReview: (productInfo: {
    product_code: string;
    text: string;
    detail_id: number;
  }) => Promise<{ reviewId: number }>;
  getUserInfo: () => Promise<{ userInfo: UserInfo | undefined }>;
  modifyUserinfo: (changeInfo: ChangeInfo) => Promise<void>;
  getUserInfoToOrder: () => Promise<{ userInfo: UserInfo }>;
  requestPay: (payInfo: {
    paymentOption: string;
    amount: number;
    shippingFee: number;
    productPrice: number;
    orderList: CartProducts[];
    orderer: string;
    phone: string;
    address: string;
    extra_address: string;
  }) => Promise<{ orderId: number; merchantUID: string }>;
  payComplete: (
    imp_uid: string,
    merchant_uid: string
  ) => Promise<{ quantityInCart: number }>;
  cancelPayment: (
    merchantUID: string,
    orderList: CartProducts[]
  ) => Promise<void>;
  cancelOrder: (orderId: number) => Promise<void>;
  requestRefund: (
    refundInfo: RefundInfo,
    immediatelyRefundInfo: ImmediatelyRefundInfo,
    pendingRefundInfo: PendingRefundInfo
  ) => Promise<{
    newMerchantUID: string | undefined;
    refundId: number;
    savePoint: SavePoint;
  }>;
  requestRefundToImp: (imp_uid: string | undefined, 
    refundAmount: number) => Promise<void>;
  refundComplete: (merchantUID: string, impUID: string) => Promise<void>;
  refundFail: (
    refundInformation: RefundInfo,
    savePoint: SavePoint) => Promise<void>;
  getOrder: (
    orderId: string
  ) => Promise<{ order: Order; orderDetail: OrderDetails[] | [] }>;
};

export type SignupInfo = {
  idCheck: boolean;
  username: string;
  password: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  extraAddress: string;
};

export type ChangeInfo = {
  username?: string;
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  extra_address?: string;
  password: string;
};

export type UserInfo = {
  username: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  extra_address: string;
};

export type RefundInfo = {
  merchantUID: string;
  impUID: string;
  extraCharge: number;
  prePayment: number;
  refundProduct: OrderDetails[];
  refundAmount: number;
  newMerchantUID?: string;
  refundId?: number;
};

export type SavePoint = {
  products_price: number;
  shippingfee: number;
  rest_refund_amount: number;
  refund_amount: number;
  return_shippingfee: number;
  pending_refund: number;
  paymentOption: string;
}

export type PayInfo = {
  amount: number;
  productName: string;
};

export type ImmediatelyRefundInfo = {
  refundAmountForProduct: number;
  refundAmountForShipping: number;
};

export type PendingRefundInfo = {
  pendingRefundAmountForProduct: number;
  returnShippingFee: number;
  pendingRefundAmountForShipping: number;
};

export const refundReasons = [
  {
    type: "????????????",
    reason: "",
  },
  {
    type: "????????????",
    reason: "???????????? ????????? ????????? ?????? ??????",
  },
  {
    type: "????????????",
    reason: "?????? ???????????????",
  },
  {
    type: "????????????",
    reason: "?????? ??????",
  },
  {
    type: "???????????????",
    reason: "",
  },
  {
    type: "???????????????",
    reason: "????????? ???????????? ?????????",
  },
  {
    type: "???????????????",
    reason: "?????? ??????",
  },
  {
    type: "???????????????",
    reason: "????????? ????????? ??????",
  },
  {
    type: "???????????????",
    reason: "?????? ????????? ?????????",
  },
  {
    type: "???????????????",
    reason: "?????? ??????/????????? ????????? ??????",
  },
];

export type MyReviews = {
  review_id: number;
  main_img_src: string;
  product_name: string;
  product_code: string;
  detail_id: number;
  content: string;
  full_count: number;
  created: string;
  username?: string;
};

export type Status = {
  status: string;
  date: string;
};

export type Order = {
  payment_id: number;
  merchantUID: string;
  imp_uid: string;
  username: string;
  amount: number;
  shippingfee: number;
  products_price: number;
  rest_refund_amount: number;
  refund_amount: number;
  return_shippingfee: number;
  pending_refund: number;
  order_id: number;
  createdAt: string;
  orderer: string;
  address: string;
  extra_address: string;
  phone: string;
  paymentOption: string;
};

export type OrderDetails = {
  detail_id: number;
  order_id: number;
  product_code: string;
  product_name: string;
  quantity: number;
  price: number;
  status: string;
  option1: string;
  option2: string;
  main_img_src: string;
  refund_deadline: string;
  refundStatus: string;
  refundId: number;
  refundReason?: string;
};

export type OrderList = {
  order_id: number;
  full_count: number;
  created: string;
};

export type OrderDetailList = {
  detail_id: number;
  order_id: number;
  product_code: string;
  product_name: string;
  quantity: number;
  price: number;
  status: string;
  option1: string;
  option2: string;
  main_img_src: string;
  refund_deadline: string;
  refundStatus: string;
  refundId: number;
};

export type CartProducts = {
  cart_id: number;
  stock: number;
  selected: boolean;
  main_img_src: string;
  product_code: string;
  option_number: number;
  name: string;
  option1: string;
  option2: string;
  price: number;
  quantity: number;
  sale_price: number | null;
};

export type AdjustmentProduct = {
  name: string;
  quantity: number;
};
