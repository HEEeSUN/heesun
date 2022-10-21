import ContactController from "../../controller/contact";
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
        query:{
          page: 1
        }
      });
      const response = httpMocks.createResponse();
      const pageLength = 1;
      const inquiries = [{
        id: 1,
        content: "안녕하세요 문의글 ",
        createdAt: "2022-10-01 12:00:34",
      }]
      contactRepository.getAmountOfInquiry = () => 10 ;
      contactRepository.getInquiries = () => inquiries;
        
      await contactController.getInquiries(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({
        inquiries,
        pageLength,
      });
    })

    it("성공: 문의가 0개일 경우", async () => {
      const request = httpMocks.createRequest({
        query:{
          page: 1
        }
      });
      const response = httpMocks.createResponse();
      const pageLength = 1;
      const inquiries = []
      contactRepository.getAmountOfInquiry = () => 0 ;
      contactRepository.getInquiries = () => inquiries;
        
      await contactController.getInquiries(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({
        inquiries,
        pageLength,
      });
    })

    it("실패: catch error", async () => {
      const request = httpMocks.createRequest({
        query:{
          page: 1
        }
      });
      const response = httpMocks.createResponse();
      const pageLength = 1;
      const inquiries = []
      contactRepository.getAmountOfInquiry = () => 10 ;
      contactRepository.getInquiries = () => {
        throw new Error();
      };
        
      await contactController.getInquiries(request, response);

      expect(response.statusCode).toBe(400);
    })
  })

  describe("getInquiry", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        params: {
          id: 1
        }
      });
      const response = httpMocks.createResponse();
      const inquiryDetail = {
        id: 1,
        content: "안녕하세요 문의글 ",
        createdAt: "2022-10-01 12:00:34",
      }
      contactRepository.getInquiry = () => inquiryDetail ;
        
      await contactController.getInquiry(request, response);

      expect(response.statusCode).toBe(200);
      expect(response._getJSONData()).toEqual({
        inquiryDetail
      });
    })

    it("실패: catch error", async () => {
      const request = httpMocks.createRequest({
        params: {
          id: 1
        }
      });
      const response = httpMocks.createResponse();
      contactRepository.getInquiry = () => {
        throw new Error();
      }   

      await contactController.getInquiry(request, response);

      expect(response.statusCode).toBe(400);
    })
  })

  describe("writeInquiry", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        body: {
          inquiryInformation: {
            name: "홍길동", 
            content: "문의글 남김...", 
            option: "phone", 
            contactInformation: "01012345678", 
            locking: false
          }
        }
      });
      const response = httpMocks.createResponse();
      contactRepository.writeInquiry = () => {} ;
        
      await contactController.writeInquiry(request, response);

      expect(response.statusCode).toBe(200);
    })

    it("실패: catch error", async () => {
      const request = httpMocks.createRequest({
        body: {
          inquiryInformation: {
            name: "홍길동", 
            content: "문의글 남김...", 
            option: "phone", 
            contactInformation: "01012345678", 
            locking: false
          }
        }
      });
      const response = httpMocks.createResponse();
      contactRepository.writeInquiry = () => {
        throw new Error();
      } ;
        
      await contactController.writeInquiry(request, response);

      expect(response.statusCode).toBe(400);
    })
  })

  describe("answer", () => {
    it("성공", async () => {
      const request = httpMocks.createRequest({
        params: {
          id: 1
        },
        body: {
          email: "", 
          text: "문의글 남김...", 
          contactOption: "phone", 
        }
      });
      const response = httpMocks.createResponse();
      contactRepository.answer = () => {} ;
        
      await contactController.answer(request, response);

      expect(response.statusCode).toBe(200);
    })

    it("실패: catch error", async () => {
      const request = httpMocks.createRequest({
        body: {
          inquiryInformation: {
            name: "홍길동", 
            content: "문의글 남김...", 
            option: "phone", 
            contactInformation: "01012345678", 
            locking: false
          }
        }
      });
      const response = httpMocks.createResponse();
      contactRepository.answer = () => {
        throw new Error();
      } ;
        
      await contactController.answer(request, response);

      expect(response.statusCode).toBe(400);
    })
  })



//   describe("signup", () => {
//     describe("username 중복 체크", ()=> {
//       it("성공", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             idCheck: true,
//             username: "user",
//           },
//         });
//         const response = httpMocks.createResponse();
//         userRepository.findByUsername = () => {};
  
//         await userController.signup(request, response);
  
//         expect(response.statusCode).toBe(200);
//       });
  
//       it("실패 : 이미 존재하는 username일 경우", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             idCheck: true,
//             username: "user",
//           },
//         });
//         const response = httpMocks.createResponse();
//         const user = { userId: 1, username: "user" };
//         userRepository.findByUsername = () => user;
  
//         await userController.signup(request, response);
  
//         expect(response.statusCode).toBe(409);
//         expect(response._getJSONData().code).toBe("ERROR00003");
//       });
//     })

//     describe("회원가입", () => {
//       it("성공", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             idCheck: false,
//             signupInfo: {
//               username: "user",
//               password: "abcd",
//               name: "username",
//               birthday: "1990-01-01",
//               phone: "01012345678",
//               address: "",
//               extraAddress: "",
//             },
//           },
//         });
//         const response = httpMocks.createResponse();
//         userRepository.createUser = jest.fn();
  
//         await userController.signup(request, response);
  
//         expect(response.statusCode).toBe(201);
//       });
  
//       it("실패 : catch error", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             idCheck: false,
//             signupInfo: {
//               username: "user",
//               password: "abcd",
//               name: "username",
//               birthday: "1990-01-01",
//               phone: "01012345678",
//               address: "",
//               extraAddress: "",
//             },
//           },
//         });
//         const response = httpMocks.createResponse();
//         userRepository.createUser = () => {
//           throw new Error();
//         };
  
//         await userController.signup(request, response);
  
//         expect(response.statusCode).toBe(400);
//       });
//     })
//   });

//   describe("login", () => {
//     it("성공", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           userInfo: {
//             username: "user",
//             password: "1234",
//           },
//         },
//       });
//       const response = httpMocks.createResponse();
//       const user = {
//         userId: 1,
//         username: "user",
//         password:
//           "$2b$12$xK1rWv9IgppQXZA5.fNAF.A.g8Veczd2emi9xLJOlF9dXssSa3I12",
//       };
//       userRepository.findByUsername = () => user;
//       userController.createJwtToken = jest.fn(() => "token");
//       userController.setToken = jest.fn();
//       userController.cartSummary = jest.fn(() => 1);

