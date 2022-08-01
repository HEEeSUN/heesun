type Props = {
  title: string;
  handleClickEvent?: () => void;
  type?: "button" | "submit" | "reset" | undefined;
  extraClass?: string;
};

function Button(props: Props) {
  const { title, extraClass, type, handleClickEvent } = props;

  return (
    <button
      className={`mypage-btn ${extraClass}`}
      type={type ? type : "button"}
      onClick={handleClickEvent}
    >
      {title}
    </button>
  );
}

export default Button;
