type Props = {
  quantity: number;
  setQuantity: React.Dispatch<React.SetStateAction<number>>;
  selectedOptionStock: number;
  selectedOptionNumber: number | null;
};
function QuantityButton(props: Props) {
  let { quantity, setQuantity, selectedOptionStock, selectedOptionNumber } =
    props;

  return (
    <>
      <button
        className="quantity-btn"
        onClick={() => {
          if (quantity > 0) setQuantity((prev) => prev - 1);
        }}
        disabled={selectedOptionStock === 0}
      >
        -
      </button>
      <div className="quantity">
        <span>
          {selectedOptionStock === 0 &&
          (selectedOptionNumber || selectedOptionNumber === 0)
            ? "-"
            : quantity}
        </span>
      </div>
      <button
        className="quantity-btn"
        onClick={() => {
          setQuantity((prev) => prev + 1);
        }}
        disabled={selectedOptionStock === 0}
      >
        +
      </button>
    </>
  );
}

export default QuantityButton;
