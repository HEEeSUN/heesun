import AdminController from "../../controller/admin/admin";
import httpMocks from "node-mocks-http";

describe("admin", () => {
  let adminRepository;
  let adminController;

  beforeEach(() => {
    adminRepository = {};
    adminController = new AdminController(adminRepository);
  });

  describe("refresh", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        username: "master",
      });
      const response = httpMocks.createResponse();

      await adminController.refresh(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({ username: "master" });
    });
  });

  describe("getMenuList", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest();
      const response = httpMocks.createResponse();
      const accessableMenu = [
        {
          menu_id: 1,
          admin_id: 1,
          menu: "홈",
          path: "",
        },
      ];
      adminRepository.getMenuList = () => accessableMenu;

      await adminController.getMenuList(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({ menuList: accessableMenu });
    });

    it("성공 : 메뉴가 없을 때", async () => {
      const request = httpMocks.createRequest();
      const response = httpMocks.createResponse();
      const accessableMenu = [];
      adminRepository.getMenuList = () => accessableMenu;

      await adminController.getMenuList(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({ menuList: accessableMenu });
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest();
      const response = httpMocks.createResponse();

      adminRepository.getMenuList = () => {
        throw new Error();
      };

      await adminController.getMenuList(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("getDashboardData", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest();
      const response = httpMocks.createResponse();
      const sales = [
        {
          month: "202206",
          sales: 30000,
          revenue: 27000,
          refund: 3000,
          cost: 500,
        },
        {
          month: "202207",
          sales: 60000,
          revenue: 50000,
          refund: 10000,
          cost: 5000,
        },
        {
          month: "202208",
          sales: 10000,
          revenue: 10000,
          refund: 0,
          cost: 50,
        },
      ];
      adminRepository.getAllChattings = () => [
        {
          room_name: "chat240",
        },
      ];
      adminRepository.getNoReadMessage = () => {
        return { number: 1 };
      };
      adminRepository.getNewOrderAndNewRefund = () => [
        {
          status: "결제완료",
          number: 3,
        },
        {
          status: "반품및취소요청",
          number: 3,
        },
      ];
      adminRepository.get6month = () => sales;

      await adminController.getDashboardData(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({
        message: 1,
        order: 3,
        refund: 3,
        sales: 10000,
        salesOf6month: sales,
      });
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest();
      const response = httpMocks.createResponse();
      const num = { number: 1 };
      const sales = { sales: 100000 };
      adminRepository.getChatList = () => [
        {
          chat_id: 1,
          room_name: "chat240",
          username: "user",
        },
      ];
      adminRepository.getNoReadMessage = () => num;
      adminRepository.getNewOrder = () => num;
      adminRepository.getNewRefund = () => num;
      adminRepository.getSales = () => {
        throw new Error();
      };

      await adminController.getDashboardData(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("login", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        body: {
          admin: "admin",
          password: "1234",
        },
      });
      const response = httpMocks.createResponse();
      const user = {
        id: 1,
        username: "admin",
        password:
          "$2b$12$xK1rWv9IgppQXZA5.fNAF.A.g8Veczd2emi9xLJOlF9dXssSa3I12",
      };
      const accessableMenu = [
        {
          menu_id: 1,
          admin_id: 1,
          menu: "홈",
          path: "",
        },
      ];
      const token = "aa";
      adminRepository.findByUsername = () => user;
      adminRepository.getMenuList = () => accessableMenu;
      adminController.createJwtToken = () => jest.fn(() => token);
      adminController.setToken = () => {};

      await adminController.login(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({
        menuList: accessableMenu,
        username: user.username,
      });
    });

    it("실패 : 입력된 정보를 찾을 수 없음", async () => {
      const request = httpMocks.createRequest({
        body: {
          admin: "admin",
          password: "1234",
        },
      });
      const response = httpMocks.createResponse();
      adminRepository.findByUsername = () => {};

      await adminController.login(request, response);

      expect(response.statusCode).toBe(401);
      expect(response._getJSONData().code).toBe("ERROR00002");
    });

    it("실패 : 패스워드 틀림", async () => {
      const request = httpMocks.createRequest({
        body: {
          admin: "admin",
          password: "1234",
        },
      });
      const response = httpMocks.createResponse();
      const admin = {
        admin_id: 1,
        admin: "admin",
        password: "$2b$$xK1rWv9IgppQXZA5.fNAF.A.g8Veczd2emi9xLJOlF9dXssSa3I12",
      };
      adminRepository.findByUsername = () => admin;

      await adminController.login(request, response);

      expect(response.statusCode).toBe(401);
      expect(response._getJSONData().code).toBe("ERROR00002");
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        body: {
          admin: "admin",
          password: "1234",
        },
      });
      const response = httpMocks.createResponse();
      const admin = {
        admin_id: 1,
        admin: "admin",
        password:
          "$2b$12$xK1rWv9IgppQXZA5.fNAF.A.g8Veczd2emi9xLJOlF9dXssSa3I12",
      };
      adminRepository.findByUsername = () => admin;
      adminRepository.getMenuList = () => {
        throw new Error();
      };

      await adminController.login(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("create", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        body: {
          admin: "admin",
          password: "1234",
          menuList: [1, 2],
        },
      });
      const response = httpMocks.createResponse();
      adminRepository.findByUsername = () => {};
      adminRepository.createAdmin = () => 1;
      adminRepository.grantAuthority = () => {};

      await adminController.create(request, response);

      expect(response.statusCode).toBe(201);
    });

    it("실패 : 이미 사용중인 username", async () => {
      const request = httpMocks.createRequest({
        body: {
          admin: "admin",
          password: "1234",
          menuList: [1, 2],
        },
      });
      const response = httpMocks.createResponse();
      const admin = {
        admin_id: 1,
        admin: "admin",
        password:
          "$2b$12$xK1rWv9IgppQXZA5.fNAF.A.g8Veczd2emi9xLJOlF9dXssSa3I12",
      };
      adminRepository.findByUsername = () => admin;

      await adminController.create(request, response);

      expect(response.statusCode).toBe(409);
      expect(response._getJSONData().code).toBe("ERROR00003");
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        body: {
          admin: "admin",
          password: "1234",
          menuList: [1, 2],
        },
      });
      const response = httpMocks.createResponse();
      adminRepository.findByUsername = () => {};
      adminRepository.createAdmin = () => 1;
      adminRepository.grantAuthority = () => {
        throw new Error();
      };
      await adminController.create(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("product", () => {
    describe("checkProductCode", () => {
      it("성공 : 사용가능한 상품 코드", async () => {
        const request = httpMocks.createRequest({
          body: {
            product_code: "test-00000001",
          },
        });
        const response = httpMocks.createResponse();
        adminRepository.findByProductCode = () => {};

        await adminController.checkProductCode(request, response);

        expect(response.statusCode).toBe(204);
      });

      it("실패 : 이미 사용중인 상품 코드", async () => {
        const request = httpMocks.createRequest({
          body: {
            product_code: "test-00000001",
          },
        });
        const response = httpMocks.createResponse();
        const product = {
          product_id: 1,
          product_code: "test-00000001",
        };
        adminRepository.findByProductCode = () => product;

        await adminController.checkProductCode(request, response);

        expect(response.statusCode).toBe(409);
        expect(response._getJSONData().code).toBe("ERROR60001");
      });

      it("살패 : catch error", async () => {
        const request = httpMocks.createRequest({
          body: {
            product_code: "test-00000001",
          },
        });
        const response = httpMocks.createResponse();
        adminRepository.findByProductCode = () => {
          throw new Error();
        };

        await adminController.checkProductCode(request, response);

        expect(response.statusCode).toBe(400);
      });
    });

    describe("updateProduct", () => {
      it("성공", async () => {
        const request = httpMocks.createRequest({
          params: {
            id: "test-00000001",
          },
          body: {
            name: "name..",
            price: 9000,
            description: "description..",
            imageSrc: "/...",
            optionList: '{"color": "red"}',
          },
        });
        const response = httpMocks.createResponse();
        const product = {
          product_id: 1,
          product_code: "test-00000001",
        };
        adminRepository.findByProductCode = () => product;
        adminRepository.updateProduct = jest.fn();

        await adminController.updateProduct(request, response);

        expect(response.statusCode).toBe(204);
      });

      it("실패 : 존재하지 않는 상품일 경우", async () => {
        const request = httpMocks.createRequest({
          params: {
            id: "test-00000001",
          },
          body: {
            name: "name..",
            price: 9000,
            description: "description..",
            imageSrc: "/...",
            optionList: '{"color": "red"}',
          },
        });
        const response = httpMocks.createResponse();
        adminRepository.findByProductCode = () => {};

        await adminController.updateProduct(request, response);

        expect(response.statusCode).toBe(409);
        expect(response._getJSONData().code).toBe("ERROR60002");
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest({
          params: {
            id: "test-00000001",
          },
          body: {
            name: "name..",
            price: 9000,
            description: "description..",
            imageSrc: "/...",
            optionList: '{"color": "red"}',
          },
        });
        const response = httpMocks.createResponse();
        const product = {
          product_id: 1,
          product_code: "test-00000001",
        };
        adminRepository.findByProductCode = () => product;
        adminRepository.updateProduct = () => {
          throw new Error();
        };

        await adminController.updateProduct(request, response);

        expect(response.statusCode).toBe(400);
      });
    });

    describe("deleteProduct", () => {
      it("성공", async () => {
        const request = httpMocks.createRequest({
          params: {
            id: "test-00000001",
          },
        });
        const response = httpMocks.createResponse();
        const product = {
          product_id: 1,
          product_code: "test-00000001",
          main_img_src: "/...",
        };
        adminRepository.findByProductCode = () => product;
        adminRepository.deleteProduct = jest.fn();
        adminController.removeProductImageFile = jest.fn();

        await adminController.deleteProduct(request, response);

        expect(response.statusCode).toBe(200);
      });

      it("실패 : 존재하지 않는 상품일 경우", async () => {
        const request = httpMocks.createRequest({
          params: {
            id: "test-00000001",
          },
        });
        const response = httpMocks.createResponse();
        adminRepository.findByProductCode = () => {};

        await adminController.deleteProduct(request, response);

        expect(response.statusCode).toBe(405);
        expect(response._getJSONData().code).toBe("ERROR60002");
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest({
          params: {
            id: "test-00000001",
          },
        });
        const response = httpMocks.createResponse();
        const product = {
          product_id: 1,
          product_code: "test-00000001",
          main_img_src: "/...",
        };
        adminRepository.findByProductCode = () => product;
        adminRepository.deleteProduct = () => {
          throw new Error();
        };

        await adminController.deleteProduct(request, response);

        expect(response.statusCode).toBe(400);
      });
    });

    describe("addProduct", () => {
      it("성공", async () => {
        const request = httpMocks.createRequest({
          body: {
            products:
              '[{"product_code": "test-00000001", "name": "name...", "price": 19000, "description": "desc..."}]',
          },
        });
        const response = httpMocks.createResponse();
        adminRepository.addProduct = jest.fn();
        await adminController.addProduct(request, response);

        expect(response.statusCode).toBe(201);
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest({
          body: {
            products: [
              '{"product_code": "test-00000001", "name": "name...", "price": 19000, "description": "desc..."}',
            ],
          },
        });
        const response = httpMocks.createResponse();
        adminRepository.addProduct = () => {
          throw new Error();
        };

        await adminController.addProduct(request, response);

        expect(response.statusCode).toBe(400);
      });
    });

    describe("getProduct", () => {
      it("성공", async () => {
        const request = httpMocks.createRequest({
          params: {
            id: "test-00000001",
          },
        });
        const response = httpMocks.createResponse();
        const product = {
          product_id: 1,
          product_code: "test-00000001",
          main_img_src: "/...",
        };
        adminRepository.getProductOptionByCode = () => product;

        await adminController.getProduct(request, response);

        expect(response.statusCode).toBe(200);
        expect(response._getJSONData()).toEqual({
          options1: product,
          options2: product,
        });
      });

      it("실패 : 존재하지 않는 상품일 경우", async () => {
        const request = httpMocks.createRequest({
          params: {
            id: "test-00000001",
          },
        });
        const response = httpMocks.createResponse();
        adminRepository.getProductOptionByCode = () => {};

        await adminController.getProduct(request, response);

        expect(response.statusCode).toBe(405);
        expect(response._getJSONData().code).toBe("ERROR60002");
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest({
          params: {
            id: "test-00000001",
          },
        });
        const response = httpMocks.createResponse();
        adminRepository.getProductOptionByCode = () => {
          throw new Error();
        };

        await adminController.getProduct(request, response);

        expect(response.statusCode).toBe(400);
      });
    });

    describe("get products", () => {
      it("성공 : 옵션true && 카테고리x && 검색어x", async () => {
        const request = httpMocks.createRequest({
          query: {
            option: true,
            page: 1,
          },
        });
        const response = httpMocks.createResponse();
        const product = [
          {
            product_id: 1,
            product_code: "test-00000001",
            main_img_src: "/...",
            full_count: 1,
          },
        ];
        adminRepository.getAllProductWithOption = jest.fn(() => {
          return product;
        });
        adminRepository.getProductWithOptionByTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getProductWithOptionByCatAndTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getAllProduct = jest.fn(() => {
          return product;
        });
        adminRepository.getProductByTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getProductByCatAndTxt = jest.fn(() => {
          return product;
        });

        await adminController.getProducts(request, response);

        expect(response.statusCode).toBe(200);
        expect(adminRepository.getAllProductWithOption).toHaveBeenCalledTimes(
          1
        );
        expect(adminRepository.getProductWithOptionByTxt).toHaveBeenCalledTimes(
          0
        );
        expect(
          adminRepository.getProductWithOptionByCatAndTxt
        ).toHaveBeenCalledTimes(0);
        expect(adminRepository.getAllProduct).toHaveBeenCalledTimes(0);
        expect(adminRepository.getProductByTxt).toHaveBeenCalledTimes(0);
        expect(adminRepository.getProductByCatAndTxt).toHaveBeenCalledTimes(0);
      });

      it("성공 : 옵션true && 카테고리x && 검색어o", async () => {
        const request = httpMocks.createRequest({
          query: {
            option: true,
            search: "test",
            page: 1,
          },
        });
        const response = httpMocks.createResponse();
        const product = [
          {
            product_id: 1,
            product_code: "test-00000001",
            main_img_src: "/...",
            full_count: 1,
          },
        ];
        adminRepository.getAllProductWithOption = jest.fn(() => {
          return product;
        });
        adminRepository.getProductWithOptionByTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getProductWithOptionByCatAndTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getAllProduct = jest.fn(() => {
          return product;
        });
        adminRepository.getProductByTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getProductByCatAndTxt = jest.fn(() => {
          return product;
        });

        await adminController.getProducts(request, response);

        expect(response.statusCode).toBe(200);
        expect(adminRepository.getAllProductWithOption).toHaveBeenCalledTimes(
          0
        );
        expect(adminRepository.getProductWithOptionByTxt).toHaveBeenCalledTimes(
          1
        );
        expect(
          adminRepository.getProductWithOptionByCatAndTxt
        ).toHaveBeenCalledTimes(0);
        expect(adminRepository.getAllProduct).toHaveBeenCalledTimes(0);
        expect(adminRepository.getProductByTxt).toHaveBeenCalledTimes(0);
        expect(adminRepository.getProductByCatAndTxt).toHaveBeenCalledTimes(0);
      });

      it("성공 : 옵션true && 카테고리o && 검색어o || 검색어x", async () => {
        const request = httpMocks.createRequest({
          query: {
            option: true,
            category: "title",
            page: 1,
          },
        });
        const response = httpMocks.createResponse();
        const product = [
          {
            product_id: 1,
            product_code: "test-00000001",
            main_img_src: "/...",
            full_count: 1,
          },
        ];
        adminRepository.getAllProductWithOption = jest.fn(() => {
          return product;
        });
        adminRepository.getProductWithOptionByTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getProductWithOptionByCatAndTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getAllProduct = jest.fn(() => {
          return product;
        });
        adminRepository.getProductByTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getProductByCatAndTxt = jest.fn(() => {
          return product;
        });

        await adminController.getProducts(request, response);

        expect(response.statusCode).toBe(200);
        expect(adminRepository.getAllProductWithOption).toHaveBeenCalledTimes(
          0
        );
        expect(adminRepository.getProductWithOptionByTxt).toHaveBeenCalledTimes(
          0
        );
        expect(
          adminRepository.getProductWithOptionByCatAndTxt
        ).toHaveBeenCalledTimes(1);
        expect(adminRepository.getAllProduct).toHaveBeenCalledTimes(0);
        expect(adminRepository.getProductByTxt).toHaveBeenCalledTimes(0);
        expect(adminRepository.getProductByCatAndTxt).toHaveBeenCalledTimes(0);
      });

      it("성공 : 옵션false && 카테고리x && 검색어x", async () => {
        const request = httpMocks.createRequest({
          query: {
            option: false,
            page: 1,
          },
        });
        const response = httpMocks.createResponse();
        const product = [
          {
            product_id: 1,
            product_code: "test-00000001",
            main_img_src: "/...",
            full_count: 1,
          },
        ];
        adminRepository.getAllProductWithOption = jest.fn(() => {
          return product;
        });
        adminRepository.getProductWithOptionByTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getProductWithOptionByCatAndTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getAllProduct = jest.fn(() => {
          return product;
        });
        adminRepository.getProductByTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getProductByCatAndTxt = jest.fn(() => {
          return product;
        });

        await adminController.getProducts(request, response);

        expect(response.statusCode).toBe(200);
        expect(adminRepository.getAllProductWithOption).toHaveBeenCalledTimes(
          0
        );
        expect(adminRepository.getProductWithOptionByTxt).toHaveBeenCalledTimes(
          0
        );
        expect(
          adminRepository.getProductWithOptionByCatAndTxt
        ).toHaveBeenCalledTimes(0);
        expect(adminRepository.getAllProduct).toHaveBeenCalledTimes(1);
        expect(adminRepository.getProductByTxt).toHaveBeenCalledTimes(0);
        expect(adminRepository.getProductByCatAndTxt).toHaveBeenCalledTimes(0);
      });

      it("성공 : 옵션false && 카테고리x && 검색어o", async () => {
        const request = httpMocks.createRequest({
          query: {
            option: false,
            search: "test",
            page: 1,
          },
        });
        const response = httpMocks.createResponse();
        const product = [
          {
            product_id: 1,
            product_code: "test-00000001",
            main_img_src: "/...",
            full_count: 1,
          },
        ];
        adminRepository.getAllProductWithOption = jest.fn(() => {
          return product;
        });
        adminRepository.getProductWithOptionByTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getProductWithOptionByCatAndTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getAllProduct = jest.fn(() => {
          return product;
        });
        adminRepository.getProductByTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getProductByCatAndTxt = jest.fn(() => {
          return product;
        });

        await adminController.getProducts(request, response);

        expect(response.statusCode).toBe(200);
        expect(adminRepository.getAllProductWithOption).toHaveBeenCalledTimes(
          0
        );
        expect(adminRepository.getProductWithOptionByTxt).toHaveBeenCalledTimes(
          0
        );
        expect(
          adminRepository.getProductWithOptionByCatAndTxt
        ).toHaveBeenCalledTimes(0);
        expect(adminRepository.getAllProduct).toHaveBeenCalledTimes(0);
        expect(adminRepository.getProductByTxt).toHaveBeenCalledTimes(1);
        expect(adminRepository.getProductByCatAndTxt).toHaveBeenCalledTimes(0);
      });

      it("성공 : 옵션false && 카테고리o && 검색어o || 검색어x", async () => {
        const request = httpMocks.createRequest({
          query: {
            option: false,
            category: "title",
            search: "test",
            page: 1,
          },
        });
        const response = httpMocks.createResponse();
        const product = [
          {
            product_id: 1,
            product_code: "test-00000001",
            main_img_src: "/...",
            full_count: 1,
          },
        ];
        adminRepository.getAllProductWithOption = jest.fn(() => {
          return product;
        });
        adminRepository.getProductWithOptionByTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getProductWithOptionByCatAndTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getAllProduct = jest.fn(() => {
          return product;
        });
        adminRepository.getProductByTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getProductByCatAndTxt = jest.fn(() => {
          return product;
        });

        await adminController.getProducts(request, response);

        expect(response.statusCode).toBe(200);
        expect(adminRepository.getAllProductWithOption).toHaveBeenCalledTimes(
          0
        );
        expect(adminRepository.getProductWithOptionByTxt).toHaveBeenCalledTimes(
          0
        );
        expect(
          adminRepository.getProductWithOptionByCatAndTxt
        ).toHaveBeenCalledTimes(0);
        expect(adminRepository.getAllProduct).toHaveBeenCalledTimes(0);
        expect(adminRepository.getProductByTxt).toHaveBeenCalledTimes(0);
        expect(adminRepository.getProductByCatAndTxt).toHaveBeenCalledTimes(1);
        expect(response._getJSONData()).toEqual({
          productList: product,
          productPageLength: 1,
        });
      });

      it("성공 : 상품이 없을 경우", async () => {
        const request = httpMocks.createRequest({
          query: {
            option: false,
            category: "title",
            search: "test",
            page: 1,
          },
        });
        const response = httpMocks.createResponse();
        const product = [];
        adminRepository.getAllProductWithOption = jest.fn(() => {
          return product;
        });
        adminRepository.getProductWithOptionByTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getProductWithOptionByCatAndTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getAllProduct = jest.fn(() => {
          return product;
        });
        adminRepository.getProductByTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getProductByCatAndTxt = jest.fn(() => {
          return product;
        });

        await adminController.getProducts(request, response);

        expect(response.statusCode).toBe(200);
        expect(adminRepository.getAllProductWithOption).toHaveBeenCalledTimes(
          0
        );
        expect(adminRepository.getProductWithOptionByTxt).toHaveBeenCalledTimes(
          0
        );
        expect(
          adminRepository.getProductWithOptionByCatAndTxt
        ).toHaveBeenCalledTimes(0);
        expect(adminRepository.getAllProduct).toHaveBeenCalledTimes(0);
        expect(adminRepository.getProductByTxt).toHaveBeenCalledTimes(0);
        expect(adminRepository.getProductByCatAndTxt).toHaveBeenCalledTimes(1);
        expect(response._getJSONData()).toEqual({
          productList: product,
          productPageLength: 1,
        });
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest({
          query: {
            option: false,
            category: "title",
            search: "test",
            page: 1,
          },
        });
        const response = httpMocks.createResponse();
        const product = [];
        adminRepository.getAllProductWithOption = jest.fn(() => {
          return product;
        });
        adminRepository.getProductWithOptionByTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getProductWithOptionByCatAndTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getAllProduct = jest.fn(() => {
          return product;
        });
        adminRepository.getProductByTxt = jest.fn(() => {
          return product;
        });
        adminRepository.getProductByCatAndTxt = jest.fn(() => {
          throw new Error();
        });

        await adminController.getProducts(request, response);

        expect(response.statusCode).toBe(400);
      });
    });
  });

  describe("sale product", () => {
    describe("addSaleProduct", () => {
      it("성공 : 타임 세일 상품", async () => {
        const request = httpMocks.createRequest({
          body: {
            productList: [
              {
                product_code: "test-00000001",
                option_number: 0,
                sale_price: 10000,
              },
            ],
            saleTime: {
              saleStartTime: "2022-04-01 00:00:00",
              saleEndTime: "200-04-02 00:00:00",
            },
          },
        });
        const response = httpMocks.createResponse();
        adminRepository.addSaleProduct = jest.fn();
        adminRepository.addSaleProductAndTIme = jest.fn();

        await adminController.addSaleProduct(request, response);

        expect(response.statusCode).toBe(201);
        expect(adminRepository.addSaleProduct).toHaveBeenCalledTimes(0);
        expect(adminRepository.addSaleProductAndTIme).toHaveBeenCalledTimes(1);
      });

      it("성공 : 상시 세일 상품", async () => {
        const request = httpMocks.createRequest({
          body: {
            productList: [
              {
                product_code: "test-00000001",
                option_number: 0,
                sale_price: 10000,
              },
            ],
          },
        });
        const response = httpMocks.createResponse();
        adminRepository.addSaleProduct = jest.fn();
        adminRepository.addSaleProductAndTIme = jest.fn();

        await adminController.addSaleProduct(request, response);

        expect(response.statusCode).toBe(201);
        expect(adminRepository.addSaleProductAndTIme).toHaveBeenCalledTimes(0);
        expect(adminRepository.addSaleProduct).toHaveBeenCalledTimes(1);
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest({
          body: {
            productList: [
              {
                product_code: "test-00000001",
                option_number: 0,
                sale_price: 10000,
              },
            ],
          },
        });
        const response = httpMocks.createResponse();
        adminRepository.addSaleProduct = () => {
          throw new Error();
        };

        await adminController.addSaleProduct(request, response);

        expect(response.statusCode).toBe(400);
      });
    });

    describe("deleteSaleProduct", () => {
      it("성공 : 타임 세일 상품", async () => {
        const request = httpMocks.createRequest({
          params: {
            id: 1,
          },
        });
        const response = httpMocks.createResponse();
        adminRepository.deleteSaleProduct = jest.fn();
        adminRepository.deleteTimeSale = jest.fn();

        await adminController.deleteSaleProduct(request, response);

        expect(response.statusCode).toBe(204);
        expect(adminRepository.deleteSaleProduct).toHaveBeenCalledTimes(0);
        expect(adminRepository.deleteTimeSale).toHaveBeenCalledTimes(1);
      });

      it("성공 : 상시 세일 상품", async () => {
        const request = httpMocks.createRequest();
        const response = httpMocks.createResponse();
        adminRepository.deleteSaleProduct = jest.fn();
        adminRepository.deleteTimeSale = jest.fn();

        await adminController.deleteSaleProduct(request, response);

        expect(response.statusCode).toBe(204);
        expect(adminRepository.deleteTimeSale).toHaveBeenCalledTimes(0);
        expect(adminRepository.deleteSaleProduct).toHaveBeenCalledTimes(1);
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest();
        const response = httpMocks.createResponse();
        adminRepository.deleteSaleProduct = () => {
          throw new Error();
        };

        await adminController.deleteSaleProduct(request, response);

        expect(response.statusCode).toBe(400);
      });
    });

    describe("updateSaleProduct", () => {
      it("성공 : 타임 세일 상품", async () => {
        const request = httpMocks.createRequest({
          body: {
            timeId: 1,
            changeList: [
              {
                change_price: 500,
                sale_id: 1,
              },
            ],
            deleteList: [2],
          },
        });
        const response = httpMocks.createResponse();
        const productList = [{ product_id: 1, product_code: "test-00000001" }];
        adminRepository.updateSaleProduct = jest.fn();
        adminRepository.getSaleProductsAfterUpdate = () => productList;

        await adminController.updateSaleProduct(request, response);

        expect(response.statusCode).toBe(200);
        expect(response._getJSONData()).toEqual({ productList });
      });

      it("성공 : 상시 세일 상품", async () => {
        const request = httpMocks.createRequest({
          body: {
            changeList: [
              {
                change_price: 500,
                sale_id: 1,
              },
            ],
            deleteList: [2],
          },
        });
        const response = httpMocks.createResponse();
        const productList = [{ product_id: 1, product_code: "test-00000001" }];
        adminRepository.updateSaleProduct = jest.fn();
        adminRepository.getSaleProductsAfterUpdate = () => productList;

        await adminController.updateSaleProduct(request, response);

        expect(response.statusCode).toBe(200);
        expect(response._getJSONData()).toEqual({ productList });
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest({
          body: {
            timeId: 1,
            changeList: [
              {
                change_price: 500,
                sale_id: 1,
              },
            ],
            deleteList: [2],
          },
        });
        const response = httpMocks.createResponse();
        adminRepository.updateSaleProduct = () => {
          throw new Error();
        };

        await adminController.updateSaleProduct(request, response);

        expect(response.statusCode).toBe(400);
      });
    });

    describe("getSaleProducts", () => {
      it("성공 : 타임 세일 상품", async () => {
        const request = httpMocks.createRequest();
        const response = httpMocks.createResponse();
        const timeTable = [{ time_id: 1 }];
        const saleProducts = [
          { time_id: 1, product_id: 1, product_code: "test-00000001" },
          { product_id: 2, product_code: "test-00000002" },
        ];
        const saleGroup = [
          [{ time_id: 1, product_id: 1, product_code: "test-00000001" }],
          [{ product_id: 2, product_code: "test-00000002" }],
        ];
        adminRepository.getSaleTimeTable = () => timeTable;
        adminRepository.getSaleProducts = () => saleProducts;

        await adminController.getSaleProducts(request, response);

        expect(response.statusCode).toBe(200);
        expect(response._getJSONData()).toEqual({ saleGroup });
      });

      it("성공 : 상시 세일 상품", async () => {
        const request = httpMocks.createRequest();
        const response = httpMocks.createResponse();
        const saleProducts = [{ product_id: 1, product_code: "test-00000001" }];
        const saleGroup = [[{ product_id: 1, product_code: "test-00000001" }]];
        adminRepository.getSaleTimeTable = () => [];
        adminRepository.getSaleProducts = () => saleProducts;

        await adminController.getSaleProducts(request, response);

        expect(response.statusCode).toBe(200);
        expect(response._getJSONData()).toEqual({ saleGroup });
      });

      it("성공 : 세일 상품이 없을 경우", async () => {
        const request = httpMocks.createRequest();
        const response = httpMocks.createResponse();
        adminRepository.getSaleTimeTable = () => [];
        adminRepository.getSaleProducts = () => [];

        await adminController.getSaleProducts(request, response);

        expect(response.statusCode).toBe(200);
        expect(response._getJSONData()).toEqual({ saleGroup: [] });
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest();
        const response = httpMocks.createResponse();
        adminRepository.getSaleTimeTable = () => [];
        adminRepository.getSaleProducts = () => {
          throw new Error();
        };

        await adminController.getSaleProducts(request, response);

        expect(response.statusCode).toBe(400);
      });
    });
  });

  describe("order", () => {
    describe("deliveryStatus", () => {
      it("성공", async () => {
        const request = httpMocks.createRequest({
          params: {
            id: 200,
          },
        });
        const response = httpMocks.createResponse();
        const status = [{ status: "결제완료", date: "2022-04-01" }];
        adminRepository.getDeliveryStatus = () => status;

        await adminController.deliveryStatus(request, response);

        expect(response.statusCode).toBe(200);
        expect(response._getJSONData()).toEqual({ status });
      });

      it("실패 : 주문 번호로 배송 현황을 가져올 수 없는 경우", async () => {
        const request = httpMocks.createRequest({
          params: {
            id: 200,
          },
        });
        const response = httpMocks.createResponse();
        adminRepository.getDeliveryStatus = () => [];

        await adminController.deliveryStatus(request, response);

        expect(response.statusCode).toBe(405);
        expect(response._getJSONData().code).toBe("ERROR70002");
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest({
          params: {
            id: 200,
          },
        });
        const response = httpMocks.createResponse();
        adminRepository.getDeliveryStatus = () => {
          throw new Error();
        };

        await adminController.deliveryStatus(request, response);

        expect(response.statusCode).toBe(400);
      });
    });

    describe("updateStatus", () => {
      it("성공", async () => {
        const request = httpMocks.createRequest({
          params: {
            id: 200,
          },
          body: {
            state: "배송중",
          },
        });
        const response = httpMocks.createResponse();
        adminRepository.updateOrderStatus = jest.fn();

        await adminController.updateStatus(request, response);

        expect(response.statusCode).toBe(204);
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest({
          params: {
            id: 200,
          },
          body: {
            state: "배송중",
          },
        });
        const response = httpMocks.createResponse();
        adminRepository.updateOrderStatus = () => {
          throw new Error();
        };

        await adminController.updateStatus(request, response);

        expect(response.statusCode).toBe(400);
      });
    });

    describe("getOrderBySpecificStatus", () => {
      // it("성공 : 주문 상태가 결제완료인 경우", async () => {
      //   const request = httpMocks.createRequest({
      //     query: {
      //       page: 1,
      //       status: "new",
      //     },
      //   });
      //   const response = httpMocks.createResponse();
      //   const orderList = [{ product_code: "test-00000001", full_count: 1 }];
      //   adminRepository.getOrderBySpecificStatus = () => orderList;
      //   adminRepository.getPendingRefundList = jest.fn();
      //   adminRepository.getPendingRefund = jest.fn();

      //   await adminController.getOrderBySpecificStatus(request, response);

      //   expect(response.statusCode).toBe(200);
      //   expect(adminRepository.getPendingRefundList).toHaveBeenCalledTimes(0);
      //   expect(adminRepository.getPendingRefund).toHaveBeenCalledTimes(0);
      // });

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

        await adminController.getOrderBySpecificStatus(request, response);

        expect(response.statusCode).toBe(200);
      });
    });

    describe("getOrders", () => {
      it("성공 : 카테고리x && 검색어x", async () => {
        const request = httpMocks.createRequest({
          query: {
            page: 1,
            date1: "2022-04-01",
            date2: "2022-04-30",
          },
        });
        const response = httpMocks.createResponse();
        const orderList = [{ product_code: "test-00000001", full_count: 1 }];
        adminRepository.getOrderAll = jest.fn(() => orderList);
        adminRepository.getOrderBySearchWord = jest.fn();
        adminRepository.getOrderByStatus = jest.fn();
        adminRepository.getOrderByWordAndCategory = jest.fn();

        await adminController.getOrders(request, response);

        expect(response.statusCode).toBe(200);
        expect(adminRepository.getOrderAll).toHaveBeenCalledTimes(1);
        expect(adminRepository.getOrderByStatus).toHaveBeenCalledTimes(0);
        expect(adminRepository.getOrderBySearchWord).toHaveBeenCalledTimes(0);
        expect(adminRepository.getOrderByWordAndCategory).toHaveBeenCalledTimes(
          0
        );
      });

      it("성공 : 카테고리x && 검색어o", async () => {
        const request = httpMocks.createRequest({
          query: {
            page: 1,
            date1: "2022-04-01",
            date2: "2022-04-30",
            searchWord: "search",
          },
        });
        const response = httpMocks.createResponse();
        const orderList = [{ product_code: "test-00000001", full_count: 1 }];
        adminRepository.getOrderAll = jest.fn();
        adminRepository.getOrderBySearchWord = jest.fn(() => orderList);
        adminRepository.getOrderByStatus = jest.fn();
        adminRepository.getOrderByWordAndCategory = jest.fn();

        await adminController.getOrders(request, response);

        expect(response.statusCode).toBe(200);
        expect(adminRepository.getOrderBySearchWord).toHaveBeenCalledTimes(1);
        expect(adminRepository.getOrderByStatus).toHaveBeenCalledTimes(0);
        expect(adminRepository.getOrderAll).toHaveBeenCalledTimes(0);
        expect(adminRepository.getOrderByWordAndCategory).toHaveBeenCalledTimes(
          0
        );
      });

      it("성공 : 카테고리o && 카테고리가 state && status o", async () => {
        const request = httpMocks.createRequest({
          query: {
            page: 1,
            date1: "2022-04-01",
            date2: "2022-04-30",
            searchWord: "search",
            status: "배송중",
            category: "state",
          },
        });
        const response = httpMocks.createResponse();
        const orderList = [{ product_code: "test-00000001", full_count: 1 }];
        adminRepository.getOrderAll = jest.fn();
        adminRepository.getOrderBySearchWord = jest.fn();
        adminRepository.getOrderByStatus = jest.fn(() => orderList);
        adminRepository.getOrderByWordAndCategory = jest.fn();

        await adminController.getOrders(request, response);

        expect(response.statusCode).toBe(200);
        expect(adminRepository.getOrderBySearchWord).toHaveBeenCalledTimes(0);
        expect(adminRepository.getOrderByStatus).toHaveBeenCalledTimes(1);
        expect(adminRepository.getOrderAll).toHaveBeenCalledTimes(0);
        expect(adminRepository.getOrderByWordAndCategory).toHaveBeenCalledTimes(
          0
        );
      });

      it("s성공 : 카테고리o && 카테고리가 state && status x", async () => {
        const request = httpMocks.createRequest({
          query: {
            page: 1,
            date1: "2022-04-01",
            date2: "2022-04-30",
            searchWord: "search",
            category: "state",
          },
        });
        const response = httpMocks.createResponse();
        const orderList = [{ product_code: "test-00000001", full_count: 1 }];
        adminRepository.getOrderAll = jest.fn();
        adminRepository.getOrderBySearchWord = jest.fn(() => orderList);
        adminRepository.getOrderByStatus = jest.fn();
        adminRepository.getOrderByWordAndCategory = jest.fn();

        await adminController.getOrders(request, response);

        expect(response.statusCode).toBe(200);
        expect(adminRepository.getOrderBySearchWord).toHaveBeenCalledTimes(1);
        expect(adminRepository.getOrderByStatus).toHaveBeenCalledTimes(0);
        expect(adminRepository.getOrderAll).toHaveBeenCalledTimes(0);
        expect(adminRepository.getOrderByWordAndCategory).toHaveBeenCalledTimes(
          0
        );
      });

      it("성공 : 카테고리o && 카테고리가 state가 아닐 경우", async () => {
        const request = httpMocks.createRequest({
          query: {
            page: 1,
            date1: "2022-04-01",
            date2: "2022-04-30",
            searchWord: "search",
            category: "name",
          },
        });
        const response = httpMocks.createResponse();
        const orderList = [{ product_code: "test-00000001", full_count: 1 }];
        adminRepository.getOrderAll = jest.fn();
        adminRepository.getOrderBySearchWord = jest.fn();
        adminRepository.getOrderByStatus = jest.fn();
        adminRepository.getOrderByWordAndCategory = jest.fn(() => orderList);

        await adminController.getOrders(request, response);

        expect(response.statusCode).toBe(200);
        expect(adminRepository.getOrderByWordAndCategory).toHaveBeenCalledTimes(
          1
        );
        expect(adminRepository.getOrderBySearchWord).toHaveBeenCalledTimes(0);
        expect(adminRepository.getOrderByStatus).toHaveBeenCalledTimes(0);
        expect(adminRepository.getOrderAll).toHaveBeenCalledTimes(0);
      });

      it("성공 : order가 없을 때", async () => {
        const request = httpMocks.createRequest({
          query: {
            page: 1,
            date1: "2022-04-01",
            date2: "2022-04-30",
          },
        });
        const response = httpMocks.createResponse();
        const orderList = [];
        adminRepository.getOrderAll = jest.fn(() => orderList);
        adminRepository.getOrderBySearchWord = jest.fn();
        adminRepository.getOrderByStatus = jest.fn();
        adminRepository.getOrderByWordAndCategory = jest.fn();

        await adminController.getOrders(request, response);

        expect(response.statusCode).toBe(200);
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

        adminRepository.getOrderAll = jest.fn(() => {
          throw new Error();
        });
        adminRepository.getOrderBySearchWord = jest.fn();
        adminRepository.getOrderByStatus = jest.fn();
        adminRepository.getOrderByWordAndCategory = jest.fn();

        await adminController.getOrders(request, response);

        expect(response.statusCode).toBe(400);
      });
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
      adminRepository.refund = jest.fn();

      await adminController.refund(request, response);

      expect(response.statusCode).toBe(200);
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
});
