export default class UserOrderController {
  #db; 

  constructor(dataRepository) {
    this.#db = dataRepository;
  }

  /* 사용자 정보 불러오기 */
  getMyInfo = async (req, res) => {
    try {
      const { username } = req;
      const user = await this.#db.getUserInfo(username);

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

  /* order 실행전 클라이언트에서 받아온 값들이 유효한지 확인 */
  checkOrderInfo = async (req, res, next) => {
    try {
      const PAYMENT_OPTION = ['html5_inicis', 'cash', 'kakaopay']
      const { amount, shippingFee, productPrice, paymentOption, newArray } = req.body;

      const find = PAYMENT_OPTION.find(option => option === paymentOption);
      
      if (!find) {
        throw new Error('ERROR30004');
      }

      const date = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      ).toISOString();

      let results = [];
      for(let i=0; i<newArray.length; i++) {
        const result = await this.#db.checkStockBeforeOrder(date, newArray[i]);

        if (!result) {
          throw new Error('ERROR30004');
        }

        results[i] = result;
      }

      if (results.length !== newArray.length) {
        throw new Error('ERROR30004')
      }

      newArray.forEach((product, index)=>{
        if (product.quantity > results[index].stock) {
          throw new Error('ERROR30002')
        }
      })

      let price = 0;
      newArray.forEach((product, index) => {
        if (product.sale_price != null && results[index].sale_price != null) {
          if (product.sale_price < results[index].sale_price) {
            throw new Error('ERROR30003')
          }

          price += (product.sale_price * product.quantity);
        } else {
          if (product.price < results[index].price) {
            throw new Error('ERROR30003')
          }

          price += (product.price * product.quantity);
        }
      })

      if (productPrice !== price || price + shippingFee !== amount ) {
        throw new Error('ERROR30004');
      }

      next();
    } catch (error) {
      console.log(error)
      return res.status(400).json({ code: error.message })
    }
  }

  /* 결제 정보 저장 */
  payment = async (req, res, next) => {
    let paymentId;

    try {
      const username = req.username;
      const { amount, shippingFee, productPrice, paymentOption } = req.body;

      paymentId = await this.#db.insertInfoForPayment(
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

      const result = await this.#db.updateMarchantUID(paymentId, merchantUID);

      if (!result) {
        await this.#db.deletePaymentByPaymentId(paymentId);
        return res.status(409).json({ code: "ERROR30001" });
      }

      req.paymentId = paymentId;
      req.merchantUID = merchantUID;

      next();
    } catch (error) {
      if (paymentId) {
        await this.#db.deletePaymentByPaymentId(paymentId);
      }
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 주문 정보 저장 */
  order = async (req, res) => {
    const { paymentOption, newArray, orderer, phone, address, extra_address } =
      req.body;
    const paymentId = req.paymentId;
    const merchantUID = req.merchantUID;
    const username = req.username;

    let orderId;

    try {
      orderId = await this.#db.order(
        username,
        paymentId,
        orderer,
        phone,
        address,
        extra_address
      );

      if (!orderId) {
        this.#db.deletePaymentByPaymentId(paymentId);
        return res.status(409).json({ code: "ERROR30001" });
      }

      let status = "";

      if (paymentOption === "cash") {
        status = "입금대기중";
      } else {
        status = "결제완료";
      }

      const result = await this.#db.orderDetail(status, orderId, newArray);

      if (!result) {
        this.#db.deletePaymentByPaymentId(paymentId);
        return res.status(409).json({ code: "ERROR30001" });
      }

      res.status(200).json({ merchantUID, orderId });
    } catch (error) {
      // orders가 payment 테이블의 payment_id를 참조 (casecade)
      // payment_id만 지워주면 됨
      console.log(error);
      this.#db.deletePaymentByPaymentId(paymentId);
      return res.sendStatus(400);
    }
  };

  /* 결제 성공, 결제대행에서 받아온 고유 id db에 저장 */
  completePayment = async (req, res) => {
    try {
      const { impUID, merchantUID } = req.body;

      this.#db.updatePayment(impUID, merchantUID);

      const quantityInCart = await this.cartSummary(req.userId);

      res.status(200).json({ quantityInCart });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 결제 실패, 주문시 차감한 재고 다시 복구 */
  failedPayment = async (req, res, next) => {
    try {
      const { merchantUID } = req.body;

      const payInfo = await this.#db.getPaymentIdAndOrderId(merchantUID);

      if (!payInfo) {
        return res.sendStatus(404);
      }
      
      const orderDetailList = await this.#db.getOrderDetail(payInfo.order_id);

      const products = await this.#db.increaseStock(orderDetailList);

      await this.#db.deletePaymentByMerchantUID(merchantUID);

      req.productArray = products;

      next();
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

      productArray.forEach((product, key) => {
        this.#db.addInCart(
          product.product_code,
          product.option_number,
          product.quantity,
          userId
        );
      });

      return res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* payment와 order를 거쳐 저장된 주문 정보를 반환 (결제 성공시 클라이언트에 보여주기 위함) */
  getLatestOrder = async (req, res) => {
    try {
      const merchantUID = req.params.id;

      const orders = await this.#db.getOrderId(merchantUID);
      const order = await this.#db.getRefundOrder(orders.order_id);
      const orderDetail = await this.#db.getOrderDetail(orders.order_id);

      if (!order) {
        return res.sendStatus(404);
      }

      res.status(200).json({ order, orderDetail });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  }

  /* 로그인, 카트 담기, 카트안 상품 삭제시 카트안의 총 수량을 체크 */
  cartSummary = async (id) => {
    const result = await this.#db.getQuantityInCart(id).catch((err) => {
      return false;
    });
    return result.quantity;
  };

  /* 주문시 고객의 총 주문가격에 따라 등급 조정 (아직 적용전) */
  upgradeClass = async (username) => {
    try {
      let price = 0;
      let orderDetailList = [];
      const orderList = await this.#db.getOrder(username);

      for (let i = 0; i < orderList.length; i++) {
        const orderDetail = await this.#db.getOrderDetail(
          orderList[i].order_id
        );
        orderDetailList = orderDetailList.concat(orderDetail);
      }

      orderDetailList.map((orderDetail, key) => {
        price += orderDetail.price;
      });

      if (orderList.length >= 10 && price >= 1000) {
        this.#db.upgradeClass(username, "gold");
      } else if (orderList.length >= 30 && price >= 3000) {
        this.#db.upgradeClass(username, "vip");
      }
    } catch (error) {
      console.log(error);
    }
  };
}
