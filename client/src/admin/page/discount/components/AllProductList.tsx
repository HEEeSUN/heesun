import { memo, useEffect, useState } from "react";
import { AdminDiscountService, Product } from "../../../model/discount.model";
import Page from "../../../components/Page";
import SearchForm from "../../../components/SearchForm";

type Props = {
  adminDiscountService: AdminDiscountService;
  discountList: Product[];
  setDiscountList: React.Dispatch<React.SetStateAction<Product[]>>;
  productList: Product[];
  setProductList: React.Dispatch<React.SetStateAction<Product[]>>;
};

const AllProductList = memo((props: Props) => {
  let [category, setCategory] = useState<string>("");
  let [searchWord, setSearchWord] = useState<string>("");
  let [pageNumber, setPageNumber] = useState<number>(1);
  let [skip, setSkip] = useState<boolean>(true);
  let [staticSearchWord, setStaticSearchWord] = useState<string>("");
  let [pageLength, setPageLength] = useState<number>(0);
  let [change, setChange] = useState<boolean>(false);

  let {
    adminDiscountService,
    discountList,
    setDiscountList,
    productList,
    setProductList,
  } = props;

  const getProduct = async (getallProduct: boolean = false) => {
    let text: string = "";
    if (getallProduct) {
      setSearchWord("");
      setStaticSearchWord("");
    } else {
      text = staticSearchWord;
    }
    try {
      const { productList, productPageLength } =
        await adminDiscountService.getProductWithOption(
          category,
          text,
          pageNumber
        );

      discountList.map((discountProduct) => {
        productList.map((product: Product) => {
          if (discountProduct.option_id === product.option_id) {
            product.selected = true;
          }
        });
      });

      setPageLength(productPageLength);
      setChange(true);
      setProductList(productList);
    } catch (error: any) {
      alert(error.message);
    }
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchWord) {
      alert("검색어를 입력해주세요");
    } else {
      setStaticSearchWord(searchWord);
      setPageNumber(0);
    }
  };

  useEffect(() => {
    if (pageNumber === 0) {
      setPageNumber(1);
    } else {
      setProductList([]);
      getProduct();
    }
  }, [pageNumber]);

  useEffect(() => {
    if (skip) {
      setSkip(false);
    } else {
      if (!category) {
        getProduct(true);
      }
    }
  }, [category]);

  const checked = (checked: boolean, product: Product) => {
    let tempArray = [...discountList];
    let tempArray1 = [...productList];

    if (checked) {
      tempArray.push(product);
      tempArray1.map((item, key) => {
        if (product === item) {
          item.selected = true;
        }
      });
    } else {
      tempArray = tempArray.filter(
        (item) => item.option_id !== product.option_id
      );
      tempArray1.map((item, key) => {
        if (product === item) {
          item.selected = false;
        }
      });
    }
    setDiscountList(tempArray);
    setProductList(tempArray1);
  };

  const categoryHandleing1 = async (value: string, id?: string) => {
    setCategory(value);
  };

  const searchHandleing = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchWord) {
      alert("검색어를 입력해주세요");
      return;
    }

    if (searchWord && searchWord.length > 50) {
      alert("검색어를 확인해 주세요");
      return;
    }

    setStaticSearchWord(searchWord);
    setPageNumber(0);
  };

  const categoryArr1 = [
    { value: "", name: "전체보기", id: "default" },
    { value: "product_code", name: "상품코드" },
    { value: "name", name: "상품명" },
  ];

  return (
    <div className="product-list">
      <div className="search">
        <SearchForm
          categoryArr1={categoryArr1}
          searchWord={searchWord}
          setSearchWord={setSearchWord}
          searchHandleing={searchHandleing}
          categoryHandleing1={categoryHandleing1}
        />
      </div>
      <ProductListTable productList={productList} checked={checked} />
      <Page
        amountOfPerPage={10}
        change={change}
        setChange={setChange}
        pageLength={pageLength}
        pageNumber={pageNumber}
        setPageNumber={setPageNumber}
      />
    </div>
  );
});

type P = {
  productList: Product[];
  checked: (checked: boolean, product: Product) => void;
};

const ProductListTable = memo(({ productList, checked }: P) => {
  return (
    <table>
      <thead>
        <tr>
          <th className="checkbox"></th>
          <th className="code">상품코드</th>
          <th className="name">상품명</th>
          <th className="option">옵션1</th>
          <th className="option">옵션2</th>
        </tr>
      </thead>
      <tbody>
        {!productList[0] ? (
          <tr>
            <td colSpan={5}> 상품이 존재하지 않습니다 </td>
          </tr>
        ) : (
          productList.map((product) => {
            return (
              <tr
                className={
                  product.disabled
                    ? "delete-option"
                    : product.sale_id
                    ? "sale-option"
                    : product.selected
                    ? "selected-option"
                    : ""
                }
              >
                <td className="checkbox">
                  <input
                    type="checkbox"
                    disabled={
                      product.disabled || product.sale_id ? true : false
                    }
                    onChange={(e) => checked(e.target.checked, product)}
                    checked={product.selected}
                  ></input>
                </td>
                <td className="code">{product.product_code}</td>
                <td className="name">{product.name}</td>
                <td className="option">{product.option1}</td>
                <td className="option">{product.option2}</td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );
});

export default AllProductList;
