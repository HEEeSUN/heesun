import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import "./manageProducts.css";
import {
  SelectedProduct,
  ProductSummary,
  AdminProductService,
} from "../../model/product.model";
import Page from "../../components/Page";
import SearchForm from "../../components/SearchForm";
import ShowDetail from "./components/ShowDetail";

type Props = {
  adminProductService: AdminProductService;
};

function ManageProduct({ adminProductService }: Props) {
  let [category, setCategory] = useState<string>("");
  let [searchWord, setSearchWord] = useState<string>("");
  let [pageNumber, setPageNumber] = useState<number>(1);
  let [skip, setSkip] = useState<boolean>(true);
  let [showDetail, setShowDetail] = useState<boolean>(false);
  let [staticSearchWord, setStaticSearchWord] = useState<string>("");
  let [pageLength, setPageLength] = useState<number>(0);
  let [change, setChange] = useState<boolean>(false);
  let [selectedProduct, setSelectedProduct] = useState<SelectedProduct>();
  let [productList, setProductList] = useState<ProductSummary[]>([]);
  let [modifyProduct, setModifyProduct] = useState<boolean>(false);
  let history = useHistory();

  /* 상품 목록 가져오기 */
  const getProduct = async (getallProduct: boolean = false) => {
    //검색어를 먼저 입력하고, 전체보기 카테고리로 전환시 입력된 검색어를 지우고 전체보기를 행하기 위함
    let text: string = "";
    if (getallProduct) {
      setSearchWord("");
      setStaticSearchWord("");
    } else {
      text = staticSearchWord;
      // 검색을 누르거나 페이지 번호 변경시 둘다 searchWord를 가지고 검색하게 되기 때문에
      // 고정검색어를 저장하여 검색을 눌러 접근할 경우에만 검색어를 이용한 검색이 되어지도록
    }
    try {
      const { productList, productPageLength } =
        await adminProductService.getProduct(category, text, pageNumber);

      setPageLength(productPageLength);
      setChange(true);
      setProductList(productList);
    } catch (error: any) {
      alert(error.message);
    }
  };

  /* 상품 삭제 */
  const deleteProduct = async (code: string, name: string) => {
    const result = window.confirm(`'${name}' 상품을 삭제하시겠습니까?`);

    if (!result) {
      return;
    }

    try {
      await adminProductService.deleteProduct(code);

      getProduct();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const showProductDetail = async (
    code: string,
    name: string,
    price: number,
    cost: number,
    imgSrc: string,
    description: string
  ) => {
    setSelectedProduct({
      code,
      name,
      price,
      cost,
      imgSrc,
      description,
    });
  };

  useEffect(() => {
    if (selectedProduct) {
      setShowDetail(true);
    }
  }, [selectedProduct]);

  useEffect(() => {
    if (pageNumber === 0) {
      setPageNumber(1);
    } else {
      getProduct();
    }
  }, [pageNumber]);

  useEffect(() => {
    if (skip) {
      setSkip(false);
    } else {
      if (!category) {
        console.log("ddd");
        getProduct(true);
      }
    }
  }, [category]);

  useEffect(() => {
    if (modifyProduct) {
      getProduct();
      setModifyProduct(false);
    }
  }, [modifyProduct]);

  const categoryArr1 = [
    { value: "", name: "전체보기", id: "default" },
    { value: "product_code", name: "상품코드" },
    { value: "name", name: "상품명" },
  ];

  const categoryHandleing1 = async (value: string, id?: string) => {
    setCategory(value);
  };

  const searchHandleing = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!searchWord) {
      alert("검색어를 입력해 주세요");
      return;
    }

    if (searchWord && searchWord.length > 50) {
      alert("검색어를 확인해 주세요");
      return;
    }

    setStaticSearchWord(searchWord);
    setPageNumber(0);
  };

  return (
    <div className="product-list">
      {showDetail && selectedProduct ? (
        <ShowDetail
          adminProductService={adminProductService}
          selectedProduct={selectedProduct}
          setShowDetail={setShowDetail}
          setModifyProduct={setModifyProduct}
        />
      ) : (
        <>
          <div className="search">
            <SearchForm
              categoryArr1={categoryArr1}
              searchWord={searchWord}
              setSearchWord={setSearchWord}
              searchHandleing={searchHandleing}
              categoryHandleing1={categoryHandleing1}
            />
          </div>
          <table>
            <thead>
              <tr>
                <th className="code">상품코드</th>
                <th className="name">상품명</th>
                <th className="option">상세보기</th>
                <th className="delete">삭제</th>
              </tr>
            </thead>
            <tbody>
              {!productList[0] ? (
                <tr>
                  <td colSpan={4}> 상품이 존재하지 않습니다 </td>
                </tr>
              ) : (
                productList.map((product) => {
                  return (
                    <tr>
                      <td>
                        <p>{product.product_code}</p>
                      </td>
                      <td>{product.name}</td>
                      <td>
                        <button
                          className="product-btn"
                          onClick={() => {
                            showProductDetail(
                              product.product_code,
                              product.name,
                              product.price,
                              product.cost,
                              product.main_img_src,
                              product.description
                            );
                          }}
                        >
                          상세보기
                        </button>
                      </td>
                      <td>
                        <button
                          className="product-btn"
                          onClick={() =>
                            deleteProduct(product.product_code, product.name)
                          }
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
          <Page
            amountOfPerPage={20}
            change={change}
            setChange={setChange}
            pageLength={pageLength}
            pageNumber={pageNumber}
            setPageNumber={setPageNumber}
          />
          <button
            className="add-product-btn"
            onClick={() => history.push("products/add")}
          >
            상품등록
          </button>
        </>
      )}
    </div>
  );
}

export default ManageProduct;
