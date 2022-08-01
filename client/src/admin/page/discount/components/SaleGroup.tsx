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
      alert("변동사항이 없습니다");
      return;
    }

    try {
      const { productList } = await adminDiscountService.updateSaleProduct(
        timeId,
        changeList,
        deleteList
      );

      alert("수정되었습니다");
      setProductList(productList);
      setUpdate(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const deleteSaleGroup = async (timeId: number) => {
    const result = window.confirm(
      "해당 상품들의 할인 적용을 해제하시겠습니까?"
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

      alert("삭제되었습니다");
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
        setGroupName(`[종료] 시작시간: ${startTime}  ~  종료시간: ${endTime}`);
        setSaleEndTime("");
      } else {
        setGroupName(
          `[타임세일] 시작시간: ${startTime}  ~  종료시간: ${endTime}`
        );
        setSaleEndTime(productGroup[0].end);
      }
    } else {
      setGroupName("세일");
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
    console.log(dday ? dday + ":" : "" + ddayHour + "시간 " + ddayMin + "분 ");
  }, [ddayHour]);

  return (
    <div className="discount-group">
      <p>{groupName}</p>
      {saleEndTime ? (
        <p>
          종료까지 남은시간 :{" "}
          {dday && dday + "일 " + ddayHour + "시간 " + ddayMin + "분 "}
        </p>
      ) : null}
      {!update ? (
        <table>
          <thead>
            <tr>
              <th className="discount-group-delete"></th>
              <th className="discount-group-code">상품코드</th>
              <th className="discount-group-name">상품명</th>
              <th className="discount-group-option">옵션1</th>
              <th className="discount-group-option">옵션2</th>
              <th className="discount-group-price">원가</th>
              <th className="discount-group-price">정상가</th>
              <th className="discount-group-price">할인가</th>
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
                <button onClick={() => setUpdate(true)}>할인수정</button>
                <button onClick={() => deleteSaleGroup(timeId)}>삭제</button>
              </td>
            </tr>
          </tbody>
        </table>
      ) : (
        <table>
          <thead>
            <tr>
              <th className="discount-group-delete"></th>
              <th className="discount-group-code">상품코드</th>
              <th className="discount-group-name">상품명</th>
              <th className="discount-group-option">옵션1</th>
              <th className="discount-group-option">옵션2</th>
              <th className="discount-group-price">원가</th>
              <th className="discount-group-price">정상가</th>
              <th className="discount-group-price">할인가</th>
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
                <button onClick={() => setUpdate(false)}>취소</button>
                <button onClick={done}>수정완료</button>
              </td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default SaleGroup;
