import AdminController from "../../../controller/admin/admin.js";
import httpMocks from "node-mocks-http";

describe("admin", () => {
  let adminRepository;
  let adminController;

  beforeEach(() => {
    adminRepository = {};
    adminController = new AdminController(adminRepository);
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
      const token = "tokenStr";
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

  describe("logout", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest();
      const response = httpMocks.createResponse({
        cookie: {
          token: "abcd",
        },
      });
      // adminController.setToken = () => {};

      await adminController.logout(request, response);

      expect(response.statusCode).toBe(200);
    });
  });

  describe("refresh", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        userId: 1,
        username: "master",
      });
      const response = httpMocks.createResponse();
      const menuList = [];
      adminRepository.getMenuList = () => menuList;

      await adminController.refresh(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({ username: "master", menuList });
    });
  });

  describe("getDashboardData", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest();
      const response = httpMocks.createResponse();
      const sales = [
        {
          month: "202212",
          sales: 30000,
          revenue: 27000,
          refund: 3000,
          cost: 500,
        },
        {
          month: "202301",
          sales: 60000,
          revenue: 50000,
          refund: 10000,
          cost: 5000,
        },
        {
          month: "202302",
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
      adminRepository.createAdmin = () => {
        throw new Error();
      };

      await adminController.create(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("createJwtToken", () => {});

  describe("setToken", () => {
    it("성공", async () => {
      const response = httpMocks.createResponse();

      await adminController.setToken(response, "abcd");

      expect(response.cookies.token.value).toBe("abcd");
    });
  });
});
