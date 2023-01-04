export default class AdminOrderController {
  constructor(adminRepository, requestRefundToIMP) {
    this.db = adminRepository;
    this.requestRefundToIMP = requestRefundToIMP;
  }

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
          orderList = await this.db.getOrderAll(
            date1,
            date2,
            amountOfSendData,
            prevPage
          );
        } else {
          orderList = await this.db.getOrderBySearchWord(
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
            orderList = await this.db.getOrderByStatus(
              date1,
              date2,
              status,
              searchWord,
              amountOfSendData,
              prevPage
            );
          } else {
            orderList = await this.db.getOrderBySearchWord(
              date1,
              date2,
              searchWord,
              amountOfSendData,
              prevPage
            );
          }
        } else {
          orderList = await this.db.getOrderByWordAndCategory(
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
      const orderAndRefund = await this.db.getNewOrderAndNewRefund();

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
      orderList = await this.db.getPendingRefundList(
        amountOfSendData,
        prevPage
      );

      if (orderList.length > 0) {
        fullCount = orderList[0].full_count;
      }

      if (orderList.length !== 0) {
        if (orderList.length < amountOfSendData) {
          refundList = await this.db.getPendingRefund(
            orderList[orderList.length - 1].refundId,
            orderList[0].refundId
          );
        } else {
          refundList = await this.db.getPendingRefund(
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
      } = await this.db.getSavePointBeforeRefund(merchantUID, refundId);
      const savePoint = {
        beforePaymentInfo, 
        beforeOrderDetailList, 
        beforeRefundInfo
      }

      await this.db.refund(
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
  
      await this.db.refundFail(merchantUID, beforePaymentInfo, beforeOrderDetailList, beforeRefundInfo)
      
      return
    } catch (error) {
      console.log(error)
    }
  }

  /* 주문 정보(배송현황) 상세보기 */
  deliveryStatus = async (req, res) => {
    try {
      const detailId = req.params.id;
      const status = await this.db.getDeliveryStatus(detailId);

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

      await this.db.updateOrderStatus(detail_id, state, after14days);

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };


}