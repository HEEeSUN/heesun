export default class ProductController {
  constructor(prodcutRepository) {
    this.product = prodcutRepository;
  }

  /* 상품 상세 보기 */
  getProduct = async (req, res) => {
    try {
      const product_code = req.params.id;
      let { reviewPage } = req.query;

      if (!product_code) {
        return res.sendStatus(404);
      }

      if (!reviewPage) {
        const today = new Date(
          Date.now() - new Date().getTimezoneOffset() * 60000
        ).toISOString();

        const product = await this.product.getByProduct_code(product_code, today);

        if (product.length < 1) {
          return res.sendStatus(404);
        }

        res.status(200).json({ product });
      } else {
        if (isNaN(Number(reviewPage))) return res.sendStatus(404);

        const amountOfSendData = 5; //한번에 보낼 리뷰의 개수
        let prevPage = (reviewPage - 1) * amountOfSendData;
        let reviewPageLength = 1;

        const amountOfReviews = await this.product.getAmountOfReviews(
          product_code
        );

        if (amountOfReviews === 0) {
          return res.status(200).json({ reviews: [], reviewPageLength });
        }

        const reviews = await this.product.getReviews(
          product_code,
          amountOfSendData,
          prevPage
        );

        if (amountOfReviews % amountOfSendData > 0) {
          reviewPageLength = Math.ceil(amountOfReviews / amountOfSendData);
        } else {
          reviewPageLength = amountOfReviews / amountOfSendData;
        }

        res.status(200).json({ reviews, reviewPageLength });
      }
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 전체 상품 보기 */
  getAllProduct = async (req, res) => {
    try {
      const { searchWord, sortCode, page } = req.query;

      if (isNaN(Number(page))) return res.sendStatus(404);

      const amountOfSendData = 9; //한번에 보여줄 상품 개수
      let currPage = page * amountOfSendData;
      let prevPage = (page - 1) * amountOfSendData;
      let hasmore = 0;
      let orderBy;
      let product;

      const today = new Date(
        Date.now() - new Date().getTimezoneOffset() * 60000
      ).toISOString();

      switch (sortCode) {
        case "highPrice":
          orderBy = "price DESC";
          break;
        case "lowPrice":
          orderBy = "price";
          break;
        case "latestUpdate":
          orderBy = "createdAt DESC";
          break;
        default:
          orderBy = "createdAt DESC";
      }

      if (searchWord) {
        product = await this.product.testGetByName(
          searchWord,
          today,
          orderBy,
          prevPage,
          amountOfSendData
        );
      } else {
        product = await this.product.testGetALL(
          today,
          orderBy,
          prevPage,
          amountOfSendData
        );
      }

      const timesale = await this.product.testGetSale(today);

      if (!product[0]) {
        return res.status(200).json({ product, hasmore, timesale });
      }

      product[0].full_count < currPage ? (hasmore = 0) : (hasmore = 1);

      res.status(200).json({ product, hasmore, timesale });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };
}
