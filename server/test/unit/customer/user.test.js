import UserController from "../../../controller/customer/user.js";
import httpMocks from "node-mocks-http";

describe("user", () => {
  let userRepository;
  let userController;

  beforeEach(() => {
    userRepository = {};
    userController = new UserController(userRepository);
  });

  describe("idDuplicateCheck", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        query: {
          username: "user",
        },
      });
      const response = httpMocks.createResponse();
      userRepository.findByUsername = () => {};

      await userController.idDuplicateCheck(request, response);

      expect(response.statusCode).toBe(200);
    });

    it("실패 : 이미 존재하는 username일 경우", async () => {
      const request = httpMocks.createRequest({
        body: {
          idCheck: true,
          username: "user",
        },
      });
      const response = httpMocks.createResponse();
      const user = { userId: 1, username: "user" };
      userRepository.findByUsername = () => user;

      await userController.idDuplicateCheck(request, response);

      expect(response.statusCode).toBe(409);
      expect(response._getJSONData().code).toBe("ERROR00003");
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        query: {
          username: "user",
        },
      });
      const response = httpMocks.createResponse();
      userRepository.findByUsername = () => {
        throw new Error();
      };

      await userController.idDuplicateCheck(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("signup", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        body: {
          signupInfo: {
            username: "user",
            password: "abcd",
            name: "username",
            birthday: "1990-01-01",
            phone: "01012345678",
            address: "",
            extra_address: "",
          },
        },
      });
      const response = httpMocks.createResponse();
      userController.validationCheck = jest.fn(() => {
        return true;
      });
      userRepository.createUser = jest.fn();

      await userController.signup(request, response);

      expect(response.statusCode).toBe(201);
    });

    it("실패 : 유효성 검사를 통과하지 못한 경우", async () => {
      const request = httpMocks.createRequest({
        body: {
          signupInfo: {
            username: "user",
            password: "abcd",
            name: "username",
            birthday: "1990-01-01",
            phone: "01012345678",
            address: "",
            extra_address: "",
          },
        },
      });
      const response = httpMocks.createResponse();
      userController.validationCheck = jest.fn(() => {
        return false;
      });
      userRepository.createUser = jest.fn();

      await userController.signup(request, response);

      expect(response.statusCode).toBe(400);
      expect(response._getJSONData().code).toEqual("ERROR61001");
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        body: {
          signupInfo: {
            username: "user",
            password: "abcd",
            name: "username",
            birthday: "1990-01-01",
            phone: "01012345678",
            address: "",
            extra_address: "",
          },
        },
      });
      const response = httpMocks.createResponse();
      userRepository.createUser = () => {
        throw new Error();
      };

      await userController.signup(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("login", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        body: {
          userInfo: {
            username: "user",
            password: "1234",
          },
        },
      });
      const response = httpMocks.createResponse();
      const user = {
        userId: 1,
        username: "user",
        password:
          "$2b$12$xK1rWv9IgppQXZA5.fNAF.A.g8Veczd2emi9xLJOlF9dXssSa3I12",
      };
      userRepository.findByUsername = () => user;
      userController.createJwtToken = jest.fn(() => "token");
      userController.setToken = jest.fn();
      userController.cartSummary = jest.fn(() => 1);

      await userController.login(request, response);

      expect(response.statusCode).toBe(200);
    });

    it("실패 : 존재하지 않는 username인 경우", async () => {
      const request = httpMocks.createRequest({
        body: {
          userInfo: {
            username: "user",
            password: "1234",
          },
        },
      });
      const response = httpMocks.createResponse();

      userRepository.findByUsername = () => {};
      userController.createJwtToken = jest.fn(() => "token");
      userController.setToken = jest.fn();
      userController.cartSummary = jest.fn(() => 1);

      await userController.login(request, response);

      expect(response.statusCode).toBe(401);
    });

    it("실패 : 패스워드가 올바르지 않은 경우", async () => {
      const request = httpMocks.createRequest({
        body: {
          userInfo: {
            username: "user",
            password: "1234",
          },
        },
      });
      const response = httpMocks.createResponse();
      const user = {
        userId: 1,
        username: "user",
        password: "$2b$$xK1rWv9IgppQXZA5.fNAF.A.g8Veczd2emi9xLJOlF9dXssSa3I12",
      };
      userRepository.findByUsername = () => user;
      userController.createJwtToken = jest.fn(() => "token");
      userController.setToken = jest.fn();
      userController.cartSummary = jest.fn(() => 1);

      await userController.login(request, response);

      expect(response.statusCode).toBe(401);
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        body: {
          userInfo: {
            username: "user",
            password: "1234",
          },
        },
      });
      const response = httpMocks.createResponse();
      const user = {
        userId: 1,
        username: "user",
        password:
          "$2b$12$xK1rWv9IgppQXZA5.fNAF.A.g8Veczd2emi9xLJOlF9dXssSa3I12",
      };
      userRepository.findByUsername = () => {
        throw new Error();
      };
      userController.createJwtToken = jest.fn(() => "token");
      userController.setToken = jest.fn();
      userController.cartSummary = jest.fn(() => 1);

      await userController.login(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("kakaoLogin", () => {
    it("성공 : 이전에 카카오 로그인 기록이 있는 경우", async () => {
      const request = httpMocks.createRequest({
        body: {
          kakao_account: "kakao@kakao.n",
        },
      });
      const response = httpMocks.createResponse();
      const user = {
        id: 1,
        username: "kakao@kakao.n",
      };
      userRepository.findByUsername = () => user;
      userRepository.createUserKakao = jest.fn();
      userController.createJwtToken = jest.fn(() => "token");
      userController.setToken = jest.fn();
      userController.cartSummary = jest.fn(() => 1);

      await userController.kakaoLogin(request, response);

      expect(response.statusCode).toBe(200);
      expect(userRepository.createUserKakao).toHaveBeenCalledTimes(0);
    });

    it("성공 : 카카오 로그인이 최초인 경우", async () => {
      const request = httpMocks.createRequest({
        body: {
          kakao_account: "kakao@kakao.n",
        },
      });
      const response = httpMocks.createResponse();
      userRepository.findByUsername = () => {};
      userRepository.createUserKakao = () => 1;
      userController.createJwtToken = jest.fn(() => "token");
      userController.setToken = jest.fn();
      userController.cartSummary = jest.fn(() => 1);

      await userController.kakaoLogin(request, response);

      expect(response.statusCode).toBe(200);
    });

    it("실패 :catch error", async () => {
      const request = httpMocks.createRequest({
        body: {
          kakao_account: "kakao@kakao.n",
        },
      });
      const response = httpMocks.createResponse();
      userRepository.findByUsername = () => {};
      userRepository.createUserKakao = () => {
        throw new Error();
      };
      userController.createJwtToken = jest.fn(() => "token");
      userController.setToken = jest.fn();
      userController.cartSummary = jest.fn(() => 1);

      await userController.kakaoLogin(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("user info", () => {
    describe("getMyInfo", () => {
      it("성공", async () => {
        const request = httpMocks.createRequest({
          username: "user",
        });
        const response = httpMocks.createResponse();
        const user = {
          name: "홍길동",
        };
        userRepository.getUserInfo = () => user;

        await userController.getMyInfo(request, response);

        expect(response.statusCode).toBe(200);
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest({
          username: "user",
        });
        const response = httpMocks.createResponse();
        userRepository.getUserInfo = () => {
          throw new Error();
        };

        await userController.getMyInfo(request, response);

        expect(response.statusCode).toBe(400);
      });
    });

    describe("modifyUserInfo", () => {
      it("성공 : 패스워드를 제외한 항목 변경", async () => {
        const request = httpMocks.createRequest({
          body: {
            userInfo: {
              name: "홍길순",
            },
          },
        });
        const response = httpMocks.createResponse();
        userController.validationCheck = jest.fn(() => {
          return true;
        });
        userRepository.modifyUserInfo = jest.fn();
        userRepository.modifyUserInfoAndPw = jest.fn();

        await userController.modifyUserInfo(request, response);

        expect(response.statusCode).toBe(200);
        expect(userRepository.modifyUserInfo).toHaveBeenCalledTimes(1);
        expect(userRepository.modifyUserInfoAndPw).toHaveBeenCalledTimes(0);
      });

      it("성공 : 패스워드 변경", async () => {
        const request = httpMocks.createRequest({
          body: {
            userInfo: {
              name: "홍길순",
              password: "abcd",
            },
          },
        });
        const response = httpMocks.createResponse();
        userController.validationCheck = jest.fn(() => {
          return true;
        });
        userRepository.modifyUserInfo = jest.fn();
        userRepository.modifyUserInfoAndPw = jest.fn();

        await userController.modifyUserInfo(request, response);

        expect(response.statusCode).toBe(200);
        expect(userRepository.modifyUserInfo).toHaveBeenCalledTimes(0);
        expect(userRepository.modifyUserInfoAndPw).toHaveBeenCalledTimes(1);
      });

      it("실패 : 유효성 검사를 실패한 경우", async () => {
        const request = httpMocks.createRequest({
          body: {
            userInfo: {
              name: "홍길순",
              password: "abcd",
            },
          },
        });
        const response = httpMocks.createResponse();
        userController.validationCheck = jest.fn(() => {
          return false;
        });
        userRepository.modifyUserInfo = jest.fn();
        userRepository.modifyUserInfoAndPw = jest.fn();

        await userController.modifyUserInfo(request, response);

        expect(response.statusCode).toBe(400);
        expect(userRepository.modifyUserInfo).toHaveBeenCalledTimes(0);
        expect(userRepository.modifyUserInfoAndPw).toHaveBeenCalledTimes(0);
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest({
          body: {
            userInfo: {
              name: "홍길순",
              password: "abcd",
            },
          },
        });
        const response = httpMocks.createResponse();

        userRepository.modifyUserInfo = jest.fn();
        userRepository.modifyUserInfoAndPw = () => {
          throw new Error();
        };

        await userController.modifyUserInfo(request, response);

        expect(response.statusCode).toBe(400);
      });
    });
  });

  describe("cart", () => {
    describe("removeProductInCART", () => {
      it("성공", async () => {
        const request = httpMocks.createRequest({
          query: {
            id: 1,
          },
        });
        const response = httpMocks.createResponse();
        const affectedRow = 1;
        userRepository.deleteProduct = jest.fn(() => {
          return affectedRow;
        });

        await userController.removeProductInCART(request, response);

        expect(response.statusCode).toBe(204);
      });

      it("실패 : affectedRow가 0인 경우", async () => {
        const request = httpMocks.createRequest({
          query: {
            id: 1,
          },
        });
        const response = httpMocks.createResponse();
        const affectedRow = 0;
        userRepository.deleteProduct = jest.fn(() => {
          return affectedRow;
        });

        await userController.removeProductInCART(request, response);

        expect(response.statusCode).toBe(403);
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest({
          query: {
            id: 1,
          },
        });
        const response = httpMocks.createResponse();
        userRepository.deleteProduct = () => {
          throw new Error();
        };

        await userController.removeProductInCART(request, response);

        expect(response.statusCode).toBe(400);
      });
    });

    describe("cart", () => {
      it("성공", async () => {
        const request = httpMocks.createRequest();
        const response = httpMocks.createResponse();
        const products = [{ cart_id: 1, stock: 2, quantity: 1, name: "name" }];
        const adjustmentProduct = [];
        userRepository.getInCart = () => products;
        userRepository.adjustmentQuantityInCart = jest.fn();

        await userController.cart(request, response);

        expect(response.statusCode).toBe(200);
        expect(response._getJSONData()).toEqual({
          products,
          adjustmentProduct,
        });
      });

      it("성공 : 재고 부족시 카트 안의 상품 재고 조정후 가져오기", async () => {
        const request = httpMocks.createRequest();
        const response = httpMocks.createResponse();
        const products = [{ cart_id: 1, stock: 1, quantity: 2, name: "name" }];
        const adjustmentProduct = [{ quantity: 1, name: "name" }];
        const afterProducts = [
          { cart_id: 1, stock: 1, quantity: 1, name: "name" },
        ];
        userRepository.getInCart = () => products;
        userRepository.adjustmentQuantityInCart = jest.fn();

        await userController.cart(request, response);

        expect(response.statusCode).toBe(200);
        expect(response._getJSONData()).toEqual({
          products: afterProducts,
          adjustmentProduct,
        });
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest();
        const response = httpMocks.createResponse();
        userRepository.getInCart = () => {
          throw new Error();
        };
        userRepository.adjustmentQuantityInCart = jest.fn();

        await userController.cart(request, response);

        expect(response.statusCode).toBe(400);
      });
    });

    describe("addCart", () => {
      it("성공 : 이미 cart에 있는 상품인 경우", async () => {
        const request = httpMocks.createRequest({
          body: {
            product_code: "test-00000001",
            option_number: 0,
            quantity: 1,
          },
        });
        const response = httpMocks.createResponse();
        const product = [{ product_code: "test-00000001", option_number: 0 }];
        const cartProduct = { product_code: "test-00000001", option_number: 0 };
        userRepository.getByProduct_code = () => product;
        userController.duplicateCheck = () => cartProduct;
        userRepository.increaseQuantity = jest.fn();
        userRepository.addInCart = jest.fn();
        userController.cartSummary = jest.fn(() => 1);

        await userController.addCart(request, response);

        expect(response.statusCode).toBe(201);
        expect(userRepository.increaseQuantity).toHaveBeenCalledTimes(1);
        expect(userRepository.addInCart).toHaveBeenCalledTimes(0);
      });

      it("성공", async () => {
        const request = httpMocks.createRequest({
          body: {
            product_code: "test-00000001",
            option_number: 0,
            quantity: 1,
          },
        });
        const response = httpMocks.createResponse();
        const product = [{ product_code: "test-00000001", option_number: 0 }];
        userRepository.getByProduct_code = () => product;
        userController.duplicateCheck = () => {};
        userRepository.increaseQuantity = jest.fn();
        userRepository.addInCart = jest.fn();
        userController.cartSummary = jest.fn(() => 1);

        await userController.addCart(request, response);

        expect(response.statusCode).toBe(201);
        expect(userRepository.increaseQuantity).toHaveBeenCalledTimes(0);
        expect(userRepository.addInCart).toHaveBeenCalledTimes(1);
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest({
          body: {
            product_code: "test-00000001",
            option_number: 0,
            quantity: 1,
          },
        });
        const response = httpMocks.createResponse();
        const product = [{ product_code: "test-00000001", option_number: 0 }];
        userRepository.getByProduct_code = () => product;
        userController.duplicateCheck = () => {};
        userRepository.increaseQuantity = jest.fn();
        userRepository.addInCart = jest.fn(() => {
          throw new Error();
        });
        userController.cartSummary = jest.fn(() => 1);

        await userController.addCart(request, response);

        expect(response.statusCode).toBe(400);
      });

      it("실패 : 상품코드로 상품을 찾을 수 없는 경우", async () => {
        const request = httpMocks.createRequest({
          body: {
            product_code: "test-00000001",
            option_number: 0,
            quantity: 1,
          },
        });
        const response = httpMocks.createResponse();
        const product = [];
        userRepository.getByProduct_code = () => product;
        userController.duplicateCheck = jest.fn();
        userRepository.increaseQuantity = jest.fn();
        userRepository.addInCart = jest.fn(() => {
          throw new Error();
        });
        userController.cartSummary = jest.fn(() => 1);

        await userController.addCart(request, response);

        expect(response.statusCode).toBe(404);
        expect(response._getJSONData().code).toBe("ERROR10003");
      });
    });
  });

  describe("info", () => {
    describe("info", () => {
      //주문내역
      it("성공", async () => {
        const request = httpMocks.createRequest({
          query: {
            page: 1,
            date1: "2022-04-01",
            date2: "2022-04-30",
          },
        });
        const response = httpMocks.createResponse();
        const orderList = [{ order_id: 1, full_count: 1 }];
        const orderDetail = [{ detail_id: 1, order_id: 1 }];
        userRepository.getOrder = () => orderList;
        userRepository.getOrderDetail = () => orderDetail;

        await userController.info(request, response);

        expect(response.statusCode).toBe(200);
      });

      it("성공 : 주문이 없는 경우", async () => {
        const request = httpMocks.createRequest({
          query: {
            page: 1,
            date1: "2022-04-01",
            date2: "2022-04-30",
          },
        });
        const response = httpMocks.createResponse();
        const orderList = [];
        const orderDetail = [];
        userRepository.getOrder = () => orderList;
        userRepository.getOrderDetail = () => orderDetail;

        await userController.info(request, response);

        expect(response.statusCode).toBe(200);
        expect(response._getJSONData().orderList).toStrictEqual([]);
      });

      it("실패 : 날짜가 잘못된 형식으로 오는 경우", async () => {
        const request = httpMocks.createRequest({
          query: {
            page: 1,
            date1: "20220401",
            date2: "2022-04-30",
          },
        });
        const response = httpMocks.createResponse();
        const orderList = [{ order_id: 1, full_count: 1 }];
        const orderDetail = [{ detail_id: 1, order_id: 1 }];
        userRepository.getOrder = () => orderList;
        userRepository.getOrderDetail = () => orderDetail;

        await userController.info(request, response);

        expect(response.statusCode).toBe(400);
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest({
          query: {
            page: 1,
            date1: "2022-04-01",
            date2: "2022-04-30",
          },
        });
        const response = httpMocks.createResponse();
        userRepository.getOrder = () => {
          throw new Error();
        };
        userRepository.getOrderDetail = () => {};

        await userController.info(request, response);

        expect(response.statusCode).toBe(400);
      });
    });

    describe("getMyInfo", () => {
      it("성공", async () => {
        const request = httpMocks.createRequest();
        const response = httpMocks.createResponse();
        const user = {
          user_id: 1,
          username: "user",
        };
        userRepository.getUserInfo = () => user;

        await userController.getMyInfo(request, response);

        expect(response.statusCode).toBe(200);
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest();
        const response = httpMocks.createResponse();
        userRepository.getUserInfo = () => {
          throw new Error();
        };

        await userController.getMyInfo(request, response);

        expect(response.statusCode).toBe(400);
      });
    });

    describe("deliveryStatus", () => {
      it("성공", async () => {
        const request = httpMocks.createRequest({
          params: { id: 1 },
        });
        const response = httpMocks.createResponse();
        const status = [{ status: "결제완료", date: "2022-04-01" }];
        userRepository.getDeliveryStatus = () => status;

        await userController.deliveryStatus(request, response);

        expect(response.statusCode).toBe(200);
      });

      it("실패 : 주어진 id로 배송 정보를 확인할 수 없는 경우", async () => {
        const request = httpMocks.createRequest({
          params: { id: 1 },
        });
        const response = httpMocks.createResponse();
        const status = [];
        userRepository.getDeliveryStatus = () => status;

        await userController.deliveryStatus(request, response);

        expect(response.statusCode).toBe(404);
        expect(response._getJSONData().code).toBe("ERROR20001");
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest({
          params: { id: 1 },
        });
        const response = httpMocks.createResponse();
        userRepository.getDeliveryStatus = () => {
          throw new Error();
        };

        await userController.deliveryStatus(request, response);

        expect(response.statusCode).toBe(400);
      });
    });
  });

  describe("review", () => {
    describe("getMyReview", () => {
      it("성공 : 작성한 리뷰", async () => {
        const request = httpMocks.createRequest({
          query: {
            status: "done",
            page: 1,
          },
        });
        const response = httpMocks.createResponse();
        const review = [
          {
            product_code: "test-00000001",
            content: "good~",
            full_count: 1,
          },
        ];
        userRepository.getMyReview = jest.fn(() => review);
        userRepository.getWritableReview = jest.fn(() => review);

        await userController.getMyReview(request, response);

        expect(response.statusCode).toBe(200);
        expect(userRepository.getMyReview).toHaveBeenCalledTimes(1);
        expect(userRepository.getWritableReview).toHaveBeenCalledTimes(0);
      });

      it("성공 : 작성 가능한 리뷰", async () => {
        const request = httpMocks.createRequest({
          query: {
            status: "yet",
            page: 1,
          },
        });
        const response = httpMocks.createResponse();
        const review = [
          {
            product_code: "test-00000001",
            content: "good~",
            full_count: 1,
          },
        ];
        userRepository.getMyReview = jest.fn(() => review);
        userRepository.getWritableReview = jest.fn(() => review);

        await userController.getMyReview(request, response);

        expect(response.statusCode).toBe(200);
        expect(userRepository.getMyReview).toHaveBeenCalledTimes(0);
        expect(userRepository.getWritableReview).toHaveBeenCalledTimes(1);
      });

      it("성공 : 작성했거나 작성 가능한 리뷰가 없는 경우", async () => {
        const request = httpMocks.createRequest({
          query: {
            status: "yet",
            page: 1,
          },
        });
        const response = httpMocks.createResponse();
        const review = [];
        userRepository.getMyReview = jest.fn(() => review);
        userRepository.getWritableReview = jest.fn(() => review);

        await userController.getMyReview(request, response);

        expect(response.statusCode).toBe(200);
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest({
          query: {
            status: "yet",
            page: 1,
          },
        });
        const response = httpMocks.createResponse();
        const review = [];
        userRepository.getMyReview = jest.fn(() => review);
        userRepository.getWritableReview = jest.fn(() => {
          throw new Error();
        });

        await userController.getMyReview(request, response);

        expect(response.statusCode).toBe(400);
      });
    });

    describe("writeReview", () => {
      it("성공", async () => {
        const request = httpMocks.createRequest({
          body: {
            text: "good",
            detail_id: 1,
          },
        });
        const response = httpMocks.createResponse();
        const order = { product_code: "test-0001" };
        userRepository.getOrderDetailByUsername = jest.fn(() => {
          return order;
        });
        userRepository.writeReview = jest.fn();

        await userController.writeReview(request, response);

        expect(response.statusCode).toBe(201);
      });

      it("실패 : 해당하는 주문건이 없는 경우", async () => {
        const request = httpMocks.createRequest({
          body: {
            text: "good",
            detail_id: 1,
          },
        });
        const response = httpMocks.createResponse();
        userRepository.getOrderDetailByUsername = jest.fn(() => {
          return;
        });
        userRepository.writeReview = jest.fn();

        await userController.writeReview(request, response);

        expect(response.statusCode).toBe(404);
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest({
          body: {
            product_code: "test-00000001",
            text: "good",
            detail_id: 1,
          },
        });
        const response = httpMocks.createResponse();
        const order = { product_code: "test-0001" };
        userRepository.getOrderDetailByUsername = jest.fn(() => {
          return order;
        });
        userRepository.writeReview = () => {
          throw new Error();
        };

        await userController.writeReview(request, response);

        expect(response.statusCode).toBe(400);
      });
    });
  });

  describe("getMyPost", () => {
    it("성공 : 내가 작성한 게시글", async () => {
      const request = httpMocks.createRequest({
        query: {
          thing: "post",
          page: 1,
        },
      });
      const response = httpMocks.createResponse();
      const posts = [{ post_id: 1, title: "title..", full_count: 1 }];
      userRepository.getMyPost = jest.fn(() => posts);
      userRepository.getMyComment = jest.fn(() => posts);

      await userController.getMyPost(request, response);

      expect(response.statusCode).toBe(200);
      expect(userRepository.getMyPost).toHaveBeenCalledTimes(1);
      expect(userRepository.getMyComment).toHaveBeenCalledTimes(0);
    });

    it("성공 : 내가 댓글을 작성한 게시글", async () => {
      const request = httpMocks.createRequest({
        query: {
          thing: "comment",
          page: 1,
        },
      });
      const response = httpMocks.createResponse();
      const posts = [{ post_id: 1, title: "title..", full_count: 1 }];
      userRepository.getMyPost = jest.fn(() => posts);
      userRepository.getMyComment = jest.fn(() => posts);

      await userController.getMyPost(request, response);

      expect(response.statusCode).toBe(200);
      expect(userRepository.getMyPost).toHaveBeenCalledTimes(0);
      expect(userRepository.getMyComment).toHaveBeenCalledTimes(1);
    });

    it("성공 : 내가 작성했거나 댓글을 작성한 게시글이 없는 경우", async () => {
      const request = httpMocks.createRequest({
        query: {
          thing: "comment",
          page: 1,
        },
      });
      const response = httpMocks.createResponse();
      const posts = [];
      userRepository.getMyPost = jest.fn(() => posts);
      userRepository.getMyComment = jest.fn(() => posts);

      await userController.getMyPost(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({ newPosts: [], hasmore: 0 });
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        query: {
          thing: "comment",
          page: 1,
        },
      });
      const response = httpMocks.createResponse();
      const posts = [];
      userRepository.getMyPost = jest.fn(() => posts);
      userRepository.getMyComment = jest.fn(() => {
        throw new Error();
      });

      await userController.getMyPost(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("refreshAuth", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest();
      const response = httpMocks.createResponse();
      userController.cartSummary = jest.fn(() => 1);

      await userController.refreshAuth(request, response);

      expect(response.statusCode).toBe(200);
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        userId: 1,
      });
      const response = httpMocks.createResponse();
      userController.cartSummary = jest.fn(() => {
        throw new Error();
      });

      await userController.refreshAuth(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("cartSummary", () => {
    it("성공", async () => {
      const id = 1;
      const cartQuantity = { quantity: 1 };
      userRepository.getQuantityInCart = jest.fn(async () => {
        return cartQuantity;
      });

      const result = await userController.cartSummary(id);

      expect(result).toBe(1);
    });

    it("실패 : catch error", async () => {
      const id = 1;
      const cartQuantity = { quantity: 1 };
      userRepository.getQuantityInCart = jest.fn(async () => {
        throw new Error();
      });

      const result = await userController.cartSummary(id);

      expect(result).toBe(false);
    });
  });

  describe("duplicateCheck", () => {
    it("성공", async () => {
      const userId = 1;
      const product_code = "test-0001";
      const option_number = 1;
      const cartResult = {};
      userRepository.checkInCart = jest.fn(async () => {
        return cartResult;
      });

      const result = await userController.duplicateCheck(
        userId,
        product_code,
        option_number
      );

      expect(result).toBe(cartResult);
    });

    it("실패 : catch error", async () => {
      const userId = 1;
      const product_code = "test-0001";
      const option_number = 1;
      const cartResult = {};
      userRepository.checkInCart = jest.fn(async () => {
        throw new Error();
      });

      const result = await userController.duplicateCheck(
        userId,
        product_code,
        option_number
      );

      expect(result).toBe(false);
    });
  });
});