//       await userController.login(request, response);

//       expect(response.statusCode).toBe(200);
//     });

//     it("실패 : 존재하지 않는 username인 경우", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           userInfo: {
//             username: "user",
//             password: "1234",
//           },
//         },
//       });
//       const response = httpMocks.createResponse();

//       userRepository.findByUsername = () => {};
//       userController.createJwtToken = jest.fn(() => "token");
//       userController.setToken = jest.fn();
//       userController.cartSummary = jest.fn(() => 1);

//       await userController.login(request, response);

//       expect(response.statusCode).toBe(401);
//     });

//     it("실패 : 패스워드가 올바르지 않은 경우", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           userInfo: {
//             username: "user",
//             password: "1234",
//           },
//         },
//       });
//       const response = httpMocks.createResponse();
//       const user = {
//         userId: 1,
//         username: "user",
//         password: "$2b$$xK1rWv9IgppQXZA5.fNAF.A.g8Veczd2emi9xLJOlF9dXssSa3I12",
//       };
//       userRepository.findByUsername = () => user;
//       userController.createJwtToken = jest.fn(() => "token");
//       userController.setToken = jest.fn();
//       userController.cartSummary = jest.fn(() => 1);

//       await userController.login(request, response);

//       expect(response.statusCode).toBe(401);
//     });

//     it("실패 : catch error", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           userInfo: {
//             username: "user",
//             password: "1234",
//           },
//         },
//       });
//       const response = httpMocks.createResponse();
//       const user = {
//         userId: 1,
//         username: "user",
//         password:
//           "$2b$12$xK1rWv9IgppQXZA5.fNAF.A.g8Veczd2emi9xLJOlF9dXssSa3I12",
//       };
//       userRepository.findByUsername = () => {throw new Error()};
//       userController.createJwtToken = jest.fn(() => "token");
//       userController.setToken = jest.fn();
//       userController.cartSummary = jest.fn(() => 1);

//       await userController.login(request, response);

//       expect(response.statusCode).toBe(400);
//     });
//   });

//   describe("kakaoLogin", () => {
//     it("성공 : 이전에 카카오 로그인 기록이 있는 경우", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           kakao_account: "kakao@kakao.n",
//         },
//       });
//       const response = httpMocks.createResponse();
//       const user = {
//         id: 1,
//         username: "kakao@kakao.n",
//       };
//       userRepository.findByUsername = () => user;
//       userRepository.createUserKakao = jest.fn();
//       userController.createJwtToken = jest.fn(() => "token");
//       userController.setToken = jest.fn();
//       userController.cartSummary = jest.fn(() => 1);

//       await userController.kakaoLogin(request, response);

//       expect(response.statusCode).toBe(200);
//       expect(userRepository.createUserKakao).toHaveBeenCalledTimes(0);
//     });

//     it("성공 : 카카오 로그인이 최초인 경우", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           kakao_account: "kakao@kakao.n",
//         },
//       });
//       const response = httpMocks.createResponse();
//       userRepository.findByUsername = () => {};
//       userRepository.createUserKakao = () => 1;
//       userController.createJwtToken = jest.fn(() => "token");
//       userController.setToken = jest.fn();
//       userController.cartSummary = jest.fn(() => 1);

//       await userController.kakaoLogin(request, response);

//       expect(response.statusCode).toBe(200);
//     });

//     it("실패 :catch error", async () => {
//       const request = httpMocks.createRequest({
//         body: {
//           kakao_account: "kakao@kakao.n",
//         },
//       });
//       const response = httpMocks.createResponse();
//       userRepository.findByUsername = () => {};
//       userRepository.createUserKakao = () => {
//         throw new Error();
//       };
//       userController.createJwtToken = jest.fn(() => "token");
//       userController.setToken = jest.fn();
//       userController.cartSummary = jest.fn(() => 1);

//       await userController.kakaoLogin(request, response);

//       expect(response.statusCode).toBe(400);
//     });
//   });

//   describe("user info", () => {
//     describe("getMyInfo", () => {
//       it("성공", async()=>{
//         const request = httpMocks.createRequest({
//           username: "user",
//         });
//         const response = httpMocks.createResponse();
//         const user = {
//           name: "홍길동"
//         }
//         userRepository.getUserInfo = () => user;

//         await userController.getMyInfo(request, response);

//         expect(response.statusCode).toBe(200);
//       })

//       it("실패 : catch error", async()=>{
//         const request = httpMocks.createRequest({
//           username: "user",
//         });
//         const response = httpMocks.createResponse();
//         userRepository.getUserInfo = () => {throw new Error()};

//         await userController.getMyInfo(request, response);

//         expect(response.statusCode).toBe(400);
//       })
//     }) 

//     describe("modifyUserInfo", () => {
//       it("성공 : 패스워드를 제외한 항목 변경", async()=>{
//         const request = httpMocks.createRequest({
//           body: {
//             userInfo: {
//               name: "홍길순",
//             }
//           }
//         });
//         const response = httpMocks.createResponse();

//         userRepository.modifyUserInfo = jest.fn();
//         userRepository.modifyUserInfoAndPw = jest.fn();

//         await userController.modifyUserInfo(request, response);

//         expect(response.statusCode).toBe(200);
//         expect(userRepository.modifyUserInfo).toHaveBeenCalledTimes(1);
//         expect(userRepository.modifyUserInfoAndPw).toHaveBeenCalledTimes(0);
//       })

//       it("성공 : 패스워드 변경", async()=>{
//         const request = httpMocks.createRequest({
//           body: {
//             userInfo: {
//               name: "홍길순",
//               password: "abcd"
//             }
//           }
//         });
//         const response = httpMocks.createResponse();

//         userRepository.modifyUserInfo = jest.fn();
//         userRepository.modifyUserInfoAndPw = jest.fn();

//         await userController.modifyUserInfo(request, response);

//         expect(response.statusCode).toBe(200);
//         expect(userRepository.modifyUserInfo).toHaveBeenCalledTimes(0);
//         expect(userRepository.modifyUserInfoAndPw).toHaveBeenCalledTimes(1);
//       })

//       it("실패 : catch error", async()=>{
//         const request = httpMocks.createRequest({
//           body: {
//             userInfo: {
//               name: "홍길순",
//               password: "abcd"
//             }
//           }
//         });
//         const response = httpMocks.createResponse();

