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
  getPendingRefund: (pageNumber: number) => Promise<{
    refundList: RefundAmount[] | [];
    orderList: OrderList[] | [];
    orderPageLength: number;
  }>;
  refund: (refundInfo: RefundInfo) => Promise<void>;
  refundFail: (savePoint: SavePoint) => Promise<void>;
  getDeliveryStatus: (deliveryDetailId: number) => Promise<{
    status: DeliveryStatus[] | [];
  }>;
  changeState: (detail_id: number, state: string) => Promise<void>;
};

export type ReturnDate = {
  startDate: string;
  endDate: string;
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

export type RefundAmount = {
  refundId: number;
  merchantUID: string;
  impUID: string;
  refundShippingFee: number;
  refundProductPrice: number;
  returnShippingFee: number;
  extraPay: number;
  reflection: boolean;
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

export type SavePoint = {
  payment: {
    restRefundAmount: number;
    refundAmount: number;
    returnShippingFee: number;
    shippingFee: number;
  };
  pending: Refund | undefined;
};

export type RefundInfo = {
  refundId: number | undefined;
  merchantUID: string;
  impUID: string;
  all: boolean;
  detailId: number[];
  realRefundProducts: number;
  realRefundShippingFee: number;
  realReturnShippingFee: number;
};

export type Refund = {
  refundId: number;
  merchantUID: string;
  impUID: string;
  refundShippingFee: number;
  refundProductPrice: number;
  returnShippingFee: number;
};
