import { useEffect, useState } from "react";
import { ProductService, Reviews } from "../../../model/product.model";
import Page from "../../../components/Page";
import ProductReview from "../../../components/ProductReview";
import NoticeNoContent from "../../../components/NoticeNoContent";

type Props = {
  productService: ProductService;
  product_code: string;
};

function ProductReviews({ productService, product_code }: Props) {
  let [reviewDetail, setReviewDetail] = useState<number | null>(null);
  let [reviews, setReviews] = useState<Reviews[]>([]);
  let [pageNumber, setPageNumber] = useState<number>(1);
  let [pageLength, setPageLength] = useState<number>(0);
  let [change, setChange] = useState<boolean>(false);

  /* 상품에 달려있는 후기 가져오기 */
  const getReviews = async () => {
    const { reviews, reviewPageLength } = await productService.getReviews(
      product_code,
      pageNumber
    );

    setPageLength(reviewPageLength);
    setChange(true);
    setReviews(reviews);
  };

  useEffect(() => {
    setReviewDetail(null);
    getReviews();
  }, [pageNumber]);

  return (
    <>
      <div className="review-table">
        <div className="review-table-head">
          <div className="review-content">후기</div>
          <div className="review-username">작성자</div>
          <div className="review-created">작성일</div>
        </div>
        {reviews.length < 1 ? (
          <NoticeNoContent message={"작성된 후기가 없습니다"} />
        ) : (
          reviews.map((review) => {
            return (
              <ProductReview
                writable={false}
                myReview={false}
                review={review}
                reviewDetail={reviewDetail}
                setReviewDetail={setReviewDetail}
              />
            );
          })
        )}
      </div>
      <div className="paging-wrapper">
        <Page
          amountOfPerPage={5}
          change={change}
          setChange={setChange}
          pageLength={pageLength}
          pageNumber={pageNumber}
          setPageNumber={setPageNumber}
        />
      </div>
    </>
  );
}

export default ProductReviews;
