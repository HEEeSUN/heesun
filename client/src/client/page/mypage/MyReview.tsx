import { useEffect, useState } from "react";
import { MemberService, MyReviews } from "../../model/member.model";
import SlideMenuBar from "../../components/SlideMenuBar";
import Button from "../../components/Button";
import WriteReviewModal from "../../components/WriteReviewModal";
import ProductReview from "../../components/ProductReview";
import NoticeNoContent from "../../components/NoticeNoContent";

type Props = {
  memberService: MemberService;
};

function MyReview({ memberService }: Props) {
  let [clickedMenu, setClickedMenu] = useState<number>(1);
  let [reviewComplete, setReviewComplete] = useState<boolean>(false);
  let [reviewDetail, setReviewDetail] = useState<number | null>(null);
  let [reviews, setReviews] = useState<MyReviews[]>([]);
  let [reviewPageNumber, setReviewPageNumber] = useState<number>(1);
  let [hasmore, setHasmore] = useState<number>(0);
  let [showModal, setShowModal] = useState<boolean>(false);
  let [code, setCode] = useState<string>("");
  let [id, setId] = useState<number>(0);
  let [newReviewId, setNewReviewId] = useState<number>(0);

  const getReviews = async () => {
    try {
      let reviewStatus: "done" | "yet" = "done";

      if (clickedMenu === 2) {
        reviewStatus = "yet";
      }

      const { newReviews, hasmore } = await memberService.getMyReviews(
        reviewStatus,
        reviewPageNumber
      );

      const tempArray = [...reviews, ...newReviews];
      setReviews(tempArray);
      setHasmore(hasmore);
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    setReviewPageNumber(0);
  }, [clickedMenu]);

  useEffect(() => {
    if (reviewPageNumber === 0) {
      setReviews([]);
      setReviewPageNumber(1);
    } else {
      getReviews();
    }
  }, [reviewPageNumber]);

  useEffect(() => {
    if (reviewComplete) {
      setReviewDetail(newReviewId);
      setClickedMenu(1);
      setReviewComplete(false);
    }
  }, [reviewComplete]);

  return (
    <div className="myreview">
      <SlideMenuBar
        menuTitle1={"작성한리뷰"}
        menuTitle2={"작성가능리뷰"}
        clickedMenu={clickedMenu}
        setClickedMenu={setClickedMenu}
      />
      <div className="myreview">
        <div className="myreview-content">
          {clickedMenu === 1 ? (
            reviews.length < 1 ? (
              <NoticeNoContent message={"작성된 후기가 없습니다"} />
            ) : (
              reviews.map((review, key) => {
                return (
                  <ProductReview
                    writable={false}
                    myReview={true}
                    review={review}
                    reviewDetail={reviewDetail}
                    setReviewDetail={setReviewDetail}
                  />
                );
              })
            )
          ) : reviews.length < 1 ? (
            <NoticeNoContent message={"작성가능한 후기가 없습니다"} />
          ) : (
            reviews.map((review, key) => {
              return (
                <ProductReview
                  writable={true}
                  myReview={true}
                  review={review}
                  setShowModal={setShowModal}
                  setCode={setCode}
                  setId={setId}
                />
              );
            })
          )}
          {showModal && (
            <WriteReviewModal
              memberService={memberService}
              product_code={code}
              detail_id={id}
              setShowModal={setShowModal}
              setStatusChange={setReviewComplete}
              setNewReviewId={setNewReviewId}
            />
          )}
          {hasmore ? (
            <Button
              title={"더보기"}
              handleClickEvent={() => setReviewPageNumber((curr) => curr + 1)}
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default MyReview;
