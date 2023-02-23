export type OrderService = {
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
  completeOrder: (impUID: string, merchantUID: string) => Promise<{
    quantityInCart: number;
  }>;
  failedOrder: (merchantUID: string) => Promise<void>;
  getNewOrder: (
    orderId: string
  ) => Promise<{ order: Order; orderDetail: OrderDetails[] | [] }>;
  getOrder: (
    orderId: string
  ) => Promise<{ order: Order; orderDetail: OrderDetails[] | [] }>;
  payAndRefund: (
    refundInfo: RefundInfo,
    immediatelyRefundInfo: ImmediatelyRefundInfo,
    pendingRefundInfo: PendingRefundInfo,
    orderId: string
  ) => Promise<{newMerchantUID: string}>;
  refund: (
    refundInfo: RefundInfo,
    immediatelyRefundInfo: ImmediatelyRefundInfo,
    pendingRefundInfo: PendingRefundInfo,
    orderId: string
  ) => Promise<void>;
  completeRefund: (
    orderId: string,
    impUID: string,
    merchantUID: string
  ) => Promise<void>;
  failedRefund: (
    orderId: string,
    merchantUID: string
  ) => Promise<void>;
};

export type UserInfo = {
  username: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  extra_address: string;
};

export type PayInfo = {
  amount: number;
  productName: string;
};

export type RefundInfo = {
  merchantUID: string;
  imp_uid: string;
  extraCharge: number;
  prePayment: number;
  refundProduct: orderDetailIdArray[];
  refundAmount: number;
}

export type orderDetailIdArray = {
  detail_id: number;
  status: string;
}

export type ImmediatelyRefundInfo = {
  refundAmountForProduct: number;
  refundAmountForShipping: number;
};

export type PendingRefundInfo = {
  pendingRefundAmountForProduct: number;
  returnShippingFee: number;
  pendingRefundAmountForShipping: number;
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

export const refundReasons = [
  {
    type: "단순변심",
    reason: "",
  },
  {
    type: "단순변심",
    reason: "사이즈나 색상이 기대한 것과 다름",
  },
  {
    type: "단순변심",
    reason: "그냥 필요없어짐",
  },
  {
    type: "단순변심",
    reason: "주문 실수",
  },
  {
    type: "상품불만족",
    reason: "",
  },
  {
    type: "상품불만족",
    reason: "상품이 파손되어 배송됨",
  },
  {
    type: "상품불만족",
    reason: "배송 지연",
  },
  {
    type: "상품불만족",
    reason: "상품이 설명과 다름",
  },
  {
    type: "상품불만족",
    reason: "다른 상품이 배송됨",
  },
  {
    type: "상품불만족",
    reason: "상품 결함/기능에 이상이 있음",
  },
];
