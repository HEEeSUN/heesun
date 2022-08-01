import { useEffect, useState } from "react";
import { hour, minute } from "../../../util/date";
import { AdminDiscountService, Product } from "../../../model/discount.model";
import AllProductList from "./AllProductList";

type Props = {
  adminDiscountService: AdminDiscountService;
  setAddDiscountPage: React.Dispatch<React.SetStateAction<boolean>>;
};

function AddDiscount({ adminDiscountService, setAddDiscountPage }: Props) {
  let [timeSale, setTimeSale] = useState<boolean>(false);
  let [discountList, setDiscountList] = useState<Product[]>([]);
  let [productList, setProductList] = useState<Product[]>([]);

  let [saleEndDate, setSaleEndDate] = useState<string>("");
  let [saleStartDate, setSaleStartDate] = useState<string>("");
  let [saleStartHour, setSaleStartHour] = useState<string>("00");
  let [saleStartMin, setSaleStartMin] = useState<string>("00");
  let [saleEndHour, setSaleEndHour] = useState<string>("00");
  let [saleEndMin, setSaleEndMin] = useState<string>("00");

  let [showProductList, setShowProductList] = useState<boolean>(false);

  let saleStartTime: string = "";
  let saleEndTime: string = "";

  const offset = new Date().getTimezoneOffset() * 60000;
  const curr = new Date(Date.now() - offset);
  let today = curr.toISOString().substr(0, 10);

  const discountPrice = async (value: string, index: number) => {
    let tempArray = [...discountList];
    tempArray[index].sale_price = Number(value);
    setDiscountList(tempArray);
  };

  const validationCheck = () => {
    if (!discountList[0]) {
      alert("세일 품목을 설정해주세요");
      return;
    }

    let found = discountList.find((product) => !product.sale_price);

    if (found) {
      alert("할인 가격을 설정해주세요");
      return;
    }

    found = discountList.find(
      (product) =>
        product.price < product.sale_price || product.cost > product.sale_price
    );

    if (found) {
      const result = window.confirm(
        "세일가가 정상가보다 크거나 원가보다 작은 항목이 있습니다\n그대로 진행하시겠습니까?"
      );

      if (!result) {
        return;
      }
    }

    if (timeSale) {
      if (
        !saleStartDate ||
        !saleStartHour ||
        !saleStartMin ||
        !saleEndDate ||
        !saleEndHour ||
        !String(saleEndMin)
      ) {
        alert("타임 세일 시간설정을 해주세요");
        return;
      }

      saleStartTime = `${saleStartDate} ${saleStartHour}:${saleStartMin}:00`;
      saleEndTime = `${saleEndDate} ${saleEndHour}:${saleEndMin}:00`;

      if (new Date(saleStartTime) < new Date()) {
        alert("시작시간은 현재시간보다 전일 수 없습니다");
        return;
      }

      if (saleStartTime >= saleEndTime) {
        alert("종료시간은 시작시간보다 전일 수 없습니다");
        return;
      }
    }

    return true;
  };

  const checked = (checked: boolean, product: Product) => {
    let tempArray = [...discountList];
    let tempArray1 = [...productList];
    let temp: Product[] = [];

    if (checked) {
      tempArray.push(product);
      tempArray1.map((item) => {
        if (product === item) {
          item.selected = true;
        }
      });
    } else {
      tempArray = tempArray.filter(
        (item) => item.option_id !== product.option_id
      );
      tempArray1.map((item) => {
        if (product === item) {
          item.selected = false;
        }
      });
    }
    setDiscountList(tempArray);
    setProductList(tempArray1);
  };

  const addNewSaleList = async () => {
    if (validationCheck()) {
      let saleTime;

      if (timeSale) {
        saleTime = {
          saleStartTime,
          saleEndTime,
        };
      }

      try {
        await adminDiscountService.addSaleProduct(discountList, saleTime);

        setDiscountList([]);
        alert("할인등록이 완료되었습니다");
        setShowProductList(false);
        setShowProductList(true);
      } catch (error: any) {
        alert(error.message);
      }
    }
  };

  const backToList = async () => {
    if (discountList.length > 0) {
      const result = window.confirm("세일 품목 등록을 취소하시겠습니까?");

      if (!result) {
        return;
      }
    }
    setAddDiscountPage(false);
  };

  useEffect(() => {
    return () => {
      setAddDiscountPage(false);
    };
  }, []);

  return (
    <div className="add-discount">
      <div className="top-bar">
        <span onClick={backToList}>◀ 목록으로 돌아가기</span>
      </div>
      <div className="discount-list">
        <table>
          <thead>
            <tr>
              <th className="remove"></th>
              <th className="code">상품코드</th>
              <th className="name">상품명</th>
              <th className="option">옵션1</th>
              <th className="option">옵션2</th>
              <th className="price">원가</th>
              <th className="price">정상가</th>
              <th className="price">할인가</th>
            </tr>
          </thead>
          <tbody>
            {discountList.length < 1 ? (
              <tr className="discount-notice">
                <td colSpan={8}>상품을 선택해 주세요</td>
              </tr>
            ) : (
              discountList.map((product, key) => {
                return (
                  <tr>
                    <td>
                      <span
                        className="remove-btn"
                        onClick={() => checked(false, product)}
                      >
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
                        onChange={(e) => discountPrice(e.target.value, key)}
                      ></input>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <div className="sale-time">
        <div className="sale-time-label">
          <label>타임세일적용</label>
          <input
            type="checkbox"
            onChange={(e) => setTimeSale(e.target.checked)}
          ></input>
        </div>
        <div className="sale-time-timer">
          <label>시작일</label>
          <input
            type="date"
            disabled={!timeSale}
            min={today}
            onChange={(e) => {
              setSaleStartDate(e.target.value);
            }}
          ></input>
          <select
            onChange={(e) => setSaleStartHour(e.target.value)}
            disabled={!timeSale}
          >
            {hour.map((hour) => {
              return <option> {hour} </option>;
            })}
          </select>
          <select
            onChange={(e) => setSaleStartMin(e.target.value)}
            disabled={!timeSale}
          >
            {minute.map((min) => {
              return <option> {min} </option>;
            })}
          </select>
          <span> ~ </span>
          <label>종료일</label>
          <input
            type="date"
            disabled={!timeSale}
            min={today}
            onChange={(e) => {
              setSaleEndDate(e.target.value);
            }}
          ></input>
          <select
            onChange={(e) => setSaleEndHour(e.target.value)}
            disabled={!timeSale}
          >
            {hour.map((hour) => {
              return <option> {hour} </option>;
            })}
          </select>
          <select
            onChange={(e) => setSaleEndMin(e.target.value)}
            disabled={!timeSale}
          >
            {minute.map((min) => {
              return <option> {min} </option>;
            })}
          </select>
        </div>
      </div>
      <button className="add-btn" onClick={addNewSaleList}>
        할인등록
      </button>
      <div className="discount-notice">
        세일을 등록하실 상품을 하단에서 선택하여 주세요
        <p className="discount-notice-color">
          <span>붉은색</span> : 옵션이 삭제된 상품 / <span>파란색</span>: 이미
          세일품목으로 지정된 상품(기존 세일품목에서 삭제후 사용 가능)
        </p>
        <button
          className="show-list-btn"
          onClick={() => setShowProductList(!showProductList)}
        >
          {showProductList ? "상품목록접기" : "상품목록열기"}
        </button>
      </div>
      {showProductList && (
        <AllProductList
          adminDiscountService={adminDiscountService}
          discountList={discountList}
          setDiscountList={setDiscountList}
          productList={productList}
          setProductList={setProductList}
        />
      )}
    </div>
  );
}

export default AddDiscount;
