import AdminOrderController from "../../../controller/admin/order.js";
import httpMocks from "node-mocks-http";

describe("admin", () => {
  let adminRepository;
  let adminController;

  beforeEach(() => {
    adminRepository = {};
    adminController = new AdminOrderController(adminRepository);
  });

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

      expect(response.statusCode).toBe(404);
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
    it("성공: 배송완료가 아닌 상태로 변경", async () => {
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

    it("성공: 배송완료 상태로 변경", async () => {
      const request = httpMocks.createRequest({
        params: {
          id: 200,
        },
        body: {
          state: "배송완료",
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
      const orderAndRefund = [
        { status: "반품및취소요청", number: 1 },
        { status: "결제완료", number: 1 },
      ];
      adminRepository.getNewOrderAndNewRefund = jest.fn(() => orderAndRefund);
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
      const orderAndRefund = [
        { status: "반품및취소요청", number: 1 },
        { status: "결제완료", number: 1 },
      ];
      adminRepository.getNewOrderAndNewRefund = jest.fn(() => orderAndRefund);
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
      const orderAndRefund = [
        { status: "반품및취소요청", number: 1 },
        { status: "결제완료", number: 1 },
      ];
      adminRepository.getNewOrderAndNewRefund = jest.fn(() => orderAndRefund);
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
      const orderAndRefund = [
        { status: "반품및취소요청", number: 1 },
        { status: "결제완료", number: 1 },
      ];
      adminRepository.getNewOrderAndNewRefund = jest.fn(() => orderAndRefund);
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
      const orderAndRefund = [
        { status: "반품및취소요청", number: 1 },
        { status: "결제완료", number: 1 },
      ];
      adminRepository.getNewOrderAndNewRefund = jest.fn(() => orderAndRefund);
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
      adminRepository.getNewOrderAndNewRefund = jest.fn(() => {
        return [];
      });

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
