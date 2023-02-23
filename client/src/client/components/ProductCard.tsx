import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { Product } from "../model/product.model";
import ImageCmp from "./ImageCmp";

type Props = {
  product: Product;
};

function ProductCard(props: Props) {
  let [sale, setSale] = useState<boolean>(false);
  let [timeSale, setTimeSale] = useState<boolean>(false);
  let [salePrice, setSalePrice] = useState<number>();
  let history = useHistory();
  let imgSrc: string;
  let [dday, setDday] = useState<string>();
  let [ddayHour, setDdayHour] = useState<string>();
  let [ddayMin, setDdayMin] = useState<string>();
  let [ddaySec, setDdaySec] = useState<string>();
  let { product } = props;

  if (!product.main_img_src) {
    imgSrc = "/image/noImage.jpg";
  } else {
    imgSrc = product.main_img_src;
  }

  useEffect(() => {
    if (product.sale_price && !product.start) {
      setSale(true);
      setSalePrice(Number(product.sale_price));
    } else if (
      product.sale_price &&
      new Date(product.start) < new Date() &&
      new Date() < new Date(product.end)
    ) {
      setTimeSale(true);
      setSalePrice(Number(product.sale_price));

      const endDate = new Date(product.end);
      const gap = endDate.getTime() - Date.now();
      const day = Math.floor(gap / (1000 * 60 * 60 * 24));
      const hours = Math.floor((gap / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((gap / (1000 * 60)) % 60);
      const seconds = Math.floor((gap / 1000) % 60);

      setDday(String(day));
      setDdayHour(String(hours).padStart(2, "0"));
      setDdayMin(String(minutes).padStart(2, "0"));
      setDdaySec(String(seconds).padStart(2, "0"));

      setInterval(() => {
        const endDate = new Date(product.end);
        const gap = endDate.getTime() - Date.now();
        const day = Math.floor(gap / (1000 * 60 * 60 * 24));
        const hours = Math.floor((gap / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((gap / (1000 * 60)) % 60);
        const seconds = Math.floor((gap / 1000) % 60);

        setDday(String(day));
        setDdayHour(String(hours).padStart(2, "0"));
        setDdayMin(String(minutes).padStart(2, "0"));
        setDdaySec(String(seconds).padStart(2, "0"));
      }, 60000);
    }
  }, []);

  return (
    <div
      className="productCard"
      onClick={() => {
        history.push(`/home/product/${product.product_code}`);
      }}
    >
      <div className="productThumbnailWrapper">
        <ImageCmp 
          imgSrc={imgSrc}
          alt="product image"
          className="productThumbnail"
        />
        {(timeSale || sale) && (
          <div className="sale-banner">
            {timeSale ? (
              <p>타임세일! {dday + ":" + ddayHour + ":" + ddayMin}</p>
            ) : (
              <p>SALE</p>
            )}
          </div>
        )}
      </div>
      <div className="productSummary">
        <h4 className="productName">{product.name}</h4>
        <p className={sale || timeSale ? "sale productPrice" : "productPrice"}>
          {product.price.toLocaleString()}
        </p>
        <p className="sale-price">{salePrice && salePrice.toLocaleString()}</p>
      </div>
    </div>
  );
}

export default ProductCard;
