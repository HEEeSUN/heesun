import AdminProductController from "../../../controller/admin/product.js";
import httpMocks from "node-mocks-http";

describe("admin", () => {
  let adminRepository;
  let adminController;

  beforeEach(() => {
    adminRepository = {};
    adminController = new AdminProductController(adminRepository);
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
            products:
              '{"name": "name...", "price": 19000, "cost": 1000, "description": "desc...", "imageSrc": "", "options":[{"option1":"","option2":""}]}',
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
            products:
              '{"name": "name...", "price": 19000, "cost": 1000, "description": "desc...", "imageSrc": "", "options":[{"option1":"","option2":""}]}',
          },
        });
        const response = httpMocks.createResponse();
        adminRepository.findByProductCode = () => {};

        await adminController.updateProduct(request, response);

        expect(response.statusCode).toBe(404);
        expect(response._getJSONData().code).toBe("ERROR60002");
      });

      it("실패 : catch error", async () => {
        const request = httpMocks.createRequest({
          params: {
            id: "test-00000001",
          },
          body: {
            products:
              '{"name": "name...", "price": 19000, "cost": 1000, "description": "desc...", "imageSrc": "", "options":[{"option1":"","option2":""}]}',
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

        expect(response.statusCode).toBe(404);
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
        adminRepository.getProductOptionByCode = () => {
          return [];
        };

        await adminController.getProduct(request, response);

        expect(response.statusCode).toBe(404);
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
      it("성공 : 카테고리x && 검색어x", async () => {
        const request = httpMocks.createRequest({
          query: {
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
        expect(adminRepository.getAllProduct).toHaveBeenCalledTimes(1);
        expect(adminRepository.getProductByTxt).toHaveBeenCalledTimes(0);
        expect(adminRepository.getProductByCatAndTxt).toHaveBeenCalledTimes(0);
      });

      it("성공 : 카테고리x && 검색어o", async () => {
        const request = httpMocks.createRequest({
          query: {
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
        expect(adminRepository.getAllProduct).toHaveBeenCalledTimes(0);
        expect(adminRepository.getProductByTxt).toHaveBeenCalledTimes(1);
        expect(adminRepository.getProductByCatAndTxt).toHaveBeenCalledTimes(0);
      });

      it("성공 : 카테고리o && 검색어o || 검색어x", async () => {
        const request = httpMocks.createRequest({
          query: {
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
            category: "title",
            search: "test",
            page: 1,
          },
        });
        const response = httpMocks.createResponse();
        const product = [];
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

    describe("checkOption", () => {
      it("성공", async () => {
        const request = httpMocks.createRequest({
          body: {
            products:
              '{"productCode": "test-00000001", "name": "name...", "price": 19000, "cost": 1000, "description": "desc...", "options":[{"option1":"","option2":""}]}',
          },
        });
        const response = httpMocks.createResponse();
        const next = jest.fn();

        await adminController.checkOption(request, response, next);

        expect(next).toHaveBeenCalledTimes(1);
      });

      it("실패: 상품 코드 길이가 20을 초과할 경우", async () => {
        const request = httpMocks.createRequest({
          body: {
            products:
              '{"productCode": "test-0000000112345678901234567890", "name": "name...", "price": 19000, "cost": 1000, "description": "desc...", "options":[{"option1":"","option2":""}]}',
          },
        });
        const response = httpMocks.createResponse();
        const next = jest.fn();

        await adminController.checkOption(request, response, next);

        expect(next).toHaveBeenCalledTimes(0);
        expect(response.statusCode).toBe(400);
      });

      it("실패: 상품명 길이가 50을 초과할 경우", async () => {
        const request = httpMocks.createRequest({
          body: {
            products:
              '{"productCode": "test-00000001", "name": "namenamenamenamenamenamenamenamenamenamenamenamename", "price": 19000, "cost": 1000, "description": "desc...", "options":[{"option1":"","option2":""}]}',
          },
        });
        const response = httpMocks.createResponse();
        const next = jest.fn();

        await adminController.checkOption(request, response, next);

        expect(next).toHaveBeenCalledTimes(0);
        expect(response.statusCode).toBe(400);
      });

      it("실패: cost, price 금액이 잘못된 경우", async () => {
        const request = httpMocks.createRequest({
          body: {
            products:
              '{"productCode": "test-00000001", "name": "name...", "price": "price", "cost": 1000, "description": "desc...", "options":[{"option1":"","option2":""}]}',
          },
        });
        const response = httpMocks.createResponse();
        const next = jest.fn();

        await adminController.checkOption(request, response, next);

        expect(next).toHaveBeenCalledTimes(0);
        expect(response.statusCode).toBe(400);
      });
    });
  });
});
