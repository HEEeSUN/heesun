type Props = {
  type: string;
  name: string;
  labelName: string;
  value?: string;
  defaultValue?: string | undefined;
  settings?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  handleBlur?: () => void;
  placeholder?: string;
  disabled?: boolean;
};

function Input(props: Props) {
  const {
    type,
    name,
    labelName,
    value,
    defaultValue,
    settings,
    handleFocus,
    handleBlur,
    placeholder,
    disabled,
  } = props;

  return (
    <div className="common-input">
      <label className="common-label">{labelName}</label>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        value={value && value}
        placeholder={placeholder}
        onChange={settings}
        onFocus={handleFocus}
        onBlur={handleBlur}
        disabled={disabled}
      ></input>
    </div>
  );
}

export default Input;
