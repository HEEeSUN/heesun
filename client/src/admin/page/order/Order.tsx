import { useEffect, useState } from "react";
import "./order.css";
import { AdminOrderService, ReturnDate, Orders } from "../../model/order.model";
import Page from "../../components/Page";
import SearchForm from "../../components/SearchForm";
import Refund from "./components/Refund";
import StatusModal from "./components/StatusModal";
import OrderList from "./components/OrderList";
import Popup from "../../components/Popup";

type Props = {
  adminOrderService: AdminOrderService;
  refundNum?: number;
};

function Order({ adminOrderService, refundNum }: Props) {
  let [orderList, setOrderList] = useState<Orders[]>([]);
  let [order, setOrder] = useState<Orders>();
  let [searchCategory, setSearchCategory] = useState<string>("");
  let [status, setStatus] = useState<string>("");
  let [searchWord, setSearchWord] = useState<string>("");
  let [staticSearchWord, setStaticSearchWord] = useState<string>("");
  let [showStatusModal, setShowStatusModal] = useState<boolean>(false);
  let [changeStatus, setChangeStatus] = useState<boolean>(false);
  let [deliveryDetailId, setDeliveryDetailId] = useState<number>(0);
  let [pageNumber, setPageNumber] = useState<number>(1);
  let [prevDate, setPrevDate] = useState<string>("");
  let [date, setDate] = useState<string>("");
  let [skip, setSkip] = useState<boolean>(true);
  let [pageLength, setPageLength] = useState<number>(0);
  let [change, setChange] = useState<boolean>(false);
  let [extraCategory, setExtraCategory] = useState<boolean>(false);
  let [showRefund, setShowRefund] = useState<boolean>(false);

  const refundCmp = <Refund adminOrderService={adminOrderService} />;

  const categoryArr1 = [
    { value: "", name: "전체보기", id: "default" },
    { value: "orderer", name: "주문자명" },
    { value: "product_name", name: "상품명" },
    { value: "state", name: "주문현황", id: "extra" },
    { value: "merchantUID", name: "주문번호" },
  ];

  const categoryArr2 = [
    "입금대기중",
    "결제완료",
    "배송중",
    "배송완료",
    "리뷰작성완료",
    "반품및취소요청",
    "반품및취소완료",
  ];

  const categoryHandleing1 = async (value: string, id?: string) => {
    setSearchCategory(value);

    id === "extra" ? setExtraCategory(true) : setExtraCategory(false);
  };

  const categoryHandleing2 = async (value: string) => {
    setStatus(value);
  };

  const searchHandleing = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (searchWord && searchWord.length > 50) {
      alert("검색어를 확인해 주세요");
      return;
    }

    setStaticSearchWord(searchWord);
    setPageNumber(0);
  };

  const stateArray = [
    "주문취소",
    "입금대기중",
    "결제완료",
    "배송중",
    "배송완료",
    "리뷰작성완료",
    "반품및취소요청",
    "반품및취소완료",
  ];

  const offset = new Date().getTimezoneOffset() * 60000;
  const curr = new Date(Date.now() - offset);
  const today = curr.toISOString().substr(0, 10);
  curr.setFullYear(curr.getFullYear() - 1);
  curr.setDate(curr.getDate() + 1);
  const lastyear = curr.toISOString().substr(0, 10);

  /* 처음 실행시 검색 달력 날짜 설정 */
  const defaultDate = async () => {
    setDate(today);
    setPrevDate(lastyear);
  };

  /* 검색 날짜 및 시간 설정 */
  const searchDate = async (): Promise<ReturnDate> => {
    let time = new Date();
    const hour = String(time.getHours());
    const minute = String(time.getMinutes());
    const second = String(time.getSeconds());
    const now = ` ${hour}:${minute}:${second}`;

    let startDate = lastyear + " 00:00:00";
    let endDate = today + now;

    if (date && prevDate) {
      startDate = prevDate + " 00:00:00";
      if (date < today) {
        endDate = date + " 23:59:59";
      } else {
        endDate = date + now;
      }
    }

    return { startDate, endDate };
  };
  /* 주문 목록 가져오기 */
  const getOrderList = async (getAllOrder: boolean = false) => {
    let text: string = "";

    if (getAllOrder) {
      setSearchWord("");
      setStaticSearchWord("");
    } else {
      text = staticSearchWord;
    }

    try {
      const { startDate, endDate } = await searchDate();
      const { orderList, orderPageLength } =
        await adminOrderService.getOrderListByWord(
          pageNumber,
          startDate,
          endDate,
          searchCategory,
          status,
          text
        );

      setPageLength(orderPageLength);
      setChange(true);
      setOrderList(orderList);
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    if (deliveryDetailId) {
      const find: Orders | undefined = orderList.find(
        (order) => order.detail_id === deliveryDetailId
      );

      if (find) {
        setOrder(find);
        setShowStatusModal(true);
      }
    } else {
      setShowStatusModal(false);
    }
  }, [deliveryDetailId]);

  useEffect(() => {
    if (!changeStatus) {
      return
    }

    getOrderList();
    setChangeStatus(false);
  }, [changeStatus]);

  useEffect(() => {
    if (pageNumber === 0) {
      setPageNumber(1);
    } else {
      getOrderList();
    }
  }, [pageNumber]);

  useEffect(() => {
    if (skip) {
      setSkip(false);
    } else {
      if (!searchCategory) {
        setStatus("");
        getOrderList(true);
      }
    }
  }, [searchCategory]);

  useEffect(() => {
    defaultDate();
  }, []);

  return (
    <div className="order-list">
      <div>
        {refundNum ? (
          <div className="refund-notice" onClick={() => setShowRefund(true)}>
            {refundNum}건의 환불 요청이 있습니다. 확인하시려면 클릭해주세요.
          </div>
        ) : null}
      </div>
      {showRefund && (
        <Popup
          children={refundCmp}
          title={"환불 요청 목록"}
          setPopup={setShowRefund}
        />
      )}
      <div className="order-search">
        <div className="search">
          <input
            type="date"
            className="search-date"
            defaultValue={prevDate}
            onChange={(e) => setPrevDate(e.target.value)}
          ></input>
          <div className="search-date-tilde">~</div>
          <input
            type="date"
            className="search-date"
            defaultValue={date}
            onChange={(e) => setDate(e.target.value)}
          ></input>
          <SearchForm
            categoryArr1={categoryArr1}
            categoryArr2={categoryArr2}
            extraCategory={extraCategory}
            searchWord={searchWord}
            setSearchWord={setSearchWord}
            searchHandleing={searchHandleing}
            categoryHandleing1={categoryHandleing1}
            categoryHandleing2={categoryHandleing2}
          />
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th className="order-date">주문일자</th>
            <th className="order-num">주문번호</th>
            <th className="order-name">
              <p>상품코드</p>
              <p>상품명</p>
            </th>
            <th className="order-quantity">수량</th>
            <th className="order-orderer">주문자명</th>
            <th className="order-delivery-status">배송현황</th>
            <th className="order-detail">상세보기</th>
            <th className="order-refund">환불</th>
          </tr>
        </thead>
        <tbody>
          {orderList.length < 1 ? (
            <td colSpan={8}>검색 조건과 일치하는 주문이 없습니다</td>
          ) : (
            orderList.map((order) => {
              return (
                <OrderList
                  order={order}
                  setDeliveryDetailId={setDeliveryDetailId}
                />
              );
            })
          )}
        </tbody>
      </table>
      <Page
        amountOfPerPage={5}
        change={change}
        setChange={setChange}
        pageLength={pageLength}
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
      />
      {order && showStatusModal && (
        <StatusModal
          adminOrderService={adminOrderService}
          order={order}
          setChangeStatus={setChangeStatus}
          stateArray={stateArray}
          setShowStatusModal={setShowStatusModal}
          deliveryDetailId={deliveryDetailId}
          setDeliveryDetailId={setDeliveryDetailId}
        />
      )}
    </div>
  );
}

export default Order;
