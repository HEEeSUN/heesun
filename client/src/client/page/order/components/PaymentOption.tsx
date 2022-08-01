type Props = {
  title: string;
  value: string;
  defaultChecked?: boolean;
  handleClickEvent: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

function PaymentOption({
  title,
  value,
  defaultChecked,
  handleClickEvent,
}: Props) {
  return (
    <div>
      <input
        type="radio"
        name="payment"
        value={value}
        defaultChecked={defaultChecked}
        onChange={handleClickEvent}
      ></input>
      <label>{title}</label>
    </div>
  );
}

export default PaymentOption;
