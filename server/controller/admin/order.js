export default class AdminOrderController {
  constructor(adminRepository) {
    this.db = adminRepository;
  }

  /* Id로 접근하는 것들에 대해 유효한 값인지 사전에 검사 */
  checkOrderId = async (req, res, next) => {
    const id = req.params.id;

    const existence = await this.db.checkExistOrder(id);

    if (!existence) {
      return res.sendStatus(404)
    }

    next();
  }

  /* 주문 목록 가져오기 */
  getOrders = async (req, res) => {
    try {
      let { page, date1, date2, searchWord, status, category } = req.query;
      
      let dateArr = [];
      dateArr[dateArr.length] = new Date(date1);
      dateArr[dateArr.length] = new Date(date2);

      dateArr.forEach((date) => {
        if (date == 'Invalid Date') {
          throw new Error('날짜 형식을 확인해주세요')
        }
      })

      if (dateArr[0] > dateArr[1]) {
        throw new Error('검색 시작 날짜가 검색 종료 날짜보다 클 수 없습니다')
      }

      if (isNaN(Number(page))) return res.sendStatus(404);

      const amountOfSendData = 10;
      let orderPageLength = 1;
      let refundNum = 0;
      let prevPage = (page - 1) * amountOfSendData;
      let orderList;

      if (!category) {
        if (!searchWord) {
          orderList = await this.db.getOrderAll(
            `${date1} 00:00:00`,
            `${date2} 23:59:59`,
            // date1,
            // date2,
            amountOfSendData,
            prevPage
          );
        } else {
          orderList = await this.db.getOrderBySearchWord(
            `${date1} 00:00:00`,
            `${date2} 23:59:59`,
            // date1,
            // date2,
            searchWord,
            amountOfSendData,
            prevPage
          );
        }
      } else {
        if (category === "state") {
          if (status) {
            orderList = await this.db.getOrderByStatus(
              `${date1} 00:00:00`,
              `${date2} 23:59:59`,
              // date1,
              // date2,
              status,
              searchWord,
              amountOfSendData,
              prevPage
            );
          } else {
            orderList = await this.db.getOrderBySearchWord(
              `${date1} 00:00:00`,
              `${date2} 23:59:59`,
              // date1,
              // date2,
              searchWord,
              amountOfSendData,
              prevPage
            );
          }
        } else {
          orderList = await this.db.getOrderByWordAndCategory(
            `${date1} 00:00:00`,
            `${date2} 23:59:59`,
            // date1,
            // date2,
            category,
            searchWord,
            amountOfSendData,
            prevPage
          );
        }
      }

      // 결제완료, 환불요청 주문건
      const orderAndRefund = await this.db.getNewOrderAndNewRefund();

      const newRefund = orderAndRefund.find(
        (order) => order.status === "반품및취소요청"
      );

      if (newRefund) {
        refundNum = newRefund.number;
      }

      if (!orderList[0]) {
        return res.status(200).json({ orderList, orderPageLength, refundNum });
      }

      if (orderList[0].full_count % amountOfSendData > 0) {
        orderPageLength = Math.ceil(orderList[0].full_count / amountOfSendData);
      } else {
        orderPageLength = orderList[0].full_count / amountOfSendData;
      }

      res.status(200).json({ orderList, orderPageLength, refundNum });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 주문 정보(배송현황) 상세보기 */
  deliveryStatus = async (req, res) => {
    try {
      const detailId = req.params.id;
      const status = await this.db.getDeliveryStatus(detailId);

      if (status.length === 0) {
        return res.status(404).json({ code: "ERROR70002" });
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
      const ORDER_STATUS = [
        "입금대기중",
        "결제완료",
        "배송중",
        "배송완료",
        "리뷰작성완료",
        "반품및취소요청",
        "반품및취소완료",
      ];
      const detail_id = req.params.id;
      const { state } = req.body;
      let after14days = "";

      const find = ORDER_STATUS.find(status => status === state);

      if (!find) {
        throw new Error();
      }
      
      if (state === "배송완료") {
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
