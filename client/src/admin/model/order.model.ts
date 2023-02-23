export type AdminOrderService = {
  getOrderListByWord: (
    pageNumber: number,
    startDate: string,
    endDate: string,
    category: string,
    status: string,
    searchWord: string
  ) => Promise<{
    orderList: Orders[] | [];
    orderPageLength: number;
    refundNum: number;
  }>;
  changeState: (detail_id: number, state: string) => Promise<void>;
  getDeliveryStatus: (deliveryDetailId: number) => Promise<{
    status: DeliveryStatus[] | [];
  }>;
  getPendingRefundList: (pageNumber: number) => Promise<{
    refundList: RefundList[] | [];
    orderPageLength: number;
  }>;
  getPendingRefundDetail: (refundId: number) => Promise<{
    refundDetail: RefundDetails[] | [];
    paymentInfo: PaymentInfo;
  }>;
  refund: (refundInfo: RefundInfo) => Promise<void>;
};

export type ReturnDate = {
  startDate: string;
  endDate: string;
};

export type RefundList = {
  pendingRefundId: number;
  merchantUID: string;
  product_name: string;
  count: number;
};

export type Orders = {
  createdAt: string;
  created: string;
  product_code: string;
  product_name: string;
  merchantUID: string;
  quantity: number;
  username: string;
  name: string;
  status: string;
  detail_id: number;
  refundStatus: string;
  phone: string;
  address: string;
  extra_address: string;
};

export type Order = {
  product_name: string;
  paymentOption: string;
  price: number;
  deliverystatus: string;
  quantity: number;
  merchantUID: string;
  orderer: string;
  phone: string;
  address: string;
  extra_address: string;
  detail_id: number;
  amount: number;
  refund_amount: number;
  rest_refund_amount: number;
  shippingfee: number;
  return_shippingfee: number;
  imp_uid: string;
  refundStatus: string;
  refundId: number;
};

export type OrderList = [order: Order];

export type DeliveryStatus = {
  status: string;
  date: string;
};

export type RefundInfo = {
  pendingRefundId: number;
  merchantUID: string | undefined;
  imp_uid: string | undefined;
  detailId: number[];
  realRefundProducts: number;
  realRefundShippingFee: number;
  realReturnShippingFee: number;
  refundAmount: number;
  setOff: number;
  extraPay: number;
};

export type PaymentInfo = {
  merchantUID: string;
  payAmount: number;
  imp_uid: string;
  paymentOption: string;
  orderer: string;
  address: string;
  extra_address: string;
  phone: string;
  pendingRefundId: number;
  amount: number;
  productsPrice: number;
  shippingFee: number;
  returnShippingFee: number;
  setOff: number;
  extraPay: number;
  pastAmount: number;
};

export type RefundDetails = {
  detail_id: number;
  product_name: string;
  price: number;
  quantity: number;
  deliverystatus: string;
};
