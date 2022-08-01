type Props = {
  productPrice: number;
  shippingFee: number;
  totalPrice: number;
  order: () => void;
};

function OrederSummary(props: Props) {
  const { productPrice, shippingFee, totalPrice, order } = props;

  return (
    <div className="order-summary">
      <p className="cart-title">Order Summary</p>
      <div className="summary">
        <div className="summary-title">Subtotal</div>
        <div>{productPrice.toLocaleString()}</div>
      </div>
      <div className="summary">
        <div className="summary-title">Shipping</div>
        <div>{shippingFee.toLocaleString()}</div>
      </div>
      <div className="summary-total">
        <div>Total</div>
        <div>{totalPrice.toLocaleString()}</div>
      </div>
      <button onClick={order} className="order-btn">
        Checkout
      </button>
    </div>
  );
}

export default OrederSummary;
