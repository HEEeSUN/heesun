import { useEffect, useState, useCallback, useRef } from "react";
import { ProductService, Product } from "../../model/product.model";
import Products from "../../components/Products";

type Props = {
  productService: ProductService;
};

function Shop(props: Props) {
  let [products, setProducts] = useState<Product[]>([]);
  let [howToSort, setHowToSort] = useState<string>("");
  let [pageNumber, setPageNumber] = useState<number>(1);
  let [loading, setLoading] = useState<boolean>(true);
  let [hasmore, setHasmore] = useState<boolean>(false);
  const observer = useRef<IntersectionObserver>();
  const { productService } = props;

  /* 상품 목록 가져오기 (기본 최근등록순, 선택된 정렬 방법에 따라 다르게 정렬하여 목록을 가져옴) */
  const getProducts = async () => {
    try {
      const { product, hasmore } = await productService.getSearchProduct(
        "",
        howToSort,
        pageNumber
      );

      const temp = [...products, ...product];

      console.log(product);
      setProducts(temp);
      setHasmore(hasmore);
      setLoading(false);
    } catch (error: any) {
      alert(error.message);
    }
  };

  /* 화면에 출력된 element중 마지막 element가 현재 브라우저에 교차상태일 경우 새로운 데이터를 받아올 수 있게 무한 스크롤링 구현*/
  const lastOrderElement = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasmore) {
          setPageNumber((prevPageNumber) => prevPageNumber + 1);
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasmore]
  );

  useEffect(() => {
    if (howToSort) {
      setProducts([]);

      if (pageNumber === 1) {
        setPageNumber(0);
      } else {
        setPageNumber(1);
      }
    }
  }, [howToSort]);

  useEffect(() => {
    if (!pageNumber) {
      setPageNumber(1);
    } else {
      getProducts();
    }
  }, [pageNumber]);

  return (
    <Products
      products={products}
      lastOrderElement={lastOrderElement}
      setHowToSort={setHowToSort}
    />
  );
}

export default Shop;
