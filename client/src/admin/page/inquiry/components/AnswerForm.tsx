import { useState } from "react";
import { adminInquiryService } from "../../../model/inquiry.model";
import Button from "../../../../client/components/Button";

type Props = {
  adminInquiryService: adminInquiryService;
  inquiryId: number | undefined;
  email: string;
  complteAnswer: () => Promise<void>;
};

function AnswerForm({
  adminInquiryService,
  inquiryId,
  email,
  complteAnswer,
}: Props) {
  let [text, setText] = useState<string>("");
  let [loading, setLoading] = useState<boolean>(false);

  const answer = async () => {
    try {
      setLoading(true);
      await adminInquiryService.answer(inquiryId, email, text, "");

      alert("답변이 메일로 전송되었습니다");
      setLoading(false);
      complteAnswer();
    } catch (error: any) {
      alert(error.message);
    }
  };

  return (
    <div className="answer-form">
      <div className="info">
        <span>받는사람</span>
        <span>{email}</span>
      </div>
      <textarea onChange={(e) => setText(e.target.value)}></textarea>
      <Button title="완료" handleClickEvent={answer} />
      {loading && (
        <div className="popup-wrap">
          <img
            className="loading"
            src="../image/loading.png"
            alt="loading"
          ></img>
        </div>
      )}
    </div>
  );
}

export default AnswerForm;
