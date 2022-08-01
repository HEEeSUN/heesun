import DaumPostcode from "react-daum-postcode";

type Props = {
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  setShowPostcodePopup: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function PostcodePopup({
  setAddress,
  setShowPostcodePopup,
}: Props) {
  const onClose = () => {
    setShowPostcodePopup(false);
  };

  const handleComplete = (data: any) => {
    let fullAddress = data.address;
    let extraAddress = "";

    if (data.addressType === "R") {
      if (data.bname !== "") {
        extraAddress += data.bname;
      }
      if (data.buildingName !== "") {
        extraAddress +=
          extraAddress !== "" ? `, ${data.buildingName}` : data.buildingName;
      }
      fullAddress += extraAddress !== "" ? ` (${extraAddress})` : "";
    }
    setAddress(fullAddress);
  };

  return (
    <div className="popup-wrap">
      <div className="popup">
        <div className="popup-head">
          <span className="head-title">주소 검색</span>
          <span className="head-title" onClick={onClose}>
            x
          </span>
        </div>
        <div className="popup-body">
          <DaumPostcode onComplete={handleComplete} onClose={onClose} />
        </div>
      </div>
    </div>
  );
}
