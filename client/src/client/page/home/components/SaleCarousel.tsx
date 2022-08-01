import React, { useEffect, useLayoutEffect, useState } from "react";
import Carousel from "react-bootstrap/Carousel";
import { useHistory } from "react-router";
import Button from "../../../components/Button";
import ProductCard from "../../../components/ProductCard";
import { Product } from "../../../model/product.model";

type Props = {
  mainProducts: Product[];
};

function SaleCarousel({ mainProducts }: Props) {
  const [index, setIndex] = useState<number>(0);
  const [width, setWidth] = useState<number>(window.innerWidth);
  let [slideProducts, setSlideProducts] = useState<Product[][]>([]);
  let [gridStyle, setGridStyle] = useState<"big" | "small" | "medium">("big");
  let history = useHistory();

  const handleSelect = (selectedIndex: number) => {
    setIndex(selectedIndex);
  };

  const changeBrowserSize = async () => {
    if (width <= 479) {
      setGridStyle("small");
    } else if (width <= 1023) {
      setGridStyle("medium");
    } else {
      setGridStyle("big");
    }
  };

  const timeSaleZone = () => {
    let a = 0;
    let b = 0;

    switch (gridStyle) {
      case "small":
        a = 1;
        break;
      case "medium":
        a = 3;
        break;
      default:
        a = 5;
    }

    b = Math.ceil((mainProducts.length + 1) / a);

    let tempArray = [];
    for (let i = 0; i < b; i++) {
      const tmp = mainProducts.slice(i * a, (i + 1) * a);
      tempArray.push(tmp);
    }

    setSlideProducts(tempArray);
  };

  useEffect(() => {
    if (mainProducts.length > 0) timeSaleZone();
  }, [gridStyle]);

  useEffect(() => {
    changeBrowserSize();
  }, [width, mainProducts]);

  useLayoutEffect(() => {
    function updateSize() {
      setWidth(window.innerWidth);
    }

    window.addEventListener("resize", updateSize);
    updateSize();

    return () => {
      setSlideProducts([]);
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  return (
    <div className="special-product">
      <p className="special-notice">
        ⏳ 특별한 가격! 시간이 얼마 남지 않았어요!
      </p>
      <Carousel activeIndex={index} onSelect={handleSelect}>
        {slideProducts.map((array, key) => {
          return (
            <Carousel.Item>
              <div className={`sale-grid-zone ${gridStyle}`}>
                {array.map((product) => {
                  return <ProductCard product={product} />;
                })}
                {slideProducts.length === key + 1 && (
                  <Button
                    title="전체보기"
                    type="button"
                    handleClickEvent={() => history.push("/home/shop")}
                  />
                )}
              </div>
            </Carousel.Item>
          );
        })}
      </Carousel>
    </div>
  );
}

export default SaleCarousel;
