import UserOrderController from "../../../controller/customer/order.js";
import httpMocks from "node-mocks-http";

describe("order", () => {
  let orderRepository;
  let orderController;

  beforeEach(() => {
    orderRepository = {};
    orderController = new UserOrderController(orderRepository);
  });

  describe("getMyInfo", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        username: "testUser",
      });
      const response = httpMocks.createResponse();
      const user = {
        name: "test",
        phone: "01012345678",
        email: "testUser@email.com",
        address: "",
        extra_address: "",
      };
      const expectReturnUserinfo = {
        username: "testUser",
        ...user,
      };
      orderRepository.getUserInfo = () => user;

      await orderController.getMyInfo(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({
        userInfo: expectReturnUserinfo,
      });
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        username: "testUser",
      });
      const response = httpMocks.createResponse();
      orderRepository.getUserInfo = () => {
        throw new Error();
      };

      await orderController.getMyInfo(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("checkOrderInfo", () => {
    it("성공", async () => {
      const product = {
        product_code: "test-0001",
        option_number: 1,
        name: "테스트상품",
        option1: "",
        option2: "",
        quantity: 1,
        price: 12000,
        sale_price: null,
        main_img_src: "",
        cart_id: 1,
      };
      const request = httpMocks.createRequest({
        body: {
          amount: 15000,
          shippingFee: 3000,
          productPrice: 12000,
          paymentOption: "cash",
          newArray: [product],
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      orderRepository.checkStockBeforeOrder = () => [product];

      await orderController.checkOrderInfo(request, response, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("실패 : 결제 방법이 잘못된 경우", async () => {
      const product = {
        product_code: "test-0001",
        option_number: 1,
        name: "테스트상품",
        option1: "",
        option2: "",
        quantity: 1,
        price: 12000,
        sale_price: null,
        main_img_src: "",
        cart_id: 1,
      };
      const request = httpMocks.createRequest({
        body: {
          amount: 15000,
          shippingFee: 3000,
          productPrice: 12000,
          paymentOption: "",
          newArray: [product],
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      orderRepository.checkStockBeforeOrder = () => [product];

      await orderController.checkOrderInfo(request, response, next);

      expect(response.statusCode).toBe(400);
      expect(response._getJSONData().code).toBe("ERROR30004");
    });

    it("실패 : 일치하는 상품이 없는 경우", async () => {
      const product = {
        product_code: "test-0001",
        option_number: 1,
        name: "테스트상품",
        option1: "",
        option2: "",
        quantity: 1,
        price: 12000,
        sale_price: null,
        main_img_src: "",
        cart_id: 1,
      };
      const request = httpMocks.createRequest({
        body: {
          amount: 15000,
          shippingFee: 3000,
          productPrice: 12000,
          paymentOption: "cash",
          newArray: [product],
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      orderRepository.checkStockBeforeOrder = () => {};

      await orderController.checkOrderInfo(request, response, next);

      expect(response.statusCode).toBe(400);
      expect(response._getJSONData().code).toBe("ERROR30004");
    });

    it("실패 : 주문 수량보다 재고가 작은 경우", async () => {
      const product = {
        product_code: "test-0001",
        option_number: 1,
        name: "테스트상품",
        option1: "",
        option2: "",
        quantity: 1,
        price: 12000,
        sale_price: null,
        main_img_src: "",
        cart_id: 1,
      };
      const productInfoByDB = {
        product_code: "test-0001",
        option_number: 1,
        name: "테스트상품",
        price: 12000,
        main_img_src: "",
        description: "",
        option1: "",
        option2: "",
        stock: 0,
        sale_price: null,
      };
      const request = httpMocks.createRequest({
        body: {
          amount: 15000,
          shippingFee: 3000,
          productPrice: 12000,
          paymentOption: "cash",
          newArray: [product],
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      orderRepository.checkStockBeforeOrder = () => {
        return productInfoByDB;
      };

      await orderController.checkOrderInfo(request, response, next);

      expect(response.statusCode).toBe(400);
      expect(response._getJSONData().code).toBe("ERROR30002");
    });
  });

  describe("payment", () => {
    it("성공", async () => {
      const paymentId = 1;
      const product = {
        product_code: "test-0001",
        option_number: 1,
        name: "테스트상품",
        option1: "",
        option2: "",
        quantity: 1,
        price: 12000,
        sale_price: null,
        main_img_src: "",
        cart_id: 1,
      };
      const request = httpMocks.createRequest({
        body: {
          amount: 15000,
          shippingFee: 3000,
          productPrice: 12000,
          paymentOption: "cash",
          newArray: [product],
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      orderRepository.checkStockBeforeOrder = () => [product];
      orderRepository.insertInfoForPayment = () => {
        return paymentId;
      };
      orderRepository.updateMarchantUID = jest.fn(() => {
        return [];
      });
      orderRepository.deletePaymentByPaymentId = jest.fn();

      await orderController.payment(request, response, next);

      expect(next).toHaveBeenCalledTimes(1);
      expect(orderRepository.deletePaymentByPaymentId).toHaveBeenCalledTimes(0);
    });

    it("실패 : payment 아이디 생성 오류", async () => {
      const paymentId = "";
      const product = {
        product_code: "test-0001",
        option_number: 1,
        name: "테스트상품",
        option1: "",
        option2: "",
        quantity: 1,
        price: 12000,
        sale_price: null,
        main_img_src: "",
        cart_id: 1,
      };
      const request = httpMocks.createRequest({
        body: {
          amount: 15000,
          shippingFee: 3000,
          productPrice: 12000,
          paymentOption: "cash",
          newArray: [product],
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      orderRepository.insertInfoForPayment = () => {
        return paymentId;
      };

      await orderController.payment(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(409);
      expect(response._getJSONData().code).toBe("ERROR30001");
    });

    it("실패 : 주문번호 업데이트 오류", async () => {
      const paymentId = 1;
      const product = {
        product_code: "test-0001",
        option_number: 1,
        name: "테스트상품",
        option1: "",
        option2: "",
        quantity: 1,
        price: 12000,
        sale_price: null,
        main_img_src: "",
        cart_id: 1,
      };
      const request = httpMocks.createRequest({
        body: {
          amount: 15000,
          shippingFee: 3000,
          productPrice: 12000,
          paymentOption: "cash",
          newArray: [product],
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      orderRepository.insertInfoForPayment = () => {
        return paymentId;
      };
      orderRepository.updateMarchantUID = () => {
        return;
      };
      orderRepository.deletePaymentByPaymentId = jest.fn();

      await orderController.payment(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(orderRepository.deletePaymentByPaymentId).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(409);
      expect(response._getJSONData().code).toBe("ERROR30001");
    });
  });

  describe("order", () => {
    it("성공", async () => {
      const orderId = 1;
      const paymentId = 1;
      const product = {
        product_code: "test-0001",
        option_number: 1,
        name: "테스트상품",
        option1: "",
        option2: "",
        quantity: 1,
        price: 12000,
        sale_price: null,
        main_img_src: "",
        cart_id: 1,
      };
      const request = httpMocks.createRequest({
        paymentId,
        merchantUID: "주문번호",
        username: "testuser",
        body: {
          amount: 15000,
          shippingFee: 3000,
          productPrice: 12000,
          paymentOption: "cash",
          newArray: [product],
          orderer: "홍길동",
          phone: "01012345678",
          address: "주소",
          extra_address: "상세주소",
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      orderRepository.order = jest.fn(() => {
        return orderId;
      });
      orderRepository.orderDetail = jest.fn(() => {
        return true;
      });

      orderRepository.updateMarchantUID = jest.fn(() => {
        return [];
      });
      orderRepository.deletePaymentByPaymentId = jest.fn();

      await orderController.order(request, response, next);

      expect(response.statusCode).toBe(200);
      expect(orderRepository.deletePaymentByPaymentId).toHaveBeenCalledTimes(0);
    });

    it("실패 : order 아이디 생성 오류", async () => {
      const orderId = "";
      const paymentId = 1;
      const product = {
        product_code: "test-0001",
        option_number: 1,
        name: "테스트상품",
        option1: "",
        option2: "",
        quantity: 1,
        price: 12000,
        sale_price: null,
        main_img_src: "",
        cart_id: 1,
      };
      const request = httpMocks.createRequest({
        paymentId,
        merchantUID: "주문번호",
        username: "testuser",
        body: {
          amount: 15000,
          shippingFee: 3000,
          productPrice: 12000,
          paymentOption: "cash",
          newArray: [product],
          orderer: "홍길동",
          phone: "01012345678",
          address: "주소",
          extra_address: "상세주소",
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      orderRepository.order = jest.fn(() => {
        return orderId;
      });
      orderRepository.orderDetail = jest.fn(() => {
        return true;
      });

      orderRepository.updateMarchantUID = jest.fn(() => {
        return [];
      });
      orderRepository.deletePaymentByPaymentId = jest.fn();

      await orderController.order(request, response, next);

      expect(orderRepository.deletePaymentByPaymentId).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(409);
      expect(response._getJSONData().code).toBe("ERROR30001");
    });

    it("실패 : order 상세 내용 업데이트 오류", async () => {
      const orderId = 1;
      const paymentId = 1;
      const product = {
        product_code: "test-0001",
        option_number: 1,
        name: "테스트상품",
        option1: "",
        option2: "",
        quantity: 1,
        price: 12000,
        sale_price: null,
        main_img_src: "",
        cart_id: 1,
      };
      const request = httpMocks.createRequest({
        paymentId,
        merchantUID: "주문번호",
        username: "testuser",
        body: {
          amount: 15000,
          shippingFee: 3000,
          productPrice: 12000,
          paymentOption: "cash",
          newArray: [product],
          orderer: "홍길동",
          phone: "01012345678",
          address: "주소",
          extra_address: "상세주소",
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      orderRepository.order = jest.fn(() => {
        return orderId;
      });
      orderRepository.orderDetail = jest.fn(() => {
        return false;
      });

      orderRepository.updateMarchantUID = jest.fn(() => {
        return [];
      });
      orderRepository.deletePaymentByPaymentId = jest.fn();

      await orderController.order(request, response, next);

      expect(orderRepository.deletePaymentByPaymentId).toHaveBeenCalledTimes(1);
      expect(response.statusCode).toBe(409);
      expect(response._getJSONData().code).toBe("ERROR30001");
    });
  });

  describe("completePayment", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        body: {
          impUID: "대행사 주문번호",
          merchantUID: "주문번호",
        },
      });
      const response = httpMocks.createResponse();
      orderRepository.updatePayment = jest.fn();
      orderController.cartSummary = jest.fn(() => {
        return 1;
      });

      await orderController.completePayment(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({
        quantityInCart: 1,
      });
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        body: {
          impUID: "대행사 주문번호",
          merchantUID: "주문번호",
        },
      });
      const response = httpMocks.createResponse();
      orderRepository.updatePayment = jest.fn(() => {
        throw new Error();
      });
      orderController.cartSummary = jest.fn(() => {
        return 1;
      });

      await orderController.completePayment(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("failedPayment", () => {
    it("성공", async () => {
      const payInfo = {
        payment_id: 1,
        order_id: 1,
      };
      const orderDetailList = [{}];
      const products = [
        {
          product_code: "test-0001",
          option_number: 1,
          quantity: 1,
        },
      ];
      const request = httpMocks.createRequest({
        body: {
          merchantUID: "주문번호",
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      orderRepository.getPaymentIdAndOrderId = jest.fn(() => {
        return payInfo;
      });
      orderRepository.getOrderDetail = jest.fn(() => {
        return orderDetailList;
      });
      orderRepository.increaseStock = jest.fn(() => {
        return products;
      });
      orderRepository.deletePaymentByMerchantUID = jest.fn();

      await orderController.failedPayment(request, response, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("실패 : 결제 정보를 찾을 수 없는 경우", async () => {
      const orderDetailList = [{}];
      const products = [
        {
          product_code: "test-0001",
          option_number: 1,
          quantity: 1,
        },
      ];
      const request = httpMocks.createRequest({
        body: {
          merchantUID: "주문번호",
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      orderRepository.getPaymentIdAndOrderId = jest.fn(() => {
        return;
      });
      orderRepository.getOrderDetail = jest.fn(() => {
        return orderDetailList;
      });
      orderRepository.increaseStock = jest.fn(() => {
        return products;
      });
      orderRepository.deletePaymentByMerchantUID = jest.fn();

      await orderController.failedPayment(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(404);
    });

    it("실패 : catch error", async () => {
      const payInfo = {
        payment_id: 1,
        order_id: 1,
      };
      const orderDetailList = [{}];
      const products = [
        {
          product_code: "test-0001",
          option_number: 1,
          quantity: 1,
        },
      ];
      const request = httpMocks.createRequest({
        body: {
          merchantUID: "주문번호",
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();
      orderRepository.getPaymentIdAndOrderId = jest.fn(() => {
        return payInfo;
      });
      orderRepository.getOrderDetail = jest.fn(() => {
        throw new Error();
      });
      orderRepository.increaseStock = jest.fn(() => {
        return products;
      });
      orderRepository.deletePaymentByMerchantUID = jest.fn();

      await orderController.failedPayment(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });
  });

  describe("addCart", () => {
    it("성공", async () => {
      const products = [
        {
          product_code: "test-0001",
          option_number: 1,
          quantity: 1,
        },
      ];
      const request = httpMocks.createRequest({
        userId: 1,
        productArray: products,
      });
      const response = httpMocks.createResponse();
      orderRepository.addInCart = jest.fn();

      await orderController.addCart(request, response);

      expect(response.statusCode).toBe(204);
    });

    it("실패 : catch error", async () => {
      const products = [
        {
          product_code: "test-0001",
          option_number: 1,
          quantity: 1,
        },
      ];
      const request = httpMocks.createRequest({
        userId: 1,
        productArray: products,
      });
      const response = httpMocks.createResponse();
      orderRepository.addInCart = jest.fn(() => {
        throw new Error();
      });

      await orderController.addCart(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("getLatestOrder", () => {
    it("성공", async () => {
      const orderId = 1;
      const orderInfo = {};
      const orderDetailList = [{}];
      const request = httpMocks.createRequest({
        params: {
          id: "주문번호",
        },
      });
      const response = httpMocks.createResponse();
      orderRepository.getOrderId = jest.fn(() => {
        return orderId;
      });
      orderRepository.getRefundOrder = jest.fn(() => {
        return orderInfo;
      });
      orderRepository.getOrderDetail = jest.fn(() => {
        return orderDetailList;
      });

      await orderController.getLatestOrder(request, response);

      expect(response.statusCode).toBe(200);
    });

    it("실패 : 주문 정보가 없는 경우", async () => {
      const orderId = 1;
      const orderInfo = {};
      const orderDetailList = [{}];
      const request = httpMocks.createRequest({
        params: {
          id: "주문번호",
        },
      });
      const response = httpMocks.createResponse();
      orderRepository.getOrderId = jest.fn(() => {
        return orderId;
      });
      orderRepository.getRefundOrder = jest.fn(() => {
        return;
      });
      orderRepository.getOrderDetail = jest.fn(() => {
        return orderDetailList;
      });

      await orderController.getLatestOrder(request, response);

      expect(response.statusCode).toBe(404);
    });

    it("실패 : catch error", async () => {
      const orderId = 1;
      const orderInfo = {};
      const orderDetailList = [{}];
      const request = httpMocks.createRequest({
        params: {
          id: "주문번호",
        },
      });
      const response = httpMocks.createResponse();
      orderRepository.getOrderId = jest.fn(() => {
        throw new Error();
      });
      orderRepository.getRefundOrder = jest.fn(() => {
        return orderInfo;
      });
      orderRepository.getOrderDetail = jest.fn(() => {
        return orderDetailList;
      });

      await orderController.getLatestOrder(request, response);

      expect(response.statusCode).toBe(400);
    });
  });
});

// describe("payment", () => {
//   describe("paycomplete", () => {
//     it("성공", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           imp_uid: "2022040100000001",
//           merchant_uid: "2022040100000001",
//         },
//       });
//       const response = httpMocks.createResponse();
//       userRepository.updatePayment = jest.fn();
//       userController.cartSummary = jest.fn(() => 1);

//       await userController.paycomplete(request, response);

//       expect(response.statusCode).toBe(200);
//     });

//     it("실패: catch error", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           imp_uid: "2022040100000001",
//           merchant_uid: "2022040100000001",
//         },
//       });
//       const response = httpMocks.createResponse();
//       userRepository.updatePayment = () => {
//         throw new Error();
//       };
//       await userController.paycomplete(request, response);

//       expect(response.statusCode).toBe(400);
//     });
//   });

//   describe("cancelOrder", () => {
//     it("성공", async () => {
//       const request = httpMocks.createRequest({
//         params: {
//           id: 1
//         }
//       });
//       const response = httpMocks.createResponse();
//       const paymentId = 1;
//       userRepository.findPaymentId = () => paymentId;
//       userRepository.cancelOrder = jest.fn()

//       await userController.cancelOrder(request, response);

//       expect(response.statusCode).toBe(204);
//     });

//     it("실패 : 주어진 orderId로 paymentId를 찾을 수 없는 경우", async () => {
//       const request = httpMocks.createRequest({
//         params: {
//           id: 1
//         }
//       });
//       const response = httpMocks.createResponse();
//       const paymentId = {};
//       userRepository.findPaymentId = () => paymentId;

//       await userController.cancelOrder(request, response);

//       expect(response.statusCode).toBe(400);
//     });

//     it("실패 : catch error", async () => {
//       const request = httpMocks.createRequest({
//         params: {
//           id: 1
//         }
//       });
//       const response = httpMocks.createResponse();
//       userRepository.findPaymentId = () => {throw new Error() };

//       await userController.cancelOrder(request, response);

//       expect(response.statusCode).toBe(400);
//     });
//   })

//   describe("cancelPayment", () => {
//     it("성공", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           merchantUID: "2022040100000001",
//           newArray: [{ product_code: "test" }],
//         },
//       });
//       const response = httpMocks.createResponse();
//       const next = jest.fn();
//       userRepository.increaseStock = jest.fn(() => true);
//       userRepository.deletePayment = jest.fn();

//       await userController.cancelPayment(request, response, next);

//       expect(next).toHaveBeenCalledTimes(1);
//     });

//     it("실패 : catch error", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           merchantUID: "2022040100000001",
//           newArray: [{ product_code: "test" }],
//         },
//       });
//       const response = httpMocks.createResponse();
//       const next = jest.fn();
//       userRepository.increaseStock = jest.fn(() => true);
//       userRepository.deletePayment = () => {
//         throw new Error();
//       };

//       await userController.cancelPayment(request, response, next);

//       expect(response.statusCode).toBe(400);
//       expect(next).toHaveBeenCalledTimes(0);
//     });
//   });

//   describe("payment", () => {
//     it("성공", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           amount: 10000,
//           shippingFee: 3000,
//           productPrice: 7000,
//           newArray: [],
//           orderer: "user",
//           phone: "01012345678",
//           address: "adress..",
//           extra_address: "extra adress..",
//         },
//       });
//       const response = httpMocks.createResponse();
//       const next = jest.fn();
//       userController.checkStock = jest.fn(() => {return false});
//       userRepository.insertInfoForPayment = jest.fn(() => 1);
//       userRepository.deletePaymentByPaymentId = jest.fn()
//       userRepository.updateMarchantUID = jest.fn(() => { return {insertId:1}});

//       await userController.payment(request, response, next);

//       expect(response.statusCode).toBe(200);
//     });

//     it("실패 : 재고부족", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           amount: 10000,
//           shippingFee: 3000,
//           productPrice: 7000,
//           newArray: [],
//           orderer: "user",
//           phone: "01012345678",
//           address: "adress..",
//           extra_address: "extra adress..",
//         },
//       });
//       const response = httpMocks.createResponse();
//       userController.checkStock = jest.fn(() => true);
//       userRepository.insertInfoForPayment = jest.fn(() => 1);
//       userRepository.updateMarchantUID = jest.fn(() => []);
//       userController.order = jest.fn();

//       await userController.payment(request, response);

//       expect(response.statusCode).toBe(409);
//       expect(response._getJSONData().code).toBe("ERROR30002");
//     });

//     it("실패 : payment id 생성 실패", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           amount: 10000,
//           shippingFee: 3000,
//           productPrice: 7000,
//           newArray: [],
//           orderer: "user",
//           phone: "01012345678",
//           address: "adress..",
//           extra_address: "extra adress..",
//         },
//       });
//       const response = httpMocks.createResponse();
//       userController.checkStock = jest.fn(() => false);
//       userRepository.insertInfoForPayment = jest.fn();
//       userRepository.updateMarchantUID = jest.fn(() => []);
//       userController.order = jest.fn();

//       await userController.payment(request, response);

//       expect(response.statusCode).toBe(409);
//       expect(response._getJSONData().code).toBe("ERROR30001");
//     });

//     it("실패 : merchantUID 업데이트 실패", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           amount: 10000,
//           shippingFee: 3000,
//           productPrice: 7000,
//           newArray: [],
//           orderer: "user",
//           phone: "01012345678",
//           address: "adress..",
//           extra_address: "extra adress..",
//         },
//       });
//       const response = httpMocks.createResponse();
//       userController.checkStock = jest.fn(() => false);
//       userRepository.insertInfoForPayment = jest.fn(() => 1);
//       userRepository.deletePaymentByPaymentId = jest.fn()
//       userRepository.updateMarchantUID = jest.fn();
//       userController.order = jest.fn();
//       userRepository.cancelPayment = jest.fn();

//       await userController.payment(request, response);

//       expect(response.statusCode).toBe(409);
//       expect(response._getJSONData().code).toBe("ERROR30001");
//     });

//     it("실패 : catch error", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           amount: 10000,
//           shippingFee: 3000,
//           productPrice: 7000,
//           newArray: [],
//           orderer: "user",
//           phone: "01012345678",
//           address: "adress..",
//           extra_address: "extra adress..",
//         },
//       });
//       const response = httpMocks.createResponse();
//       userController.checkStock = jest.fn(() => false);
//       userRepository.insertInfoForPayment = jest.fn(() => 1);
//       userRepository.deletePaymentByPaymentId = jest.fn()
//       userRepository.updateMarchantUID = jest.fn(() => {
//         throw new Error();
//       });
//       userController.order = jest.fn();
//       userRepository.cancelPayment = jest.fn();

//       await userController.payment(request, response);

//       expect(response.statusCode).toBe(400);
//     });
//   });

//   describe("order", () => {
//     it("성공", async()=>{
//       const request = httpMocks.createRequest({
//         paymentId: 1,
//         merchantUID: "2022080100000001",
//         username: "user",
//         body: {
//           paymentOption : "card",
//           newArray: [],
//           orderer: "홍길동",
//           phone: "010-1234-5678",
//           address: "경기도",
//           extra_address: "고양시"
//         },
//       });
//       const response = httpMocks.createResponse();
//       const orderId = 1;
//       const orderDetailResult = {insertId:1}
//       userRepository.order = jest.fn(()=>orderId)
//       userRepository.deletePaymentByPaymentId = jest.fn();
//       userRepository.orderDetail = jest.fn(()=>orderDetailResult)

//       await userController.order(request, response);

//       expect(response.statusCode).toBe(200);
//     })

//     it("실패 : order 정보가 저장되지 않은 경우", async()=>{
//       const request = httpMocks.createRequest({
//         paymentId: 1,
//         merchantUID: "2022080100000001",
//         username: "user",
//         body: {
//           paymentOption : "card",
//           newArray: [],
//           orderer: "홍길동",
//           phone: "010-1234-5678",
//           address: "경기도",
//           extra_address: "고양시"
//         },
//       });
//       const response = httpMocks.createResponse();
//       const orderId = undefined;
//       const orderDetailResult = {insertId:1}
//       userRepository.order = jest.fn(()=>orderId)
//       userRepository.deletePaymentByPaymentId = jest.fn();
//       userRepository.orderDetail = jest.fn(()=>orderDetailResult)

//       await userController.order(request, response);

//       expect(response.statusCode).toBe(409);
//     })

//     it("실패 : order detail정보가 저장되지 않은 경우", async()=>{
//       const request = httpMocks.createRequest({
//         paymentId: 1,
//         merchantUID: "2022080100000001",
//         username: "user",
//         body: {
//           paymentOption : "card",
//           newArray: [],
//           orderer: "홍길동",
//           phone: "010-1234-5678",
//           address: "경기도",
//           extra_address: "고양시"
//         },
//       });
//       const response = httpMocks.createResponse();
//       const orderId = 1;
//       const orderDetailResult = undefined
//       userRepository.order = jest.fn(()=>orderId)
//       userRepository.deletePaymentByPaymentId = jest.fn();
//       userRepository.orderDetail = jest.fn(()=>orderDetailResult)

//       await userController.order(request, response);

//       expect(response.statusCode).toBe(409);
//     })

//     it("실패 : catch error", async()=>{
//       const request = httpMocks.createRequest({
//         paymentId: 1,
//         merchantUID: "2022080100000001",
//         username: "user",
//         body: {
//           paymentOption : "card",
//           newArray: [],
//           orderer: "홍길동",
//           phone: "010-1234-5678",
//           address: "경기도",
//           extra_address: "고양시"
//         },
//       });
//       const response = httpMocks.createResponse();
//       const orderId = 1;
//       const orderDetailResult = {}
//       userRepository.order = jest.fn(()=>{throw new Error()})
//       userRepository.deletePaymentByPaymentId = jest.fn();
//       userRepository.orderDetail = jest.fn(()=>orderDetailResult)

//       await userController.order(request, response);

//       expect(response.statusCode).toBe(400);
//     })
//   })
// });
// describe("refund", () => {
//   describe("refund", ()=> {
//     it("성공", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           refundInfo: {
//             merchantUID: "2022000000",
//             impUID: "2022000000",
//             extraCharge: 0,
//             refundProduct: [],
//             refundAmount: 10000,
//           },
//           immediatelyRefundInfo: {
//             refundAmountForProduct: 7000,
//             refundAmountForShipping: 3000,
//           },
//           pendingRefundInfo: {
//             pendingRefundAmountForProduct: 0,
//             returnShippingFee: 0,
//             pendingRefundAmountForShipping: 0,
//           },
//         },
//       });
//       const response = httpMocks.createResponse();
//       const refundSavePoint = {
//         rest_refund_amount: 10000,
//         products_price: 7000,
//         shippingfee: 3000,
//         return_shippingfee: 0,
//       };
//       userRepository.getAmount = jest.fn(() => refundSavePoint);
//       userRepository.refund = jest.fn();
//       userRepository.requestRefund = jest.fn(() => 1);

//       await userController.refund(request, response);

//       expect(response.statusCode).toBe(200);
//     });

//     it("성공 : 추가결제금 결제", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           refundInfo: {
//             merchantUID: "2022000000",
//             impUID: "2022000000",
//             extraCharge: 5000,
//             refundProduct: [],
//             refundAmount: 10000,
//           },
//           immediatelyRefundInfo: {
//             refundAmountForProduct: 7000,
//             refundAmountForShipping: 3000,
//           },
//           pendingRefundInfo: {
//             pendingRefundAmountForProduct: 0,
//             returnShippingFee: 0,
//             pendingRefundAmountForShipping: 0,
//           },
//         },
//       });
//       const response = httpMocks.createResponse();
//       const refundSavePoint = {
//         rest_refund_amount: 10000,
//         products_price: 7000,
//         shippingfee: 3000,
//         return_shippingfee: 0,
//       };
//       userRepository.getAmount = jest.fn(() => refundSavePoint);
//       userController.payExtra = jest.fn(() => "202000");
//       userRepository.refund = jest.fn();
//       userRepository.requestRefund = jest.fn(() => 1);

//       await userController.refund(request, response);

//       expect(response.statusCode).toBe(200);
//     });

//     it("실패 : 환불하고자 하는 금액이 주문액보다 클 경우", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           refundInfo: {
//             merchantUID: "2022000000",
//             impUID: "2022000000",
//             extraCharge: 0,
//             refundProduct: [],
//             refundAmount: 15000,
//           },
//           immediatelyRefundInfo: {
//             refundAmountForProduct: 7000,
//             refundAmountForShipping: 3000,
//           },
//           pendingRefundInfo: {
//             pendingRefundAmountForProduct: 0,
//             returnShippingFee: 0,
//             pendingRefundAmountForShipping: 0,
//           },
//         },
//       });
//       const response = httpMocks.createResponse();
//       const refundSavePoint = {
//         rest_refund_amount: 10000,
//         products_price: 7000,
//         shippingfee: 3000,
//         return_shippingfee: 0,
//       };
//       userRepository.getAmount = jest.fn(() => refundSavePoint);
//       userRepository.refund = jest.fn();
//       userRepository.requestRefund = jest.fn(() => 1);

//       await userController.refund(request, response);

//       expect(response.statusCode).toBe(400);
//       expect(userRepository.refund).toHaveBeenCalledTimes(0);
//       expect(userRepository.requestRefund).toHaveBeenCalledTimes(0);
//     });

//     it("실패 : 추가금 결제시 merchantUID를 생성하지 못한 경우", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           refundInfo: {
//             merchantUID: "2022000000",
//             impUID: "2022000000",
//             extraCharge: 5000,
//             refundProduct: [],
//             refundAmount: 10000,
//           },
//           immediatelyRefundInfo: {
//             refundAmountForProduct: 7000,
//             refundAmountForShipping: 3000,
//           },
//           pendingRefundInfo: {
//             pendingRefundAmountForProduct: 0,
//             returnShippingFee: 0,
//             pendingRefundAmountForShipping: 0,
//           },
//         },
//       });
//       const response = httpMocks.createResponse();
//       const refundSavePoint = {
//         rest_refund_amount: 10000,
//         products_price: 7000,
//         shippingfee: 3000,
//         return_shippingfee: 0,
//       };
//       userRepository.getAmount = jest.fn(() => refundSavePoint);
//       userController.payExtra = jest.fn();
//       userRepository.refund = jest.fn();
//       userRepository.requestRefund = jest.fn(() => 1);

//       await userController.refund(request, response);

//       expect(response.statusCode).toBe(400);
//       expect(response._getJSONData().message).toBe("refund failed");
//       expect(userRepository.refund).toHaveBeenCalledTimes(0);
//       expect(userRepository.requestRefund).toHaveBeenCalledTimes(0);
//     });

//     it("실패 : catch error", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           refundInfo: {
//             merchantUID: "2022000000",
//             impUID: "2022000000",
//             extraCharge: 5000,
//             refundProduct: [],
//             refundAmount: 15000,
//           },
//           immediatelyRefundInfo: {
//             refundAmountForProduct: 7000,
//             refundAmountForShipping: 3000,
//           },
//           pendingRefundInfo: {
//             pendingRefundAmountForProduct: 0,
//             returnShippingFee: 0,
//             pendingRefundAmountForShipping: 0,
//           },
//         },
//       });
//       const response = httpMocks.createResponse();
//       userRepository.getAmount = jest.fn(() => {
//         throw new Error();
//       });
//       userController.payExtra = jest.fn();
//       userRepository.refund = jest.fn();
//       userRepository.requestRefund = jest.fn(() => 1);

//       await userController.refund(request, response);

//       expect(response.statusCode).toBe(400);
//     });
//   })

//   describe("cancelRefund", () => {
//     it("성공", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           refundInfo: {
//             merchantUID: "202000001",
//             newMerchantUID: "202000002",
//             refundId: 1,
//             refundProduct: [],
//           },
//           refundFailInfo: {
//             rest_refund_amount: 10000,
//             products_price: 7000,
//             shippingfee: 3000,
//             return_shippingfee: 0,
//             refund_amount: 0,
//             pending_refund: 0,
//           },
//         },
//       });
//       const response = httpMocks.createResponse();
//       userRepository.cancelRefund = jest.fn();

//       await userController.cancelRefund(request, response);

//       expect(response.statusCode).toBe(200);
//     });

//     it("실패 : catch error", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           refundInfo: {
//             merchantUID: "202000001",
//             newMerchantUID: "202000002",
//             refundId: 1,
//             refundProduct: [],
//           },
//           refundFailInfo: {
//             rest_refund_amount: 10000,
//             products_price: 7000,
//             shippingfee: 3000,
//             return_shippingfee: 0,
//             refund_amount: 0,
//             pending_refund: 0,
//           },
//         },
//       });
//       const response = httpMocks.createResponse();
//       userRepository.cancelRefund = jest.fn(() => {
//         throw new Error();
//       });

//       await userController.cancelRefund(request, response);

//       expect(response.statusCode).toBe(400);
//     });
//   })

//   describe("payExtra", ()=>{
//     it("성공", async() => {
//       const username = "user";
//       const extraCharge = 5000;
//       const paymentId = 1;
//       const updateMarchantUIDResult = {insertId:1};
//       userRepository.insertInfoForExtra = jest.fn(() => paymentId);
//       userRepository.updateMarchantUID = jest.fn(() => updateMarchantUIDResult);
//       userRepository.cancelPayment = jest.fn();

//       await userController.payExtra(username, extraCharge);

//       expect(userRepository.insertInfoForExtra).toHaveBeenCalledTimes(1);
//       expect(userRepository.updateMarchantUID).toHaveBeenCalledTimes(1);
//       expect(userRepository.cancelPayment).toHaveBeenCalledTimes(0);
//     })

//     it("실패 : paymentID 생성 실패", async() => {
//       const username = "user";
//       const extraCharge = 5000;
//       const paymentId = undefined;
//       userRepository.insertInfoForExtra = jest.fn(() => paymentId);
//       userRepository.updateMarchantUID = jest.fn(() => undefined);
//       userRepository.cancelPayment = jest.fn();

//       await userController.payExtra(username, extraCharge);

//       expect(userRepository.insertInfoForExtra).toHaveBeenCalledTimes(1);
//       expect(userRepository.updateMarchantUID).toHaveBeenCalledTimes(0);
//       expect(userRepository.cancelPayment).toHaveBeenCalledTimes(0);
//     })

//     it("실패 : merchantUID 업데이트 실패", async() => {
//       const username = "user";
//       const extraCharge = 5000;
//       const paymentId = 1;
//       userRepository.insertInfoForExtra = jest.fn(() => paymentId);
//       userRepository.updateMarchantUID = jest.fn(() => undefined);
//       userRepository.cancelPayment = jest.fn();

//       await userController.payExtra(username, extraCharge);

//       expect(userRepository.insertInfoForExtra).toHaveBeenCalledTimes(1);
//       expect(userRepository.updateMarchantUID).toHaveBeenCalledTimes(1);
//       expect(userRepository.cancelPayment).toHaveBeenCalledTimes(1);
//     })

//     it("실패 : catch error", async() => {
//       const username = "user";
//       const extraCharge = 5000;
//       const paymentId = 1;
//       userRepository.insertInfoForExtra = jest.fn(() =>  paymentId);
//       userRepository.updateMarchantUID = jest.fn(() => {throw new Error()});
//       userRepository.cancelPayment = jest.fn();

//       await userController.payExtra(username, extraCharge);

//       expect(userRepository.insertInfoForExtra).toHaveBeenCalledTimes(1);
//       expect(userRepository.updateMarchantUID).toHaveBeenCalledTimes(1);
//       expect(userRepository.cancelPayment).toHaveBeenCalledTimes(1);
//     })
//   })
// });

// it("성공 : 주문취소로 인한 카트 재담기인 경우", async () => {
//   const request = httpMocks.createRequest({
//     productArray: [{
//       product_code: "testcode",
//       option_number: 1,
//       quantity: 1,
//       userId: 2
//     },
//     {
//       product_code: "testcode",
//       option_number: 2,
//       quantity: 1,
//       userId: 2
//     }
//   ]
//   });
//   const response = httpMocks.createResponse();
//   const product = [{ product_code: "test-00000001", option_number: 0 }];
//   userRepository.getByProduct_code = jest.fn(() => product);
//   userRepository.increaseQuantity = jest.fn();
//   userRepository.addInCart = jest.fn();

//   await userController.addCart(request, response);

//   expect(response.statusCode).toBe(204);
//   expect(userRepository.getByProduct_code).toHaveBeenCalledTimes(0);
//   expect(userRepository.increaseQuantity).toHaveBeenCalledTimes(0);
//   expect(userRepository.addInCart).toHaveBeenCalledTimes(2);
// });