//         userRepository.modifyUserInfo = jest.fn();
//         userRepository.modifyUserInfoAndPw = () => {throw new Error()};

//         await userController.modifyUserInfo(request, response);

//         expect(response.statusCode).toBe(400);
//       })
//     })
//   })

//   describe("cart", () => {
//     describe("removeProductInCART", () => {
//       it("성공", async () => {
//         const request = httpMocks.createRequest({
//           query: {
//             id: 1,
//           },
//         });
//         const response = httpMocks.createResponse();
//         userRepository.deleteProduct = jest.fn();

//         await userController.removeProductInCART(request, response);

//         expect(response.statusCode).toBe(204);
//       });

//       it("실패 : catch error", async () => {
//         const request = httpMocks.createRequest({
//           query: {
//             id: 1,
//           },
//         });
//         const response = httpMocks.createResponse();
//         userRepository.deleteProduct = () => {
//           throw new Error();
//         };

//         await userController.removeProductInCART(request, response);

//         expect(response.statusCode).toBe(400);
//       });
//     });

//     describe("cart", () => {
//       it("성공", async () => {
//         const request = httpMocks.createRequest();
//         const response = httpMocks.createResponse();
//         const products = [{ cart_id: 1, stock: 2, quantity: 1, name: "name" }];
//         const adjustmentProduct = [];
//         userRepository.getInCart = () => products;
//         userRepository.adjustmentQuantityInCart = jest.fn();

//         await userController.cart(request, response);

//         expect(response.statusCode).toBe(200);
//         expect(response._getJSONData()).toEqual({
//           products,
//           adjustmentProduct,
//         });
//       });

//       it("성공 : 재고 부족시 카트 안의 상품 재고 조정후 가져오기", async () => {
//         const request = httpMocks.createRequest();
//         const response = httpMocks.createResponse();
//         const products = [{ cart_id: 1, stock: 1, quantity: 2, name: "name" }];
//         const adjustmentProduct = [{ quantity: 1, name: "name" }];
//         const afterProducts = [
//           { cart_id: 1, stock: 1, quantity: 1, name: "name" },
//         ];
//         userRepository.getInCart = () => products;
//         userRepository.adjustmentQuantityInCart = jest.fn();

//         await userController.cart(request, response);

//         expect(response.statusCode).toBe(200);
//         expect(response._getJSONData()).toEqual({
//           products: afterProducts,
//           adjustmentProduct,
//         });
//       });

//       it("실패 : catch error", async () => {
//         const request = httpMocks.createRequest();
//         const response = httpMocks.createResponse();
//         userRepository.getInCart = () => {
//           throw new Error();
//         };
//         userRepository.adjustmentQuantityInCart = jest.fn();

//         await userController.cart(request, response);

//         expect(response.statusCode).toBe(400);
//       });
//     });

//     describe("addCart", () => {
//       it("성공 : 이미 cart에 있는 상품인 경우", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             product_code: "test-00000001",
//             option_number: 0,
//             quantity: 1,
//           },
//         });
//         const response = httpMocks.createResponse();
//         const product = [{ product_code: "test-00000001", option_number: 0 }];
//         const cartProduct = { product_code: "test-00000001", option_number: 0 };
//         userRepository.getByProduct_code = () => product;
//         userController.duplicateCheck = () => cartProduct;
//         userRepository.increaseQuantity = jest.fn();
//         userRepository.addInCart = jest.fn();
//         userController.cartSummary = jest.fn(() => 1);

//         await userController.addCart(request, response);

//         expect(response.statusCode).toBe(201);
//         expect(userRepository.increaseQuantity).toHaveBeenCalledTimes(1);
//         expect(userRepository.addInCart).toHaveBeenCalledTimes(0);
//       });

//       it("성공", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             product_code: "test-00000001",
//             option_number: 0,
//             quantity: 1,
//           },
//         });
//         const response = httpMocks.createResponse();
//         const product = [{ product_code: "test-00000001", option_number: 0 }];
//         userRepository.getByProduct_code = () => product;
//         userController.duplicateCheck = () => {};
//         userRepository.increaseQuantity = jest.fn();
//         userRepository.addInCart = jest.fn();
//         userController.cartSummary = jest.fn(() => 1);

//         await userController.addCart(request, response);

//         expect(response.statusCode).toBe(201);
//         expect(userRepository.increaseQuantity).toHaveBeenCalledTimes(0);
//         expect(userRepository.addInCart).toHaveBeenCalledTimes(1);
//       });

//       it("성공 : 주문취소로 인한 카트 재담기인 경우", async () => {
//         const request = httpMocks.createRequest({
//           productArray: [{
//             product_code: "testcode",
//             option_number: 1,
//             quantity: 1,
//             userId: 2
//           },
//           {
//             product_code: "testcode",
//             option_number: 2,
//             quantity: 1,
//             userId: 2
//           }
//         ]
//         });
//         const response = httpMocks.createResponse();
//         const product = [{ product_code: "test-00000001", option_number: 0 }];
//         userRepository.getByProduct_code = jest.fn(() => product);
//         userRepository.increaseQuantity = jest.fn();
//         userRepository.addInCart = jest.fn();

//         await userController.addCart(request, response);

//         expect(response.statusCode).toBe(204);
//         expect(userRepository.getByProduct_code).toHaveBeenCalledTimes(0);
//         expect(userRepository.increaseQuantity).toHaveBeenCalledTimes(0);
//         expect(userRepository.addInCart).toHaveBeenCalledTimes(2);
//       });

//       it("실패 : catch error", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             product_code: "test-00000001",
//             option_number: 0,
//             quantity: 1,
//           },
//         });
//         const response = httpMocks.createResponse();
//         const product = [{ product_code: "test-00000001", option_number: 0 }];
//         userRepository.getByProduct_code = () => product;
//         userController.duplicateCheck = () => {};
//         userRepository.increaseQuantity = jest.fn();
//         userRepository.addInCart = jest.fn(() => {
//           throw new Error();
//         });
//         userController.cartSummary = jest.fn(() => 1);

//         await userController.addCart(request, response);

//         expect(response.statusCode).toBe(400);
//       });

//       it("실패 : 상품코드로 상품을 찾을 수 없는 경우", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             product_code: "test-00000001",
//             option_number: 0,
//             quantity: 1,
//           },
//         });
//         const response = httpMocks.createResponse();
//         const product = [];
//         userRepository.getByProduct_code = () => product;
//         userController.duplicateCheck = jest.fn();
//         userRepository.increaseQuantity = jest.fn();
//         userRepository.addInCart = jest.fn(() => {
//           throw new Error();
//         });
//         userController.cartSummary = jest.fn(() => 1);

