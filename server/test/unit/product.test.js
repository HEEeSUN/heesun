import Product from "../../controller/customer/product";
import httpMocks from "node-mocks-http";

describe("product", () => {
  let productRepository;
  let productController;

  beforeEach(() => {
    productRepository = {};
    productController = new Product(productRepository);
  });

  describe("getProduct", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        params: {
          id: "code-00000001",
        },
      });
      const response = httpMocks.createResponse();
      const product = {
        product_code: "code-00000001",
        option_number: 0,
        name: "product name..",
        price: 19000,
      };
      productRepository.getByProduct_code = () => product;

      await productController.getProduct(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({ product });
    });

    it("실패 : product_code가 전달되지 않은 경우", async () => {
      const request = httpMocks.createRequest();
      const response = httpMocks.createResponse();

      await productController.getProduct(request, response);

      expect(response.statusCode).toBe(404);
    });

    it("실패 : 존재하지 않는 상품인 경우", async () => {
      const request = httpMocks.createRequest({
        params: {
          id: "code-00000001",
        },
      });
      const response = httpMocks.createResponse();
      productRepository.getByProduct_code = () => { return []};

      await productController.getProduct(request, response);

      expect(response.statusCode).toBe(404);
    });

    it("성공 : 리뷰 가져오기", async () => {
      const product_code = "code-00000001";
      const pageNumber = 1;
      const request = httpMocks.createRequest({
        params: {
          id: product_code,
        },
        query: {
          reviewPage: pageNumber,
        },
      });
      const response = httpMocks.createResponse();
      const reviews = [
        {
          content: "review content",
          username: "username",
          created: "2022-04-01",
        },
      ];
      const amountOfReviews = reviews.length;

      productRepository.getAmountOfReviews = () => amountOfReviews;
      productRepository.getReviews = () => reviews;

      await productController.getProduct(request, response);

      expect(response.statusCode).toBe(200);
    });

    it("성공 : 리뷰가 없는 경우", async () => {
      const product_code = "code-00000001";
      const pageNumber = 1;
      const request = httpMocks.createRequest({
        params: {
          id: product_code,
        },
        query: {
          reviewPage: pageNumber,
        },
      });
      const response = httpMocks.createResponse();
      const reviews = [];
      const amountOfReviews = reviews.length;

      productRepository.getAmountOfReviews = () => amountOfReviews;

      await productController.getProduct(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({ reviews, reviewPageLength: 1 });
    });

    it("실패 : catch error", async () => {
      const product_code = "code-00000001";
      const pageNumber = 1;
      const request = httpMocks.createRequest({
        params: {
          id: product_code,
        },
        query: {
          reviewPage: pageNumber,
        },
      });
      const response = httpMocks.createResponse();

      productRepository.getAmountOfReviews = () => {
        throw new Error();
      };

      await productController.getProduct(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("getAllProduct", () => {
    it("성공 : 상품이 없는 경우", async () => {
      const request = httpMocks.createRequest({
        query: {
          page: 1,
        },
      });
      const response = httpMocks.createResponse();
      const products = [];

      productRepository.testGetALL = () => products;
      productRepository.testGetSale = () => products;

      await productController.getAllProduct(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({
        product: products,
        hasmore: 0,
        timesale: products,
      });
    });

    it("성공 : 검색어가 없는 경우", async () => {
      const request = httpMocks.createRequest({
        query: {
          page: 1,
        },
      });
      const response = httpMocks.createResponse();
      const products = [
        {
          full_count: 1,
          product_code: "test-00000001",
          name: "product name",
          price: 19000,
        },
      ];

      productRepository.testGetALL = () => products;
      productRepository.testGetSale = () => products;

      await productController.getAllProduct(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({
        product: products,
        hasmore: 0,
        timesale: products,
      });
    });

    it("성공 : 정렬을 할 경우", async () => {
      const request = httpMocks.createRequest({
        query: {
          searchWord: "search word",
          sortCode: "highPrice",
          page: 1,
        },
      });
      const response = httpMocks.createResponse();
      const products = [
        {
          full_count: 1,
          product_code: "test-00000001",
          name: "product name",
          price: 19000,
        },
      ];

      productRepository.saveSearchWord = jest.fn();
      productRepository.testGetByName = () => products;
      productRepository.testGetSale = () => products;

      await productController.getAllProduct(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({
        product: products,
        hasmore: 0,
        timesale: products,
      });
    });

    it("실패 : catch error", async () => {
      const request = httpMocks.createRequest({
        query: {
          searchWord: "search word",
          sortCode: "highPrice",
          page: 1,
        },
      });
      const response = httpMocks.createResponse();
      const products = [
        {
          full_count: 1,
          product_code: "test-00000001",
          name: "product name",
          price: 19000,
        },
      ];

      productRepository.saveSearchWord = jest.fn();
      productRepository.testGetByName = () => {
        throw new Error();
      };
      productRepository.testGetSale = () => products;

      await productController.getAllProduct(request, response);

      expect(response.statusCode).toBe(400);
    });
  });
});
