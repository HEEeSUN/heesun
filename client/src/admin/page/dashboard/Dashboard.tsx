import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "./dashboard.css";
import {
  AdminProductService,
  SalesOfPerMonth,
  DashboardAlerts,
} from "../../model/product.model";
import MiniAlert from "./components/MiniAlert";
import SalesChart from "./components/SalesChart";

type Props = {
  adminProductService: AdminProductService;
};

function Dashboard({ adminProductService }: Props) {
  let [alerts, setAlerts] = useState<DashboardAlerts>([]);
  let [labels, setLabels] = useState<string[]>([]);
  let [sales, setSales] = useState<number[]>([]);
  let [refund, setRefund] = useState<number[]>([]);
  let [updateTime, setUpdateTime] = useState<string>("");
  let [salesOf6month, setSalesOf6month] = useState<SalesOfPerMonth[]>([]);
  let [refundNum, setRefundNum] = useState<number>(0);
  let history = useHistory();

  const getInitialData = async () => {
    try {
      const { message, order, refund, sales, salesOf6month } =
        await adminProductService.getInitialData();

      setSalesOf6month(salesOf6month);
      setRefundNum(refund);
      handleUpdateTime();
      handleAlertBoard(message, order, refund, sales);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleUpdateTime = async () => {
    const time = new Date(
      Date.now() - new Date().getTimezoneOffset() * 60000
    ).toISOString();
    const current =
      String(time.substring(0, 10)) + "  " + String(time.substring(11, 19));

    setUpdateTime(current);
  };

  const handleAlertBoard = async (
    message: number,
    order: number,
    refund: number,
    sales: number
  ) => {
    setAlerts([
      {
        title: "PENDING REQUESTS",
        alt: "message icon",
        iconSrc: "/image/icon/message.png",
        extraClass: "alert-request",
        count: message,
        clickEventHandler: () => history.push("inquiries"),
      },
      {
        title: "NEW ORDER",
        alt: "new order icon",
        iconSrc: "/image/icon/order.png",
        extraClass: "alert-order",
        count: order,
        clickEventHandler: () => history.push("orders"),
      },
      {
        title: "REFUND",
        alt: "new refund icon",
        iconSrc: "/image/icon/refund.png",
        extraClass: "alert-refund",
        count: refund,
        clickEventHandler: () => history.push("orders"),
      },
      {
        title: "SALES(monthly)",
        alt: "sales icon",
        iconSrc: "/image/icon/sales.png",
        extraClass: "alert-sales",
        count: sales.toLocaleString(),
      },
    ]);
  };

  const handletDataOfSalesChart = async () => {
    let tempLabels: string[] = [];
    let tempSales: number[] = [];
    let tempRefund: number[] = [];

    salesOf6month.map((sales) => {
      tempLabels.push(sales.month);
      tempSales.push(sales.sales);
      tempRefund.push(sales.refund);
    });

    setLabels(tempLabels);
    setSales(tempSales);
    setRefund(tempRefund);
  };

  const data = {
    labels,
    datasets: [
      {
        label: "환불액",
        data: refund,
        borderColor: "rgb(255, 99, 132)",
        backgroundColor: "rgba(255, 99, 132, 0.5)",
      },
      {
        label: "판매액",
        data: sales,
        borderColor: "rgb(53, 162, 235)",
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
    ],
  };

  useEffect(() => {
    handletDataOfSalesChart();
  }, [salesOf6month]);

  useEffect(() => {
    getInitialData();
  }, []);

  return (
    <div className="dashboard">
      <div className="update-board">
        <div className="refresh-btn">
          <img
            src="/image/icon/refresh.png"
            alt="refresh icon"
            onClick={getInitialData}
          ></img>
        </div>
        <div className="update-time">
          <span>업데이트 시간: {updateTime}</span>
        </div>
      </div>
      <div className="alert-board">
        {alerts.map((item) => {
          return (
            <MiniAlert
              title={item.title}
              alt={item.alt}
              iconSrc={item.iconSrc}
              extraClass={item.extraClass}
              count={item.count}
              clickEventHandler={item.clickEventHandler}
            />
          );
        })}
      </div>
      <div className="sales-board">
        <SalesChart data={data} />
        <div className="curr-sales">공백</div>
      </div>
    </div>
  );
}

export default Dashboard;
