import { MyReviews } from "../model/member.model";
import { Reviews } from "../model/product.model";
import Button from "./Button";

type Props = {
  writable: boolean;
  myReview: boolean;
  review: MyReviews | Reviews;
  setShowModal?: React.Dispatch<React.SetStateAction<boolean>>;
  reviewDetail?: number | null;
  setReviewDetail?: React.Dispatch<React.SetStateAction<number | null>>;
  setCode?: React.Dispatch<React.SetStateAction<string>>;
  setId?: React.Dispatch<React.SetStateAction<number>>;
};

function ProductReview(props: Props) {
  const {
    writable,
    myReview,
    review,
    setShowModal,
    reviewDetail,
    setReviewDetail,
    setCode,
    setId,
  } = props;

  const showReview = () => {
    if (!setReviewDetail) {
      return;
    }

    reviewDetail === review.review_id
      ? setReviewDetail(null)
      : setReviewDetail(review.review_id);
  };

  return (
    <div className="review-table-body">
      <div
        className={
          !reviewDetail || reviewDetail !== review.review_id
            ? "review-summary"
            : "review-summary clicked-review"
        }
        onClick={showReview}
      >
        {review.main_img_src && (
          <div className="review-image">
            <img src={review.main_img_src} alt="product image"></img>
          </div>
        )}
        {myReview ? (
          <div className="review-content">{review.product_name}</div>
        ) : (
          <>
            <div className="review-content">{review.content}</div>
            <div className="review-username">{review.username}</div>
            <div className="review-created">{review.created}</div>
          </>
        )}
        {writable && setShowModal && (
          <Button
            title={"리뷰작성"}
            handleClickEvent={() => {
              if (setCode && setId && review.product_code && review.detail_id) {
                setCode(review.product_code);
                setId(review.detail_id);
              }
              setShowModal(true);
            }}
          />
        )}
      </div>
      {reviewDetail && reviewDetail === review.review_id ? (
        <div className="review-detail">{review.content}</div>
      ) : null}
    </div>
  );
}

export default ProductReview;
