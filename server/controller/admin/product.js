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

  /* 신규 상품 등록 및 기존 상품 수정시 입력 항목이 유효한지 확인 */
  checkOption = async (req, res, next) => {
    try {
      const products = JSON.parse(req.body.products);
      const { productCode, name, cost, price, options } = products;

      if (productCode && productCode.length > 20) {
        throw new Error('ERROR61001')
      }

      if (name.length > 50) {
        throw new Error('ERROR61001')
      }

      if (
        !Number(cost) ||
        !Number(price) ||
        Number(cost) > 100000000 ||
        Number(price) > 100000000
      ) {
        throw new Error('ERROR61001');
      }

      if (options.length > 1) {
        // 옵션배열이 1보다 크다 === 옵션이 2개 이상이다 === 옵션이 있다는 것이므로 옵션1이 공백이 올 수 없음 (비활성화 시킬때만 공백이 올 수 있음)
        const find = options.find((option) => option.option1 == '' && option.disabled != true);

        const filter = options.filter((option) =>  option.disabled != true);

        if (filter.length > 1 && find) {
          throw new Error('ERROR61002')
        }
      }

      options.forEach((option) => {
        if (option.option1 == '' && option.option2 != '') {
          throw new Error('ERROR61002')
        }
      })

      next();
    } catch (error) {
      console.log(error)
      return res.status(400).json({message: error.message})
    }
  }

  /* 상품 추가 */
  addProduct = async (req, res, next) => {
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

      if (result.length < 1) {
        return res.status(404).json({ code: "ERROR60002" });
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

      const { name, price, cost, description, imageSrc, options } = produtList;

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
        options
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
        return res.status(404).json({ code: "ERROR60002" });
      }

      await this.db.deleteProduct(code);

      res.sendStatus(200);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };
}
