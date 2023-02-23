import RefundController from "../../controller/refund.js";
import httpMocks from "node-mocks-http";

describe("refund", () => {
  let refundRepository;
  let refundController;

  beforeEach(() => {
    refundRepository = {};
    refundController = new RefundController(refundRepository);
  });

  describe("getOrder", () => {
    //환불요청할주문내역
    it("성공", async () => {
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();
      const order = {
        merchantUID: "주문번호",
        imp_uid: "대행사 주문번호",
        paymentOption: "결제방법",
        amount: 15000,
        products_price: 12000,
        shippingfee: 3000,
        orderer: "홍길동",
        phone: "01013245678",
        address: "주소",
        extra_address: "상세주소",
      };
      const order_detail = [{ detail_id: 1 }];
      const refundAmount = {
        amount: 0,
        productsPrice: 0,
        shippingFee: 0,
        returnShippingFee: 0,
        setOff: 0,
        extraPay: 0,
      };

      refundRepository.getOrder = jest.fn(() => {
        return order;
      });
      refundRepository.getOrderDetailByOrderId = jest.fn(() => {
        return order_detail;
      });
      refundRepository.getRefundInformation = jest.fn(() => {
        return refundAmount;
      });

      await refundController.getOrder(request, response);

      expect(response.statusCode).toBe(200);
    });

    it("실패 : order 아이디로 주문 정보를 찾을 수 없는 경우", async () => {
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();
      const order = {
        merchantUID: "주문번호",
        imp_uid: "대행사 주문번호",
        paymentOption: "결제방법",
        amount: 15000,
        products_price: 12000,
        shippingfee: 3000,
        orderer: "홍길동",
        phone: "01013245678",
        address: "주소",
        extra_address: "상세주소",
      };
      const order_detail = [{ detail_id: 1 }];
      const refundAmount = {
        amount: 0,
        productsPrice: 0,
        shippingFee: 0,
        returnShippingFee: 0,
        setOff: 0,
        extraPay: 0,
      };

      refundRepository.getOrder = jest.fn(() => {
        return;
      });
      refundRepository.getOrderDetailByOrderId = jest.fn(() => {
        return order_detail;
      });
      refundRepository.getRefundInformation = jest.fn(() => {
        return refundAmount;
      });

      await refundController.getOrder(request, response);

      expect(response.statusCode).toBe(404);
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();
      const order = {
        merchantUID: "주문번호",
        imp_uid: "대행사 주문번호",
        paymentOption: "결제방법",
        amount: 15000,
        products_price: 12000,
        shippingfee: 3000,
        orderer: "홍길동",
        phone: "01013245678",
        address: "주소",
        extra_address: "상세주소",
      };
      const order_detail = [{ detail_id: 1 }];
      const refundAmount = {
        amount: 0,
        productsPrice: 0,
        shippingFee: 0,
        returnShippingFee: 0,
        setOff: 0,
        extraPay: 0,
      };

      refundRepository.getOrder = jest.fn(() => {
        return order;
      });
      refundRepository.getOrderDetailByOrderId = jest.fn(() => {
        throw new Error();
      });
      refundRepository.getRefundInformation = jest.fn(() => {
        return refundAmount;
      });

      await refundController.getOrder(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("refund", () => {
    it("성공 : 즉시 환불만 있는 경우", async () => {
      const refundProducts = [
        {
          detail_id: 1,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundInfo = {
        merchantUID: "주문번호",
        imp_uid: "대행사 주문번호",
        extraCharge: 0,
        prePayment: 0,
        refundProduct: refundProducts,
        refundAmount: 15000,
      };
      const immediatelyRefundInfo = {
        refundAmountForProduct: 12000,
        refundAmountForShipping: 3000,
      };
      const pendingRefundInfo = {
        pendingRefundAmountForProduct: 0,
        returnShippingFee: 0,
        pendingRefundAmountForShipping: 0,
      };
      const payment = {
        paymentOption: "kakao",
        products_price: 12000,
        shippingfee: 3000,
      };
      const alreadyRefund = {
        productsPrice: 0,
        shippingFee: 0,
      };
      const request = httpMocks.createRequest({
        body: {
          refundInfo,
          immediatelyRefundInfo,
          pendingRefundInfo,
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.refund = jest.fn(() => {
        return 1;
      });
      refundRepository.pendingRefund = jest.fn(() => {
        return 1;
      });

      await refundController.refund(request, response, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("성공 : 확인후 환불만 있는 경우", async () => {
      const refundProducts = [
        {
          detail_id: 1,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundInfo = {
        merchantUID: "주문번호",
        imp_uid: "대행사 주문번호",
        extraCharge: 0,
        prePayment: 0,
        refundProduct: refundProducts,
        refundAmount: 0,
      };
      const immediatelyRefundInfo = {
        refundAmountForProduct: 0,
        refundAmountForShipping: 0,
      };
      const pendingRefundInfo = {
        pendingRefundAmountForProduct: 12000,
        returnShippingFee: 0,
        pendingRefundAmountForShipping: 3000,
      };
      const request = httpMocks.createRequest({
        paymentOption: "cash",
        body: {
          refundInfo,
          immediatelyRefundInfo,
          pendingRefundInfo,
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.refund = jest.fn(() => {
        return 1;
      });
      refundRepository.pendingRefund = jest.fn(() => {
        return 1;
      });

      await refundController.refund(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(200);
    });

    it("실패 : 위 경우 둘다 있는 경우 실패시", async () => {
      const refundProducts = [
        {
          detail_id: 1,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
        {
          detail_id: 2,
          status: "배송중",
          price: 10000,
          quantity: 1,
        },
      ];
      const refundInfo = {
        merchantUID: "주문번호",
        imp_uid: "대행사 주문번호",
        extraCharge: 0,
        prePayment: 5000,
        refundProduct: refundProducts,
        refundAmount: 7000,
      };
      const immediatelyRefundInfo = {
        refundAmountForProduct: 12000,
        refundAmountForShipping: 0,
      };
      const pendingRefundInfo = {
        pendingRefundAmountForProduct: 10000,
        returnShippingFee: 5000,
        pendingRefundAmountForShipping: 3000,
      };
      const request = httpMocks.createRequest({
        paymentOption: "kakao",
        body: {
          refundInfo,
          immediatelyRefundInfo,
          pendingRefundInfo,
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.refund = jest.fn(() => {
        return 1;
      });
      refundRepository.pendingRefund = jest.fn(() => {
        return;
      });
      refundRepository.deleteRefundId = jest.fn();

      await refundController.refund(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(refundRepository.deleteRefundId).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(400);
    });

    it("실패: 즉시 환불만 있는 경우 실패시", async () => {
      const refundProducts = [
        {
          detail_id: 1,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundInfo = {
        merchantUID: "주문번호",
        imp_uid: "대행사 주문번호",
        extraCharge: 0,
        prePayment: 0,
        refundProduct: refundProducts,
        refundAmount: 15000,
      };
      const immediatelyRefundInfo = {
        refundAmountForProduct: 12000,
        refundAmountForShipping: 3000,
      };
      const pendingRefundInfo = {
        pendingRefundAmountForProduct: 0,
        returnShippingFee: 0,
        pendingRefundAmountForShipping: 0,
      };
      const payment = {
        paymentOption: "kakao",
        products_price: 12000,
        shippingfee: 3000,
      };
      const alreadyRefund = {
        productsPrice: 0,
        shippingFee: 0,
      };
      const request = httpMocks.createRequest({
        body: {
          refundInfo,
          immediatelyRefundInfo,
          pendingRefundInfo,
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.refund = jest.fn(() => {
        return;
      });
      refundRepository.pendingRefund = jest.fn(() => {
        return 1;
      });

      await refundController.refund(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });

    it("실패: 확인후 환불만 있는 경우 실패시", async () => {
      const refundProducts = [
        {
          detail_id: 1,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundInfo = {
        merchantUID: "주문번호",
        imp_uid: "대행사 주문번호",
        extraCharge: 0,
        prePayment: 0,
        refundProduct: refundProducts,
        refundAmount: 0,
      };
      const immediatelyRefundInfo = {
        refundAmountForProduct: 0,
        refundAmountForShipping: 0,
      };
      const pendingRefundInfo = {
        pendingRefundAmountForProduct: 12000,
        returnShippingFee: 0,
        pendingRefundAmountForShipping: 3000,
      };
      const request = httpMocks.createRequest({
        paymentOption: "cash",
        body: {
          refundInfo,
          immediatelyRefundInfo,
          pendingRefundInfo,
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.refund = jest.fn(() => {
        return 1;
      });
      refundRepository.pendingRefund = jest.fn(() => {
        return;
      });
      refundRepository.deleteRefundId = jest.fn();

      await refundController.refund(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(refundRepository.deleteRefundId).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });

    it("성공: catch error", async () => {
      const refundProducts = [
        {
          detail_id: 1,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundInfo = {
        merchantUID: "주문번호",
        imp_uid: "대행사 주문번호",
        extraCharge: 0,
        prePayment: 0,
        refundProduct: refundProducts,
        refundAmount: 15000,
      };
      const immediatelyRefundInfo = {
        refundAmountForProduct: 12000,
        refundAmountForShipping: 3000,
      };
      const pendingRefundInfo = {
        pendingRefundAmountForProduct: 0,
        returnShippingFee: 0,
        pendingRefundAmountForShipping: 0,
      };
      const payment = {
        paymentOption: "kakao",
        products_price: 12000,
        shippingfee: 3000,
      };
      const alreadyRefund = {
        productsPrice: 0,
        shippingFee: 0,
      };
      const request = httpMocks.createRequest({
        body: {
          refundInfo,
          immediatelyRefundInfo,
          pendingRefundInfo,
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.refund = jest.fn(() => {
        throw new Error();
      });
      refundRepository.pendingRefund = jest.fn(() => {
        return 1;
      });

      await refundController.refund(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });
  });
  describe("validateRefundInformation", () => {
    it("성공", async () => {
      const refundProducts = [
        {
          detail_id: 1,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundProductsByDb = [
        {
          detail_id: 1,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundInfo = {
        merchantUID: "주문번호",
        imp_uid: "대행사 주문번호",
        extraCharge: 0,
        prePayment: 0,
        refundProduct: refundProducts,
        refundAmount: 15000,
      };
      const immediatelyRefundInfo = {
        refundAmountForProduct: 12000,
        refundAmountForShipping: 3000,
      };
      const pendingRefundInfo = {
        pendingRefundAmountForProduct: 0,
        returnShippingFee: 0,
        pendingRefundAmountForShipping: 0,
      };
      const request = httpMocks.createRequest({
        body: {
          refundInfo,
          immediatelyRefundInfo,
          pendingRefundInfo,
        },
      });
      const payment = {
        paymentOption: "kakao",
        products_price: 12000,
        shippingfee: 3000,
      };
      const alreadyRefund = {
        productsPrice: 0,
        shippingFee: 0,
      };
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.getOrderDetailByIds = jest.fn(() => {
        return refundProductsByDb;
      });
      refundRepository.getPaymentInformation = jest.fn(() => {
        return payment;
      });
      refundRepository.getRefundInformation = jest.fn(() => {
        return alreadyRefund;
      });

      await refundController.validateRefundInformation(request, response, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("성공 : 확인후 환불만 있는 경우", async () => {
      const refundProducts = [
        {
          detail_id: 1,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundProductsByDb = [
        {
          detail_id: 1,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundInfo = {
        merchantUID: "주문번호",
        imp_uid: "대행사 주문번호",
        extraCharge: 0,
        prePayment: 0,
        refundProduct: refundProducts,
        refundAmount: 0,
      };
      const immediatelyRefundInfo = {
        refundAmountForProduct: 0,
        refundAmountForShipping: 0,
      };
      const pendingRefundInfo = {
        pendingRefundAmountForProduct: 12000,
        returnShippingFee: 0,
        pendingRefundAmountForShipping: 3000,
      };
      const request = httpMocks.createRequest({
        body: {
          refundInfo,
          immediatelyRefundInfo,
          pendingRefundInfo,
        },
      });
      const payment = {
        paymentOption: "cash",
        products_price: 12000,
        shippingfee: 3000,
      };
      const alreadyRefund = {
        productsPrice: 0,
        shippingFee: 0,
      };
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.getOrderDetailByIds = jest.fn(() => {
        return refundProductsByDb;
      });
      refundRepository.getPaymentInformation = jest.fn(() => {
        return payment;
      });
      refundRepository.getRefundInformation = jest.fn(() => {
        return alreadyRefund;
      });

      await refundController.validateRefundInformation(request, response, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("실패 : 환불 상품의 정보가 다른 경우1", async () => {
      const refundProducts = [
        {
          detail_id: 1,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
        {
          detail_id: 2,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundProductsByDb = [
        {
          detail_id: 1,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundInfo = {
        merchantUID: "주문번호",
        imp_uid: "대행사 주문번호",
        extraCharge: 0,
        prePayment: 0,
        refundProduct: refundProducts,
        refundAmount: 15000,
      };
      const immediatelyRefundInfo = {
        refundAmountForProduct: 12000,
        refundAmountForShipping: 3000,
      };
      const pendingRefundInfo = {
        pendingRefundAmountForProduct: 0,
        returnShippingFee: 0,
        pendingRefundAmountForShipping: 0,
      };
      const request = httpMocks.createRequest({
        body: {
          refundInfo,
          immediatelyRefundInfo,
          pendingRefundInfo,
        },
      });
      const payment = {
        paymentOption: "kakao",
        products_price: 12000,
        shippingfee: 3000,
      };
      const alreadyRefund = {
        productsPrice: 0,
        shippingFee: 0,
      };
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.getOrderDetailByIds = jest.fn(() => {
        return refundProductsByDb;
      });
      refundRepository.getPaymentInformation = jest.fn(() => {
        return payment;
      });
      refundRepository.getRefundInformation = jest.fn(() => {
        return alreadyRefund;
      });

      await refundController.validateRefundInformation(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response._getJSONData().code).toBe("ERROR40001");
      expect(response.statusCode).toBe(400);
    });

    it("실패 : 환불 상품의 정보가 다른 경우2", async () => {
      const refundProducts = [
        {
          detail_id: 1,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundProductsByDb = [
        {
          detail_id: 1,
          status: "배송중",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundInfo = {
        merchantUID: "주문번호",
        imp_uid: "대행사 주문번호",
        extraCharge: 0,
        prePayment: 0,
        refundProduct: refundProducts,
        refundAmount: 15000,
      };
      const immediatelyRefundInfo = {
        refundAmountForProduct: 12000,
        refundAmountForShipping: 3000,
      };
      const pendingRefundInfo = {
        pendingRefundAmountForProduct: 0,
        returnShippingFee: 0,
        pendingRefundAmountForShipping: 0,
      };
      const request = httpMocks.createRequest({
        body: {
          refundInfo,
          immediatelyRefundInfo,
          pendingRefundInfo,
        },
      });
      const payment = {
        paymentOption: "kakao",
        products_price: 12000,
        shippingfee: 3000,
      };
      const alreadyRefund = {
        productsPrice: 0,
        shippingFee: 0,
      };
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.getOrderDetailByIds = jest.fn(() => {
        return refundProductsByDb;
      });
      refundRepository.getPaymentInformation = jest.fn(() => {
        return payment;
      });
      refundRepository.getRefundInformation = jest.fn(() => {
        return alreadyRefund;
      });

      await refundController.validateRefundInformation(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });

    it("실패 : 환불 상품이 없는 경우", async () => {
      const refundProducts = "";
      const refundProductsByDb = [
        {
          detail_id: 1,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundInfo = {
        merchantUID: "주문번호",
        imp_uid: "대행사 주문번호",
        extraCharge: 0,
        prePayment: 0,
        refundProduct: refundProducts,
        refundAmount: 15000,
      };
      const immediatelyRefundInfo = {
        refundAmountForProduct: 12000,
        refundAmountForShipping: 3000,
      };
      const pendingRefundInfo = {
        pendingRefundAmountForProduct: 0,
        returnShippingFee: 0,
        pendingRefundAmountForShipping: 0,
      };
      const request = httpMocks.createRequest({
        body: {
          refundInfo,
          immediatelyRefundInfo,
          pendingRefundInfo,
        },
      });
      const payment = {
        paymentOption: "kakao",
        products_price: 12000,
        shippingfee: 3000,
      };
      const alreadyRefund = {
        productsPrice: 0,
        shippingFee: 0,
      };
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.getOrderDetailByIds = jest.fn(() => {
        return refundProductsByDb;
      });
      refundRepository.getPaymentInformation = jest.fn(() => {
        return payment;
      });
      refundRepository.getRefundInformation = jest.fn(() => {
        return alreadyRefund;
      });

      await refundController.validateRefundInformation(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response._getJSONData().code).toBe("ERROR40001");
      expect(response.statusCode).toBe(400);
    });

    it("실패 : 입금대기중인 상품이 있는 경우", async () => {
      const refundProducts = [
        {
          detail_id: 1,
          status: "입금대기중",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundProductsByDb = [
        {
          detail_id: 1,
          status: "입금대기중",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundInfo = {
        merchantUID: "주문번호",
        imp_uid: "대행사 주문번호",
        extraCharge: 0,
        prePayment: 0,
        refundProduct: refundProducts,
        refundAmount: 15000,
      };
      const immediatelyRefundInfo = {
        refundAmountForProduct: 12000,
        refundAmountForShipping: 3000,
      };
      const pendingRefundInfo = {
        pendingRefundAmountForProduct: 0,
        returnShippingFee: 0,
        pendingRefundAmountForShipping: 0,
      };
      const request = httpMocks.createRequest({
        body: {
          refundInfo,
          immediatelyRefundInfo,
          pendingRefundInfo,
        },
      });
      const payment = {
        paymentOption: "cash",
        products_price: 12000,
        shippingfee: 3000,
      };
      const alreadyRefund = {
        productsPrice: 0,
        shippingFee: 0,
      };
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.getOrderDetailByIds = jest.fn(() => {
        return refundProductsByDb;
      });
      refundRepository.getPaymentInformation = jest.fn(() => {
        return payment;
      });
      refundRepository.getRefundInformation = jest.fn(() => {
        return alreadyRefund;
      });

      await refundController.validateRefundInformation(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response._getJSONData().code).toBe("ERROR40002");
      expect(response.statusCode).toBe(404);
    });

    it("실패 : 클라이언트에서 받아온 환불액이 잘못된 경우", async () => {
      const refundProducts = [
        {
          detail_id: 1,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundProductsByDb = [
        {
          detail_id: 1,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundInfo = {
        merchantUID: "주문번호",
        imp_uid: "대행사 주문번호",
        extraCharge: 0,
        prePayment: 0,
        refundProduct: refundProducts,
        refundAmount: 15000,
      };
      const immediatelyRefundInfo = {
        refundAmountForProduct: 15000,
        refundAmountForShipping: 3000,
      };
      const pendingRefundInfo = {
        pendingRefundAmountForProduct: 0,
        returnShippingFee: 0,
        pendingRefundAmountForShipping: 0,
      };
      const request = httpMocks.createRequest({
        body: {
          refundInfo,
          immediatelyRefundInfo,
          pendingRefundInfo,
        },
      });
      const payment = {
        paymentOption: "kakao",
        products_price: 12000,
        shippingfee: 3000,
      };
      const alreadyRefund = {
        productsPrice: 0,
        shippingFee: 0,
      };
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.getOrderDetailByIds = jest.fn(() => {
        return refundProductsByDb;
      });
      refundRepository.getPaymentInformation = jest.fn(() => {
        return payment;
      });
      refundRepository.getRefundInformation = jest.fn(() => {
        return alreadyRefund;
      });

      await refundController.validateRefundInformation(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response._getJSONData().code).toBe("ERROR40001");
      expect(response.statusCode).toBe(400);
    });

    it("실패 : catch error", async () => {
      const refundProducts = [
        {
          detail_id: 1,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundProductsByDb = [
        {
          detail_id: 1,
          status: "결제완료",
          price: 12000,
          quantity: 1,
        },
      ];
      const refundInfo = {
        merchantUID: "주문번호",
        imp_uid: "대행사 주문번호",
        extraCharge: 0,
        prePayment: 0,
        refundProduct: refundProducts,
        refundAmount: 15000,
      };
      const immediatelyRefundInfo = {
        refundAmountForProduct: 12000,
        refundAmountForShipping: 3000,
      };
      const pendingRefundInfo = {
        pendingRefundAmountForProduct: 0,
        returnShippingFee: 0,
        pendingRefundAmountForShipping: 0,
      };
      const request = httpMocks.createRequest({
        body: {
          refundInfo,
          immediatelyRefundInfo,
          pendingRefundInfo,
        },
      });
      const payment = {
        paymentOption: "kakao",
        products_price: 12000,
        shippingfee: 3000,
      };
      const alreadyRefund = {
        productsPrice: 0,
        shippingFee: 0,
      };
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.getOrderDetailByIds = jest.fn(() => {
        throw new Error();
      });
      refundRepository.getPaymentInformation = jest.fn(() => {
        return payment;
      });
      refundRepository.getRefundInformation = jest.fn(() => {
        return alreadyRefund;
      });

      await refundController.validateRefundInformation(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });
  });

  describe("payment", () => {
    it("성공", async () => {
      const paymentId = 2;
      const request = httpMocks.createRequest({
        username: "testuser",
        body: {
          refundInfo: {
            extraCharge: 5000,
          },
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.insertInfoForPayment = jest.fn(() => {
        return paymentId;
      });
      refundRepository.updateMarchantUID = jest.fn(() => {
        return {};
      });

      await refundController.payment(request, response, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(200);
    });

    it("실패 : payment 아이디 생성 오류", async () => {
      const paymentId = "";
      const request = httpMocks.createRequest({
        username: "testuser",
        body: {
          refundInfo: {
            extraCharge: 5000,
          },
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.insertInfoForPayment = jest.fn(() => {
        return paymentId;
      });
      refundRepository.updateMarchantUID = jest.fn(() => {
        return {};
      });

      await refundController.payment(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });

    it("실패 : 주문번호 업데이트 실패", async () => {
      const paymentId = 2;
      const request = httpMocks.createRequest({
        username: "testuser",
        body: {
          refundInfo: {
            extraCharge: 5000,
          },
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.insertInfoForPayment = jest.fn(() => {
        return paymentId;
      });
      refundRepository.updateMarchantUID = jest.fn(() => {
        return;
      });

      await refundController.payment(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });

    it("실패 : catch error", async () => {
      const paymentId = 2;
      const request = httpMocks.createRequest({
        username: "testuser",
        body: {
          refundInfo: {
            extraCharge: 5000,
          },
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.insertInfoForPayment = jest.fn(() => {
        throw new Error();
      });
      refundRepository.updateMarchantUID = jest.fn(() => {
        return {};
      });
      refundRepository.deletePaymentByPaymentId = jest.fn();

      await refundController.payment(request, response, next);

      expect(refundRepository.deletePaymentByPaymentId).toHaveBeenCalledTimes(
        1
      );
      expect(response.statusCode).toBe(400);
    });
  });

  describe("requestRefund", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        body: {
          refundInfo: {
            imp_uid: "대행사 주문번호",
            refundAmount: 15000,
          },
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundController.requestRefundToIMP = jest.fn();

      await refundController.requestRefund(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(200);
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        body: {
          refundInfo: {
            imp_uid: "대행사 주문번호",
            refundAmount: 15000,
          },
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundController.requestRefundToIMP = jest.fn(() => {
        throw new Error();
      });

      await refundController.requestRefund(request, response, next);

      expect(next).toHaveBeenCalledTimes(1);
    });
  });

  describe("completePayment", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        body: {
          imp_uid: "신규 대행사 주문번호",
          merchant_uid: "신규 주문번호",
        },
      });
      const response = httpMocks.createResponse();
      refundRepository.updatePayment = jest.fn();

      await refundController.completePayment(request, response);

      expect(response.statusCode).toBe(200);
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        body: {
          imp_uid: "신규 대행사 주문번호",
          merchant_uid: "신규 주문번호",
        },
      });
      const response = httpMocks.createResponse();
      refundRepository.updatePayment = jest.fn(() => {
        throw new Error();
      });

      await refundController.completePayment(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("failedPayment", () => {
    it("성공", async () => {
      const refundId = 1;
      const pendingRefundId = 1;
      const request = httpMocks.createRequest({
        query: {
          newMerchantUID: "신규주문번호",
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.getRefundId = jest.fn(() => {
        return { refundId };
      });
      refundRepository.getPendingRefundId = jest.fn(() => {
        return { pendingRefundId };
      });
      refundRepository.failedPayment = jest.fn();

      await refundController.failedPayment(request, response, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("실패 : refundId가 없는 경우", async () => {
      const refundId = "";
      const pendingRefundId = 1;
      const request = httpMocks.createRequest({
        query: {
          newMerchantUID: "신규주문번호",
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.getRefundId = jest.fn(() => {
        return { refundId };
      });
      refundRepository.getPendingRefundId = jest.fn(() => {
        return { pendingRefundId };
      });

      await refundController.failedPayment(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(404);
    });

    it("실패 : pendingRefundId가 없는 경우", async () => {
      const refundId = 1;
      const pendingRefundId = "";
      const request = httpMocks.createRequest({
        query: {
          newMerchantUID: "신규주문번호",
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.getRefundId = jest.fn(() => {
        return { refundId };
      });
      refundRepository.getPendingRefundId = jest.fn(() => {
        return { pendingRefundId };
      });

      await refundController.failedPayment(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(404);
    });

    it("실패 : catch error", async () => {
      const refundId = 1;
      const pendingRefundId = 1;
      const request = httpMocks.createRequest({
        query: {
          newMerchantUID: "신규주문번호",
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.getRefundId = jest.fn(() => {
        throw new Error();
      });
      refundRepository.getPendingRefundId = jest.fn(() => {
        return { pendingRefundId };
      });
      refundRepository.failedPayment = jest.fn();

      await refundController.failedPayment(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });
  });

  describe("failedRefund", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        refundId: 1,
        pendingRefundId: 1,
      });
      const response = httpMocks.createResponse();
      refundRepository.getTempDeliverystatus = jest.fn();
      refundRepository.failedRefund = jest.fn();

      await refundController.failedRefund(request, response);

      expect(response.statusCode).toBe(400);
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        refundId: 1,
        pendingRefundId: 1,
      });
      const response = httpMocks.createResponse();
      refundRepository.getTempDeliverystatus = jest.fn(() => {
        throw new Error();
      });
      refundRepository.failedRefund = jest.fn();

      await refundController.failedRefund(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("validateCancelInformation", () => {
    it("성공", async () => {
      const paymentId = 1;
      const orderDetailList = [
        {
          detail_id: 1,
          status: "입금대기중",
        },
      ];
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.findPaymentId = jest.fn(() => {
        return paymentId;
      });
      refundRepository.getOrderDetailByOrderId = jest.fn(() => {
        return orderDetailList;
      });

      await refundController.validateCancelInformation(request, response, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("실패 : 결제 정보를 찾을 수 없는 경우", async () => {
      const paymentId = "";
      const orderDetailList = [
        {
          detail_id: 1,
          status: "입금대기중",
        },
      ];
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.findPaymentId = jest.fn(() => {
        return paymentId;
      });
      refundRepository.getOrderDetailByOrderId = jest.fn(() => {
        return orderDetailList;
      });

      await refundController.validateCancelInformation(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });

    it("실패 : 주문상태가 입금대기중이 아닌 상품이 있는 경우", async () => {
      const paymentId = 1;
      const orderDetailList = [
        {
          detail_id: 1,
          status: "결제완료",
        },
      ];
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.findPaymentId = jest.fn(() => {
        return paymentId;
      });
      refundRepository.getOrderDetailByOrderId = jest.fn(() => {
        return orderDetailList;
      });

      await refundController.validateCancelInformation(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response._getJSONData().code).toBe("ERROR40005");
      expect(response.statusCode).toBe(400);
    });

    it("실패 : catch error", async () => {
      const paymentId = 1;
      const orderDetailList = [
        {
          detail_id: 1,
          status: "입금대기중",
        },
      ];
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      refundRepository.findPaymentId = jest.fn(() => {
        return paymentId;
      });
      refundRepository.getOrderDetailByOrderId = jest.fn(() => {
        throw new Error();
      });

      await refundController.validateCancelInformation(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });
  });

  describe("cancelOrder", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        orderId: 1,
        paymentId: 1,
      });
      const response = httpMocks.createResponse();
      refundRepository.cancelOrder = jest.fn();

      await refundController.cancelOrder(request, response);

      expect(response.statusCode).toBe(204);
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        orderId: 1,
        paymentId: 1,
      });
      const response = httpMocks.createResponse();
      refundRepository.cancelOrder = jest.fn(() => {
        throw new Error();
      });

      await refundController.cancelOrder(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("getPendingRefundList", () => {
    it("성공", async () => {
      const refundList = [{}];
      const request = httpMocks.createRequest({
        query: {
          page: 1,
        },
      });
      const response = httpMocks.createResponse();
      refundRepository.getPendingRefundList = jest.fn(() => {
        return refundList;
      });

      await refundController.getPendingRefundList(request, response);

      expect(response.statusCode).toBe(200);
    });

    it("성공: 환불 요청이 없는 경우", async () => {
      const refundList = [];
      const request = httpMocks.createRequest({
        query: {
          page: 1,
        },
      });
      const response = httpMocks.createResponse();
      refundRepository.getPendingRefundList = jest.fn(() => {
        return refundList;
      });

      await refundController.getPendingRefundList(request, response);

      expect(response.statusCode).toBe(200);
    });

    it("실패 : catch error", async () => {
      const refundList = [];
      const request = httpMocks.createRequest({
        query: {
          page: 1,
        },
      });
      const response = httpMocks.createResponse();
      refundRepository.getPendingRefundList = jest.fn(() => {
        throw new Error();
      });

      await refundController.getPendingRefundList(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("getPendingRefundDetail", () => {
    it("성공", async () => {
      const refundDetail = [
        {
          detail_id: 1,
          product_name: "상품명",
          price: 12000,
          quantity: 1,
          deliverystatus: "결제완료",
        },
      ];
      const paymetnInfo = {};
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();
      refundRepository.getPendingRefundDetail = jest.fn(() => {
        return refundDetail;
      });
      refundRepository.getRefundDetailPayInfo = jest.fn(() => {
        return paymetnInfo;
      });

      await refundController.getPendingRefundDetail(request, response);

      expect(response.statusCode).toBe(200);
    });

    it("실패 : 상세 내용이 없는 경우", async () => {
      const refundDetail = [];
      const paymetnInfo = {};
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();
      refundRepository.getPendingRefundDetail = jest.fn(() => {
        return refundDetail;
      });
      refundRepository.getRefundDetailPayInfo = jest.fn(() => {
        return paymetnInfo;
      });

      await refundController.getPendingRefundDetail(request, response);

      expect(response.statusCode).toBe(404);
    });

    it("실패 : 결제 관련 정보가 없는 경우", async () => {
      const refundDetail = [
        {
          detail_id: 1,
          product_name: "상품명",
          price: 12000,
          quantity: 1,
          deliverystatus: "결제완료",
        },
      ];
      const paymetnInfo = {};
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();
      refundRepository.getPendingRefundDetail = jest.fn(() => {
        return refundDetail;
      });
      refundRepository.getRefundDetailPayInfo = jest.fn(() => {
        return;
      });

      await refundController.getPendingRefundDetail(request, response);

      expect(response.statusCode).toBe(404);
    });

    it("실패 : catch error", async () => {
      const refundDetail = [
        {
          detail_id: 1,
          product_name: "상품명",
          price: 12000,
          quantity: 1,
          deliverystatus: "결제완료",
        },
      ];
      const paymetnInfo = {};
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();
      refundRepository.getPendingRefundDetail = jest.fn(() => {
        throw new Error();
      });
      refundRepository.getRefundDetailPayInfo = jest.fn(() => {
        return paymetnInfo;
      });

      await refundController.getPendingRefundDetail(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("refundByAdmin", () => {});

  describe("failedRefundByAdmin", () => {
    it("성공 : 전체 환불 실패", async () => {
      const pendingRefund = {
        merchantUID: "주문번호",
        amount: 15000,
        productsPrice: 12000,
        shippingFee: 3000,
        returnShippingFee: 5000,
        setOff: 0,
        extraPay: 5000,
        newMerchantUID: "",
      };
      const request = httpMocks.createRequest({
        all: true,
        refundId: 1,
        pendingRefund: pendingRefund,
        body: {
          refundInfo: {
            pendingRefundId: 1,
            detailId: 1,
          },
        },
      });
      const response = httpMocks.createResponse();
      refundRepository.faileFullRefund = jest.fn();
      refundRepository.failedPartialRefund = jest.fn();

      await refundController.failedRefundByAdmin(request, response);

      expect(refundRepository.faileFullRefund).toHaveBeenCalledTimes(1);
      expect(refundRepository.failedPartialRefund).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });

    it("성공 : 부분 환불 실패", async () => {
      const pendingRefund = {
        merchantUID: "주문번호",
        amount: 15000,
        productsPrice: 12000,
        shippingFee: 3000,
        returnShippingFee: 5000,
        setOff: 0,
        extraPay: 5000,
        newMerchantUID: "",
      };
      const request = httpMocks.createRequest({
        all: false,
        refundId: 1,
        pendingRefund: pendingRefund,
        body: {
          refundInfo: {
            pendingRefundId: 1,
            detailId: 1,
          },
        },
      });
      const response = httpMocks.createResponse();
      refundRepository.faileFullRefund = jest.fn();
      refundRepository.failedPartialRefund = jest.fn();

      await refundController.failedRefundByAdmin(request, response);

      expect(refundRepository.failedPartialRefund).toHaveBeenCalledTimes(1);
      expect(refundRepository.faileFullRefund).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });

    it("실패 : catch error", async () => {
      const pendingRefund = {
        merchantUID: "주문번호",
        amount: 15000,
        productsPrice: 12000,
        shippingFee: 3000,
        returnShippingFee: 5000,
        setOff: 0,
        extraPay: 5000,
        newMerchantUID: "",
      };
      const request = httpMocks.createRequest({
        all: true,
        refundId: 1,
        pendingRefund: pendingRefund,
        body: {
          refundInfo: {
            pendingRefundId: 1,
            detailId: 1,
          },
        },
      });
      const response = httpMocks.createResponse();
      refundRepository.faileFullRefund = jest.fn(() => {
        throw new Error();
      });
      refundRepository.failedPartialRefund = jest.fn();

      await refundController.failedRefundByAdmin(request, response);

      expect(refundRepository.faileFullRefund).toHaveBeenCalledTimes(1);
      expect(refundRepository.failedPartialRefund).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });
  });
});

/*

  describe("getPendingRefundList", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        query: {
          page: 1,
        },
      });
      const response = httpMocks.createResponse();
      const orderList = [{ refundId: 1, full_count: 1 }];
      const refundList = [{ refundId: 1, product_name: "name", price: 3000 }];
      adminRepository.getPendingRefundList = () => orderList;
      adminRepository.getPendingRefund = () => refundList;

      await adminController.getPendingRefundList(request, response);

      expect(response.statusCode).toBe(200);
    });
  });
  
  describe("refund", () => {
    it("성공", async () => {
      const savePoint = {};
      const refundInfo = {
        merchantUID: "2022080100000001",
        impUID: "2022080100000001",
        refundId: 1,
        all: true,
        detailId: 1,
        realRefundProducts: 20000,
        realRefundShippingFee: 3000,
        realReturnShippingFee: 5000,
      };

      const request = httpMocks.createRequest({
        body: {
          savePoint,
          refundInfo,
        },
      });
      const response = httpMocks.createResponse();
      adminRepository.getSavePointBeforeRefund = jest.fn();
      adminRepository.refund = jest.fn();
      next = () => {}

      await adminController.refund(request, response);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("실패 : catch error", async () => {
      const savePoint = {};
      const refundInfo = {
        merchantUID: "2022080100000001",
        impUID: "2022080100000001",
        refundId: 1,
        all: true,
        detailId: 1,
        realRefundProducts: 20000,
        realRefundShippingFee: 3000,
        realReturnShippingFee: 5000,
      };

      const request = httpMocks.createRequest({
        body: {
          savePoint,
          refundInfo,
        },
      });
      const response = httpMocks.createResponse();
      adminRepository.reufnd = () => {
        throw new Error();
      };

      await adminController.refund(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("refundFail", () => {
    it("성공", async () => {
      const merchantUID = '20221101-00000001'
      const savePoint = {
        beforePaymentInfo: {},
        beforeOrderDetailList: [], 
        beforeRefundInfo: {}
      }
      adminRepository.refundFail = () => {}
  
      await adminController.refundFail(merchantUID, savePoint)
  
      expect(adminRepository.refundFail).toHaveBeenCalledTimes(1);
    })
  })
*/