//         await userController.addCart(request, response);

//         expect(response.statusCode).toBe(409);
//         expect(response._getJSONData().code).toBe("ERROR10003");
//       });
//     });
//   });

//   describe("info", () => {
//     describe("info", () => { //주문내역
//       it("성공", async () => {
//         const request = httpMocks.createRequest({
//           query: {
//             page: 1,
//             date1: "2022-04-01",
//             date2: "2022-04-30",
//           },
//         });
//         const response = httpMocks.createResponse();
//         const orderList = [{ order_id: 1, full_count: 1 }];
//         const orderDetail = [{ detail_id: 1, order_id: 1 }];
//         userRepository.getOrder = () => orderList;
//         userRepository.getOrderDetail = () => orderDetail;

//         await userController.info(request, response);

//         expect(response.statusCode).toBe(200);
//       });

//       it("성공 : 주문이 없는 경우", async () => {
//         const request = httpMocks.createRequest({
//           query: {
//             page: 1,
//             date1: "2022-04-01",
//             date2: "2022-04-30",
//           },
//         });
//         const response = httpMocks.createResponse();
//         const orderList = [];
//         const orderDetail = [];
//         userRepository.getOrder = () => orderList;
//         userRepository.getOrderDetail = () => orderDetail;

//         await userController.info(request, response);

//         expect(response.statusCode).toBe(200);
//         expect(response._getJSONData().orderList).toStrictEqual([]);
//       });

//       it("실패 : catch error", async () => {
//         const request = httpMocks.createRequest({
//           query: {
//             page: 1,
//             date1: "2022-04-01",
//             date2: "2022-04-30",
//           },
//         });
//         const response = httpMocks.createResponse();
//         userRepository.getOrder = () => {throw new Error()};
//         userRepository.getOrderDetail = () => {};

//         await userController.info(request, response);

//         expect(response.statusCode).toBe(400);
//       });
//     });

//     describe("getMyInfo", () => {
//       it("성공", async () => {
//         const request = httpMocks.createRequest();
//         const response = httpMocks.createResponse();
//         const user = {
//           user_id: 1,
//           username: "user",
//         };
//         userRepository.getUserInfo = () => user;

//         await userController.getMyInfo(request, response);

//         expect(response.statusCode).toBe(200);
//       });

//       it("실패 : catch error", async () => {
//         const request = httpMocks.createRequest();
//         const response = httpMocks.createResponse();
//         userRepository.getUserInfo = () => {
//           throw new Error();
//         };

//         await userController.getMyInfo(request, response);

//         expect(response.statusCode).toBe(400);
//       });
//     });

//     describe("getOrder", () => { //환불요청할주문내역
//       it("성공", async () => {
//         const request = httpMocks.createRequest({
//           params: {
//             id: 1,
//           },
//         });
//         const response = httpMocks.createResponse();
//         const order = { order_id: 1, payment_id: 1 };
//         const order_detail = [{ detail_id: 1 }];
//         userRepository.getRefundOrder = () => order;
//         userRepository.getOrderDetail = () => order_detail;

//         await userController.getOrder(request, response);

//         expect(response.statusCode).toBe(200);
//       });

//       it("실패 : order가 없는 경우", async () => {
//         const request = httpMocks.createRequest({
//           params: {
//             id: 1,
//           },
//         });
//         const response = httpMocks.createResponse();
//         userRepository.getRefundOrder = () => {};
//         userRepository.getOrderDetail = () => [];

//         await userController.getOrder(request, response);

//         expect(response.statusCode).toBe(404);
//       });

//       it("실패 : catch error", async () => {
//         const request = httpMocks.createRequest({
//           params: {
//             id: 1,
//           },
//         });
//         const response = httpMocks.createResponse();
//         userRepository.getRefundOrder = () => {};
//         userRepository.getOrderDetail = () => {
//           throw new Error();
//         };

//         await userController.getOrder(request, response);

//         expect(response.statusCode).toBe(400);
//       });
//     });

//     describe("deliveryStatus", () => {
//       it("성공", async () => {
//         const request = httpMocks.createRequest({
//           query: { id: 1 },
//         });
//         const response = httpMocks.createResponse();
//         const status = [{ status: "결제완료", date: "2022-04-01" }];
//         userRepository.getDeliveryStatus = () => status;

//         await userController.deliveryStatus(request, response);

//         expect(response.statusCode).toBe(200);
//       });

//       it("실패 : 주어진 id로 배송 정보를 확인할 수 없는 경우", async () => {
//         const request = httpMocks.createRequest({
//           query: { id: 1 },
//         });
//         const response = httpMocks.createResponse();
//         const status = [];
//         userRepository.getDeliveryStatus = () => status;

//         await userController.deliveryStatus(request, response);

//         expect(response.statusCode).toBe(400);
//         expect(response._getJSONData().code).toBe("ERROR20001");
//       });

//       it("실패 : catch error", async () => {
//         const request = httpMocks.createRequest({
//           query: { id: 1 },
//         });
//         const response = httpMocks.createResponse();
//         userRepository.getDeliveryStatus = () => {
//           throw new Error();
//         };

//         await userController.deliveryStatus(request, response);

//         expect(response.statusCode).toBe(400);
//       });
//     });
//   });

//   describe("payment", () => {
//     describe("paycomplete", () => {
//       it("성공", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             imp_uid: "2022040100000001",
//             merchant_uid: "2022040100000001",
//           },
//         });
//         const response = httpMocks.createResponse();
//         userRepository.updatePayment = jest.fn();
//         userController.cartSummary = jest.fn(() => 1);

//         await userController.paycomplete(request, response);

//         expect(response.statusCode).toBe(200);
//       });

//       it("실패: catch error", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             imp_uid: "2022040100000001",
//             merchant_uid: "2022040100000001",
//           },
//         });
//         const response = httpMocks.createResponse();
//         userRepository.updatePayment = () => {
//           throw new Error();
//         };
//         await userController.paycomplete(request, response);

//         expect(response.statusCode).toBe(400);
//       });
//     });

//     describe("cancelOrder", () => {
//       it("성공", async () => {
//         const request = httpMocks.createRequest({
//           params: {
//             id: 1
//           }
//         });
//         const response = httpMocks.createResponse();
//         const paymentId = 1;
//         userRepository.findPaymentId = () => paymentId;
//         userRepository.cancelOrder = jest.fn()

