import { OptionList } from "../../../model/product.model";

type Props = {
  setClickedBtn: React.Dispatch<React.SetStateAction<number | null>>;
  clickedBtn: number | null;
  id: number;
  clickEventHandler: (item: OptionList, key: number) => void;
  option: OptionList;
  title: string | undefined;
};

function OptionButton(props: Props) {
  const { setClickedBtn, clickedBtn, id, clickEventHandler, option, title } =
    props;

  return (
    <button
      className={`option-btn ${clickedBtn === id && "clicked-btn"}`}
      onClick={() => {
        setClickedBtn(id);
        clickEventHandler(option, id);
      }}
      disabled={option.stock && option.stock === 0 ? true : false}
    >
      {title}
    </button>
  );
}

export default OptionButton;
