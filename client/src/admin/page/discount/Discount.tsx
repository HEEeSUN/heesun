import { useEffect, useState } from "react";
import "./discount.css";
import { AdminDiscountService, SaleList } from "../../model/discount.model";
import AddDiscount from "./components/AddDiscount";
import SaleGroup from "./components/SaleGroup";

type Props = {
  adminDiscountService: AdminDiscountService;
};

function Discount({ adminDiscountService }: Props) {
  let [saleList, setSaleList] = useState<SaleList[]>([]);
  let [addDiscountPage, setAddDiscountPage] = useState<boolean>(false);
  let [changeSale, setChangeSale] = useState<boolean>(false);

  const getSaleList = async () => {
    try {
      const { saleGroup } = await adminDiscountService.getSaleList();

      setSaleList(saleGroup);
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    if (!addDiscountPage) {
      setSaleList([]);
      getSaleList();
    }
  }, [addDiscountPage]);

  useEffect(() => {
    if (changeSale) {
      setSaleList([]);
      getSaleList();
      setChangeSale(false);
    }
  }, [changeSale]);

  return (
    <div className="discount">
      {!addDiscountPage ? (
        <>
          <div className="discount-top-bar">
            <button onClick={() => setAddDiscountPage(true)}>할인 등록</button>
          </div>
          <div className="discount-content">
            {saleList.length > 0 ? (
              saleList.map((productGroup) => {
                return (
                  <SaleGroup
                    adminDiscountService={adminDiscountService}
                    productGroup={productGroup}
                    setChangeSale={setChangeSale}
                  />
                );
              })
            ) : (
              <p>할인 등록된 상품이 없습니다</p>
            )}
          </div>
        </>
      ) : (
        <AddDiscount
          adminDiscountService={adminDiscountService}
          setAddDiscountPage={setAddDiscountPage}
        />
      )}
    </div>
  );
}

export default Discount;
