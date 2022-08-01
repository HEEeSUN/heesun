type Props = {
  showChattingList: () => void;
};

function InquiryButton(props: Props) {
  const { showChattingList } = props;

  return (
    <div className="request">
      <button onClick={showChattingList}>?</button>
    </div>
  );
}

export default InquiryButton;