//         await userController.cancelOrder(request, response);

//         expect(response.statusCode).toBe(204);
//       });

//       it("실패 : 주어진 orderId로 paymentId를 찾을 수 없는 경우", async () => {
//         const request = httpMocks.createRequest({
//           params: {
//             id: 1
//           }
//         });
//         const response = httpMocks.createResponse();
//         const paymentId = {};
//         userRepository.findPaymentId = () => paymentId;

//         await userController.cancelOrder(request, response);

//         expect(response.statusCode).toBe(400);
//       });

//       it("실패 : catch error", async () => {
//         const request = httpMocks.createRequest({
//           params: {
//             id: 1
//           }
//         });
//         const response = httpMocks.createResponse();
//         userRepository.findPaymentId = () => {throw new Error() };

//         await userController.cancelOrder(request, response);

//         expect(response.statusCode).toBe(400);
//       });
//     })

//     describe("cancelPayment", () => {
//       it("성공", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             merchantUID: "2022040100000001",
//             newArray: [{ product_code: "test" }],
//           },
//         });
//         const response = httpMocks.createResponse();
//         const next = jest.fn();
//         userRepository.increaseStock = jest.fn(() => true);
//         userRepository.deletePayment = jest.fn();

//         await userController.cancelPayment(request, response, next);

//         expect(next).toHaveBeenCalledTimes(1);
//       });

//       it("실패 : catch error", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             merchantUID: "2022040100000001",
//             newArray: [{ product_code: "test" }],
//           },
//         });
//         const response = httpMocks.createResponse();
//         const next = jest.fn();
//         userRepository.increaseStock = jest.fn(() => true);
//         userRepository.deletePayment = () => {
//           throw new Error();
//         };

//         await userController.cancelPayment(request, response, next);

//         expect(response.statusCode).toBe(400);
//         expect(next).toHaveBeenCalledTimes(0);
//       });
//     });

//     describe("payment", () => {
//       it("성공", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             amount: 10000,
//             shippingFee: 3000,
//             productPrice: 7000,
//             newArray: [],
//             orderer: "user",
//             phone: "01012345678",
//             address: "adress..",
//             extra_address: "extra adress..",
//           },
//         });
//         const response = httpMocks.createResponse();
//         const next = jest.fn();
//         userController.checkStock = jest.fn(() => {return false});
//         userRepository.insertInfoForPayment = jest.fn(() => 1);
//         userRepository.deletePaymentByPaymentId = jest.fn()
//         userRepository.updateMarchantUID = jest.fn(() => { return {insertId:1}});

//         await userController.payment(request, response, next);

//         expect(response.statusCode).toBe(200);
//       });

//       it("실패 : 재고부족", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             amount: 10000,
//             shippingFee: 3000,
//             productPrice: 7000,
//             newArray: [],
//             orderer: "user",
//             phone: "01012345678",
//             address: "adress..",
//             extra_address: "extra adress..",
//           },
//         });
//         const response = httpMocks.createResponse();
//         userController.checkStock = jest.fn(() => true);
//         userRepository.insertInfoForPayment = jest.fn(() => 1);
//         userRepository.updateMarchantUID = jest.fn(() => []);
//         userController.order = jest.fn();

//         await userController.payment(request, response);

//         expect(response.statusCode).toBe(409);
//         expect(response._getJSONData().code).toBe("ERROR30002");
//       });

//       it("실패 : payment id 생성 실패", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             amount: 10000,
//             shippingFee: 3000,
//             productPrice: 7000,
//             newArray: [],
//             orderer: "user",
//             phone: "01012345678",
//             address: "adress..",
//             extra_address: "extra adress..",
//           },
//         });
//         const response = httpMocks.createResponse();
//         userController.checkStock = jest.fn(() => false);
//         userRepository.insertInfoForPayment = jest.fn();
//         userRepository.updateMarchantUID = jest.fn(() => []);
//         userController.order = jest.fn();

//         await userController.payment(request, response);

//         expect(response.statusCode).toBe(409);
//         expect(response._getJSONData().code).toBe("ERROR30001");
//       });

//       it("실패 : merchantUID 업데이트 실패", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             amount: 10000,
//             shippingFee: 3000,
//             productPrice: 7000,
//             newArray: [],
//             orderer: "user",
//             phone: "01012345678",
//             address: "adress..",
//             extra_address: "extra adress..",
//           },
//         });
//         const response = httpMocks.createResponse();
//         userController.checkStock = jest.fn(() => false);
//         userRepository.insertInfoForPayment = jest.fn(() => 1);
//         userRepository.deletePaymentByPaymentId = jest.fn()
//         userRepository.updateMarchantUID = jest.fn();
//         userController.order = jest.fn();
//         userRepository.cancelPayment = jest.fn();

//         await userController.payment(request, response);

//         expect(response.statusCode).toBe(409);
//         expect(response._getJSONData().code).toBe("ERROR30001");
//       });

//       it("실패 : catch error", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             amount: 10000,
//             shippingFee: 3000,
//             productPrice: 7000,
//             newArray: [],
//             orderer: "user",
//             phone: "01012345678",
//             address: "adress..",
//             extra_address: "extra adress..",
//           },
//         });
//         const response = httpMocks.createResponse();
//         userController.checkStock = jest.fn(() => false);
//         userRepository.insertInfoForPayment = jest.fn(() => 1);
//         userRepository.deletePaymentByPaymentId = jest.fn()
//         userRepository.updateMarchantUID = jest.fn(() => {
//           throw new Error();
//         });
//         userController.order = jest.fn();
//         userRepository.cancelPayment = jest.fn();

//         await userController.payment(request, response);

//         expect(response.statusCode).toBe(400);
//       });
//     });

//     describe("order", () => {
//       it("성공", async()=>{
//         const request = httpMocks.createRequest({
//           paymentId: 1,
//           merchantUID: "2022080100000001",
//           username: "user",
//           body: {
//             paymentOption : "card",
//             newArray: [],
//             orderer: "홍길동",
//             phone: "010-1234-5678",
//             address: "경기도",
//             extra_address: "고양시"
//           },
//         });
//         const response = httpMocks.createResponse();
//         const orderId = 1;
//         const orderDetailResult = {insertId:1}
//         userRepository.order = jest.fn(()=>orderId)
//         userRepository.deletePaymentByPaymentId = jest.fn();
//         userRepository.orderDetail = jest.fn(()=>orderDetailResult)

