import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { SalesQuantity } from "../../../model/product.model";

ChartJS.register(ArcElement, Tooltip, Legend);

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type Props = {
  salesQuantity: SalesQuantity[];
};

function SalesQuantityChart({ salesQuantity }: Props) {
  let [labels, setLabels] = useState<string[]>([]);
  let [sales, setSales] = useState<number[]>([]);

  useEffect(() => {
    let tempLabels: string[] = [];
    let tempQuantity: number[] = [];

    salesQuantity.map((sales) => {
      const str =
        String(sales.product_code) +
        " " +
        String(sales.option1) +
        " " +
        String(sales.option2);
      tempLabels.push(str);
      tempQuantity.push(sales.count);
    });

    setLabels(tempLabels);
    setSales(tempQuantity);
  }, [salesQuantity]);

  const data = {
    labels: labels,
    datasets: [
      {
        label: "# of Votes",
        data: sales,
        backgroundColor: [
          "rgba(255, 99, 132, 0.2)",
          "rgba(54, 162, 235, 0.2)",
          "rgba(255, 206, 86, 0.2)",
          "rgba(75, 192, 192, 0.2)",
          "rgba(153, 102, 255, 0.2)",
          "rgba(255, 159, 64, 0.2)",
        ],
        borderColor: [
          "rgba(255, 99, 132, 1)",
          "rgba(54, 162, 235, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
          "rgba(255, 159, 64, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <div style={{ width: "400px" }}>
      {sales.length < 1 ? (
        <div>데이터가 아직 존재하지 않습니다</div>
      ) : (
        <Doughnut data={data} />
      )}
    </div>
  );
}

export default SalesQuantityChart;
