import { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router";
import "./product.css";
import {
  ProductService,
  ProductDetail,
  OptionList,
} from "../../model/product.model";
import { UseParams } from "../../model/model";
import Alert from "../../components/Alert";
import Description from "./components/Description";
import ProductReviews from "./components/ProductReviews";
import QuantityButton from "./components/QuantityButton";
import OptionButton from "./components/OptionButton";

type Props = {
  productService: ProductService;
  loginState: boolean;
  setQuantityInCart: React.Dispatch<React.SetStateAction<number>>;
};

function Product(props: Props) {
  let [essentialInfo, setEssentialInfo] = useState<ProductDetail>();
  let [selected1stOption, setSelected1stOption] = useState<string | null>(null);
  let [selectedOptionNumber, setSelectedOptionNumber] = useState<number | null>(
    null
  );
  let [selectedOptionStock, setSelectedOptionStock] = useState<number>(0);
  let [quantity, setQuantity] = useState<number>(0);
  let [showModal, setShowModal] = useState<boolean>(false);
  let [option, setOption] = useState<boolean>(false);
  let [optionList1st, setOptionList1st] = useState<OptionList[]>([]);
  let [optionList2nd, setOptionList2nd] = useState<OptionList[]>([]);
  let [salePrice, setSalePrice] = useState<number>();
  let [clickedBtn1, setClickedBtn1] = useState<number | null>(null);
  let [clickedBtn2, setClickedBtn2] = useState<number | null>(null);
  let { productService, loginState, setQuantityInCart } = props;

  const product_code: string = useParams<UseParams>().id;
  let history = useHistory();

  const setSelectedOption1 = (item: OptionList, key: number) => {
    if (item.option_number || item.option_number === 0) {
      //option1만 존재할 경우
      setSelected1stOption(null);
      setSelectedOptionNumber(item.option_number);
      setSelectedOptionStock(item.stock ? item.stock : 0);
      setSalePrice(item.salePrice);
    } else {
      setSelected1stOption(item.option1 ? item.option1 : null);
      setSelectedOptionNumber(null);
    }
    // setClickedBtn1(key);
  };

  const setSelectedOption2 = (item: OptionList, key: number) => {
    if (item.option_number || item.option_number === 0) {
      // setClickedBtn2(key);
      setSelectedOptionNumber(item.option_number);
      setSelectedOptionStock(item.stock ? item.stock : 0);
      setSalePrice(item.salePrice);
    }
  };

  /* 상품 상세보기 가져오기 (option의 유무에 따라 보여지는 구성이 달라지므로 옵션을 구분하여 저장)*/
  const getProduct = async () => {
    try {
      let tempArray1st: OptionList[] = [];
      let tempArray2nd: OptionList[] = [];

      const result = await productService.getProduct(product_code);
      const product: ProductDetail[] = result.product;

      setEssentialInfo(product[0]);

      if (product.length === 1 && !product[0].option1 && !product[0].option2) {
        setSalePrice(product[0].sale_price);
        setSelectedOptionNumber(product[0].option_number);
        setSelectedOptionStock(product[0].stock);
      } else {
        setOption(true);
        product.map((product) => {
          if (product.option1 && !product.option2) {
            tempArray1st.push({
              option_number: product.option_number,
              option1: product.option1,
              stock: product.stock,
              salePrice: product.sale_price,
            });
          } else {
            const find = tempArray1st.find(
              (item) => item.option1 === product.option1
            );
            if (!find) {
              tempArray1st.push({ option1: product.option1 });
            }
            tempArray2nd.push({
              option_number: product.option_number,
              option1: product.option1,
              option2: product.option2,
              stock: product.stock,
              salePrice: product.sale_price,
            });
          }
        });
      }

      let tempSet = new Set(tempArray1st);
      let temp = Array.from(tempSet);
      tempArray1st = [...temp];

      setOptionList1st(tempArray1st);
      setOptionList2nd(tempArray2nd);
    } catch (error: any) {
      alert(error.message);
      history.goBack();
    }
  };

  /* 상품을 cart에 추가 */
  const addToCart = async () => {
    try {
      const validation = validationCheck();

      if (validation) {
        const product = {
          product_code,
          price: essentialInfo?.price,
          option_number: selectedOptionNumber,
          quantity,
        };

        const { quantityInCart } = await productService.addToCart(product);

        setShowModal(true);
        setQuantityInCart(quantityInCart);

        setQuantity(0);
      }
    } catch (error: any) {
      alert(error.message);
    }
  };

  /* add cart 버튼 클릭시 cart에 추가 가능한 상태인지 점검*/
  const validationCheck = () => {
    if (!loginState) {
      alert("로그인후 이용해주세요");
      return false;
    } else if (selectedOptionNumber === null) {
      alert("옵션을 선택해주세요");
      return false;
    } else if (quantity < 1) {
      alert("구매하실 수량을 설정해주세요");
      return false;
    } else if (selectedOptionStock < quantity) {
      alert(`현재 주문가능한 수량은 ${selectedOptionStock}개 이하입니다.`);
      return false;
    }
    return true;
  };

  const handleClose = () => {
    setShowModal(false);
  };

  const handleMoveToCart = () => {
    setShowModal(false);
    history.push("/home/member/cart");
  };

  useEffect(() => {
    getProduct();
  }, []);

  useEffect(() => {
    setClickedBtn2(null);
  }, [selected1stOption]);

  return (
    <div className="product">
      <div className="product-info-top">
        <div className="product-img">
          <img
            src={essentialInfo?.main_img_src || "/image/noimage.jpg"}
            alt="product image"
          />
        </div>
        <div className="product-info-list">
          <div className="product-info">
            <div className="product-name">
              <p>{essentialInfo?.name}</p>
            </div>
          </div>
          <div className="product-info">
            <div className="info-title">
              <p>Price</p>
            </div>
            <div className="info-option">
              <p>
                {salePrice
                  ? salePrice.toLocaleString()
                  : essentialInfo?.price
                  ? essentialInfo?.price.toLocaleString()
                  : essentialInfo?.price}
              </p>
            </div>
          </div>
          {option && (
            <div className="product-info">
              <div className="info-title">
                <p>Option 1</p>
              </div>
              <div className="info-option">
                {optionList1st.map((item, key) => {
                  return (
                    <OptionButton
                      setClickedBtn={setClickedBtn1}
                      clickedBtn={clickedBtn1}
                      id={key}
                      clickEventHandler={setSelectedOption1}
                      option={item}
                      title={item.option1}
                    />
                  );
                })}
              </div>
            </div>
          )}
          {selected1stOption && (
            <div className="product-info">
              <div className="info-title">
                <p>Option 2</p>
              </div>
              <div className="info-option">
                {optionList2nd.map((item, key) => {
                  if (item.option1 === selected1stOption) {
                    return (
                      <OptionButton
                        setClickedBtn={setClickedBtn2}
                        clickedBtn={clickedBtn2}
                        id={key}
                        clickEventHandler={setSelectedOption2}
                        option={item}
                        title={item.option2}
                      />
                    );
                  }
                })}
              </div>
            </div>
          )}
          <div className="product-info">
            <div className="info-title">
              <p>Quantity</p>
            </div>
            <div className="info-option">
              <QuantityButton
                quantity={quantity}
                setQuantity={setQuantity}
                selectedOptionStock={selectedOptionStock}
                selectedOptionNumber={selectedOptionNumber}
              />
            </div>
          </div>
          {selectedOptionStock === 0 &&
          (selectedOptionNumber || selectedOptionNumber === 0) ? (
            <div className="stock-alert">재고부족으로 구매가 불가합니다</div>
          ) : null}
          <div className="cart-btn-wrapper">
            <button className="cart-btn" onClick={addToCart}>
              Add to Cart
            </button>
          </div>
          <Description description={essentialInfo?.description} />
        </div>
      </div>
      <ProductReviews
        productService={productService}
        product_code={product_code}
      />
      {showModal && (
        <Alert
          showModal={showModal}
          handleClose={handleClose}
          handleMove={handleMoveToCart}
          titleTxt={"장바구니 담기 완료"}
          bodyTxt={"상품이 장바구니에 담겼습니다. 장바구니로 이동하시겠습니까?"}
        />
      )}
    </div>
  );
}

export default Product;
