import { Product } from "../model/product.model";
import ProductCard from "./ProductCard";
import Category from "./Category";

type Props = {
  products: Product[];
  lastOrderElement: (node: any) => void;
  setHowToSort: React.Dispatch<React.SetStateAction<string>>;
};

function Products(props: Props) {
  const { products, lastOrderElement, setHowToSort } = props;

  const categoryItems = [
    {
      name: "최근등록순",
      value: "latestUpdate",
      selected: true,
    },
    {
      name: "낮은가격순",
      value: "lowPrice",
      selected: false,
    },
    {
      name: "높은가격순",
      value: "highPrice",
      selected: false,
    },
  ];
  return (
    <div className="products">
      <div className="sort-wrapper">
        <Category
          categoryItems={categoryItems}
          changeHandler={(event: React.ChangeEvent<HTMLSelectElement>) =>
            setHowToSort(event.target.value)
          }
        />
      </div>
      {products.length < 1 ? (
        <div>아직 등록된 상품이 없습니다</div>
      ) : (
        <div className="row">
          {products.map((product, i) => {
            if (products.length === i + 1) {
              return (
                <div className="productCart-wrapper" ref={lastOrderElement}>
                  <ProductCard product={product} key={i} />
                </div>
              );
            } else {
              return (
                <div className="productCart-wrapper">
                  <ProductCard product={product} key={i} />
                </div>
              );
            }
          })}
        </div>
      )}
    </div>
  );
}

export default Products;
