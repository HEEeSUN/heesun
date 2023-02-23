import axios from "axios";

export default class RefundController {
  constructor(userRepository) {
    this.user = userRepository;
  }

  /* 주문 내역 가져오기 */
  getOrder = async (req, res) => {
    try {
      const id = req.params.id;

      const order = await this.user.getOrder(id);
            
      if (!order) {
        return res.sendStatus(404);
      }

      const orderDetail = await this.user.getOrderDetailByOrderId(id);
      const refundAmountInfo = await this.user.getRefundInformation(order.merchantUID);

      const sendOrderInfo = {
        amount: order.amount,
        merchantUID:  order.merchantUID,
        imp_uid: order.imp_uid,
        paymentOption: order.paymentOption,
        products_price: order.products_price - refundAmountInfo.productsPrice,// payment products_price - refund&pending productsPrice
        shippingfee: order.shippingfee, //payment shippingfee
        orderer: order.orderer,
        phone: order.phone,
        address: order.address,
        extra_address: order.extra_address,
        return_shippingfee: refundAmountInfo.returnShippingFee// refund&pending returnShippingFee
      }

      res.status(200).json({ order: sendOrderInfo, orderDetail });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 환불시 클라이언트에서 받아온 값이 유효한지 확인 */
  validateRefundInformation = async (req, res, next) => {
    try {
      const NON_REFUNDABLE_PAYMENT_OPTION = 'cash';
      const NON_REFUNDABLE_STATUS = '입금대기중';
      const IMMEDIATE_REFUNDABLE_STATUS = '결제완료';
      const { refundInfo, immediatelyRefundInfo, pendingRefundInfo } = req.body;
      const { merchantUID, refundProduct } = refundInfo;

      if (!refundProduct) {
        return res.status(400).json({ code: "ERROR40001"});
      }

      const find = refundProduct.find(order => order.status === NON_REFUNDABLE_STATUS) 

      if (find) {
        return res.status(404).json({ code: "ERROR40002"});
      }

      // 받아온 상품 검증    
      let detailIds = '';
      refundProduct.forEach((product, index)=>{
        if (index !== refundProduct.length-1) {
          detailIds += product.detail_id + ','
        } else {
          detailIds += product.detail_id
        }
      })

      const orderDetail = await this.user.getOrderDetailByIds(detailIds)

      if (orderDetail.length !== refundProduct.length) {
        return res.status(400).json({ code: "ERROR40001"});
      }

      let refundAmountForProduct = 0;
      let pendingRefundAmountForProduct = 0;

      refundProduct.forEach((product, index) => {
        const find = orderDetail.find(
          (order)=> order.detail_id == product.detail_id 
          && order.status == product.status
          && order.price == product.price
          && order.quantity == product.quantity
        )

        if (!find) {
          return res.status(400).json({ code: "ERROR40001"});
        }

        if (find.status !== IMMEDIATE_REFUNDABLE_STATUS) {
          pendingRefundAmountForProduct += find.price * find.quantity
        } else {
          refundAmountForProduct += find.price * find.quantity
        }
      })

      // 환불액 검증
      const payment = await this.user.getPaymentInformation(merchantUID);
      const alreadyRefund = await this.user.getRefundInformation(merchantUID);

      if (payment.paymentOption === NON_REFUNDABLE_PAYMENT_OPTION) {
        pendingRefundAmountForProduct += refundAmountForProduct;
        refundAmountForProduct = 0;
      }

      const 클라이언트에서받아온상품환불액 = immediatelyRefundInfo.refundAmountForProduct
      const 클라이언트에서받은배송비환불액 = immediatelyRefundInfo.refundAmountForShipping
      const 클라이언트에서받아온상품환불액확인후 = pendingRefundInfo.pendingRefundAmountForProduct
      const 클라이언트에서받은배송비환불액확인후 = pendingRefundInfo.pendingRefundAmountForShipping

      if (
        클라이언트에서받아온상품환불액 > refundAmountForProduct 
        || 클라이언트에서받아온상품환불액확인후 > pendingRefundAmountForProduct
        || 클라이언트에서받아온상품환불액 + 클라이언트에서받아온상품환불액확인후 
            > payment.products_price - alreadyRefund.productsPrice  
        || 클라이언트에서받은배송비환불액+클라이언트에서받은배송비환불액확인후
            > payment.shippingfee - alreadyRefund.shippingFee
      ) {
       return res.status(400).json({ code: "ERROR40001"});
      }

      req.paymentOption = payment.paymentOption;

      next();
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  }

  /* 추가 결제시 결제 정보 저장 */
  payment = async (req, res, next) => {
    let paymentId;
    
    try { 
      const username = req.username;
      const { extraCharge } = req.body.refundInfo;

      paymentId = await this.user.insertInfoForPayment(
        username,
        extraCharge
      );

      if (!paymentId) {
        return res.status(400).json({ code: "ERROR40003"});
      }

      const paymentDate = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      )
        .toISOString()
        .substr(0, 10);
      const paymentInfoDate = paymentDate.split("-").join("");
      const paymentInfoId = String(paymentId).padStart(8, "0");
      const newMerchantUID = paymentInfoDate.concat("-", paymentInfoId);

      const result = await this.user.updateMarchantUID(paymentId, newMerchantUID);

      if (!result) {
        return res.status(400).json({ code: "ERROR40003"});
      }

      req.newMerchantUID = newMerchantUID;

      return next();
    } catch (error) {
      await this.user.deletePaymentByPaymentId(paymentId);
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 환불 */
  refund = async (req, res, next) => {
    try { 
      const NON_REFUNDABLE_PAYMENT_OPTION = 'cash';
      const IMMEDIATE_REFUNDABLE_STATUS = '결제완료';
      const { newMerchantUID, paymentOption } = req;
      const { refundInfo, immediatelyRefundInfo, pendingRefundInfo } = req.body;
      const { merchantUID, impUID, extraCharge, prePayment, refundProduct, refundAmount } =
        refundInfo;
      let product = []; // 배송이 되지 않은 것 (환불완료)
      let pendingRefundProduct = []; // 배송이 진행된 것 || 현금결제건 (환불요청)

      const { refundAmountForProduct, refundAmountForShipping } =
        immediatelyRefundInfo;

      const {
        pendingRefundAmountForProduct,
        returnShippingFee,
        pendingRefundAmountForShipping,
      } = pendingRefundInfo;

      // 결제방법이 현금인 경우 무조건 pendin
      //아닌경우 배송중인것과 결제완료인것 구분하여 환불
      if (paymentOption !== NON_REFUNDABLE_PAYMENT_OPTION) {
        product = refundProduct.filter(
          (product) =>
            product.status === IMMEDIATE_REFUNDABLE_STATUS
        );
        // const product2 = refundProduct.filter(product=>product.status!=='결제완료');
        pendingRefundProduct = refundProduct.filter(
          (product) =>
            product.status !== IMMEDIATE_REFUNDABLE_STATUS
        );
      } else {
        pendingRefundProduct = refundProduct;
      }
      
      let refundId;
      let pendingRefundId;

      if (refundAmountForProduct > 0) {
        refundId = await this.user.refund(
          merchantUID, 
          refundAmountForProduct,
          refundAmountForShipping,
          newMerchantUID,
          product
        )

        if (!refundId) {
          return res.status(400).json({ code: "ERROR40004"});
        }
      }

      if (pendingRefundAmountForProduct > 0) {
        pendingRefundId = await this.user.pendingRefund(
          merchantUID, 
          pendingRefundAmountForProduct,
          pendingRefundAmountForShipping,
          returnShippingFee,
          prePayment,
          extraCharge,
          newMerchantUID,
          pendingRefundProduct
        );

        if (!pendingRefundId) {
          if (refundId) {
            this.user.deleteRefundId(refundId);
          }
          return res.status(400).json({ code: "ERROR40004"});
        }
      }  

      if (refundAmount > 0) {
        req.refundId = refundId;
        req.pendingRefundId = pendingRefundId;
        return next();
      }

      return res.status(200).json({ newMerchantUID });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };
  
  /* 환불액이 있는 경우 결제대행사에 환불 요청 */
  requestRefund = async (req, res, next) => {
    try {
      const { imp_uid, refundAmount } = req.body.refundInfo;

      await this.requestRefundToIMP(imp_uid, refundAmount);

      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return next();
    }
  }

  /* 결제대행사에 환불 요청 */
  requestRefundToIMP = async (imp_uid, amount) => {
    try {
      const getToken = await axios({
        url: process.env.IMP_GET_TOKEN_URL,
        method: "post",
        headers: { "Content-Type": "application/json" },
        data: {
          imp_key: process.env.IMP_KEY,
          imp_secret: process.env.IMP_SECRET,
        },
      });
  
      const { access_token } = getToken.data.response;

      const getCancelData = await axios({
        url: process.env.IMP_REFUND_URL,
        method: "post",
        headers: {
          "Content-Type": "application/json",
          Authorization: access_token, // 아임포트 서버로부터 발급받은 엑세스 토큰
        },
        data: {
          imp_uid, // imp_uid를 환불 `unique key`로 입력
          amount // 가맹점 클라이언트로부터 받은 환불금액
        },
      });
  
      const { response } = getCancelData.data; // 환불 결과

      if (!response) {
        // 환불 실패시 response 는 null 로 오게됨
        throw new Error();
      }
  
      return true;
    } catch (error) {
      console.log(error);
      throw new Error(error);
    }
  };

  /* 추가결제액이 있는 경우 결제 완료 및 환불 요청 완료 처리 */
  completePayment = async (req, res) => {
    try {
      const { imp_uid, merchant_uid } = req.body;

      await this.user.updatePayment(imp_uid, merchant_uid);

      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 추가결제액이 있는 경우 결제 실패 */
  failedPayment= async (req, res, next)  => {
    try {
      const { newMerchantUID } = req.query;

      const { refundId } = await this.user.getRefundId(newMerchantUID);
      const { pendingRefundId } = await this.user.getPendingRefundId(newMerchantUID);

      if (!refundId || !pendingRefundId) { 
        return res.sendStatus(404);
      }

      this.user.failedPayment(newMerchantUID);

      req.refundId = refundId
      req.pendingRefundId = pendingRefundId

      return next();
    } catch (error) {
      console.log(error)
      return res.sendStatus(400);
    }
  }

  /* 환불 실패시 환불시 수정된 데이터 복구  */
  failedRefund = async (req, res) => {
    try {
      const { refundId, pendingRefundId } = req;

      const tempStatus = await this.user.getTempDeliverystatus(refundId, pendingRefundId);

      this.user.failedRefund(refundId, pendingRefundId, tempStatus);

      return res.sendStatus(400);
    } catch (error) {
      console.log(error)
      return res.sendStatus(400);
    }
  }
  
  /* 주문취소시 클라이언트에서 받아온 값이 유효한지 확인 */
  validateCancelInformation = async (req, res, next) => {
    try {
      const CANCELABLE_STATUS = '입금대기중';
      const orderId = req.params.id;
      const paymentId = await this.user.findPaymentId(orderId);

      if (!paymentId) {
        return res.sendStatus(400);
      }

      const result = await this.user.getOrderDetailByOrderId(orderId);

      const find = result.find(order => order.status !== CANCELABLE_STATUS);

      if (find) {
        return res.status(400).json({ code: "ERROR40005"});
      }

      req.paymentId = paymentId;
      req.orderId = orderId;

      next();
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  }

  /* 주문취소 */
  cancelOrder = async (req, res) => {
    try {
      const{ orderId, paymentId } = req;
      
      await this.user.cancelOrder(paymentId, orderId);

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  // admin
  /* 환불 요청 목록 가져오기 */
  getPendingRefundList = async (req, res) => {
    try {
      let { page } = req.query;

      if (isNaN(Number(page))) return res.sendStatus(404);

      const amountOfSendData = 5;
      let orderPageLength = 1;
      let prevPage = (page - 1) * amountOfSendData;

      const refundList = await this.user.getPendingRefundList(
        amountOfSendData,
        prevPage
      );

      if (refundList.length < 1) {
        return res.status(200).json({ refundList: [], orderPageLength });
      }

      if (refundList[0].fullCount % amountOfSendData > 0) {
        orderPageLength = Math.ceil(refundList[0].fullCount / amountOfSendData);
      } else {
        orderPageLength = refundList[0].fullCount / amountOfSendData;
      }

      res.status(200).json({ refundList, orderPageLength });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 특정 환불 요청건 가져오기 */
  getPendingRefundDetail = async (req, res) => {
    try {
      const refundId = req.params.id;
      
      const refundDetail = await this.user.getPendingRefundDetail(refundId);
      const paymentInfo =  await this.user.getRefundDetailPayInfo(refundId);

      if (refundDetail.length < 1 || !paymentInfo) {
        return res.sendStatus(404);
      }
      
      res.status(200).json({ refundDetail, paymentInfo });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  }

  /* 환불 */
  refundByAdmin = async (req, res, next) => {
    try {
      const { refundInfo } = req.body;
      const {
        pendingRefundId,
        merchantUID,
        imp_uid,
        detailId,
        realRefundProducts,
        realRefundShippingFee,
        realReturnShippingFee,
        refundAmount,
        setOff,
        extraPay
      } = refundInfo;
      let refundId;

      const pendingRefund =  await this.user.getAPendingRefund(pendingRefundId);

      if (!pendingRefund) {
        return res.status(400).json({ code: "ERROR40001"});
      }

      const orderDetails = await this.user.getPendingRefundDetail(pendingRefundId);

      let productsPrice = 0;
      detailId.forEach((id, index) => {
        const find = orderDetails.find((detail)=> detail.detail_id == id)

        if (!find) {
          return res.status(400).json({ code: "ERROR40001"});
        }

        productsPrice += find.price * find.quantity
      })

      if (
        imp_uid !== pendingRefund.imp_uid
        || productsPrice !== realRefundProducts
        || (realRefundProducts === pendingRefund.productsPrice 
            && (realRefundShippingFee !== pendingRefund.shippingFee
            || realReturnShippingFee !== pendingRefund.returnShippingFee
            || setOff !== pendingRefund.setOff
            || extraPay !== pendingRefund.extraPay)
          )
        || realRefundShippingFee > pendingRefund.shippingFee
        || realReturnShippingFee > pendingRefund.returnShippingFee
        || setOff > pendingRefund.setOff
        || extraPay > pendingRefund.extraPay
      ) {
        return res.status(400).json({ code: "ERROR40001"});
      }

      if (pendingRefund.productsPrice === realRefundProducts) {
        req.all = true;
        refundId = await this.user.fullRefund(pendingRefundId, pendingRefund, detailId);
      } else {
        req.all = false;
        refundId = await this.user.partialRefund(pendingRefundId, pendingRefund, detailId, refundInfo);
      }

      req.refundId = refundId;
      req.pendingRefund = pendingRefund;

      if (imp_uid && refundAmount > 0) {
        return next();
      }

      return res.sendStatus(200)
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  }

  /* 환불 실패 */
  failedRefundByAdmin = async (req, res) => {
    try {
      const { all, refundId, pendingRefund } = req;
      const { refundInfo } = req.body;
      const { pendingRefundId, detailId } = refundInfo;

      if (all) {
        this.user.faileFullRefund(refundId, pendingRefund, detailId)
      } else {
        this.user.failedPartialRefund(refundId, pendingRefundId, detailId)
      }

      return res.sendStatus(400);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  }
}
