import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";

export default class UserController {
  constructor(userRepository, requestRefundToIMP) {
    this.user = userRepository;
    this.requestRefundToIMP = requestRefundToIMP;
  }

  /* 회원가입 (idCheck 값이 true로 들어올 경우 중복체크만 해서 return함) */
  signup = async (req, res) => {
    try {
      const { idCheck } = req.body;

      if (idCheck) {
        const { username } = req.body;

        const result = await this.user.findByUsername(username);

        if (result) {
          return res.status(409).json({ code: "ERROR00003" });
        } else {
          return res.sendStatus(200);
        }
      } else {
        const { signupInfo } = req.body;
        const {
          username,
          password,
          name,
          email,
          phone,
          address = "",
          extraAddress = "",
        } = signupInfo;

        const hashed = await bcrypt.hash(
          password,
          parseInt(process.env.BCRYPT_SALT_ROUNDS)
        );

        await this.user.createUser(
          username,
          hashed,
          name,
          email,
          phone,
          address,
          extraAddress
        );

        res.sendStatus(201);
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 로그아웃 */
  logout = async (req, res) => {
    return res.clearCookie('token', {domain : '.heesun.shop'}).send();
  };

  /* 로그인 */
  login = async (req, res) => {
    try {
      const { userInfo } = req.body;
      const user = await this.user.findByUsername(userInfo.username);

      if (!user) {
        return res.status(401).json({ code: "ERROR00002" });
      }

      const isValidPassword = await bcrypt.compare(
        userInfo.password,
        user.password
      );

      if (!isValidPassword) {
        return res.status(401).json({ code: "ERROR00002" });
      }

      const token = this.createJwtToken(user.id);
      this.setToken(res, token);
      const quantity = await this.cartSummary(user.id);
      res
        .status(200)
        .json({ username: user.username, quantityInCart: quantity });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* kakao로그인 */
  kakaoLogin = async (req, res) => {
    try {
      const { kakao_account } = req.body;
      const user = await this.user.findByUsername(kakao_account);
      let userUniqueId;

      if (!user) {
        const newUser = await this.user.createUserKakao(kakao_account);
        userUniqueId = newUser;
      } else {
        userUniqueId = user.id;
      }

      const token = this.createJwtToken(userUniqueId);
      this.setToken(res, token);
      const quantity = await this.cartSummary(userUniqueId);
      res
        .status(200)
        .json({ username: kakao_account, quantityInCart: quantity });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* jwt토큰 생성 */
  createJwtToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES, //ms
    });
  };

  /* 쿠키에 토큰 설정 */
  setToken = (res, token) => {
    const options = {
      httpOnly: true,
      domain : '.heesun.shop', 
      // maxAge: process.env.JWT_EXPIRES * 1000, //ms
      // sameSite: "none",
      // secure: true,
    };

    res.cookie("token", token, options);
  };

  /* 로그인, 카트 담기, 카트안 상품 삭제시 카트안의 총 수량을 체크 */
  cartSummary = async (id) => {
    const result = await this.user.getQuantityInCart(id).catch((err) => {
      return false;
    });
    return result.quantity;
  };

  /* 사용자 id, pw 찾아서 메일로 전송 */
  searchUserInfo = async (req, res) => {
    try {
      const { userInfo } = req.body;
      const { id, pw } = req.query;

      let transporter = nodemailer.createTransport({
        service: process.env.MAILER_SERVICE,
        auth: {
          user: process.env.MAILER_USERNAME,
          pass: process.env.MAILER_PASSWORD,
        },
      });

      if (id) {
        const { name, email } = userInfo;

        const result = await this.user.findByNameAndEmail(name, email);

        if (!result) {
          return res.status(402).json({ code: "ERROR00004" });
        }

        const mailOptions = {
          from: process.env.MAILER_USERNAME,
          to: email,
          subject: "[heesun] 아이디 찾기 결과 발송해드립니다.",
          html: `<h4>아이디 발송</h4>
                  <div>
                    <p>${result.name}님의 아이디는 아래와 같습니다.</p>
                    ${result.username}
                  </div>`,
        };
        const info = await transporter.sendMail(mailOptions);

        if (!info) {
          return res.sendStatus(403);
        }
      }

      if (pw) {
        const { id, email } = userInfo;

        const result = await this.user.findByUsernameAndEmail(id, email);

        if (!result) {
          return res.status(400).json({ code: "ERROR00004" });
        }

        const random = Math.random().toString(36).substring(2, 12);
        const hashed = await bcrypt.hash(
          random,
          parseInt(process.env.BCRYPT_SALT_ROUNDS)
        );

        const mailOptions = {
          from: process.env.MAILER_USERNAME,
          to: email,
          subject: `[heesun] ${id}님 임시 비밀번호 발송해드립니다.`,
          html: `<h4>임시비밀번호 발송</h4>
                  <div>
                    <p>아래 임시비밀번호로 로그인하여 새로운 비밀번호로 변경하여 주세요.</p>
                    ${random}
                  </div>`,
        };
        const info = await transporter.sendMail(mailOptions);

        if (!info) {
          return res.sendStatus(400);
        }

        this.user.updatePassword(id, hashed);
      }
      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 장바구니 상품 삭제 */
  removeProductInCART = async (req, res) => {
    try {
      const { id } = req.query;
      await this.user.deleteProduct(id);

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 사용자 정보 불러오기 (my page의 my info 및 상품 주문시 사용자 정보 불러올 경우) */
  getMyInfo = async (req, res) => {
    try {
      const { username } = req;
      const user = await this.user.getUserInfo(username);

      const userInfo = {
        username,
        ...user,
      };

      res.status(200).json({ userInfo });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 사용자 정보 수정 */
  modifyUserInfo = async (req, res) => {
    try {
      const { userInfo } = req.body;
      const { password } = userInfo;

      if (!password) {
        await this.user.modifyUserInfo(userInfo);
      } else {
        const hashed = await bcrypt.hash(
          password,
          parseInt(process.env.BCRYPT_SALT_ROUNDS)
        );

        await this.user.modifyUserInfoAndPw(userInfo, hashed);
      }

      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 환불 요청할 주문 정보 불러오기 */
  getOrder = async (req, res) => {
    try {
      const id = req.params.id;

      const order = await this.user.getRefundOrder(id);
      const orderDetail = await this.user.getOrderDetail(id);

      if (!order) {
        return res.sendStatus(404);
      }

      res.status(200).json({ order, orderDetail });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 결제 성공, 결제대행에서 받아온 고유 id db에 저장 */
  paycomplete = async (req, res) => {
    try {
      const { imp_uid, merchant_uid } = req.body;

      await this.user.updatePayment(imp_uid, merchant_uid);

      const quantityInCart = await this.cartSummary(req.userId);

      res.status(200).json({ quantityInCart });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 결제 실패, 주문시 차감한 재고 다시 복구 */
  cancelPayment = async (req, res, next) => {
    try {
      const { merchantUID, newArray } = req.body;
      req.productArray = newArray;

      await this.user.increaseStock(newArray);
      await this.user.deletePayment(merchantUID);

      next();
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 주문 정보 (배송현황) 상세보기 */
  deliveryStatus = async (req, res) => {
    try {
      const { id } = req.query;
      const status = await this.user.getDeliveryStatus(id);

      if (status.length < 1) {
        // id 값이 현재 존재하지 않는 id 일 경우
        return res.status(400).json({ code: "ERROR20001" });
      }

      res.status(200).json({ status });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 리뷰 작성 */
  writeReview = async (req, res) => {
    try {
      const username = req.username;
      const { product_code, text, detail_id } = req.body;

      const reviewId = await this.user.writeReview(
        detail_id,
        username,
        product_code,
        text
      );

      res.status(201).json({ reviewId });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 새로고침 */
  refreshAuth = async (req, res) => {
    try {
      const { userId, username } = req;
      let quantityInCart;

      if (userId) {
        quantityInCart = await this.cartSummary(userId);
      }

      res.status(200).json({ username, quantityInCart });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 장바구니에 저장된 상품 가져오기 */
  cart = async (req, res) => {
    try {
      const today = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      ).toISOString();
      const products = await this.user.getInCart(req.userId, today);
      let adjustmentProduct = [];

      if (products.length < 1) {
        return res.status(200).json({ products, adjustmentProduct });
      }

      //장바구니에 담겨있던 상품의 재고가 장바구니 수량보다 적을 경우 재고에 맞춰 조정
      for (let i = 0; i < products.length; i++) {
        if (products[i].stock < products[i].quantity) {
          products[i].quantity = products[i].stock;
          adjustmentProduct.push({
            name: products[i].name,
            quantity: products[i].stock,
          });
          await this.user.adjustmentQuantityInCart(
            products[i].quantity,
            products[i].cart_id
          );
        }
      }

      res.status(200).json({ products, adjustmentProduct });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 내가 작성한 or 작성 가능한 리뷰 목록 가져오기 */
  getMyReview = async (req, res) => {
    try {
      const username = req.username;
      const { status, page } = req.query;

      if (isNaN(Number(page))) return res.sendStatus(404);

      const amountOfSendData = 5; //한번에 보낼 리뷰의 개수
      let currPage = page * amountOfSendData;
      let prevPage = (page - 1) * amountOfSendData;
      let hasmore = 0;
      let newReviews;

      if (status === "done") {
        newReviews = await this.user.getMyReview(
          username,
          amountOfSendData,
          prevPage
        );
      } else {
        newReviews = await this.user.getWritableReview(
          username,
          amountOfSendData,
          prevPage
        );
      }

      if (!newReviews[0]) {
        return res.status(200).json({ newReviews, hasmore });
      }

      currPage < newReviews[0].full_count ? (hasmore = 1) : (hasmore = 0);

      res.status(200).json({ newReviews, hasmore });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 내가 작성한 or 내가 댓글을 작성한 게시글 목록 가져오기 */
  getMyPost = async (req, res) => {
    try {
      let { post, comment, page } = req.query;

      if (isNaN(Number(page))) return res.sendStatus(404);

      const username = req.username;
      const amountOfSendData = 15; // 한번에 보낼 게시글의 개수
      let currPage = page * amountOfSendData;
      let prevPage = (page - 1) * amountOfSendData;
      let newPosts;
      let hasmore = 0;

      if (post) {
        newPosts = await this.user.getMyPost(
          username,
          amountOfSendData,
          prevPage
        );
      } else if (comment) {
        newPosts = await this.user.getMyComment(
          username,
          amountOfSendData,
          prevPage
        );
      }

      if (newPosts.length < 1) {
        return res.status(200).json({ newPosts, hasmore });
      }

      currPage < newPosts[0].full_count ? (hasmore = 1) : (hasmore = 0);

      res.status(200).json({ newPosts, hasmore });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 장바구니 담기 */
  addCart = async (req, res) => {
    try {
      const userId = req.userId;
      const { productArray } = req; // 결제 취소시 addcart실행하여 다시 장바구니에 담으려고..

      if (productArray) {
        productArray.map((product, key) => {
          this.user.addInCart(
            product.product_code,
            product.option_number,
            product.quantity,
            userId
          );
        });

        return res.sendStatus(204);
      }

      const { product_code, option_number, quantity } = req.body;

      let product = await this.user.getByProduct_code(product_code);

      const option = product.find(
        (product) => product.option_number === option_number
      );

      if (!product || !option) {
        return res.status(409).json({ code: "ERROR10003" });
      }

      const result = await this.duplicateCheck(
        userId,
        product_code,
        option_number
      );

      if (result) {
        await this.user.increaseQuantity(
          product_code,
          option_number,
          quantity,
          userId
        );
      } else {
        await this.user.addInCart(
          product_code,
          option_number,
          quantity,
          userId
        );
      }

      const quantityInCart = await this.cartSummary(userId);

      res.status(201).json({ quantityInCart });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 장바구니 담기 실행시, 이미 장바구니에 있는 상품인지 확인 */
  duplicateCheck = async (userId, product_code, option_number) => {
    const result = await this.user
      .checkInCart(userId, product_code, option_number)
      .catch((err) => {
        return false;
      });
    return result;
  };

  /* 고객 주문 목록 불러오기 */
  info = async (req, res) => {
    try {
      const username = req.username;
      const amountOfSendData = 10; // 한번에 보낼 데이터의 양
      let { page, date1, date2 } = req.query;

      if (isNaN(Number(page))) return res.sendStatus(404);

      let prevPage = 0;
      let hasmore = 0;
      let orderDetailList = [];

      if (page > 1) {
        prevPage = page - 1;
      }

      prevPage *= amountOfSendData;
      page *= amountOfSendData;

      const orderList = await this.user.getOrder(
        username,
        date1,
        date2,
        amountOfSendData,
        prevPage
      );

      if (orderList.length < 1) {
        return res
          .status(200)
          .json({ username, orderList, orderDetailList, hasmore });
      }

      for (let i = 0; i < orderList.length; i++) {
        const orderDetail = await this.user.getOrderDetail(
          orderList[i].order_id
        );
        orderDetailList = orderDetailList.concat(orderDetail);
      }

      orderList[0].full_count < page ? (hasmore = 0) : (hasmore = 1);

      res.status(200).json({ username, orderList, orderDetailList, hasmore });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 결제 정보 저장 */
  payment = async (req, res, next) => {
    let paymentId;

    try {
      const username = req.username;
      const { amount, shippingFee, productPrice, newArray, paymentOption } = req.body;

      const stock = await this.checkStock(newArray);

      if (stock) {
        return res.status(409).json({ code: "ERROR30002" });
      }

      paymentId = await this.user.insertInfoForPayment(
        username,
        amount,
        shippingFee,
        productPrice,
        paymentOption
      );

      if (!paymentId) {
        return res.status(409).json({ code: "ERROR30001" });
      }

      const paymentDate = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10);
      const paymentInfoDate = paymentDate.split("-").join("");
      const paymentInfoId = String(paymentId).padStart(8, "0");
      const merchantUID = paymentInfoDate.concat("-", paymentInfoId);

      const result = await this.user.updateMarchantUID("newOrder", paymentId, merchantUID);

      if (!result) {
        await this.user.deletePaymentByPaymentId(paymentId);
        return res.status(409).json({ code: "ERROR30001" });
      }

      req.paymentId = paymentId;
      req.merchantUID = merchantUID;

      next();

      // upgradeClass(username);

      // res.status(200).json({ merchantUID, orderId });
    } catch (error) {
      if (paymentId) {
        await this.user.deletePaymentByPaymentId(paymentId);
      }
      console.log(error);
      return res.sendStatus(400);
    }
  };

  cancelOrder = async (req, res) => {
    try {
      const orderId = req.params.id;
      const paymentId = await this.user.findPaymentId(orderId);

      if (!paymentId) {
        return res.sendStatus(400);
      }

      await this.user.cancelOrder(paymentId, orderId);

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 환불 요청, 즉시 환불 or 관리자 확인후 환불 가능하게 요청 건 db 저장 */
  refund = async (req, res) => {
    let refundId;
    let refundInformation;
    let savePoint;

    try {
      const { refundInfo, immediatelyRefundInfo, pendingRefundInfo } = req.body;
      const { merchantUID, impUID, extraCharge, prePayment, refundProduct, refundAmount } =
        refundInfo;
      refundInformation = refundInfo;
      let newMerchantUID;
      let product = []; // 배송이 되지 않은 것 (환불완료)
      let pendingRefundProduct = []; // 배송이 진행된 것 || 현금결제건 (환불요청)

      savePoint = await this.user.getSavePointBeforeRefund(merchantUID, refundId);

      const {
        rest_refund_amount,
        products_price,
        shippingfee,
        return_shippingfee,
      } = savePoint;

      const { refundAmountForProduct, refundAmountForShipping } =
        immediatelyRefundInfo;
      const {
        pendingRefundAmountForProduct,
        returnShippingFee,
        pendingRefundAmountForShipping,
      } = pendingRefundInfo;

      if (
        refundAmount > rest_refund_amount ||
        refundAmountForProduct + pendingRefundAmountForProduct >
          products_price ||
        refundAmountForShipping + pendingRefundAmountForShipping > shippingfee
      ) {
        // 클라이언트에서 임의로 환불액을 조정하여 실제 환불액보다 크게 환불을 요구한 경우
        return res.status(400).json({ code: "환불 실패" });
      }

      const restOfProductPrice = products_price - refundAmountForProduct;
      const restOfShippingFee = shippingfee - refundAmountForShipping;
      const restOfreturnShippingFee = return_shippingfee + returnShippingFee;
      const restOfRefundAmount =
        rest_refund_amount - (refundAmountForProduct + refundAmountForShipping);

      if (savePoint.paymentOption !== "cash") {
        product = refundProduct.filter(
          (product) =>
            product.status === "결제완료" || product.status === "입금대기중"
        );
        // const product2 = refundProduct.filter(product=>product.status!=='결제완료');
        pendingRefundProduct = refundProduct.filter(
          (product) =>
            product.status !== "결제완료" && product.status !== "입금대기중"
        );
      } else {
        pendingRefundProduct = refundProduct;
      }

      // refundId = await this.user.getPendingRefundById(merchantUID);

      // if (refundId) {
      //   //기존 펜딩에 추가
      // } else {

      // }

      // `SELECT refundId
      // FROM refund
      // WHERE merchantUID=? AND refundProductPrice !=0`, [merchantUID]
      

      refundId = await this.user.refund(
        merchantUID,
        impUID,
        pendingRefundProduct,
        pendingRefundAmountForProduct,
        returnShippingFee,
        pendingRefundAmountForShipping,
        extraCharge + prePayment,
        restOfProductPrice,
        restOfShippingFee,
        restOfRefundAmount,
        restOfreturnShippingFee,
        refundAmountForProduct + refundAmountForShipping,
        product
      );

      refundInformation = {
        ...refundInformation,
        refundId
      }

      if (extraCharge > 0) {
        const paymentDate = new Date(
          Date.now() - new Date().getTimezoneOffset() * 60000
        )
          .toISOString()
          .substr(0, 10);
  
        const paymentInfoDate = paymentDate.split("-").join("");
        const paymentInfoId = String(refundId).padStart(8, "0");
        newMerchantUID = paymentInfoDate.concat("-", paymentInfoId);

        this.user.updateMarchantUID("refund", refundId, newMerchantUID);
      }

      return res.status(200).json({ newMerchantUID, refundId, savePoint });
    } catch (error) {
      console.log(error);
      if (refundId) {
        this.returnToStateBeforeExecuteRefund(refundInformation, savePoint)
      }
      return res.sendStatus(400);
    }
  };

  returnToStateBeforeExecuteRefund = async (refundInfo, savePoint) => {
    try {
      const { merchantUID, refundId, refundProduct } = refundInfo;
      const {
        rest_refund_amount,
        products_price,
        shippingfee,
        return_shippingfee,
        refund_amount,
        pending_refund,
      } = savePoint;
  
      await this.user.cancelRefund(
        refundId,
        refundProduct,
        pending_refund,
        products_price,
        shippingfee,
        rest_refund_amount,
        return_shippingfee,
        refund_amount,
        merchantUID
      );
      
      return;
    } catch (error) {
      console.log(error);
    }
  }
  /* IMP에 실제 환불 요청 */
  requestRefund = async (req, res) => {
    try {
      const { imp_uid, refundAmount } = req.body;

      await this.requestRefundToIMP(imp_uid, refundAmount);

      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400)
    }
  }

  /* 환불 실패시 */
  requestToCancelRefund = async (req, res) => {
    try {
      const { refundInfo, savePoint } = req.body;

      await this.returnToStateBeforeExecuteRefund(refundInfo, savePoint);

      return res.sendStatus(200);
    } catch (error) {
      console.log(error)
      return res.sendStatus(400);
    }
  }  

  /* 주문 정보 저장 */
  order = async (req, res) => {
    const { paymentOption, newArray, orderer, phone, address, extra_address } =
      req.body;
    const paymentId = req.paymentId;
    const merchantUID = req.merchantUID;
    const username = req.username;

    let orderId;

    try {
      orderId = await this.user.order(
        username,
        paymentId,
        orderer,
        phone,
        address,
        extra_address
      );

      if (!orderId) {
        await this.user.deletePaymentByPaymentId(paymentId);
        return res.status(409).json({ code: "ERROR30001" });
      }

      let status = "";

      if (paymentOption === "cash") {
        status = "입금대기중";
      } else {
        status = "결제완료";
      }

      const result = await this.user.orderDetail(status, orderId, newArray);

      if (!result) {
        await this.user.deletePaymentByPaymentId(paymentId);
        return res.status(409).json({ code: "ERROR30001" });
      }

      res.status(200).json({ merchantUID, orderId });
    } catch (error) {
      // orders가 payment 테이블의 payment_id를 참조 (casecade)
      // payment_id만 지워주면 됨
      console.log(error);
      this.user.deletePaymentByPaymentId(paymentId);
      return res.sendStatus(400);
    }
  };

  // 결제 전 재고체크
  checkStock = async (newArray) => {
    for (let i = 0; i < newArray.length; i++) {
      const result = await this.user
        .checkStock(newArray[i].product_code, newArray[i].option_number)
        .catch((error) => {
          return true;
        });

      if (!result.stock) {
        return true;
      }
    }
  };

  /* 주문시 고객의 총 주문가격에 따라 등급 조정 (아직 적용전) */
  upgradeClass = async (username) => {
    try {
      let price = 0;
      let orderDetailList = [];
      const orderList = await this.user.getOrder(username);

      for (let i = 0; i < orderList.length; i++) {
        const orderDetail = await this.user.getOrderDetail(
          orderList[i].order_id
        );
        orderDetailList = orderDetailList.concat(orderDetail);
      }

      orderDetailList.map((orderDetail, key) => {
        price += orderDetail.price;
      });

      if (orderList.length >= 10 && price >= 1000) {
        this.user.upgradeClass(username, "gold");
      } else if (orderList.length >= 30 && price >= 3000) {
        this.user.upgradeClass(username, "vip");
      }
    } catch (error) {
      console.log(error);
    }
  };
}
