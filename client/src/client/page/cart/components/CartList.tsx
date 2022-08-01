import { useEffect, useState } from "react";
import { useHistory } from "react-router";
import { CartProducts } from "../../../model/member.model";
import CloseButton from "../../../components/CloseButton";

type Props = {
  removeCartProduct: (cart_id: number) => void;
  cartProducts: CartProducts[];
  setCartProducts: React.Dispatch<React.SetStateAction<CartProducts[]>>;
  product: CartProducts;
};

function CartList(props: Props) {
  let history = useHistory();
  let [salePrice, setSalePrice] = useState<number>(0);
  let { removeCartProduct, cartProducts, setCartProducts, product } = props;
  let {
    cart_id,
    stock,
    selected,
    main_img_src,
    product_code,
    name,
    option1,
    option2,
    price,
    quantity,
    sale_price,
  } = product;

  /* 상품 체크시 해당 상품의  selected 값 변경 */
  const checked = (checked: boolean, value: string) => {
    let newArray = [...cartProducts];

    newArray.map((item) => {
      if (item.cart_id === Number(value)) {
        item.selected = checked;
      }
    });

    setCartProducts(newArray);
  };

  useEffect(() => {
    if (sale_price) {
      setSalePrice(sale_price);
    } else {
      setSalePrice(price);
    }
  }, []);

  return (
    <div className="list-in-cart">
      <div className="list-in-cart-left">
        <div>
          <input
            type="checkbox"
            value={cart_id}
            onChange={(e) => {
              checked(e.target.checked, e.target.value);
            }}
            disabled={!stock}
            checked={selected}
          ></input>
        </div>
        <div className="product-img">
          <img className="product-img" src={main_img_src} alt="product image" />
        </div>
      </div>
      <div className="list-in-cart-right">
        <div className="product-info">
          <div className="product-name">
            <p onClick={() => history.push(`/home/product/${product_code}`)}>
              {name}
            </p>
            <p>
              {option1} {option2 ? "/" : ""} {option2}
            </p>
          </div>
          <div className="total-price">{salePrice.toLocaleString()}</div>
          <div className="quantity">{quantity}</div>
          <div className="total-price">
            {(salePrice * quantity).toLocaleString()}
          </div>
          <CloseButton clickEventHandler={() => removeCartProduct(cart_id)} />
        </div>
        {!stock && (
          <div className="stock-notice">
            재고부족으로 인하여 구매가 불가능합니다
          </div>
        )}
      </div>
    </div>
  );
}

export default CartList;
