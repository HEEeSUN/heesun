export default class AdminDiscountController {
  constructor(adminRepository) {
    this.db = adminRepository;
  }

  /* 할인 적용된 상품가져오기 */
  getSaleProducts = async (req, res) => {
    try {
      let saleGroup = [];
      const timeTable = await this.db.getSaleTimeTable();
      const saleProduct = await this.db.getSaleProducts();

      if (saleProduct.length === 0) {
        return res.status(200).json({ saleGroup });
      }

      timeTable.map((time) => {
        const group = saleProduct.filter(
          (item) => item.time_id === time.time_id
        );

        if (group[0]) {
          saleGroup = [...saleGroup, group];
        }
      });

      const group = saleProduct.filter((item) => !item.time_id);

      if (group[0]) {
        saleGroup = [...saleGroup, group];
      }

      res.status(200).json({ saleGroup });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 할인 상품 추가 */
  addSaleProduct = async (req, res) => {
    try {
      const { productList, saleTime } = req.body;

      if (!saleTime) {
        await this.db.addSaleProduct(productList);
      } else {
        const { saleStartTime, saleEndTime } = saleTime;

        let dateArr = [];
        dateArr[dateArr.length] = new Date(saleStartTime);
        dateArr[dateArr.length] = new Date(saleEndTime);

        dateArr.forEach((date) => {
          if (date == 'Invalid Date') {
            throw new Error('날짜 형식을 확인해주세요')
          }
        })

        if (dateArr[0] < new Date()) {
          throw new Error('할인 시작 날짜가 현재 날짜보다 작을 수 없습니다')
        }

        if (dateArr[0] >= dateArr[1]) {
          throw new Error('할인 시작 날짜가 할인 종료 날짜보다 크거나 같을 수 없습니다')
        }

        
        await this.db.addSaleProductAndTIme(
          productList,
          saleStartTime,
          saleEndTime
        );
      }

      res.sendStatus(201);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 할인 상품 업데이트 */
  updateSaleProduct = async (req, res) => {
    try {
      const { timeId, changeList, deleteList } = req.body;
      let productList;

      await this.db.updateSaleProduct(changeList, deleteList);

      if (timeId) {
        productList = await this.db.getSaleProductsAfterUpdate(timeId);
      } else {
        productList = await this.db.getSaleProductsAfterUpdate();
      }

      res.status(200).json({ productList });
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };

  /* 할인 상품 삭제 */
  deleteSaleProduct = async (req, res) => {
    try {
      const timeId = req.params.id;

      if (isNaN(parseInt(timeId))) {
        await this.db.deleteSaleProduct();
      } else {
        await this.db.deleteTimeSale(timeId);
      }
      res.sendStatus(204);
    } catch (error) {
      console.log(error);
      return res.sendStatus(400);
    }
  };
    
  /* 세일 상품 등록시 상품 목록 가져오기 */
  getAllProductsWithOption  = async (req, res) => {
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
          productList = await this.db.getAllProductWithOption(
            amountOfSendData,
            prevPage
          );
        } else {
          //카테고리X, 검색어O => 이름과 코드에서 검색어와 일치하는 것 보기
          productList = await this.db.getProductWithOptionByTxt(
            search,
            amountOfSendData,
            prevPage
          ); //이름에서 검색
        }
      } else {
        //카테고리o, 검색어O => 카테고리에서 검색어와 일치하는 것 보기
        productList = await this.db.getProductWithOptionByCatAndTxt(
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
  }
}
