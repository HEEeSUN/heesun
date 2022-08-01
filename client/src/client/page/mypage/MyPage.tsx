import { useEffect, useState, useCallback, useRef } from "react";
import { useHistory } from "react-router-dom";
import "./mypage.css";
import {
  MemberService,
  OrderList,
  OrderDetailList,
} from "../../model/member.model";
import Button from "../../components/Button";
import OrderDetail from "./components/OrderDetail";
import DateSearchBar from "./components/DateSearchBar";

type Props = {
  memberService: MemberService;
};

function MyPage(props: Props) {
  let [skip, setSkip] = useState<boolean>(true);
  let [username, setUsername] = useState<string>("");
  let [pageNumber, setPageNumber] = useState<number>(1);
  let [loading, setLoading] = useState<boolean>(true);
  let [error, setError] = useState<boolean>(false);
  let [orders, setOrders] = useState<OrderList[]>([]);
  let [orderDetail, setOrderDetail] = useState<OrderDetailList[]>([]);
  let [statusChange, setStatusChange] = useState<boolean>(false);
  let [hasmore, setHasmore] = useState<boolean>(false);
  let [prevDate, setPrevDate] = useState<string>("");
  let [date, setDate] = useState<string>("");
  const { memberService } = props;
  const observer = useRef<IntersectionObserver>();
  let history = useHistory();

  /* 주문 목록 가져오기 */
  const getOrderList = async () => {
    const offset = new Date().getTimezoneOffset() * 60000;
    const curr = new Date(Date.now() - offset);
    const today = curr.toISOString().substr(0, 10);
    const time = curr.toISOString().substr(11, 8);

    let date1 = prevDate + " 00:00:00";
    let date2: string = "";

    if (date < today) {
      date2 = date + " 23:59:59";
    } else {
      date2 = date + " " + time;
    }

    setLoading(true);

    try {
      const result = await memberService.getOrderList(pageNumber, date1, date2);
      const { username, orderList, orderDetailList, hasmore } = result;

      let temp1: OrderList[];
      let temp2: OrderDetailList[];

      temp1 = [...orders, ...orderList];
      temp2 = [...orderDetail, ...orderDetailList];

      setUsername(username);
      setOrders(temp1);
      setOrderDetail(temp2);
      setHasmore(hasmore);
      setLoading(false);
    } catch (error: any) {
      setError(true);
    }
  };

  /* 화면에 출력된 element중 마지막 element가 현재 브라우저에 교차상태일 경우 새로운 데이터를 받아올 수 있게 무한 스크롤링 구현*/
  const lastOrderElement = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasmore) {
          setPageNumber((prevPageNumber) => prevPageNumber + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasmore]
  );

  const dateSearch = async () => {
    if (date < prevDate) {
      alert("날짜를 다시 확인해주세요");
    } else {
      setOrders([]);
      setOrderDetail([]);

      if (pageNumber === 1) {
        setPageNumber(0);
      } else {
        setPageNumber(1);
      }
    }
  };

  useEffect(() => {
    if (skip) {
      return;
    }

    if (!pageNumber) {
      setPageNumber(1);
    } else {
      getOrderList();
    }
  }, [skip, pageNumber]);

  useEffect(() => {
    if (statusChange) {
      setOrders([]);
      setOrderDetail([]);
      setPageNumber(0);
      setStatusChange(false);
    }
  }, [statusChange]);

  return (
    <div className="info">
      <div className="user-info">
        <div className="user-info-left"></div>
        <div className="user-info-right">
          <div className="user-info-right-msg">
            <span>{username}님 환영합니다</span>
          </div>
          <div className="user-info-right-btn-list">
            <Button
              title={"회원정보수정"}
              handleClickEvent={() => history.push("myinfo")}
            />
            <Button
              title={"나의리뷰"}
              handleClickEvent={() => history.push("myreview")}
            />
            <Button
              title={"나의게시글"}
              handleClickEvent={() => history.push("mypost")}
            />
          </div>
        </div>
      </div>
      <h4 className="title">주문내역</h4>
      <DateSearchBar
        setPrevDate={setPrevDate}
        setDate={setDate}
        dateSearch={dateSearch}
        setSkip={setSkip}
      />
      {orders.length === 0 ? (
        <div>주문내역이 없습니다</div>
      ) : (
        orders.map((order, key) => {
          const orderDetailList = orderDetail.filter(
            (detail) => detail.order_id == order.order_id
          );

          if (orders.length === key + 1) {
            return (
              <div className="order-list" ref={lastOrderElement}>
                <OrderDetail
                  orderDetail={orderDetailList}
                  order_id={order.order_id}
                  created={order.created}
                  setStatusChange={setStatusChange}
                  memberService={memberService}
                />
              </div>
            );
          } else {
            return (
              <div className="order-list">
                <OrderDetail
                  orderDetail={orderDetailList}
                  order_id={order.order_id}
                  created={order.created}
                  setStatusChange={setStatusChange}
                  memberService={memberService}
                />
              </div>
            );
          }
        })
      )}
      {error ? (
        <div>Sorry, It isn't work.</div>
      ) : loading ? (
        <img className="loading" src="../image/loading.png" alt="loading"></img>
      ) : null}
      {!hasmore ? <hr className="endline"></hr> : null}
    </div>
  );
}

export default MyPage;
