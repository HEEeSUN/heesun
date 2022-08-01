type Props = {
  children: React.ReactNode;
  title: string;
  setPopup: React.Dispatch<React.SetStateAction<boolean>>;
};

function Popup({ children, title, setPopup }: Props) {
  const onClose = () => {
    setPopup(false);
  };

  return (
    <div className="popup-wrap">
      <div className="popup-body">
        <div className="popup-top-bar">
          <span>{title}</span>
          <span onClick={onClose}>x</span>
        </div>
        <div className="content">{children}</div>
      </div>
    </div>
  );
}

export default Popup;
