import AdminDiscountController from "../../../controller/admin/discount.js";
import httpMocks from "node-mocks-http";

describe("admin", () => {
  let adminRepository;
  let adminController;

  beforeEach(() => {
    adminRepository = {};
    adminController = new AdminDiscountController(adminRepository);
  });

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
            saleStartTime: "2023-04-01 00:00:00",
            saleEndTime: "2023-04-02 00:00:00",
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

  describe("getAllProductWithOption", () => {
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

      await adminController.getAllProductsWithOption(request, response);

      expect(response.statusCode).toBe(200);
      expect(adminRepository.getAllProductWithOption).toHaveBeenCalledTimes(1);
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

      await adminController.getAllProductsWithOption(request, response);

      expect(response.statusCode).toBe(200);
      expect(adminRepository.getAllProductWithOption).toHaveBeenCalledTimes(0);
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

      await adminController.getAllProductsWithOption(request, response);

      expect(response.statusCode).toBe(200);
      expect(adminRepository.getAllProductWithOption).toHaveBeenCalledTimes(0);
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
  });
});
