import { useEffect, useState } from "react";
import { Modal, Button } from "react-bootstrap";
import { MemberService } from "../model/member.model";

type Props = {
  memberService: MemberService;
  product_code: string;
  detail_id: number;
  setShowModal: React.Dispatch<React.SetStateAction<boolean>>;
  setStatusChange: React.Dispatch<React.SetStateAction<boolean>>;
  setNewReviewId?: React.Dispatch<React.SetStateAction<number>>;
};

function WriteReviewModal(props: Props) {
  let [show, setShow] = useState(true);
  let [text, setText] = useState("");
  let {
    memberService,
    product_code,
    detail_id,
    setShowModal,
    setStatusChange,
    setNewReviewId,
  } = props;

  const handleClose = () => {
    setShow(false);
    setShowModal(false);
  };

  /* 리뷰 작성후 저장 */
  const storeReview = async () => {
    if (!text) {
      alert("내용을 작성해 주세요");
      return;
    }

    const productInfo = {
      product_code,
      text,
      detail_id,
    };

    try {
      const { reviewId } = await memberService.storeReview(productInfo);

      if (setNewReviewId) {
        setNewReviewId(reviewId);
      }
      handleClose();
      alert("리뷰가 등록되었습니다");
      setStatusChange(true);
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    if (text.length > 500) {
      setText(text.slice(0, 500));
    }
  }, [text]);

  return (
    <>
      <Modal
        className="writeReviewModal"
        show={show}
        onHide={handleClose}
        backdrop="static"
        keyboard={false}
      >
        <Modal.Header className="writeReviewHeader" closeButton>
          한줄리뷰작성
        </Modal.Header>
        <Modal.Body className="writeReviewBody">
          <textarea
            className="writeReview"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
            }}
          ></textarea>
          <p>{text.length}/500</p>
        </Modal.Body>
        <Modal.Footer className="writeReviewFooter">
          <Button variant="primary" onClick={storeReview}>
            작성완료
          </Button>
          <Button variant="secondary" onClick={handleClose}>
            취소
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default WriteReviewModal;