//         await userController.order(request, response);

//         expect(response.statusCode).toBe(200);
//       })

//       it("실패 : order 정보가 저장되지 않은 경우", async()=>{
//         const request = httpMocks.createRequest({
//           paymentId: 1,
//           merchantUID: "2022080100000001",
//           username: "user",
//           body: {
//             paymentOption : "card",
//             newArray: [],
//             orderer: "홍길동",
//             phone: "010-1234-5678",
//             address: "경기도",
//             extra_address: "고양시"
//           },
//         });
//         const response = httpMocks.createResponse();
//         const orderId = undefined;
//         const orderDetailResult = {insertId:1}
//         userRepository.order = jest.fn(()=>orderId)
//         userRepository.deletePaymentByPaymentId = jest.fn();
//         userRepository.orderDetail = jest.fn(()=>orderDetailResult)

//         await userController.order(request, response);

//         expect(response.statusCode).toBe(409);
//       })

//       it("실패 : order detail정보가 저장되지 않은 경우", async()=>{
//         const request = httpMocks.createRequest({
//           paymentId: 1,
//           merchantUID: "2022080100000001",
//           username: "user",
//           body: {
//             paymentOption : "card",
//             newArray: [],
//             orderer: "홍길동",
//             phone: "010-1234-5678",
//             address: "경기도",
//             extra_address: "고양시"
//           },
//         });
//         const response = httpMocks.createResponse();
//         const orderId = 1;
//         const orderDetailResult = undefined
//         userRepository.order = jest.fn(()=>orderId)
//         userRepository.deletePaymentByPaymentId = jest.fn();
//         userRepository.orderDetail = jest.fn(()=>orderDetailResult)

//         await userController.order(request, response);

//         expect(response.statusCode).toBe(409);
//       })

//       it("실패 : catch error", async()=>{
//         const request = httpMocks.createRequest({
//           paymentId: 1,
//           merchantUID: "2022080100000001",
//           username: "user",
//           body: {
//             paymentOption : "card",
//             newArray: [],
//             orderer: "홍길동",
//             phone: "010-1234-5678",
//             address: "경기도",
//             extra_address: "고양시"
//           },
//         });
//         const response = httpMocks.createResponse();
//         const orderId = 1;
//         const orderDetailResult = {}
//         userRepository.order = jest.fn(()=>{throw new Error()})
//         userRepository.deletePaymentByPaymentId = jest.fn();
//         userRepository.orderDetail = jest.fn(()=>orderDetailResult)

//         await userController.order(request, response);

//         expect(response.statusCode).toBe(400);
//       })
//     })
//   });

//   describe("review", () => {
//     describe("getMyReview", () => {
//       it("성공 : 작성한 리뷰", async () => {
//         const request = httpMocks.createRequest({
//           query: {
//             status: "done",
//             page: 1,
//           },
//         });
//         const response = httpMocks.createResponse();
//         const review = [
//           {
//             product_code: "test-00000001",
//             content: "good~",
//             full_count: 1,
//           },
//         ];
//         userRepository.getMyReview = jest.fn(() => review);
//         userRepository.getWritableReview = jest.fn(() => review);

//         await userController.getMyReview(request, response);

//         expect(response.statusCode).toBe(200);
//         expect(userRepository.getMyReview).toHaveBeenCalledTimes(1);
//         expect(userRepository.getWritableReview).toHaveBeenCalledTimes(0);
//       });

//       it("성공 : 작성 가능한 리뷰", async () => {
//         const request = httpMocks.createRequest({
//           query: {
//             status: "yet",
//             page: 1,
//           },
//         });
//         const response = httpMocks.createResponse();
//         const review = [
//           {
//             product_code: "test-00000001",
//             content: "good~",
//             full_count: 1,
//           },
//         ];
//         userRepository.getMyReview = jest.fn(() => review);
//         userRepository.getWritableReview = jest.fn(() => review);

//         await userController.getMyReview(request, response);

//         expect(response.statusCode).toBe(200);
//         expect(userRepository.getMyReview).toHaveBeenCalledTimes(0);
//         expect(userRepository.getWritableReview).toHaveBeenCalledTimes(1);
//       });

//       it("성공 : 작성했거나 작성 가능한 리뷰가 없는 경우", async () => {
//         const request = httpMocks.createRequest({
//           query: {
//             status: "yet",
//             page: 1,
//           },
//         });
//         const response = httpMocks.createResponse();
//         const review = [];
//         userRepository.getMyReview = jest.fn(() => review);
//         userRepository.getWritableReview = jest.fn(() => review);

//         await userController.getMyReview(request, response);

//         expect(response.statusCode).toBe(200);
//       });

//       it("실패 : catch error", async () => {
//         const request = httpMocks.createRequest({
//           query: {
//             status: "yet",
//             page: 1,
//           },
//         });
//         const response = httpMocks.createResponse();
//         const review = [];
//         userRepository.getMyReview = jest.fn(() => review);
//         userRepository.getWritableReview = jest.fn(() => {
//           throw new Error();
//         });

//         await userController.getMyReview(request, response);

//         expect(response.statusCode).toBe(400);
//       });
//     });

//     describe("writeReview", () => {
//       it("성공", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             product_code: "test-00000001",
//             text: "good",
//             detail_id: 1,
//           },
//         });
//         const response = httpMocks.createResponse();
//         userRepository.writeReview = jest.fn();

//         await userController.writeReview(request, response);

//         expect(response.statusCode).toBe(201);
//       });

//       it("실패 : catch error", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             product_code: "test-00000001",
//             text: "good",
//             detail_id: 1,
//           },
//         });
//         const response = httpMocks.createResponse();
//         userRepository.writeReview = () => {
//           throw new Error();
//         };

//         await userController.writeReview(request, response);

//         expect(response.statusCode).toBe(400);
//       });
//     });
//   });

//   describe("getMyPost", () => {
//     it("성공 : 내가 작성한 게시글", async () => {
//       const request = httpMocks.createRequest({
//         query: {
//           post: true,
//           page: 1,
//         },
//       });
//       const response = httpMocks.createResponse();
//       const posts = [{ post_id: 1, title: "title..", full_count: 1 }];
//       userRepository.getMyPost = jest.fn(() => posts);
//       userRepository.getMyComment = jest.fn(() => posts);

//       await userController.getMyPost(request, response);

