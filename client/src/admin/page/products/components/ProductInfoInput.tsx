import { useState } from "react";

type Props = {
  name: string;
  required?: boolean;
  value: string | number;
  settings: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled: boolean;
  op?: () => void;
};

function ProductInfoInput(props: Props) {
  let [inputValue, setInputValue] = useState("");

  const { name, required, value, settings, disabled } = props;

  return (
    <div className="product-info-input">
      <div className="product-label">
        <label>
          {name.toLocaleUpperCase()}
          {required ? "*" : ""}
        </label>
      </div>
      <div className="product-input">
        <input
          type="text"
          name={name}
          className={!required ? "" : !inputValue ? "require" : ""}
          value={value}
          onChange={(e) => {
            setInputValue(e.target.value);
            settings(e);
          }}
          disabled={disabled}
        ></input>
      </div>
      {name === "code" ? (
        <div className="codecheck-btn-wrapper">
          <button type="button" onClick={props.op}>
            조회
          </button>
        </div>
      ) : null}
    </div>
  );
}

export default ProductInfoInput;
