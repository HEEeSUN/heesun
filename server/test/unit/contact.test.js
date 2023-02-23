import ContactController from "../../controller/contact.js";
import httpMocks from "node-mocks-http";

describe("contact", () => {
  let contactRepository;
  let contactController;

  beforeEach(() => {
    contactRepository = {};
    contactController = new ContactController(contactRepository);
  });

  describe("getInquireis", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        query: {
          page: 1,
        },
      });
      const response = httpMocks.createResponse();
      const pageLength = 1;
      const inquiries = [
        {
          id: 1,
          content: "안녕하세요 문의글 ",
          createdAt: "2022-10-01 12:00:34",
        },
      ];
      contactRepository.getAmountOfInquiry = () => 10;
      contactRepository.getInquiries = () => inquiries;

      await contactController.getInquiries(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({
        inquiries,
        pageLength,
      });
    });

    it("성공: 문의가 0개일 경우", async () => {
      const request = httpMocks.createRequest({
        query: {
          page: 1,
        },
      });
      const response = httpMocks.createResponse();
      const pageLength = 1;
      const inquiries = [];
      contactRepository.getAmountOfInquiry = () => 0;
      contactRepository.getInquiries = () => inquiries;

      await contactController.getInquiries(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({
        inquiries,
        pageLength,
      });
    });

    it("실패: catch error", async () => {
      const request = httpMocks.createRequest({
        query: {
          page: 1,
        },
      });
      const response = httpMocks.createResponse();
      const pageLength = 1;
      const inquiries = [];
      contactRepository.getAmountOfInquiry = () => 10;
      contactRepository.getInquiries = () => {
        throw new Error();
      };

      await contactController.getInquiries(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("getInquiry", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();
      const inquiryDetail = {
        id: 1,
        content: "안녕하세요 문의글 ",
        createdAt: "2022-10-01 12:00:34",
      };
      contactRepository.getInquiry = () => inquiryDetail;

      await contactController.getInquiry(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({
        inquiryDetail,
      });
    });

    it("실패: catch error", async () => {
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
      });
      const response = httpMocks.createResponse();
      contactRepository.getInquiry = () => {
        throw new Error();
      };

      await contactController.getInquiry(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("writeInquiry", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        body: {
          inquiryInformation: {
            name: "홍길동",
            content: "문의글 남김...",
            option: "phone",
            contactInformation: "01012345678",
            locking: false,
          },
        },
      });
      const response = httpMocks.createResponse();
      contactRepository.writeInquiry = () => {};

      await contactController.writeInquiry(request, response);

      expect(response.statusCode).toBe(200);
    });

    it("실패: catch error", async () => {
      const request = httpMocks.createRequest({
        body: {
          inquiryInformation: {
            name: "홍길동",
            content: "문의글 남김...",
            option: "phone",
            contactInformation: "01012345678",
            locking: false,
          },
        },
      });
      const response = httpMocks.createResponse();
      contactRepository.writeInquiry = () => {
        throw new Error();
      };

      await contactController.writeInquiry(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("answer", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
        body: {
          email: "",
          text: "문의글 남김...",
          contactOption: "phone",
        },
      });
      const response = httpMocks.createResponse();
      const inquiryDetail = {
        id: 1,
        name: "홍길동",
        content: "문의 있습니다",
        contactOption: "phone",
        contactInformation: "01012345678",
        locking: false,
        answer: null,
        createdAt: "2022-01-01 12:00:23",
        answerDate: null,
      };
      contactRepository.getInquiry = jest.fn(() => {
        return inquiryDetail;
      });
      contactRepository.answer = jest.fn();

      await contactController.answer(request, response);

      expect(response.statusCode).toBe(200);
    });

    it("실패: catch error", async () => {
      const request = httpMocks.createRequest({
        params: {
          id: 1,
        },
        body: {
          inquiryInformation: {
            name: "홍길동",
            content: "문의글 남김...",
            option: "phone",
            contactInformation: "01012345678",
            locking: false,
          },
        },
      });
      const response = httpMocks.createResponse();
      contactRepository.getInquiry = jest.fn(() => {
        throw new Error();
      });
      contactRepository.answer = jest.fn();

      await contactController.answer(request, response);

      expect(response.statusCode).toBe(400);
    });
  });

  describe("validationCheck", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        body: {
          inquiryInformation: {
            name: "홍길동",
            content: "문의글 남김...",
            option: "phone",
            contactInformation: "01012345678",
            locking: false,
          },
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();

      await contactController.validationCheck(request, response, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it("실패 : 연락 방법이 phone이 아니고 email도 아닌 경우", async () => {
      const request = httpMocks.createRequest({
        body: {
          inquiryInformation: {
            name: "홍길동",
            content: "문의글 남김...",
            option: "",
            contactInformation: "01012345678",
            locking: false,
          },
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();

      await contactController.validationCheck(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });

    it("실패 : 이름의 길이가 0 인 경우", async () => {
      const request = httpMocks.createRequest({
        body: {
          inquiryInformation: {
            name: "",
            content: "문의글 남김...",
            option: "phone",
            contactInformation: "01012345678",
            locking: false,
          },
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();

      await contactController.validationCheck(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });

    it("실패 : 연락 방법과 연락처의 형식이 다른 경우", async () => {
      const request = httpMocks.createRequest({
        body: {
          inquiryInformation: {
            name: "홍길동",
            content: "문의글 남김...",
            option: "phone",
            contactInformation: "kildong@email.com",
            locking: false,
          },
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();

      await contactController.validationCheck(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });

    it("실패 : 내용의 길이가 0인 경우", async () => {
      const request = httpMocks.createRequest({
        body: {
          inquiryInformation: {
            name: "홍길동",
            content: "",
            option: "phone",
            contactInformation: "01012345678",
            locking: false,
          },
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();

      await contactController.validationCheck(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });

    it("실패 : 잠금 여부가 boolean이 아닌 경우", async () => {
      const request = httpMocks.createRequest({
        body: {
          inquiryInformation: {
            name: "홍길동",
            content: "문의글 남김...",
            option: "phone",
            contactInformation: "01012345678",
            locking: "false",
          },
        },
      });
      const response = httpMocks.createResponse();
      const next = jest.fn();

      await contactController.validationCheck(request, response, next);

      expect(next).toHaveBeenCalledTimes(0);
      expect(response.statusCode).toBe(400);
    });
  });
});
