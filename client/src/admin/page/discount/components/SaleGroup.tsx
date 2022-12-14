import { useEffect, useState } from "react";
import {
  AdminDiscountService,
  SaleProduct,
  ChangeProduct,
} from "../../../model/discount.model";

type Props = {
  adminDiscountService: AdminDiscountService;
  productGroup: SaleProduct[];
  setChangeSale: React.Dispatch<React.SetStateAction<boolean>>;
};

function SaleGroup(props: Props) {
  let [groupName, setGroupName] = useState<string>("");
  let [saleEndTime, setSaleEndTime] = useState<string>("");
  let [dday, setDday] = useState<string>("");
  let [ddayHour, setDdayHour] = useState<string>("");
  let [ddayMin, setDdayMin] = useState<string>("");
  let [ddaySec, setDdaySec] = useState<string>("");
  let [update, setUpdate] = useState<boolean>(false);
  let [timeId, setTimeId] = useState<number>(0);
  let [changeList, setChangeList] = useState<ChangeProduct[]>([]);
  let [deleteList, setDeleteList] = useState<number[]>([]);
  let [productList, setProductList] = useState<SaleProduct[]>([]);
  const { adminDiscountService, productGroup, setChangeSale } = props;

  const deleteProduct = (sale_id: number) => {
    let temp: number[] = [...deleteList];
    temp.push(sale_id);
    setDeleteList(temp);

    const result1 = productList.filter((item) => item.sale_id !== sale_id);
    setProductList(result1);

    const result2 = changeList.filter((item) => item.sale_id !== sale_id);
    setChangeList(result2);
  };

  const changePrice = (price: string, index: number) => {
    let temp = [...changeList];
    temp[index].change_price = Number(price);
    setChangeList(temp);
  };

  useEffect(() => {
    setProductList(productGroup);
    setTimeId(productGroup[0].time_id);

    let temp: ChangeProduct[] = [];
    productGroup.map((product, key) => {
      temp.push({
        sale_id: product.sale_id,
        sale_price: product.sale_price,
        change_price: product.sale_price,
      });
    });
    setChangeList(temp);
  }, []);

  const done = async () => {
    const find = changeList.find(
      (item) => item.sale_price !== item.change_price
    );

    if (!find && !deleteList[0]) {
      alert("??????????????? ????????????");
      return;
    }

    try {
      const { productList } = await adminDiscountService.updateSaleProduct(
        timeId,
        changeList,
        deleteList
      );

      alert("?????????????????????");
      setProductList(productList);
      setUpdate(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const deleteSaleGroup = async (timeId: number) => {
    const result = window.confirm(
      "?????? ???????????? ?????? ????????? ?????????????????????????"
    );

    if (!result) {
      return;
    }

    try {
      if (timeId) {
        await adminDiscountService.deleteSaleGroup(timeId);
      } else {
        await adminDiscountService.deleteSaleGroup();
      }

      alert("?????????????????????");
      setChangeSale(true);
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    if (productGroup[0].time_id) {
      let startTime = new Date(productGroup[0].start).toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
      });
      let endTime = new Date(productGroup[0].end).toLocaleString("ko-KR", {
        timeZone: "Asia/Seoul",
      });

      console.log(startTime, endTime);

      if (new Date(productGroup[0].end) < new Date()) {
        setGroupName(`[??????] ????????????: ${startTime}  ~  ????????????: ${endTime}`);
        setSaleEndTime("");
      } else {
        setGroupName(
          `[????????????] ????????????: ${startTime}  ~  ????????????: ${endTime}`
        );
        setSaleEndTime(productGroup[0].end);
      }
    } else {
      setGroupName("??????");
    }
  }, []);

  useEffect(() => {
    if (saleEndTime) {
      const endDate = new Date(saleEndTime);
      const gap = endDate.getTime() - Date.now();
      const day = Math.floor(gap / (1000 * 60 * 60 * 24));
      const hours = Math.floor((gap / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((gap / (1000 * 60)) % 60);
      const seconds = Math.floor((gap / 1000) % 60);

      setDday(String(day));
      setDdayHour(String(hours).padStart(2, "0"));
      setDdayMin(String(minutes).padStart(2, "0"));
      setDdaySec(String(seconds).padStart(2, "0"));

      setInterval(() => {
        const endDate = new Date(saleEndTime);
        const gap = endDate.getTime() - Date.now();
        const day = Math.floor(gap / (1000 * 60 * 60 * 24));
        const hours = Math.floor((gap / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((gap / (1000 * 60)) % 60);
        const seconds = Math.floor((gap / 1000) % 60);

        setDday(String(day));
        setDdayHour(String(hours).padStart(2, "0"));
        setDdayMin(String(minutes).padStart(2, "0"));
        setDdaySec(String(seconds).padStart(2, "0"));
      }, 60000);
    }
  }, [saleEndTime]);

  useEffect(() => {
    console.log(dday ? dday + ":" : "" + ddayHour + "?????? " + ddayMin + "??? ");
  }, [ddayHour]);

  return (
    <div className="discount-group">
      <p>{groupName}</p>
      {saleEndTime ? (
        <p>
          ???????????? ???????????? :{" "}
          {dday && dday + "??? " + ddayHour + "?????? " + ddayMin + "??? "}
        </p>
      ) : null}
      {!update ? (
        <table>
          <thead>
            <tr>
              <th className="discount-group-delete"></th>
              <th className="discount-group-code">????????????</th>
              <th className="discount-group-name">?????????</th>
              <th className="discount-group-option">??????1</th>
              <th className="discount-group-option">??????2</th>
              <th className="discount-group-price">??????</th>
              <th className="discount-group-price">?????????</th>
              <th className="discount-group-price">?????????</th>
            </tr>
          </thead>
          <tbody>
            {productList.map((product, key) => {
              return (
                <tr>
                  <td>*</td>
                  <td>{product.product_code}</td>
                  <td>{product.name}</td>
                  <td>{product.option1}</td>
                  <td>{product.option2}</td>
                  <td>{product.cost}</td>
                  <td>{product.price}</td>
                  <td>{product.sale_price}</td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={8}>
                <button onClick={() => setUpdate(true)}>????????????</button>
                <button onClick={() => deleteSaleGroup(timeId)}>??????</button>
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <table>
          <thead>
            <tr>
              <th className="discount-group-delete"></th>
              <th className="discount-group-code">????????????</th>
              <th className="discount-group-name">?????????</th>
              <th className="discount-group-option">??????1</th>
              <th className="discount-group-option">??????2</th>
              <th className="discount-group-price">??????</th>
              <th className="discount-group-price">?????????</th>
              <th className="discount-group-price">?????????</th>
            </tr>
          </thead>
          <tbody>
            {productList.map((product, key) => {
              return (
                <tr>
                  <td>
                    <span onClick={() => deleteProduct(product.sale_id)}>
                      x
                    </span>
                  </td>
                  <td>{product.product_code}</td>
                  <td>{product.name}</td>
                  <td>{product.option1}</td>
                  <td>{product.option2}</td>
                  <td>{product.cost}</td>
                  <td>{product.price}</td>
                  <td>
                    <input
                      type="text"
                      defaultValue={product.sale_price}
                      onChange={(e) => changePrice(e.target.value, key)}
                    ></input>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={8}>
                <button onClick={() => setUpdate(false)}>??????</button>
                <button onClick={done}>????????????</button>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SaleGroup;