//       expect(response.statusCode).toBe(200);
//       expect(userRepository.getMyPost).toHaveBeenCalledTimes(1);
//       expect(userRepository.getMyComment).toHaveBeenCalledTimes(0);
//     });

//     it("성공 : 내가 댓글을 작성한 게시글", async () => {
//       const request = httpMocks.createRequest({
//         query: {
//           comment: true,
//           page: 1,
//         },
//       });
//       const response = httpMocks.createResponse();
//       const posts = [{ post_id: 1, title: "title..", full_count: 1 }];
//       userRepository.getMyPost = jest.fn(() => posts);
//       userRepository.getMyComment = jest.fn(() => posts);

//       await userController.getMyPost(request, response);

//       expect(response.statusCode).toBe(200);
//       expect(userRepository.getMyPost).toHaveBeenCalledTimes(0);
//       expect(userRepository.getMyComment).toHaveBeenCalledTimes(1);
//     });

//     it("성공 : 내가 작성했거나 댓글을 작성한 게시글이 없는 경우", async () => {
//       const request = httpMocks.createRequest({
//         query: {
//           comment: true,
//           page: 1,
//         },
//       });
//       const response = httpMocks.createResponse();
//       const posts = [];
//       userRepository.getMyPost = jest.fn(() => posts);
//       userRepository.getMyComment = jest.fn(() => posts);

//       await userController.getMyPost(request, response);

//       expect(response.statusCode).toBe(200);
//       expect(response._getJSONData()).toEqual({ newPosts: [], hasmore: 0 });
//     });

//     it("실패 : catch error", async () => {
//       const request = httpMocks.createRequest({
//         query: {
//           comment: true,
//           page: 1,
//         },
//       });
//       const response = httpMocks.createResponse();
//       const posts = [];
//       userRepository.getMyPost = jest.fn(() => posts);
//       userRepository.getMyComment = jest.fn(() => {throw new Error()});

//       await userController.getMyPost(request, response);

//       expect(response.statusCode).toBe(400);
//     });
//   });

//   describe("refreshAuth", () => {
//     it("성공", async () => {
//       const request = httpMocks.createRequest();
//       const response = httpMocks.createResponse();
//       userController.cartSummary = jest.fn(() => 1);

//       await userController.refreshAuth(request, response);

//       expect(response.statusCode).toBe(200);
//     });

//     it("실패 : catch error", async () => {
//       const request = httpMocks.createRequest({
//         userId: 1
//       });
//       const response = httpMocks.createResponse();
//       userController.cartSummary = jest.fn(() => {throw new Error()});

//       await userController.refreshAuth(request, response);

//       expect(response.statusCode).toBe(400);
//     });
//   });

//   describe("refund", () => {
//     describe("refund", ()=> {
//       it("성공", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             refundInfo: {
//               merchantUID: "2022000000",
//               impUID: "2022000000",
//               extraCharge: 0,
//               refundProduct: [],
//               refundAmount: 10000,
//             },
//             immediatelyRefundInfo: {
//               refundAmountForProduct: 7000,
//               refundAmountForShipping: 3000,
//             },
//             pendingRefundInfo: {
//               pendingRefundAmountForProduct: 0,
//               returnShippingFee: 0,
//               pendingRefundAmountForShipping: 0,
//             },
//           },
//         });
//         const response = httpMocks.createResponse();
//         const refundSavePoint = {
//           rest_refund_amount: 10000,
//           products_price: 7000,
//           shippingfee: 3000,
//           return_shippingfee: 0,
//         };
//         userRepository.getAmount = jest.fn(() => refundSavePoint);
//         userRepository.refund = jest.fn();
//         userRepository.requestRefund = jest.fn(() => 1);
  
//         await userController.refund(request, response);
  
//         expect(response.statusCode).toBe(200);
//       });
  
//       it("성공 : 추가결제금 결제", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             refundInfo: {
//               merchantUID: "2022000000",
//               impUID: "2022000000",
//               extraCharge: 5000,
//               refundProduct: [],
//               refundAmount: 10000,
//             },
//             immediatelyRefundInfo: {
//               refundAmountForProduct: 7000,
//               refundAmountForShipping: 3000,
//             },
//             pendingRefundInfo: {
//               pendingRefundAmountForProduct: 0,
//               returnShippingFee: 0,
//               pendingRefundAmountForShipping: 0,
//             },
//           },
//         });
//         const response = httpMocks.createResponse();
//         const refundSavePoint = {
//           rest_refund_amount: 10000,
//           products_price: 7000,
//           shippingfee: 3000,
//           return_shippingfee: 0,
//         };
//         userRepository.getAmount = jest.fn(() => refundSavePoint);
//         userController.payExtra = jest.fn(() => "202000");
//         userRepository.refund = jest.fn();
//         userRepository.requestRefund = jest.fn(() => 1);
  
//         await userController.refund(request, response);
  
//         expect(response.statusCode).toBe(200);
//       });
  
//       it("실패 : 환불하고자 하는 금액이 주문액보다 클 경우", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             refundInfo: {
//               merchantUID: "2022000000",
//               impUID: "2022000000",
//               extraCharge: 0,
//               refundProduct: [],
//               refundAmount: 15000,
//             },
//             immediatelyRefundInfo: {
//               refundAmountForProduct: 7000,
//               refundAmountForShipping: 3000,
//             },
//             pendingRefundInfo: {
//               pendingRefundAmountForProduct: 0,
//               returnShippingFee: 0,
//               pendingRefundAmountForShipping: 0,
//             },
//           },
//         });
//         const response = httpMocks.createResponse();
//         const refundSavePoint = {
//           rest_refund_amount: 10000,
//           products_price: 7000,
//           shippingfee: 3000,
//           return_shippingfee: 0,
//         };
//         userRepository.getAmount = jest.fn(() => refundSavePoint);
//         userRepository.refund = jest.fn();
//         userRepository.requestRefund = jest.fn(() => 1);
  
//         await userController.refund(request, response);
  
//         expect(response.statusCode).toBe(400);
//         expect(userRepository.refund).toHaveBeenCalledTimes(0);
//         expect(userRepository.requestRefund).toHaveBeenCalledTimes(0);
//       });
  
