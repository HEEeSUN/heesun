import { useEffect, useState } from "react";
import { adminInquiryService, Inquiry } from "../../../model/inquiry.model";
import Button from "../../../../client/components/Button";
import Popup from "../../../components/Popup";
import AnswerForm from "./AnswerForm";

type Props = {
  adminInquiryService: adminInquiryService;
  inquiry: Inquiry;
  inquiryId: number | undefined;
  setInquiryId: React.Dispatch<React.SetStateAction<number | undefined>>;
};

function InquiryDetail(props: Props) {
  let [showDetail, setShowDetail] = useState<boolean>(false);
  let [detail, setDetail] = useState<Inquiry>();
  let [showAnswerForm, setShowAnswerForm] = useState<boolean>(false);
  let [contactOptin, setContactOption] = useState<string>("");
  let [tempCompletSign, setTempCompletSign] = useState<boolean>(false);
  /*
  답변의 상태를 보여주는 부분이 부모 컴포넌트에서 받아오는 inquiry
  답변을 등록시 detail을 새로 받아오는데 부모 컴포넌트의 inquiry까지 다시 받아오는 것은 낭비
  답변완료시 사용자에게 답변안료상태를 보여주기 위한 임시 스테이트를 사용
  */

  const { adminInquiryService, inquiry, inquiryId, setInquiryId } = props;

  const complteAnswer = async () => {
    if (showAnswerForm) {
      setShowAnswerForm(false);
    }
    setTempCompletSign(true);
    getInquiry();
  };

  const answerForm = (
    <AnswerForm
      adminInquiryService={adminInquiryService}
      inquiryId={inquiryId}
      email={inquiry.contactInformation}
      complteAnswer={complteAnswer}
    />
  );

  const handelComplteAnswer = async () => {
    if (!contactOptin) {
      alert("답변 형식을 기재해주세요");
      return;
    }

    const result = window.confirm(
      "반드시 문의에 대한 답변을 하신 후 확인을 눌러주세요\n답변완료 처리를 하시겠습니까?"
    );

    if (!result) {
      return;
    }

    try {
      await adminInquiryService.answer(inquiryId, "", "", contactOptin);

      alert("답변완료 처리되었습니다");
      complteAnswer();
    } catch (error: any) {
      alert(error.message);
    }
  };

  const handleAnswerForm = async () => {
    if (showAnswerForm) {
      setShowAnswerForm(false);
    } else {
      setShowAnswerForm(true);
    }
  };

  const clickEvent = async () => {
    if (inquiryId === inquiry.id) {
      setInquiryId(undefined);
    } else {
      setInquiryId(inquiry.id);
    }
  };

  const getInquiry = async () => {
    try {
      const { inquiryDetail } = await adminInquiryService.getInquiry(
        inquiry.id
      );

      setDetail(inquiryDetail);
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    if (inquiryId === inquiry.id) {
      getInquiry();
      setShowDetail(true);
    } else {
      setShowDetail(false);
    }
  }, [inquiryId]);

  return (
    <>
      <tr className={`summary ${inquiryId === inquiry.id ? "clicked" : ""}`}>
        <th className="num">{inquiry.id}</th>
        <th className="content" onClick={clickEvent}>
          {inquiry.content}
        </th>
        <th className="createdAT">{inquiry.createdAt}</th>
        <th className="name">{inquiry.name}</th>
        <th className="answer">
          {inquiry.answer !== null || tempCompletSign ? "답변완료" : "미답변"}
        </th>
      </tr>
      {showDetail && detail && (
        <>
          <tr>
            <td className="sub-title">
              <span>문의</span>
              <span>내용</span>
            </td>
            <td className="content-area">
              <p>{detail.content}</p>
            </td>
          </tr>
          <tr>
            <td className="option">{detail.contactOption}</td>
            <td className="info">{detail.contactInformation}</td>
          </tr>
          {detail.answer !== null ? (
            <tr>
              <td className="sub-title">
                <span>답변</span>
                <span>내용</span>
              </td>
              <td className="answer-area">
                <p>{detail.answer}</p>
              </td>
            </tr>
          ) : detail.contactOption === "email" ? (
            <tr>
              <td className="answer-btn-wrapper">
                <Button title="답변하기" handleClickEvent={handleAnswerForm} />
              </td>
            </tr>
          ) : (
            <tr>
              <td className="contact-option">
                <input
                  type="text"
                  placeholder="답변 형식 (ex. 전화연락)"
                  onChange={(e) => setContactOption(e.target.value)}
                ></input>
                <Button
                  title="답변완료"
                  handleClickEvent={handelComplteAnswer}
                />
              </td>
            </tr>
          )}
          {showAnswerForm && (
            <Popup
              children={answerForm}
              title={"답변하기"}
              setPopup={setShowAnswerForm}
            />
          )}
        </>
      )}
    </>
  );
}

export default InquiryDetail;
