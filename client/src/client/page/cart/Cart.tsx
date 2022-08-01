import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import "./cart.css";
import {
  MemberService,
  CartProducts,
  AdjustmentProduct,
} from "../../model/member.model";
import CartList from "./components/CartList";
import OrderSummary from "./components/OrderSummary";

type Props = {
  memberService: MemberService;
  selectedProducts: CartProducts[];
  setSelectedProducts: React.Dispatch<React.SetStateAction<CartProducts[]>>;
  totalPrice: number;
  setTotalPrice: React.Dispatch<React.SetStateAction<number>>;
  shippingFee: number;
  setShippingFee: React.Dispatch<React.SetStateAction<number>>;
  setQuantityInCart: React.Dispatch<React.SetStateAction<number>>;
};

function Cart(props: Props) {
  let [cartProducts, setCartProducts] = useState<CartProducts[]>([]);
  let [productPrice, setProductPrice] = useState<number>(0);
  let [adjustmentProduct, setAdjustmentProduct] = useState<AdjustmentProduct[]>(
    []
  );
  let [allProductChecked, setAllProductChecked] = useState<boolean>(false);
  let [stock0, setStock0] = useState<boolean>(false);
  let history = useHistory();
  let {
    memberService,
    selectedProducts,
    setSelectedProducts,
    totalPrice,
    setTotalPrice,
    shippingFee,
    setShippingFee,
    setQuantityInCart,
  } = props;

  /* cart 상품 가져오기 */
  const getProductInfoFromCart = async () => {
    try {
      const { adjustmentProduct, products } =
        await memberService.getProductInfoFromCart();

      if (products.length !== 0) {
        products.map((product: CartProducts) => {
          product.selected = false;
        });

        const temp = products.find((item: CartProducts) => item.stock === 0);
        temp ? setStock0(true) : setStock0(false);
      }

      setAdjustmentProduct(adjustmentProduct);
      setQuantityInCart(products.length);
      setCartProducts(products);
    } catch (error: any) {
      alert(error.message);
    }
  };

  /* cart에 있는 상품 중 하나 삭제 */
  const removeCartProduct = async (cartId: number) => {
    try {
      await memberService.removeCartProduct(String(cartId));

      getProductInfoFromCart();
    } catch (error: any) {
      alert(error.message);
    }
  };

  /* cart에 있는 상품중 선택된 상품 삭제 */
  const removeSelectedProducts = async () => {
    try {
      let tempStr: string = "";
      selectedProducts.map((product, key) => {
        if (key + 1 !== selectedProducts.length) {
          tempStr = tempStr + `${product.cart_id},`;
        } else {
          tempStr = tempStr + `${product.cart_id}`;
        }
      });

      await memberService.removeCartProduct(tempStr);

      getProductInfoFromCart();
    } catch (error: any) {
      alert(error.message);
    }
  };

  /* cart에 있는 상품중 품절된 상품 삭제 */
  const removeStock0Products = async () => {
    try {
      const noStock = cartProducts.filter((product) => product.stock === 0);

      let tempStr: string = "";
      noStock.map((product, key) => {
        if (key + 1 !== noStock.length) {
          tempStr = tempStr + `${product.cart_id},`;
        } else {
          tempStr = tempStr + `${product.cart_id}`;
        }
      });

      await memberService.removeCartProduct(tempStr);

      getProductInfoFromCart();
    } catch (error: any) {
      alert(error.message);
    }
  };

  /* 주문하기 버튼 클릭시 구매할 상품이 선택되었는지 점검 */
  const validationCheck = () => {
    if (cartProducts.length < 1) {
      alert("장바구니에 상품이 없습니다");
      return false;
    } else if (selectedProducts.length < 1) {
      alert("구매하실 상품을 선택해주세요");
      return false;
    }
    return true;
  };

  /* 구매할 상품이 선택되었을 경우 order 페이지로 이동 */
  const order = () => {
    if (!validationCheck()) {
      return;
    }

    history.push("/home/member/order");
  };

  /* 전체 상품 체크 */
  const allChecked = (checked: boolean) => {
    let newArray = [...cartProducts];

    newArray.map((item) => {
      if (item.stock !== 0) item.selected = checked;
    });

    setCartProducts(newArray);
  };

  /* order summary에 나타날 선택된 상품의 총합 계산 */
  const subtotal = () => {
    let total = 0;

    cartProducts.map((item) => {
      if (item.selected === true) {
        item.sale_price
          ? (total += item.sale_price * item.quantity)
          : (total += item.price * item.quantity);
      }
    });

    setProductPrice(total);
  };

  /* 재고부족으로 인하여 수량이 조정된 상품이 있을 경우에 alert (db에서 재고를 조정한 후 뜨는 알림이기 때문에 1번만 보여지게 됨) */
  const alertAdjustment = () => {
    if (adjustmentProduct.length === 0) {
      return;
    }

    let tempStr = "[재고 부족 상품 알림]\n";

    adjustmentProduct.forEach((product, i) => {
      tempStr += `${i + 1}. '${
        product.name
      }' 상품은 재고부족으로 인하여 수량이 ${
        product.quantity
      }개로 조정되었습니다\n`;
    });

    alert(tempStr);
  };

  useEffect(() => {
    getProductInfoFromCart();
    setSelectedProducts([]);
  }, []);
  // 처음시작시 선택 상품 초기화 (cartProducts의 selected는 getProductdInfoFromCart시 false로 초기화하기 때문에 따로 설정 안함)

  useEffect(() => {
    alertAdjustment();
  }, [adjustmentProduct]);
  // props.cartProducts 업데이트시 발생하는 useEffect에서는 adjustmentProduct의 업데이트가 되지 않은 상태 일 수 있어 따로 빼줌

  useEffect(() => {
    if (!selectedProducts[0] || productPrice >= 30000) {
      setShippingFee(0);
      setTotalPrice(productPrice);
    } else {
      setShippingFee(3000);
      setTotalPrice(productPrice + 3000);
    }
  }, [productPrice]);

  useEffect(() => {
    subtotal();

    const tempArray1 = cartProducts.filter((item) => item.selected === true);
    const tempArray2 = cartProducts.filter((item) => item.stock !== 0);

    setSelectedProducts(tempArray1);
    tempArray1.length >= 1 && tempArray1.length === tempArray2.length
      ? setAllProductChecked(true)
      : setAllProductChecked(false);
  }, [cartProducts]);
  // tempArray1: 장바구니에서 체크박스 선택이 된 상품들만 분류
  // tempArray2: 장바구니에서 재고가 0이 아닌 상품들만 분류
  // 체크박스 선택이 된 상품들을 props.selectedProducts에 할당 > order에서 사용하기 위함
  // 선택된 상품의 갯수와 재고가 1 이상인 상품의 갯수가 같은 경우 전체선택으로 간주

  return (
    <div className="cart">
      <div className="my-cart">
        <p className="cart-title">My Cart</p>
        <div className="cart-btn">
          <span>
            <input
              type="checkbox"
              onChange={(e) => allChecked(e.target.checked)}
              checked={allProductChecked}
            ></input>
            전체선택
          </span>
          <div>
            {selectedProducts[0] && (
              <span onClick={removeSelectedProducts}>선택상품삭제</span>
            )}
            {selectedProducts[0] && stock0 ? <span>|</span> : null}
            {stock0 && <span onClick={removeStock0Products}>품절상품삭제</span>}
          </div>
        </div>
        {cartProducts[0] ? (
          cartProducts.map((product) => {
            return (
              <CartList
                removeCartProduct={removeCartProduct}
                cartProducts={cartProducts}
                setCartProducts={setCartProducts}
                product={product}
              />
            );
          })
        ) : (
          <div> 장바구니에 상품이 없습니다 </div>
        )}
      </div>
      <OrderSummary
        productPrice={productPrice}
        shippingFee={shippingFee}
        totalPrice={totalPrice}
        order={order}
      />
    </div>
  );
}

export default Cart;
