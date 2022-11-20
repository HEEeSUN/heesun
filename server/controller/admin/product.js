export default class AdminProductController {
  constructor(adminRepository) {
    this.db = adminRepository;
  }

  /* 상품 수정 메뉴 선택시 상품 목록 가져오기 */
  getProducts = async (req, res) => {
    try {
      const { category, search, page } = req.query;

      if (isNaN(Number(page))) return res.sendStatus(404);

      const amountOfSendData = 10;
      let productPageLength = 1;
      // let currPage = page * amountOfSendData;
      let prevPage = (page - 1) * amountOfSendData;
      let productList;

      if (!category) {
        if (!search) {
          //카테고리X, 검색어X => 전체보기
          productList = await this.db.getAllProduct(
            amountOfSendData,
            prevPage
          );
        } else {
          //카테고리X, 검색어O => 이름과 코드에서 검색어와 일치하는 것 보기
          productList = await this.db.getProductByTxt(
            search,
            amountOfSendData,
            prevPage
          ); //이름에서 검색
        }
      } else {
        //카테고리o, 검색어O => 카테고리에서 검색어와 일치하는 것 보기
        productList = await this.db.getProductByCatAndTxt(
          category,
          search,
          amountOfSendData,
          prevPage
        ); //id=카테고리 여서 카테고리 안에서 검색
      }
      
      if (!productList[0]) {
        return res.status(200).json({ productList: [], productPageLength });
      }

      if (productList[0].full_count % amountOfSendData > 0) {
        productPageLength = Math.ceil(
          productList[0].full_count / amountOfSendData
        );
      } else {
        productPageLength = productList[0].full_count / amountOfSendData;
      }

      res.status(200).json({ productList, productPageLength });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

      /* 상품 추가 */
  addProduct = async (req, res) => {
    try {
      const products = JSON.parse(req.body.products);
      const { productCode, name, cost, price, description, options } = products;

      let imgFileSrc = "";

      if (req.file) {
        imgFileSrc = "/" + req.file.key;
      }

      await this.db.addProduct(
        productCode,
        name,
        price,
        cost,
        imgFileSrc,
        description,
        options
      );

      res.sendStatus(201);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 상품등록시 상품 코드 중복 조회 */
  checkProductCode = async (req, res) => {
    try {
      const { product_code } = req.body;

      const result = await this.db.findByProductCode(product_code);

      if (result) {
        return res.status(409).json({ code: "ERROR60001" });
      }

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };
  
  /* 상품 상세보기시 옵션 목록 가져오기 */
  getProduct = async (req, res) => {
    try {
      const code = req.params.id;
      const result = await this.db.getProductOptionByCode(code);

      if (!result) {
        return res.status(405).json({ code: "ERROR60002" });
      }

      res.status(200).json({ options1: result, options2: result });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 상품 업데이트 */
  updateProduct = async (req, res) => {
    try {
      const code = req.params.id;

      const product = await this.db.findByProductCode(code);

      if (!product) {
        return res.status(404).json({ code: "ERROR60002" });
      }

      const { products } = req.body;

      const produtList = JSON.parse(products);

      const { name, price, cost, description, imageSrc, optionList } = produtList;

      let imgFileSrc = imageSrc;

      if (req.file) {
        imgFileSrc = "/" + req.file.key;
      }

      await this.db.updateProduct(
        code,
        name,
        price,
        cost,
        description,
        imgFileSrc,
        optionList
      );

      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };
  
  /* 상품 삭제 */
  deleteProduct = async (req, res) => {
    try {
      const code = req.params.id;
      const result = await this.db.findByProductCode(code);

      if (!result) {
        return res.status(405).json({ code: "ERROR60002" });
      }

      await this.db.deleteProduct(code);

      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };
}