//       it("실패 : 추가금 결제시 merchantUID를 생성하지 못한 경우", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             refundInfo: {
//               merchantUID: "2022000000",
//               impUID: "2022000000",
//               extraCharge: 5000,
//               refundProduct: [],
//               refundAmount: 10000,
//             },
//             immediatelyRefundInfo: {
//               refundAmountForProduct: 7000,
//               refundAmountForShipping: 3000,
//             },
//             pendingRefundInfo: {
//               pendingRefundAmountForProduct: 0,
//               returnShippingFee: 0,
//               pendingRefundAmountForShipping: 0,
//             },
//           },
//         });
//         const response = httpMocks.createResponse();
//         const refundSavePoint = {
//           rest_refund_amount: 10000,
//           products_price: 7000,
//           shippingfee: 3000,
//           return_shippingfee: 0,
//         };
//         userRepository.getAmount = jest.fn(() => refundSavePoint);
//         userController.payExtra = jest.fn();
//         userRepository.refund = jest.fn();
//         userRepository.requestRefund = jest.fn(() => 1);
  
//         await userController.refund(request, response);
  
//         expect(response.statusCode).toBe(400);
//         expect(response._getJSONData().message).toBe("refund failed");
//         expect(userRepository.refund).toHaveBeenCalledTimes(0);
//         expect(userRepository.requestRefund).toHaveBeenCalledTimes(0);
//       });
  
//       it("실패 : catch error", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             refundInfo: {
//               merchantUID: "2022000000",
//               impUID: "2022000000",
//               extraCharge: 5000,
//               refundProduct: [],
//               refundAmount: 15000,
//             },
//             immediatelyRefundInfo: {
//               refundAmountForProduct: 7000,
//               refundAmountForShipping: 3000,
//             },
//             pendingRefundInfo: {
//               pendingRefundAmountForProduct: 0,
//               returnShippingFee: 0,
//               pendingRefundAmountForShipping: 0,
//             },
//           },
//         });
//         const response = httpMocks.createResponse();
//         userRepository.getAmount = jest.fn(() => {
//           throw new Error();
//         });
//         userController.payExtra = jest.fn();
//         userRepository.refund = jest.fn();
//         userRepository.requestRefund = jest.fn(() => 1);
  
//         await userController.refund(request, response);
  
//         expect(response.statusCode).toBe(400);
//       });
//     })

//     describe("cancelRefund", () => {
//       it("성공", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             refundInfo: {
//               merchantUID: "202000001",
//               newMerchantUID: "202000002",
//               refundId: 1,
//               refundProduct: [],
//             },
//             refundFailInfo: {
//               rest_refund_amount: 10000,
//               products_price: 7000,
//               shippingfee: 3000,
//               return_shippingfee: 0,
//               refund_amount: 0,
//               pending_refund: 0,
//             },
//           },
//         });
//         const response = httpMocks.createResponse();
//         userRepository.cancelRefund = jest.fn();
  
//         await userController.cancelRefund(request, response);
  
//         expect(response.statusCode).toBe(200);
//       });

//       it("실패 : catch error", async () => {
//         const request = httpMocks.createRequest({
//           body: {
//             refundInfo: {
//               merchantUID: "202000001",
//               newMerchantUID: "202000002",
//               refundId: 1,
//               refundProduct: [],
//             },
//             refundFailInfo: {
//               rest_refund_amount: 10000,
//               products_price: 7000,
//               shippingfee: 3000,
//               return_shippingfee: 0,
//               refund_amount: 0,
//               pending_refund: 0,
//             },
//           },
//         });
//         const response = httpMocks.createResponse();
//         userRepository.cancelRefund = jest.fn(() => {
//           throw new Error();
//         });
  
//         await userController.cancelRefund(request, response);
  
//         expect(response.statusCode).toBe(400);
//       });
//     })

//     describe("payExtra", ()=>{
//       it("성공", async() => {
//         const username = "user";
//         const extraCharge = 5000;
//         const paymentId = 1;
//         const updateMarchantUIDResult = {insertId:1};
//         userRepository.insertInfoForExtra = jest.fn(() => paymentId);
//         userRepository.updateMarchantUID = jest.fn(() => updateMarchantUIDResult);
//         userRepository.cancelPayment = jest.fn();
  
//         await userController.payExtra(username, extraCharge);
  
//         expect(userRepository.insertInfoForExtra).toHaveBeenCalledTimes(1);
//         expect(userRepository.updateMarchantUID).toHaveBeenCalledTimes(1);  
//         expect(userRepository.cancelPayment).toHaveBeenCalledTimes(0);  
//       })

//       it("실패 : paymentID 생성 실패", async() => {
//         const username = "user";
//         const extraCharge = 5000;
//         const paymentId = undefined;
//         userRepository.insertInfoForExtra = jest.fn(() => paymentId);
//         userRepository.updateMarchantUID = jest.fn(() => undefined);
//         userRepository.cancelPayment = jest.fn();
  
//         await userController.payExtra(username, extraCharge);
  
//         expect(userRepository.insertInfoForExtra).toHaveBeenCalledTimes(1);
//         expect(userRepository.updateMarchantUID).toHaveBeenCalledTimes(0);  
//         expect(userRepository.cancelPayment).toHaveBeenCalledTimes(0); 
//       })
      
//       it("실패 : merchantUID 업데이트 실패", async() => {
//         const username = "user";
//         const extraCharge = 5000;
//         const paymentId = 1;
//         userRepository.insertInfoForExtra = jest.fn(() => paymentId);
//         userRepository.updateMarchantUID = jest.fn(() => undefined);
//         userRepository.cancelPayment = jest.fn();
  
//         await userController.payExtra(username, extraCharge);
  
//         expect(userRepository.insertInfoForExtra).toHaveBeenCalledTimes(1);
//         expect(userRepository.updateMarchantUID).toHaveBeenCalledTimes(1);  
//         expect(userRepository.cancelPayment).toHaveBeenCalledTimes(1); 
//       })

//       it("실패 : catch error", async() => {
//         const username = "user";
//         const extraCharge = 5000;
//         const paymentId = 1;
//         userRepository.insertInfoForExtra = jest.fn(() =>  paymentId);
//         userRepository.updateMarchantUID = jest.fn(() => {throw new Error()});
//         userRepository.cancelPayment = jest.fn();
  
//         await userController.payExtra(username, extraCharge);
  
//         expect(userRepository.insertInfoForExtra).toHaveBeenCalledTimes(1);
//         expect(userRepository.updateMarchantUID).toHaveBeenCalledTimes(1);  
//         expect(userRepository.cancelPayment).toHaveBeenCalledTimes(1); 
//       })
//     })
//   });
});
