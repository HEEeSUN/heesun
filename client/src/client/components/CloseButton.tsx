type Props = {
  clickEventHandler: () => void;
};

function CloseButton(props: Props) {
  const { clickEventHandler } = props;

  return (
    <div className="btn-wrapper">
      <span onClick={clickEventHandler}>x</span>
    </div>
  );
}

export default CloseButton;
