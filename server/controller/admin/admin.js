import fs from "fs";
import path from "path";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export default class AdminController {
  constructor(adminRepository, requestRefundToIMP) {
    this.admin = adminRepository;
    this.requestRefundToIMP = requestRefundToIMP;
  }

  /* 새로고침 */
  refresh = async (req, res) => {
    try {
      const { userId, username } = req;
      let menuList = [];

      if (userId && username) {
        menuList = await this.admin.getMenuList(userId);
      }

      return res.status(200).json({ username, menuList });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* dashboard에 표시될 데이터 */
  getDashboardData = async (req, res) => {
    try {
      let order = 0;
      let refund = 0;

      // new chatting 갯수
      const chattingList = await this.admin.getAllChattings();

      let message = 0;
      for (let i = 0; i < chattingList.length; i++) {
        const result = await this.admin.getNoReadMessage(
          chattingList[i].room_name
        );
        message += result.number;
      }

      // 결제완료, 환불요청 주문건
      const orderAndRefund = await this.admin.getNewOrderAndNewRefund();

      const newOrder = orderAndRefund.find(
        (order) => order.status === "결제완료"
      );
      const newRefund = orderAndRefund.find(
        (order) => order.status === "반품및취소요청"
      );

      if (newOrder) {
        order = newOrder.number;
      }

      if (newRefund) {
        refund = newRefund.number;
      }

      //chart 6개월 판매액
      const year = new Date().getFullYear();
      const month = new Date().getMonth() + 1;
      const endDate = String(year) + String(month).padStart(2, "0");
      let startMonth = month - 6 + 1;
      let startYear = year;
      if (startMonth < 1) {
        startYear -= 1;
        startMonth += 12;
      }
      const startDate = String(startYear) + String(startMonth).padStart(2, "0");

      const salesOf6month = await this.admin.get6month(startDate, endDate);
      let revenueOfCurrentMonth = 0;
      let currentMonth = salesOf6month.find((sale) => sale.month == endDate);

      if (currentMonth) {
        revenueOfCurrentMonth = currentMonth.revenue;
      }

      // const salesQuantity = await this.admin.getSalesQuantity("202204");

      res.status(200).json({
        message,
        order,
        refund,
        sales: revenueOfCurrentMonth,
        salesOf6month,
      });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 로그인 */
  login = async (req, res) => {
    try {
      const { admin, password } = req.body;

      const user = await this.admin.findByUsername(admin);

      if (!user) {
        return res.status(401).json({ code: "ERROR00002" });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ code: "ERROR00002" });
      }

      const menuList = await this.admin.getMenuList(user.id);

      const token = this.createJwtToken(user.id);
      this.setToken(res, token);

      console.log(menuList, user.username, user.id);
      res.status(200).json({ menuList, username: user.username });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 로그아웃 */
  logout = async (req, res) => {
    return res.clearCookie('token', {domain : '.heesun.shop'}).send();
  };

  /* admin 계정 생성 */
  create = async (req, res) => {
    try {
      const { admin, password, menuList } = req.body;
      const result = await this.admin.findByUsername(admin);

      if (result) {
        return res.status(409).json({ code: "ERROR00003" });
      }

      const hashed = await bcrypt.hash(
        password,
        parseInt(process.env.BCRYPT_SALT_ROUNDS)
      );

      const admin_id = await this.admin.createAdmin(admin, hashed);
      this.admin.grantAuthority(admin_id, menuList);

      res.sendStatus(201);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 상품등록시 상품 코드 중복 조회 */
  checkProductCode = async (req, res) => {
    try {
      const { product_code } = req.body;

      const result = await this.admin.findByProductCode(product_code);

      if (result) {
        return res.status(409).json({ code: "ERROR60001" });
      }

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 상품 업데이트 */
  updateProduct = async (req, res) => {
    try {
      const code = req.params.id;
      const { name, price, cost, description, imageSrc } = req.body;

      const optionList = JSON.parse(req.body.optionList);
      let imgFileSrc = imageSrc;

      const product = await this.admin.findByProductCode(code);

      if (!product) {
        return res.status(409).json({ code: "ERROR60002" });
      }

      if (req.file) {
        imgFileSrc = "/" + req.file.key;
      }

      await this.admin.updateProduct(
        code,
        name,
        price,
        cost,
        description,
        imgFileSrc,
        optionList
      );

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 상품 삭제 */
  deleteProduct = async (req, res) => {
    try {
      const code = req.params.id;
      const result = await this.admin.findByProductCode(code);

      if (!result) {
        return res.status(405).json({ code: "ERROR60002" });
      }

      await this.admin.deleteProduct(code);

      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 상품 추가 */
  addProduct = async (req, res) => {
    try {
      const products = JSON.parse(req.body.products);
      const { productCode, name, cost, price, description, options } = products;

      let imgFileSrc = "";

      if (req.file) {
        imgFileSrc = "/" + req.file.key;
      }

      await this.admin.addProduct(
        productCode,
        name,
        price,
        cost,
        imgFileSrc,
        description,
        options
      );

      res.sendStatus(201);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 상품 상세보기시 옵션 목록 가져오기 */
  getProduct = async (req, res) => {
    try {
      const code = req.params.id;
      const result = await this.admin.getProductOptionByCode(code);

      if (!result) {
        return res.status(405).json({ code: "ERROR60002" });
      }

      res.status(200).json({ options1: result, options2: result });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 세일 상품 등록시 상품 목록 가져오기 */
  getAllProductsWithOption  = async (req, res) => {
    try {
      const { category, search, page } = req.query;

      if (isNaN(Number(page))) return res.sendStatus(404);

      const amountOfSendData = 10;
      let productPageLength = 1;
      // let currPage = page * amountOfSendData;
      let prevPage = (page - 1) * amountOfSendData;
      let productList;

      if (!category) {
        if (!search) {
          //카테고리X, 검색어X => 전체보기
          productList = await this.admin.getAllProductWithOption(
            amountOfSendData,
            prevPage
          );
        } else {
          //카테고리X, 검색어O => 이름과 코드에서 검색어와 일치하는 것 보기
          productList = await this.admin.getProductWithOptionByTxt(
            search,
            amountOfSendData,
            prevPage
          ); //이름에서 검색
        }
      } else {
        //카테고리o, 검색어O => 카테고리에서 검색어와 일치하는 것 보기
        productList = await this.admin.getProductWithOptionByCatAndTxt(
          category,
          search,
          amountOfSendData,
          prevPage
        ); //id=카테고리 여서 카테고리 안에서 검색
      }

      if (!productList[0]) {
        return res.status(200).json({ productList: [], productPageLength });
      }

      if (productList[0].full_count % amountOfSendData > 0) {
        productPageLength = Math.ceil(
          productList[0].full_count / amountOfSendData
        );
      } else {
        productPageLength = productList[0].full_count / amountOfSendData;
      }

      res.status(200).json({ productList, productPageLength });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  }

  /* 상품 수정 메뉴 선택시 상품 목록 가져오기 */
  getProducts = async (req, res) => {
    try {
      const { category, search, page } = req.query;

      if (isNaN(Number(page))) return res.sendStatus(404);

      const amountOfSendData = 10;
      let productPageLength = 1;
      // let currPage = page * amountOfSendData;
      let prevPage = (page - 1) * amountOfSendData;
      let productList;

      if (!category) {
        if (!search) {
          //카테고리X, 검색어X => 전체보기
          productList = await this.admin.getAllProduct(
            amountOfSendData,
            prevPage
          );
        } else {
          //카테고리X, 검색어O => 이름과 코드에서 검색어와 일치하는 것 보기
          productList = await this.admin.getProductByTxt(
            search,
            amountOfSendData,
            prevPage
          ); //이름에서 검색
        }
      } else {
        //카테고리o, 검색어O => 카테고리에서 검색어와 일치하는 것 보기
        productList = await this.admin.getProductByCatAndTxt(
          category,
          search,
          amountOfSendData,
          prevPage
        ); //id=카테고리 여서 카테고리 안에서 검색
      }
      
      if (!productList[0]) {
        return res.status(200).json({ productList: [], productPageLength });
      }

      if (productList[0].full_count % amountOfSendData > 0) {
        productPageLength = Math.ceil(
          productList[0].full_count / amountOfSendData
        );
      } else {
        productPageLength = productList[0].full_count / amountOfSendData;
      }

      res.status(200).json({ productList, productPageLength });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 할인 상품 추가 */
  addSaleProduct = async (req, res) => {
    try {
      const { productList, saleTime } = req.body;

      if (!saleTime) {
        await this.admin.addSaleProduct(productList);
      } else {
        const { saleStartTime, saleEndTime } = saleTime;
        await this.admin.addSaleProductAndTIme(
          productList,
          saleStartTime,
          saleEndTime
        );
      }

      res.sendStatus(201);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 할인 상품 삭제 */
  deleteSaleProduct = async (req, res) => {
    try {
      const timeId = req.params.id;

      if (isNaN(parseInt(timeId))) {
        await this.admin.deleteSaleProduct();
      } else {
        await this.admin.deleteTimeSale(timeId);
      }
      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 할인 상품 업데이트 */
  updateSaleProduct = async (req, res) => {
    try {
      const { timeId, changeList, deleteList } = req.body;
      let productList;

      await this.admin.updateSaleProduct(changeList, deleteList);

      if (timeId) {
        productList = await this.admin.getSaleProductsAfterUpdate(timeId);
      } else {
        productList = await this.admin.getSaleProductsAfterUpdate();
      }

      res.status(200).json({ productList });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 할인 적용된 상품가져오기 */
  getSaleProducts = async (req, res) => {
    try {
      let saleGroup = [];
      const timeTable = await this.admin.getSaleTimeTable();
      const saleProduct = await this.admin.getSaleProducts();

      if (saleProduct.length === 0) {
        return res.status(200).json({ saleGroup });
      }

      timeTable.map((time) => {
        const group = saleProduct.filter(
          (item) => item.time_id === time.time_id
        );

        if (group[0]) {
          saleGroup = [...saleGroup, group];
        }
      });

      const group = saleProduct.filter((item) => !item.time_id);

      if (group[0]) {
        saleGroup = [...saleGroup, group];
      }

      res.status(200).json({ saleGroup });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 주문 정보(배송현황) 상세보기 */
  deliveryStatus = async (req, res) => {
    try {
      const detailId = req.params.id;
      const status = await this.admin.getDeliveryStatus(detailId);

      if (status.length === 0) {
        return res.status(405).json({ code: "ERROR70002" });
      }

      res.status(200).json({ status });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 주문 상태 변경 */
  updateStatus = async (req, res) => {
    try {
      const detail_id = req.params.id;
      const { state } = req.body;
      let after14days = "";

      if (state === "배송완료") {
        // datetime 형식의 컬럼에 new Date()을 이용하지 않고 변형하여 시간을 저장하였더니
        // 저장은 제대로 되는데 데이터를 불러올 때 -9시간을 하여 불러와짐.
        // ex)저장은 2022-03-30 또는 2022-03-30 00:00:00 으로 저장되어도 불러올 때 2022-03-29 15:00:00 이 되어짐
        // const after14days = new Date(Date.now() + (86400000 * 14)); 이경우 정확히 14일후로 제대로 저장되어지고 불려와짐
        //refunddate = String(after14days.getFullYear())+'-'+String(after14days.getMonth()+1)+'-'+String(after14days.getDate())+' 00:00:00'; 이거안됨
        //after14days = new Date(Date.now() - (new Date().getTimezoneOffset() * 60000) + (86400000 * 14)).toISOString().substr(0,10); 이거도안됨
        after14days = new Date(
          Date.now() - new Date().getTimezoneOffset() * 60000 + 86400000 * 14
        )
          .toISOString()
          .substr(0, 10);
        after14days += " 00:00:00";
      }

      await this.admin.updateOrderStatus(detail_id, state, after14days);

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 특정 주문 상태의 주문건 가져오기 */
  getPendingRefundList = async (req, res) => {
    try {
      let { page } = req.query;

      if (isNaN(Number(page))) return res.sendStatus(404);

      const amountOfSendData = 5;
      let refundList;
      let orderPageLength;
      let prevPage = (page - 1) * amountOfSendData;
      let fullCount;

      let orderList;
      orderList = await this.admin.getPendingRefundList(
        amountOfSendData,
        prevPage
      );

      if (orderList.length > 0) {
        fullCount = orderList[0].full_count;
      }

      if (orderList.length !== 0) {
        if (orderList.length < amountOfSendData) {
          refundList = await this.admin.getPendingRefund(
            orderList[orderList.length - 1].refundId,
            orderList[0].refundId
          );
        } else {
          refundList = await this.admin.getPendingRefund(
            orderList[4].refundId,
            orderList[0].refundId
          );
        }
      }

        let newArray = [];

        for (let i = 0; i < orderList.length; i++) {
          const filter = refundList.filter(
            (order) => order.refundId === orderList[i].refundId
          );

          if (filter[0]) {
            newArray = [...newArray, filter];
          }
        }

      refundList = orderList;
      orderList = newArray;

      if (orderList.length < 1) {
        return res.status(200).json({ orderList, orderPageLength, refundList });
      }

      if (fullCount % amountOfSendData > 0) {
        orderPageLength = Math.ceil(fullCount / amountOfSendData);
      } else {
        orderPageLength = fullCount / amountOfSendData;
      }

      res.status(200).json({ orderList, orderPageLength, refundList });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 주문 목록 가져오기 */
  getOrders = async (req, res) => {
    try {
      let { page, date1, date2, searchWord, status, category } = req.query;

      if (isNaN(Number(page))) return res.sendStatus(404);

      const amountOfSendData = 10;
      let orderPageLength = 1;
      let refundNum = 0;
      let prevPage = (page - 1) * amountOfSendData;
      let orderList;

      if (!category) {
        if (!searchWord) {
          orderList = await this.admin.getOrderAll(
            date1,
            date2,
            amountOfSendData,
            prevPage
          );
        } else {
          orderList = await this.admin.getOrderBySearchWord(
            date1,
            date2,
            searchWord,
            amountOfSendData,
            prevPage
          );
        }
      } else {
        if (category === "state") {
          if (status) {
            orderList = await this.admin.getOrderByStatus(
              date1,
              date2,
              status,
              searchWord,
              amountOfSendData,
              prevPage
            );
          } else {
            orderList = await this.admin.getOrderBySearchWord(
              date1,
              date2,
              searchWord,
              amountOfSendData,
              prevPage
            );
          }
        } else {
          orderList = await this.admin.getOrderByWordAndCategory(
            date1,
            date2,
            category,
            searchWord,
            amountOfSendData,
            prevPage
          );
        }
      }

      if (!orderList[0]) {
        return res.status(200).json({ orderList, orderPageLength, refundNum });
      }

      if (orderList[0].full_count % amountOfSendData > 0) {
        orderPageLength = Math.ceil(orderList[0].full_count / amountOfSendData);
      } else {
        orderPageLength = orderList[0].full_count / amountOfSendData;
      }

      // 결제완료, 환불요청 주문건
      const orderAndRefund = await this.admin.getNewOrderAndNewRefund();

      const newRefund = orderAndRefund.find(
        (order) => order.status === "반품및취소요청"
      );

      if (newRefund) {
        refundNum = newRefund.number;
      }

      res.status(200).json({ orderList, orderPageLength, refundNum });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* JWT 생성 */
  createJwtToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES,
    });
  };

  /* 쿠키에 토큰 설정 */
  setToken = (res, token) => {
    const options = {
      httpOnly: true,
      domain : '.heesun.shop', 
      // maxAge: process.env.JWT_EXPIRES * 1000,
      // sameSite: 'none',
      // secure: true
    };

    res.cookie("token", token, options);
  };

  // /* 환불 요청건에 대해 실제 환불 진행 */
  // refund = async (req, res) => {
  //   try {
  //     const { savePoint, refundInfo } = req.body;

  //     console.log(refundInfo);

  //     const {
  //       merchantUID,
  //       impUID,
  //       refundId,
  //       all,
  //       detailId,
  //       realRefundProducts,
  //       realRefundShippingFee,
  //       realReturnShippingFee,
  //     } = refundInfo;

  //     await this.admin.refund(
  //       all,
  //       detailId,
  //       realRefundProducts,
  //       realRefundShippingFee,
  //       merchantUID,
  //       refundId
  //     );

  //     if (realRefundProducts + realRefundShippingFee < 0) {
  //       //환불금 0
  //       return res.sendStatus(200);
  //     }

  //     // const result = await requestRefund(impUID, (realRefundProducts+realRefundShippingFee));

  //     res.sendStatus(200);
  //   } catch (error) {
  //     console.log(error);
  //     return res.sendStatus(400);
  //   }
  // };

    /* 환불 요청건에 대해 실제 환불 진행 */
  refund = async (req, res, next) => {
    try {
      const { refundInfo } = req.body;

      const {
        paymentOption,
        merchantUID,
        impUID,
        refundId,
        all,
        detailId,
        realRefundProducts,
        realRefundShippingFee,
        realReturnShippingFee,
        reflection,
        realRefundAmount
      } = refundInfo;

      const {
        beforePaymentInfo,
        beforeOrderDetailList, 
        beforeRefundInfo
      } = await this.admin.getSavePointBeforeRefund(merchantUID, refundId);
      const savePoint = {
        beforePaymentInfo, 
        beforeOrderDetailList, 
        beforeRefundInfo
      }

      await this.admin.refund(
        all,
        detailId,
        realRefundProducts,
        realRefundShippingFee,
        merchantUID,
        refundId,
        reflection,
      );

      if (realRefundAmount === 0 || paymentOption === "cash") {
        return res.sendStatus(200);
      }

      req.body.merchantUID = merchantUID;
      req.body.impUID = impUID;
      req.body.refundAmount = realRefundAmount;
      req.body.savePoint = savePoint;

      next();
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };
  
  requestRefund = async (req,res) => {
    const {merchantUID, impUID, refundAmount, savePoint} = req.body;

    try {
      await this.requestRefundToIMP(impUID, refundAmount);

      return res.sendStatus(200);
    } catch (error) {
      console.log(error);
      this.refundFail(merchantUID, savePoint);
      return res.sendStatus(400);
    }
  }

  refundFail = async (merchantUID, savePoint) => {
    /*
    type BeforePaymentInfo = {
      products_price: number,
      shippingfee: number,
      rest_refund_amount: number,
      refund_amount: number,
      pending_refund: number,
      return_shippingfee: number
    }
    type BeforeOrderDetailList = {
      detail_id: number, 
      status: string, 
      refundStatus: string 
    }
    type BeforeRefundInfo = {
      reflection: boolean,
      refundProductPrice: number, 
      refundShippingFee: number
    }
    type SavePoint = {
      beforePaymentInfo: BeforePaymentInfo,
      beforeOrderDetailList: BeforeOrderDetailList[],
      beforeRefundInfo: BeforeRefundInfo
    }
    */

    try {
      const {
        beforePaymentInfo,
        beforeOrderDetailList, 
        beforeRefundInfo
      } = savePoint
  
      await this.admin.refundFail(merchantUID, beforePaymentInfo, beforeOrderDetailList, beforeRefundInfo)
      
      return
    } catch (error) {
      console.log(error)
    }
    }


}
