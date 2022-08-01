import { useState, useEffect } from "react";
import "./home.css";
import {
  ProductService,
  Product,
  SaleProduct,
} from "../../model/product.model";
import ProductCard from "../../components/ProductCard";
import SaleCarousel from "./components/SaleCarousel";
import NoticeNoContent from "../../components/NoticeNoContent";

type Props = {
  productService: ProductService;
};

function Home(props: Props) {
  let [mainProducts, setMainProducts] = useState<Product[]>([]);
  let [timesaleList, setTimesaleList] = useState<SaleProduct[]>([]);
  const { productService } = props;

  const getProducts = async () => {
    try {
      const { product, timesale } = await productService.getProducts();

      setMainProducts(product);
      setTimesaleList(timesale);
    } catch (error: any) {
      alert(error.message);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className="home">
      <div className="mainImage">
        <img src="./image/main.jpg" alt="main image"></img>
      </div>
      <div className="mainPhrase">
        <p>Fresh, Seasonal, Beautiful</p>
        <p>Order Now and Get Same-Day-Delivery</p>
      </div>
      {timesaleList.length > 0 && <SaleCarousel mainProducts={timesaleList} />}

      {mainProducts.length === 0 ? (
        <NoticeNoContent
          message={"아직 등록된 상품이 없습니다"}
          extraClass={"no-border"}
        />
      ) : (
        <div className="row">
          {mainProducts.map((item, i) => {
            return <ProductCard product={item} key={i} />;
          })}
        </div>
      )}
    </div>
  );
}

export default Home;
